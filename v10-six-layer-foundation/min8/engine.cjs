'use strict';
// min8 structural engine: immutable-per-session Technique records, event execution, single L5.
const copy=x=>structuredClone(x), ensure=(x,m)=>{if(!x)throw Error(m)}, num=x=>typeof x==='number'&&Number.isFinite(x);
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const validateState=(value,seen=new Set())=>{
  const t=typeof value;
  ensure(value!==undefined&&t!=='function'&&t!=='symbol'&&t!=='bigint','STATE_VALUE_INVALID');
  if(t==='number')ensure(Number.isFinite(value),'STATE_VALUE_NON_FINITE');
  if(value===null||t!=='object')return;
  ensure(!seen.has(value),'STATE_CYCLE_INVALID');seen.add(value);
  ensure(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'STATE_OBJECT_INVALID');
  if(Array.isArray(value)){
    for(let i=0;i<value.length;i++){
      ensure(Object.hasOwn(value,i),'STATE_ARRAY_HOLE_INVALID');
      validateState(value[i],seen);
    }
    for(const key of Reflect.ownKeys(value)){
      if(key==='length')continue;
      ensure(typeof key==='string'&&Number.isSafeInteger(Number(key))&&Number(key)>=0&&String(Number(key))===key&&Number(key)<value.length&&Object.getOwnPropertyDescriptor(value,key)?.enumerable,'STATE_KEY_INVALID');
    }
  }else{
    for(const key of Reflect.ownKeys(value)){
      ensure(typeof key==='string'&&Object.getOwnPropertyDescriptor(value,key)?.enumerable,'STATE_KEY_INVALID');
      validateState(value[key],seen);
    }
  }
  seen.delete(value);
};
const semantic=x=>JSON.stringify(stable(x));
const stateEqual=(a,b)=>{
 validateState(a);validateState(b);
 const compare=(x,y)=>{
  if(Object.is(x,y))return true;
  if(x===null||y===null||typeof x!=='object'||typeof y!=='object')return false;
  if(Array.isArray(x)!==Array.isArray(y))return false;
  const xKeys=Object.keys(x),yKeys=Object.keys(y);
  return xKeys.length===yKeys.length&&xKeys.every(k=>Object.hasOwn(y,k)&&compare(x[k],y[k]));
 };
 return compare(a,b);
};
const pathIdentity=path=>JSON.stringify(path.map(key=>String(key)));
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const condition=(rule,ctx)=>{
 ensure(rule&&typeof rule==='object'&&['always','state-equals','target-equals','event-equals'].includes(rule.type),'CONDITION_INVALID');
 if(rule.type==='always')return 'true';
 const root=rule.type==='state-equals'?ctx.state:rule.type==='target-equals'?ctx.target:ctx.event;
 ensure(Object.hasOwn(rule,'value'),'CONDITION_SCHEMA_INVALID');
 const path=rule.path===undefined?[rule.key]:rule.path;
 ensure(Array.isArray(path)&&path.length>0&&path.every(k=>(typeof k==='string'&&k.length>0&&!['__proto__','prototype','constructor'].includes(k))||(Number.isInteger(k)&&k>=0)),'CONDITION_PATH_INVALID');
 let found=root;
 for(const key of path){
   if(!found||typeof found!=='object'||!Object.hasOwn(found,key))return 'unknown';
   found=found[key];
 }
 validateState(rule.value);
 return stateEqual(found,rule.value)?'true':'false';
};
const validPath=p=>Array.isArray(p)&&p.length>0&&p.every(k=>(typeof k==='string'&&k.length>0&&k!=='__proto__'&&k!=='prototype'&&k!=='constructor')||(Number.isInteger(k)&&k>=0));
const readPath=(root,path)=>{let x=root;for(const k of path){if(x===null||typeof x!=='object'||!Object.hasOwn(x,k))return {status:'unknown'};x=x[k]}return {status:'known',value:x}};
const writePath=(root,path,value)=>{let x=root;for(const k of path.slice(0,-1)){ensure(x&&typeof x==='object'&&Object.hasOwn(x,k),'STATE_PATH_UNKNOWN');x=x[k]}const key=path.at(-1);ensure(x&&typeof x==='object'&&Object.hasOwn(x,key),'STATE_PATH_UNKNOWN');x[key]=copy(value)};
const bad=reason=>({status:'unavailable',reason}), good=value=>({status:'available',value});
function createPipeline({versions,openDataSnapshot,initialState,handlers={},formulae={}}){
 const pinned=copy(versions);
 for(const k of ['game','equipment','technique','effects'])ensure(typeof pinned[k]==='string'&&pinned[k], 'VERSION_MISSING_'+k);
 function session(){
  const snap=openDataSnapshot(copy(pinned));
  ensure(snap&&semantic(snap.versions)===semantic(pinned),'SNAPSHOT_VERSION_MISMATCH');
  for(const k of ['readTechnique','resolveBuild','resolveEffects'])ensure(typeof snap[k]==='function','SNAPSHOT_READER_MISSING_'+k);
  const cache=new Map(),buildCache=new Map(),effectCache=new Map(),failures=new Map();
  let sealed=false;
  const requirePreloaded=(map,key,scope)=>{if(failures.has(scope+key))throw Error(failures.get(scope+key));if(sealed&&!map.has(key))throw Error('SNAPSHOT_UNPREPARED_KEY');};
  const capture=(map,key,scope,fn)=>{requirePreloaded(map,key,scope);if(!map.has(key)){try{map.set(key,copy(fn()))}catch(e){failures.set(scope+key,e.message);throw e}}return copy(map.get(key))};
  const readTechnique=(id)=>{const k=id+'@'+pinned.technique;return capture(cache,k,'T:',()=>snap.readTechnique(id,pinned.technique,pinned.game))};
  const resolved={
    ...snap,
    resolveBuild:(raw,db,game)=>{const key=semantic({raw,db,game});return capture(buildCache,key,'B:',()=>snap.resolveBuild(copy(raw),db,game));},
    resolveEffects:(build,conditions,ch,v)=>{const key=semantic({build,conditions,ch,v});return capture(effectCache,key,'E:',()=>snap.resolveEffects(copy(build),copy(conditions),ch,v));}
   };
  return {
    snapshot:resolved,readTechnique,
    prepare(requests){
      ensure(!sealed,'SNAPSHOT_ALREADY_SEALED');
      ensure(Array.isArray(requests),'SNAPSHOT_REQUESTS_INVALID');
      const diagnostics=[];
      for(const [i,req] of requests.entries()){
        try{
          ensure(req&&req.build&&req.evaluation&&Array.isArray(req.evaluation.techniqueIds),'SNAPSHOT_REQUEST_INVALID');
          const build=resolved.resolveBuild(copy(req.build),pinned.equipment,pinned.game);
          for(const ch of ['normal','maximum']){
            try{resolved.resolveEffects(copy(build),copy(req.conditions||{}),ch,pinned.effects)}
            catch(e){diagnostics.push({request:i,channel:ch,reason:e.message})}
          }
          for(const id of req.evaluation.techniqueIds){
            try{readTechnique(id)}catch(e){diagnostics.push({request:i,techniqueId:id,reason:e.message})}
          }
        }catch(e){diagnostics.push({request:i,reason:e.message})}
      }
      sealed=true;
      return {diagnostics:copy(diagnostics),keys:{techniques:cache.size,builds:buildCache.size,effects:effectCache.size}};
    }
   };
 }
 function planFor(req,s){
  const selected=req.evaluation.techniqueIds;ensure(Array.isArray(selected)&&selected.length,'TECHNIQUES_MISSING');
  const events=[],revisions=[];
  selected.forEach((id,step)=>{const t=s.readTechnique(id);ensure(t?.id===id&&t.dataVersion===pinned.technique&&t.revision&&t.definitionStatus==='defined','TECHNIQUE_UNDEFINED');
   ensure(Array.isArray(t.events)&&(t.events.length||t.explicitNoOp===true),'EVENTS_UNDEFINED');revisions.push({id,revision:t.revision});
   t.events.forEach((ev,i)=>{ensure(['hit','consume','transition'].includes(ev.type),'EVENT_TYPE_INVALID');
    if(ev.type==='hit'){ensure(Array.isArray(ev.components)&&ev.components.length,'COMPONENTS_MISSING');const ids=new Set();for(const c of ev.components){ensure(c.id&&!ids.has(c.id)&&c.kind&&c.unit&&c.source&&num(c.coefficient),'DB_COMPONENT_INVALID');ids.add(c.id)}}
    events.push({...copy(ev),id:step+':'+i,techniqueId:id,revision:t.revision});
   });
  });
  return {events,expected:events.map(e=>e.id),signature:semantic(revisions)};
 }
 function applyEffects(component,effects,state,build,target,event){
  const out={coefficient:component.coefficient,stats:{attack:build.trueAttack,element:build.element,affinity:build.affinity},post:[],trace:[]};
  for(const [k,v] of Object.entries(out.stats))ensure(num(v),'BASE_STAT_INVALID_'+k);
  const targets=Array.isArray(component.parameters?.effectTargets)&&component.parameters.effectTargets.length?component.parameters.effectTargets:[component.kind];
  const stages=Array.isArray(component.parameters?.effectStages)&&component.parameters.effectStages.length?component.parameters.effectStages:null;
  const unit={coefficient:component.unit,attack:'true-attack',element:'display-element',affinity:'percent',damage:'damage'};
  for(const e of [...effects].filter(x=>targets.includes(x.target)&&(!stages||stages.includes(x.stage))).sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id))){
   ensure(unit[e.stage]&&num(e.amount)&&['add','multiply','cap'].includes(e.operation),'EFFECT_INVALID');
   ensure(e.operation==='multiply'?e.unit==='dimensionless':e.unit===unit[e.stage],'EFFECT_UNIT_MISMATCH');
   const active=condition(e.condition,{state,target,event});
   if(active==='unknown')throw Error('EFFECT_CONDITION_UNKNOWN_'+e.id);
   if(active==='false')continue;
   ensure(finite(out.coefficient)&&Object.values(out.stats).every(finite),'EFFECT_RESULT_NON_FINITE');
   if(e.stage==='damage')out.post.push({operation:e.operation,amount:e.amount});
   else {const dest=e.stage==='coefficient'?out:out.stats,key=e.stage;const v=dest[key];dest[key]=e.operation==='add'?v+e.amount:e.operation==='multiply'?v*e.amount:Math.min(v,e.amount);}
   ensure(finite(out.coefficient)&&Object.values(out.stats).every(finite),'EFFECT_RESULT_NON_FINITE');
   out.trace.push({id:e.id,stage:e.stage,unit:e.unit,order:e.order,source:e.source});
  }
  return out;
 }
 function aggregate(run,duration){
  const e=run.execution,complete=e.status==='complete'&&e.expected.length===e.executed.length&&e.expected.every((x,i)=>x===e.executed[i]);
  const componentsValid=run.components.every(c=>c.status==='available'&&finite(c.value));
  const sum=componentsValid?run.components.reduce((s,c)=>s+c.value,0):null;
  const total=!complete?bad('EXECUTION_INCOMPLETE'):!componentsValid?bad('COMPONENT_UNAVAILABLE'):!finite(sum)?bad('TOTAL_NON_FINITE'):good(sum);
  const time=num(duration)&&duration>0?good(duration):bad('DURATION_UNAVAILABLE');
  return {...run,metrics:{comboTotalDamage:total,comboDuration:time,comboDps:total.status==='available'&&time.status==='available'?(finite(total.value/time.value)?good(total.value/time.value):bad('DPS_NON_FINITE')):bad(total.status==='available'?'DURATION_UNAVAILABLE':total.reason)}};
 }
 function runChannel(build,req,plan,ch,s){
  const executed=[],components=[],issues=[];let state;
  try{
   state=copy(initialState(copy(build),ch,copy(req.conditions)));ensure(state&&typeof state==='object','STATE_INVALID');validateState(state);
   const effects=s.snapshot.resolveEffects(copy(build),copy(req.conditions),ch,pinned.effects);
   ensure(Array.isArray(effects),'EFFECTS_INVALID');
   const handler=handlers[build.weaponType];ensure(typeof handler==='function','HANDLER_NOT_IMPLEMENTED');
   for(const ev of plan.events){
    try{
     const before=copy(state);
     const decision=handler({event:copy(ev),state:copy(state),conditions:copy(req.conditions||{}),channel:ch,build:copy(build),effects:copy(effects),target:copy(req.target)});
     ensure(decision&&typeof decision==='object','DECISION_MISSING');
     if(ev.type==='hit'){
      const emit=decision.emit,inactive=decision.inactive,unresolved=decision.unresolved||[],reasons=decision.reasons&&typeof decision.reasons==='object'?decision.reasons:{};
      ensure(Array.isArray(emit)&&Array.isArray(inactive)&&Array.isArray(unresolved),'DISPOSITIONS_MISSING');
      const all=[...emit,...inactive,...unresolved],allowed=ev.components.map(c=>c.id);
      ensure(all.length===allowed.length&&new Set(all).size===all.length&&all.every(id=>allowed.includes(id)),'DISPOSITION_INVALID');
      for(const c of ev.components){
       const meta={id:c.id,eventId:ev.id,techniqueId:ev.techniqueId,revision:ev.revision,source:c.source,coefficientUnit:c.unit,damageUnit:'damage'};
       if(inactive.includes(c.id)){components.push({...meta,...good(0),disposition:'confirmed_inactive'});continue}
       if(unresolved.includes(c.id)){components.push({...meta,...bad(typeof reasons[c.id]==='string'?reasons[c.id]:'UNRESOLVED_DISPOSITION'),disposition:'unresolved'});continue}
       const applied=applyEffects(c,effects,state,build,req.target,ev),f=formulae[c.kind];
       const response=typeof f==='function'?f({kind:c.kind,coefficient:applied.coefficient,coefficientUnit:c.unit,parameters:copy(c.parameters||{}),target:copy(req.target),state:copy(state),stats:copy(applied.stats),build:copy(build)}):bad('FORMULA_NOT_IMPLEMENTED');
       ensure(response?.status==='unavailable'||response?.status==='available'&&num(response.value),'FORMULA_RESULT_INVALID');
       let result=response.status==='available'?response.value:null;
       if(result!==null){for(const post of applied.post){result=post.operation==='add'?result+post.amount:post.operation==='multiply'?result*post.amount:Math.min(result,post.amount);ensure(num(result),'POST_DAMAGE_NON_FINITE')}}
       components.push({...meta,...(result===null?bad(response.reason):good(result)),...(response?.details?{details:copy(response.details)}:{}),disposition:'emitted',effectsApplied:applied.trace});
      }
     }else{
       ensure(decision.nextState&&typeof decision.nextState==='object','NEXT_STATE_REQUIRED');
       const after=decision.nextState;validateState(after);
       let expected;
       if(ev.type==='consume'){
         const path=ev.resourcePath===undefined?[ev.resource]:ev.resourcePath;
         ensure(validPath(path)&&num(ev.amount)&&ev.amount>=0,'CONSUME_DEFINITION_INVALID');
         const current=readPath(before,path);
         ensure(current.status==='known'&&num(current.value)&&current.value>=ev.amount,'CONSUME_RESOURCE_INVALID');
         expected=copy(before);writePath(expected,path,current.value-ev.amount);
         ensure(stateEqual(after,expected),'CONSUME_TRANSITION_MISMATCH');
       }else if(ev.type==='transition'){
         expected=copy(before);
         if(Array.isArray(ev.operations)){
           const occupied=new Set();
           for(const op of ev.operations){
             ensure(op&&['set','add','transfer'].includes(op.op)&&validPath(op.path),'TRANSITION_OPERATION_INVALID');
             const key=pathIdentity(op.path);ensure(!occupied.has(key),'TRANSITION_DUPLICATE_PATH');occupied.add(key);
             if(op.op==='set'){ensure(Object.hasOwn(op,'value'),'TRANSITION_VALUE_MISSING');writePath(expected,op.path,op.value);}
             else if(op.op==='add'){const curr=readPath(expected,op.path);ensure(curr.status==='known'&&finite(curr.value)&&finite(op.amount),'TRANSITION_ADD_INVALID');let next=curr.value+op.amount;ensure(finite(next),'TRANSITION_OVERFLOW');if(op.cap!==undefined){ensure(finite(op.cap),'TRANSITION_CAP_INVALID');next=Math.min(next,op.cap)}writePath(expected,op.path,next);}
             else {ensure(validPath(op.to)&&pathIdentity(op.to)!==pathIdentity(op.path),'TRANSFER_TARGET_INVALID');ensure(!occupied.has(pathIdentity(op.to)),'TRANSITION_DUPLICATE_PATH');occupied.add(pathIdentity(op.to));const from=readPath(expected,op.path),to=readPath(expected,op.to);ensure(from.status==='known'&&to.status==='known'&&finite(from.value)&&finite(to.value),'TRANSFER_RESOURCE_INVALID');const amount=op.amount==='all'?from.value:op.amount;ensure(finite(amount)&&amount>=0&&from.value>=amount,'TRANSFER_AMOUNT_INVALID');ensure(finite(to.value+amount),'TRANSFER_OVERFLOW');writePath(expected,op.path,from.value-amount);writePath(expected,op.to,to.value+amount);}
           }
         }else{
           ensure(ev.updates&&typeof ev.updates==='object'&&!Array.isArray(ev.updates),'TRANSITION_DEFINITION_MISSING');
           Object.assign(expected,copy(ev.updates));
         }
         ensure(stateEqual(after,expected),'TRANSITION_MISMATCH');
       }
       state=expected;
     }
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
  return {status:'OK',weaponType:build.weaponType,diagnostics:copy(build.diagnostics||[]),versions:copy(pinned),conditionKey:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),comparisonContext:{damage:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind}),dps:semantic({target:req.target,conditions:req.conditions,plan:plan.signature,evaluationKind:req.evaluation.kind,duration:req.evaluation.duration})},channels:results};
 }
 function safeEvaluate(req,s){try{return evaluate(req,s)}catch(err){return {status:'FAILED',reason:err.message,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{metrics:{comboTotalDamage:bad(err.message),comboDps:bad(err.message)}}]))}}}
 return Object.freeze({evaluate,safeEvaluate,session});
}
module.exports={createPipeline};
