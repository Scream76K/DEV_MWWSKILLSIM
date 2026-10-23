'use strict';
// V10 min4 structural prototype: no game formula, no DOM, no fallback.
const cp=x=>structuredClone(x);
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const unavailable=reason=>({status:'unavailable',reason});
const available=value=>({status:'available',value});
const channels=['normal','maximum'];
function pinVersions(refs){
 for(const k of ['game','equipment','technique','effects'])assert(typeof refs?.[k]==='string'&&refs[k],`VERSION_${k}_MISSING`);
 return Object.freeze(cp(refs));
}
function compilePlan({selected,versions,readTechnique}){
 assert(Array.isArray(selected)&&selected.length>0,'SELECTION_EMPTY');
 const steps=selected.map((id,step)=>{
  assert(typeof id==='string'&&id,'TECHNIQUE_ID_MISSING');
  const rec=readTechnique(id,versions.technique,versions.game);
  assert(rec?.id===id&&rec?.revision&&rec?.dataVersion===versions.technique,'TECHNIQUE_REVISION_OR_VERSION_MISMATCH');
  assert(Array.isArray(rec.hits),'HITS_MISSING');
  const events=[];
  for(const [hitIndex,hit] of rec.hits.entries()){
   assert(hit.id&&Array.isArray(hit.components),'HIT_INVALID');
   const refs=[];
   for(const c of hit.components){assert(c.id&&c.kind&&c.unit&&c.source&&finite(c.coefficient),'DB_COMPONENT_INVALID');refs.push(cp(c));}
   events.push({id:`${step}:${hitIndex}`,type:'hit',techniqueId:id,revision:rec.revision,hitId:hit.id,components:refs});
   events.push({id:`${step}:${hitIndex}:after`,type:'transition',techniqueId:id,hitId:hit.id});
  }
  return {id,revision:rec.revision,events};
 });
 return {versions:cp(versions),steps,expectedEvents:steps.flatMap(s=>s.events.map(e=>e.id))};
}
function applyEffects({component,effects,state}){
 const selected=effects.filter(e=>e.target===component.kind&&e.condition(state,component));
 selected.sort((a,b)=>a.order-b.order||a.id.localeCompare(b.id));
 let coefficient=component.coefficient;
 const trace=[];
 for(const e of selected){assert(['add','multiply','cap'].includes(e.operation)&&finite(e.amount),'EFFECT_INVALID');
  if(e.operation==='add')coefficient+=e.amount;
  if(e.operation==='multiply')coefficient*=e.amount;
  if(e.operation==='cap')coefficient=Math.min(coefficient,e.amount);
  trace.push({id:e.id,order:e.order,operation:e.operation,amount:e.amount});
 }
 return {coefficient,effectsApplied:trace};
}
function executeChannel({plan,initialState,handler,effects,formulae,build,channel}){
 let state=cp(initialState);
 const executed=[],componentResults=[],issues=[];
 if(typeof handler!=='function')return {channel,execution:{status:'incomplete',expected:plan.expectedEvents,executed,reason:'HANDLER_NOT_IMPLEMENTED'},components:componentResults,issues};
 outer:for(const step of plan.steps){for(const event of step.events){
  try{
   if(event.type==='hit'){
    const decision=handler({event:cp({id:event.id,type:event.type,techniqueId:event.techniqueId,hitId:event.hitId,componentIds:event.components.map(c=>c.id)}),state:cp(state),channel});
    assert(decision&&typeof decision==='object'&&Array.isArray(decision.emit),'HANDLER_DECISION_INVALID');
    const allowed=new Set(event.components.map(c=>c.id));
    assert(decision.emit.every(id=>allowed.has(id)),'NON_DB_COMPONENT_REF');
    assert(new Set(decision.emit).size===decision.emit.length,'DUPLICATE_COMPONENT_REF');
    assert(decision.emit.length===allowed.size || decision.inactive?.length===allowed.size-decision.emit.length,'UNDECLARED_COMPONENT');
    const inactive=new Set(decision.inactive||[]);
    assert([...inactive].every(id=>allowed.has(id)&&!decision.emit.includes(id)),'INVALID_INACTIVE_REF');
    for(const component of event.components){
     if(inactive.has(component.id)){componentResults.push({id:component.id,eventId:event.id,techniqueId:event.techniqueId,revision:event.revision,source:component.source,unit:component.unit,...available(0),disposition:'confirmed_inactive'});continue;}
     const applied=applyEffects({component,effects,state});
     const formula=formulae[component.kind];
     const result=typeof formula==='function'?formula({kind:component.kind,coefficient:applied.coefficient,unit:component.unit,state:cp(state),build:cp(build)}):unavailable('FORMULA_NOT_IMPLEMENTED');
     assert(result?.status==='unavailable'||(result?.status==='available'&&finite(result.value)),'FORMULA_RESULT_INVALID');
     componentResults.push({id:component.id,eventId:event.id,techniqueId:event.techniqueId,revision:event.revision,source:component.source,unit:component.unit,...cp(result),effectsApplied:applied.effectsApplied});
    }
   } else {
    const next=handler({event:cp({id:event.id,type:event.type,techniqueId:event.techniqueId,hitId:event.hitId}),state:cp(state),channel});
    assert(next&&typeof next==='object'&&next.nextState&&typeof next.nextState==='object','TRANSITION_INVALID');
    state=cp(next.nextState);
   }
   executed.push(event.id);
  }catch(e){issues.push({eventId:event.id,reason:e.message});break outer;}
 }}
 return {channel,execution:{status:executed.length===plan.expectedEvents.length?'complete':'incomplete',expected:cp(plan.expectedEvents),executed,reason:issues[0]?.reason||null},components:componentResults,issues,finalState:state};
}
function aggregate(result,duration){
 const {execution,components}=result;
 const notDone=execution.status!=='complete';
 const invalid=components.filter(c=>c.status!=='available');
 const total=notDone?unavailable('EXECUTION_INCOMPLETE'):invalid.length?unavailable('COMPONENT_UNAVAILABLE'):available(components.reduce((s,c)=>s+c.value,0));
 const time=finite(duration)&&duration>0?available(duration):unavailable('DURATION_UNAVAILABLE');
 const dps=total.status==='available'&&time.status==='available'?available(total.value/time.value):unavailable(total.status!=='available'?total.reason:time.reason);
 return {...cp(result),metrics:{comboTotalDamage:total,comboDuration:time,comboDps:dps}};
}
function createEngine({versions,readTechnique,resolveBuild,resolveEffects,initialState,handlers,formulae}){
 const pinned=pinVersions(versions);
 function evaluate(request){
  const build=resolveBuild(cp(request.build),pinned.equipment,pinned.game);
  const plan=compilePlan({selected:request.techniqueIds,versions:pinned,readTechnique});
  const output={versions:cp(pinned),plan:cp(plan),channels:{}};
  for(const ch of channels){
   try{const effects=resolveEffects(cp(build),ch,pinned.effects);const start=initialState(cp(build),ch,cp(request.conditions));
    output.channels[ch]=aggregate(executeChannel({plan,initialState:start,handler:handlers[build.weaponType],effects,formulae,build,channel:ch}),request.duration);
   }catch(e){output.channels[ch]=aggregate({channel:ch,execution:{status:'incomplete',expected:cp(plan.expectedEvents),executed:[],reason:e.message},components:[],issues:[{reason:e.message}]},request.duration);}
  }
  return output;
 }
 return Object.freeze({evaluate});
}
module.exports={pinVersions,compilePlan,applyEffects,executeChannel,aggregate,createEngine};
