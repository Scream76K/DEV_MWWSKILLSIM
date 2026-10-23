'use strict';
/** V10 min5: one public pipeline. No game data, formulas, DOM or legacy fallback. */
const {inputAdapter, buildResolver, effectResolver, presentationAdapter, METRICS}=require('../core.cjs');
const {pinVersions, compilePlan, executeChannel, aggregate}=require('./event-engine.cjs');
const cp=x=>structuredClone(x);
const missing=reason=>({status:'unavailable',reason});
const channels=['normal','maximum'];
function finiteNumber(x){return typeof x==='number' && Number.isFinite(x)}
function normalizeEffects(context){
 if(context.status!=='OK')return {status:'BLOCKED', reason:'EFFECT_RESOLUTION_FAILED'};
 const effects=[];
 for(const e of context.effects){
  if(e.condition.status==='unknown'||e.amount.status==='unknown')return {status:'BLOCKED',reason:'EFFECT_CONDITION_UNRESOLVED'};
  if(e.condition.status==='not_applicable'||e.condition.status==='inactive')continue;
  if(e.condition.status!=='known'||typeof e.condition.value!=='boolean')return {status:'BLOCKED',reason:'EFFECT_CONDITION_INVALID'};
  if(e.amount.status!=='known'||!finiteNumber(e.amount.value))return {status:'BLOCKED',reason:'EFFECT_AMOUNT_UNRESOLVED'};
  effects.push({id:e.id,target:e.target,order:e.order,operation:e.operation,amount:e.amount.value,condition:()=>e.condition.value===true});
 }
 return {status:'OK',effects};
}
function blankChannel(plan,reason){return {execution:{status:'incomplete',expected:cp(plan.expectedEvents),executed:[],reason},components:[],issues:[{reason}]};}
function comparisonKey(req,build,versions,plan){return {
 weaponType:build.weaponType,targetId:req.target.id,hitZoneKey:req.target.hitZoneKey,
 evaluationKind:req.evaluation.kind,evaluationSignature:req.evaluation.signature,
 versions:JSON.stringify(versions),techniqueSignature:plan.steps.map(s=>s.id+'@'+s.revision).join('|')
};}
function createPipeline({versions,resolveBuild,resolveEffects,readTechnique,initialState,handlers={},formulae={}}){
 const pinned=pinVersions(versions);
 function evaluate(source){
  const req=inputAdapter(source);
  if(!Array.isArray(req.evaluation.techniqueIds)||!req.evaluation.techniqueIds.length)throw Error('TECHNIQUE_SELECTION_EMPTY');
  const build=buildResolver(req,(snapshot,request)=>resolveBuild(snapshot,pinned.equipment,pinned.game,request));
  if(build.dbVersion!==pinned.equipment)throw Error('EQUIPMENT_DB_VERSION_MISMATCH');
  const contexts=effectResolver(build,req,(resolved,conditions,ch,request)=>resolveEffects(resolved,conditions,ch,pinned.effects,request));
  const plan=compilePlan({selected:req.evaluation.techniqueIds,versions:pinned,readTechnique});
  const result={weaponType:build.weaponType,versions:cp(pinned),comparisonKey:comparisonKey(req,build,pinned,plan),plan:cp(plan),channels:{}};
  for(const ch of channels){
   let execution;
   const normalized=normalizeEffects(contexts[ch]);
   if(normalized.status==='BLOCKED')execution=blankChannel(plan,normalized.reason);
   else {
    try{
     const state=initialState(cp(build),ch,cp(req.conditions));
     execution=executeChannel({plan,initialState:state,handler:handlers[build.weaponType],effects:normalized.effects,formulae,build,channel:ch});
    }catch(e){execution=blankChannel(plan,e.message)}
   }
   const aggregated=aggregate(execution,req.evaluation.duration);
   const metrics=Object.fromEntries(METRICS.map(k=>[k,aggregated.metrics[k]??missing('NOT_CALCULATED')]));
   result.channels[ch]={...aggregated,metrics,issues:[...build.issues,...contexts[ch].issues,...aggregated.issues]};
  }
  return result;
 }
 return Object.freeze({evaluate,present:source=>presentationAdapter(evaluate(source)),compare:(a,b)=>presentationAdapter(evaluate(a),evaluate(b))});
}
module.exports={createPipeline,normalizeEffects};
