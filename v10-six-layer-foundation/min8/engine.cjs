'use strict';
// min8 structural engine: immutable-per-session Technique records, event execution, single L5.
const copy=x=>structuredClone(x), ensure=(x,m)=>{if(!x)throw Error(m)}, num=x=>typeof x==='number'&&Number.isFinite(x);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const semantic=x=>JSON.stringify(stable(x));
const condition=(rule,ctx)=>{
 ensure(rule&&typeof rule==='object'&&['always','state-equals','target-equals','event-equals'].includes(rule.type),'CONDITION_INVALID');
 if(rule.type==='always')return 'true';
 const root=rule.type==='state-equals'?ctx.state:rule.type==='target-equals'?ctx.target:ctx.event;
 ensure(typeof rule.key==='string'&&rule.key.length>0&&Object.hasOwn(rule,'value'),'CONDITION_SCHEMA_INVALID');
 if(!root||!Object.hasOwn(root,rule.key))return 'unknown';
 return semantic(root[rule.key])===semantic(rule.value)?'true':'false';
};
const bad=reason=>({status:'unavailable',reason}), good=value=>({status:'available',value});
function createPipeline({versions,openDataSnapshot,initialState,handlers={},formulae={}}){
 const pinned=copy(versions);
 for(const k of ['game','equipment','technique','effects'])ensure(typeof pinned[k]==='string'&&pinned[k], 'VERSION_MISSING_'+k);
 function session(){
  const snap=openDataSnapshot(copy(pinned));
  ensure(snap&&JSON.stringify(snap.versions)===JSON.stringify(pinned),'SNAPSHOT_VERSION_MISMATCH');
  for(const k of ['readTechnique','resolveBuild','resolveEffects'])ensure(typeof snap[k]==='function','SNAPSHOT_READER_MISSING_'+k);
  const cache=new Map();
  const readTechnique=(id)=>{const k=id+'@'+pinned.technique;if(!cache.has(k))cache.set(k,copy(snap.readTechnique(id,pinned.technique,pinned.game)));return copy(cache.get(k))};
  return {snapshot:snap,readTechnique};
 }
 function planFor(req,s){
  const selected=req.evaluation.techniqueIds;ensure(Array.isArray(selected)&&selected.length,'TECHNIQUES_MISSING');
  const events=[],revisions=[];
  selected.forEach((id,step)=>{const t=s.readTechnique(id);ensure(t?.id===id&&t.dataVersion===pinned.technique&&t.revision&&t.definitionStatus==='defined','TECHNIQUE_UNDEFINED');
   ensure(Array.isArray(t.events)&&(t.events.length||t.explicitNoOp===true),'EVENTS_UNDEFINED');revisions.push(id+'@'+t.revision);
   t.events.forEach((ev,i)=>{ensure(['hit','consume','transition'].includes(ev.type),'EVENT_TYPE_INVALID');
    if(ev.type==='hit'){ensure(Array.isArray(ev.components)&&ev.components.length,'COMPONENTS_MISSING');const ids=new Set();for(const c of ev.components){ensure(c.id&&!ids.has(c.id)&&c.kind&&c.unit&&c.source&&num(c.coefficient),'DB_COMPONENT_INVALID');ids.add(c.id)}}
    events.push({...copy(ev),id:step+':'+i,techniqueId:id,revision:t.revision});
   });
  });
  return {events,expected:events.map(e=>e.id),signature:JSON.stringify(revisions)};
 }
 function applyEffects(component,effects,state,build,target,event){
  const out={coefficient:component.coefficient,stats:{attack:build.trueAttack,element:build.element,affinity:build.affinity},post:[],trace:[]};
  for(const [k,v] of Object.entries(out.stats))ensure(num(v),'BASE_STAT_INVALID_'+k);
  const unit={coefficient:component.unit,attack:'true-attack',element:'display-element',affinity:'percent',damage:'damage'};
  for(const e of [...effects].filter(x=>x.target===component.kind).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id))){
   ensure(unit[e.stage]===e.unit&&num(e.amount)&&['add','multiply','cap'].includes(e.operation),'EFFECT_INVALID');
   const active=condition(e.condition,{state,target,event});
   if(active==='unknown')throw Error('EFFECT_CONDITION_UNKNOWN_'+e.id);
   if(active==='false')continue;
   if(e.stage==='damage')out.post.push({operation:e.operation,amount:e.amount});
   else {const dest=e.stage==='coefficient'?out:out.stats,key=e.stage;const v=dest[key];dest[key]=e.operation==='add'?v+e.amount:e.operation==='multiply'?v*e.amount:Math.min(v,e.amount);}
   out.trace.push({id:e.id,stage:e.stage,unit:e.unit,order:e.order,source:e.source});
  }
  return out;
 }
 function aggregate(run,duration){
  const e=run.execution,complete=e.status==='complete'&&e.expected.length===e.executed.length&&e.expected.every((x,i)=>x===e.executed[i]);
  const total=!complete?bad('EXECUTION_INCOMPLETE'):run.components.some(c=>c.status!=='available')?bad('COMPONENT_UNAVAILABLE'):good(run.components.reduce((s,c)=>s+c.value,0));
  const time=num(duration)&&duration>0?good(duration):bad('DURATION_UNAVAILABLE');
  return {...run,metrics:{comboTotalDamage:total,comboDuration:time,comboDps:total.status==='available'&&time.status==='available'?good(total.value/time.value):bad(total.status==='available'?'DURATION_UNAVAILABLE':total.reason)}};
 }
 function runChannel(build,req,plan,ch,s){
  const executed=[],components=[],issues=[];let state;
  try{
   state=copy(initialState(copy(build),ch,copy(req.conditions)));ensure(state&&typeof state==='object','STATE_INVALID');
   const effects=s.snapshot.resolveEffects(copy(build),copy(req.conditions),ch,pinned.effects);
   ensure(Array.isArray(effects),'EFFECTS_INVALID');
   const handler=handlers[build.weaponType];ensure(typeof handler==='function','HANDLER_NOT_IMPLEMENTED');
   for(const ev of plan.events){
    try{
     const decision=handler({event:copy(ev),state:copy(state),channel:ch});
     ensure(decision&&typeof decision==='object','DECISION_MISSING');
     if(ev.type==='hit'){
      const emit=decision.emit,inactive=decision.inactive,unresolved=decision.unresolved||[];
      ensure(Array.isArray(emit)&&Array.isArray(inactive)&&Array.isArray(unresolved),'DISPOSITIONS_MISSING');
      const all=[...emit,...inactive,...unresolved],allowed=ev.components.map(c=>c.id);
      ensure(all.length===allowed.length&&new Set(all).size===all.length&&all.every(id=>allowed.includes(id)),'DISPOSITION_INVALID');
      for(const c of ev.components){
       const meta={id:c.id,eventId:ev.id,techniqueId:ev.techniqueId,revision:ev.revision,source:c.source,coefficientUnit:c.unit,damageUnit:'damage'};
       if(inactive.includes(c.id)){components.push({...meta,...good(0),disposition:'confirmed_inactive'});continue}
       if(unresolved.includes(c.id)){components.push({...meta,...bad('UNRESOLVED_DISPOSITION'),disposition:'unresolved'});continue}
       const applied=applyEffects(c,effects,state,build,req.target,ev),f=formulae[c.kind];
       const response=typeof f==='function'?f({kind:c.kind,coefficient:applied.coefficient,coefficientUnit:c.unit,parameters:copy(c.parameters||{}),target:copy(req.target),state:copy(state),stats:copy(applied.stats),build:copy(build)}):bad('FORMULA_NOT_IMPLEMENTED');
       ensure(response?.status==='unavailable'||response?.status==='available'&&num(response.value),'FORMULA_RESULT_INVALID');
       let result=response.status==='available'?response.value:null;
       if(result!==null){for(const post of applied.post)result=post.operation==='add'?result+post.amount:post.operation==='multiply'?result*post.amount:Math.min(result,post.amount);ensure(num(result),'POST_DAMAGE_INVALID')}
       components.push({...meta,...(result===null?bad(response.reason):good(result)),disposition:'emitted',effectsApplied:applied.trace});
      }
     }else{ensure(decision.nextState&&typeof decision.nextState==='object','NEXT_STATE_REQUIRED');state=copy(decision.nextState)}
     executed.push(ev.id);
    }catch(err){issues.push({eventId:ev.id,reason:err.message});break}
   }
  }catch(err){issues.push({reason:err.message})}
  return aggregate({execution:{status:executed.length===plan.expected.length&&!issues.length?'complete':'incomplete',expected:copy(plan.expected),executed,reason:issues[0]?.reason||null},components,issues,finalState:state},req.evaluation.duration);
 }
 function evaluate(req,s=session()){
  ensure(req?.build&&req?.target&&req?.evaluation,'REQUEST_INVALID');
  const build=s.snapshot.resolveBuild(copy(req.build),pinned.equipment,pinned.game);
  ensure(build?.weaponType,'BUILD_INVALID');
  const plan=planFor(req,s),results={};
  for(const ch of ['normal','maximum'])results[ch]=runChannel(build,req,plan,ch,s);
  return {status:'OK',weaponType:build.weaponType,versions:copy(pinned),conditionKey:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),comparisonContext:{damage:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),dps:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind,duration:req.evaluation.duration})},channels:results};
 }
 function safeEvaluate(req,s){try{return evaluate(req,s)}catch(err){return {status:'FAILED',reason:err.message,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{metrics:{comboTotalDamage:bad(err.message),comboDps:bad(err.message)}}]))}}}
 return Object.freeze({evaluate,safeEvaluate,session});
}
module.exports={createPipeline};
