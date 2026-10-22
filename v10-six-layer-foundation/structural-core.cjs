'use strict';
/* V10 min3: L4 execution structure, deliberately without MH Wilds numeric formulas. */
const {datum, inputAdapter, buildResolver, effectResolver, resultAggregator, presentationAdapter, WEAPON_TYPES}=require('./core.cjs');
const copy=x=>structuredClone(x);
const requireObj=(x,n)=>{if(!x||typeof x!=='object'||Array.isArray(x))throw new TypeError(n+' must be object');return x};
const requireText=(x,n)=>{if(typeof x!=='string'||!x.trim())throw new TypeError(n+' required');return x};
const requireFinite=(x,n)=>{if(typeof x!=='number'||!Number.isFinite(x))throw new TypeError(n+' must be finite');return x};
const error=(code,message)=>({code,layer:'L4',message:String(message)});
const blank=(status,issues)=>({status,components:[],metrics:{},issues});
function validateTechnique(t,id,dbVersion){
 requireObj(t,'Technique DB record');
 if(t.id!==id)throw Error('TECHNIQUE_ID_MISMATCH');
 if(t.dbVersion!==dbVersion)throw Error('TECHNIQUE_VERSION_MISMATCH');
 requireText(t.revision,'technique.revision'); requireText(t.source,'technique.source');
 if(!Array.isArray(t.hits))throw Error('TECHNIQUE_HITS_MISSING');
 for(const [i,h] of t.hits.entries()){
  requireObj(h,'hit'); if(h.order!==i)throw Error('HIT_ORDER_INVALID');
  requireText(h.id,'hit.id'); requireText(h.unit,'hit.unit');
  if(!Array.isArray(h.components))throw Error('HIT_COMPONENTS_MISSING');
  for(const c of h.components){requireText(c.kind,'component.kind');requireText(c.unit,'component.unit');requireText(c.source,'component.source')}
 }
 return copy(t);
}
function resolveTechniques(selection,readTechnique,dbVersion){
 if(typeof readTechnique!=='function')throw TypeError('injected readTechnique required');
 if(!Array.isArray(selection)||selection.length===0)throw Error('TECHNIQUE_SELECTION_EMPTY');
 return selection.map((id)=>validateTechnique(readTechnique(id,dbVersion),id,dbVersion));
}
function initialState(build,conditions,channel,makeInitialState){
 if(typeof makeInitialState!=='function')throw TypeError('makeInitialState required');
 const s=requireObj(makeInitialState(copy(build),copy(conditions),channel),'InitialState');
 requireText(s.version,'state.version');requireObj(s.weapon,'state.weapon');requireObj(s.combat,'state.combat');
 return copy(s);
}
function validateEmission(e,step,record){
 requireObj(e,'emission');requireText(e.id,'emission.id');requireText(e.kind,'emission.kind');
 requireText(e.hitId,'emission.hitId');requireText(e.source,'emission.source');
 if(!record.hits.some(h=>h.id===e.hitId))throw Error('EMISSION_UNKNOWN_HIT');
 if(Object.hasOwn(e,'damage')||Object.hasOwn(e,'total')||Object.hasOwn(e,'dps')||Object.hasOwn(e,'metrics'))throw Error('HANDLER_MUST_NOT_COMPUTE_METRICS');
 return {...copy(e),techniqueId:record.id,revision:record.revision,step};
}
function executeChannel({channel,build,effectContext,request,records,handler,formulaRegistry,makeInitialState}){
 if(effectContext.status==='BLOCKED')return blank('BLOCKED',copy(effectContext.issues));
 if(typeof handler!=='function')return blank('NOT_IMPLEMENTED',[error('HANDLER_NOT_IMPLEMENTED',build.weaponType)]);
 let state=initialState(build,request.conditions,channel,makeInitialState);
 const components=[],issues=[],trace=[];
 for(const [step,record] of records.entries()){
  let plan;
  try{
   plan=requireObj(handler({technique:copy(record),state:copy(state),effects:copy(effectContext.effects),build:copy(build),target:copy(request.target),channel,step}),'Handler plan');
   if(!Array.isArray(plan.emissions))throw Error('HANDLER_EMISSIONS_MISSING');
   requireObj(plan.nextState,'nextState');
   requireText(plan.nextState.version,'nextState.version');requireObj(plan.nextState.weapon,'nextState.weapon');requireObj(plan.nextState.combat,'nextState.combat');
   if(Object.hasOwn(plan,'metrics')||Object.hasOwn(plan,'total')||Object.hasOwn(plan,'dps'))throw Error('HANDLER_MUST_NOT_AGGREGATE');
  }catch(e){issues.push(error('STATE_TRANSITION_FAILED',e.message));return {status:'PARTIAL',components,metrics:{},issues,trace,failedStep:step}}
  for(const emission of plan.emissions){
   try{
    const c=validateEmission(emission,step,record);
    const compute=formulaRegistry[c.kind];
    if(typeof compute!=='function'){
     components.push({...c,status:'unavailable',reason:'FORMULA_NOT_IMPLEMENTED'});
     continue;
    }
    const evaluated=requireObj(compute({emission:copy(c),effects:copy(effectContext.effects),beforeState:copy(state),afterState:copy(plan.nextState),build:copy(build),target:copy(request.target)}),'Formula result');
    if(evaluated.status==='available')requireFinite(evaluated.value,'component.value');
    else if(evaluated.status==='unavailable')requireText(evaluated.reason,'component.reason');
    else throw Error('FORMULA_STATUS_INVALID');
    components.push({...c,...copy(evaluated),effectsApplied:copy(evaluated.effectsApplied||[])});
   }catch(e){components.push({status:'unavailable',reason:'COMPONENT_FAILED',step,techniqueId:record.id,revision:record.revision,details:e.message})}
  }
  trace.push({step,techniqueId:record.id,revision:record.revision,beforeState:copy(state),afterState:copy(plan.nextState)});
  state=copy(plan.nextState);
 }
 return {status:components.some(c=>c.status==='unavailable')?'PARTIAL':'OK',components,metrics:{},issues,trace,finalState:state};
}
function aggregateComponents(result,request){
 const channels={};
 for(const ch of ['normal','maximum']){
  const r=result.channels[ch], out=copy(r);
  const unavailable=r.components.filter(c=>c.status!=='available');
  const available=r.components.filter(c=>c.status==='available');
  const total=unavailable.length?{status:'unavailable',reason:'COMPONENT_UNAVAILABLE',dependencies:unavailable.map(c=>({techniqueId:c.techniqueId,reason:c.reason}))}:{status:'available',value:available.reduce((s,c)=>s+c.value,0)};
  const time=request.evaluation.duration;
  const duration=Number.isFinite(time)&&time>0?{status:'available',value:time}:{status:'unavailable',reason:'DURATION_NOT_RESOLVED'};
  out.metrics.comboTotalDamage=total;
  out.metrics.comboDuration=duration;
  out.metrics.comboDps=total.status==='available'&&duration.status==='available'?{status:'available',value:total.value/duration.value}:{status:'unavailable',reason:total.status==='available'?'DURATION_NOT_RESOLVED':'COMPONENT_UNAVAILABLE'};
  channels[ch]=out;
 }
 return {...copy(result),channels};
}
function createStructuralPipeline({resolveBuild,resolveEffects,readTechnique,handlers={},formulaRegistry={},makeInitialState}){
 const raw=Object.freeze({...handlers});const formulas=Object.freeze({...formulaRegistry});
 function evaluate(source){
  const req=inputAdapter(source),build=buildResolver(req,resolveBuild),effects=effectResolver(build,req,resolveEffects);
  const channels={};
  for(const channel of ['normal','maximum']){
   try{
    const records=resolveTechniques(req.evaluation.techniqueIds,readTechnique,build.dbVersion);
    channels[channel]=executeChannel({channel,build,effectContext:effects[channel],request:req,records,handler:raw[build.weaponType],formulaRegistry:formulas,makeInitialState});
   }catch(e){channels[channel]=blank('BLOCKED',[error('TECHNIQUE_RESOLUTION_FAILED',e.message)])}
  }
  const baseline=resultAggregator(build,effects,channels,req);
  const aggregated=aggregateComponents({...baseline,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{...baseline.channels[ch],components:channels[ch].components,trace:channels[ch].trace||[],finalState:channels[ch].finalState||null}]))},req);
  return aggregated;
 }
 return Object.freeze({evaluate,present:x=>presentationAdapter(evaluate(x)),compare:(a,b)=>presentationAdapter(evaluate(a),evaluate(b))});
}
module.exports={resolveTechniques,initialState,executeChannel,aggregateComponents,createStructuralPipeline,WEAPON_TYPES,datum};
