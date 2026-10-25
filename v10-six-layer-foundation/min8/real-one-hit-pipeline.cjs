'use strict';
// Isolated real-DB entry candidate. Does not modify production HTML or define game damage numbers.
// Atomic source.capture must return equipment, effects and raw Technique DB in one immutable version bundle.
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {adaptOrdinaryPhysicalHit}=require('./real-technique-one-hit-adapter.cjs');
const {createSourcedPhysicalFormula,createSourcedElementalFormula}=require('./sourced-physical-formula.cjs');
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function createRealOneHitPipeline({versions,source,resolveBuild,resolveEffects,resolveSkillApplicability,initialState,formulae,canonicalPhysical,shellingFormula,referenceFormula,phialFormula,weaponType='hammer',techniqueId='HAM_SIDE_SWING',techniqueIds=null}){
 if(typeof source?.capture!=='function')throw Error('REAL_SLICE:ATOMIC_CAPTURE_REQUIRED');
 const physical=canonicalPhysical?createSourcedPhysicalFormula(canonicalPhysical):formulae?.physical;
 const elemental=canonicalPhysical&&typeof canonicalPhysical.resolveElementSharpness==='function'&&typeof canonicalPhysical.resolveElementHitzone==='function'?createSourcedElementalFormula({...canonicalPhysical,resolveElementSharpness:canonicalPhysical.resolveElementSharpness,resolveHitzone:canonicalPhysical.resolveElementHitzone}):formulae?.element;
 if(typeof physical!=='function')throw Error('REAL_SLICE:PHYSICAL_FORMULA_REQUIRED');
 if(canonicalPhysical?.expectedGameVersion!==undefined && canonicalPhysical.expectedGameVersion!==versions?.game)throw Error('REAL_SLICE:GAME_VERSION_MISMATCH');
 if(typeof resolveBuild!=='function'||typeof resolveEffects!=='function'||typeof initialState!=='function')throw Error('REAL_SLICE:RESOLVERS_REQUIRED');
 // The pinned technique is independent of A/B builds; the physical-only disposition is
 // checked against every build and each channel, rather than cached from one build.
 const selectedTechniqueIds=Array.isArray(techniqueIds)&&techniqueIds.length?techniqueIds:[techniqueId];
 const uniqueTechniqueIds=[...new Set(selectedTechniqueIds)];
 const openDataSnapshot=createImmutableProvider({
  capture:pinned=>{
   const image=source.capture(pinned);
   if(!image?.techniques)throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
   const techniques={};
   for(const id of uniqueTechniqueIds){
    if(!own(image.techniques,id))throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND:'+id);
    const record=image.techniques[id];
    // The element-disposition proof belongs to L2/L3 and must not be fabricated during capture.
    techniques[id]=adaptOrdinaryPhysicalHit({weaponType,techniqueId:id,record,dbVersion:pinned.technique,allowUnresolvedElement:true});
   }
   return {...image,techniques};
  },
  resolveBuild:(raw,equipment,request)=>{
   const result=resolveBuild(raw,equipment,request);
   if(result?.weaponType!==weaponType)throw Error('REAL_SLICE:WEAPON_MISMATCH');
   if(result?.equipment?.displayElement?.status!=='known'||!Number.isFinite(result.equipment.displayElement.value)||result.equipment.displayElement.value<0)throw Error('REAL_SLICE:ELEMENT_NOT_RESOLVED');
   if(result.equipment.displayElement.value>0&&(!result.equipment.elementType||typeof result.equipment.elementType!=='string'))throw Error('REAL_SLICE:ELEMENT_TYPE_NOT_RESOLVED');
   if(!Array.isArray(result.skills?.entries))throw Error('REAL_SLICE:SKILL_EFFECTS_NOT_PROVEN_ABSENT');
   const value=(x)=>x&&x.status==='known'&&Number.isFinite(x.value)?x.value:undefined;
   return {...result,
    trueAttack:result.trueAttack??value(result.equipment?.trueAttack),
    element:result.element??value(result.equipment?.displayElement),
    affinity:result.affinity??value(result.equipment?.baseAffinity)
   };
  },
  resolveEffects:(build,conditions,channel,effects)=>{
   const result=resolveEffects(build,conditions,channel,effects);
   if(!Array.isArray(result))throw Error('REAL_SLICE:EFFECTS_NOT_RESOLVED_ARRAY');
   const applicability=build.skills.entries.length===0?[]:(typeof resolveSkillApplicability==='function'?resolveSkillApplicability(build.skills.entries):null);
   if(!Array.isArray(applicability)||applicability.length!==build.skills.entries.length||applicability.some(x=>!['non_damage','resolved'].includes(x?.effectDisposition)||typeof x.reason!=='string'||typeof x.evidenceRef!=='string'))throw Error('REAL_SLICE:SKILL_APPLICABILITY_UNRESOLVED');
   for(const effect of result){
    if(!effect||typeof effect.id!=='string'||!['physical','element'].includes(effect.target)||!['attack','coefficient','element','affinity'].includes(effect.stage)||!['add','multiply','cap'].includes(effect.operation)||!Number.isFinite(effect.amount)||!Number.isInteger(effect.order)||typeof effect.source!=='string'||!effect.condition)throw Error('REAL_SLICE:EFFECT_SCHEMA_INVALID');
   }
   return result;
  }
 });
 const componentIds=(id,index)=>({physical:id+':physical:'+index,element:id+':element:'+index,shelling:id+':shelling:'+index,reference:id+':reference:'+index,phial:id+':phial:'+index});
 const lookup=(root,key)=>{
  if(!root||typeof root!=='object')return {found:false};
  if(Object.prototype.hasOwnProperty.call(root,key))return {found:true,value:root[key]};
  for(const value of Object.values(root)){if(value&&typeof value==='object'){const result=lookup(value,key);if(result.found)return result;}}
  return {found:false};
 };
 const requirementIssue=(requirement,conditions,damageStatsState)=>{
  for(const [key,expected] of Object.entries(requirement||{})){
   let actual=lookup(conditions,key);
   if(!actual.found&&key==='tripleExtract'){
    const extract=lookup(conditions,'extractState');
    if(extract.found)actual={found:true,value:extract.value==='TRIPLE_EXTRACT'||extract.value==='EXTRACT'};
   }
   if(!actual.found)return 'REAL_SLICE:STATE_REQUIREMENT_UNRESOLVED:'+key;
   if(actual.value!==expected)return 'REAL_SLICE:STATE_REQUIREMENT_MISMATCH:'+key;
  }
  if(damageStatsState!==undefined&&damageStatsState!==null){
   let actual=lookup(conditions,'damageStatsState');
   if(!actual.found){const extract=lookup(conditions,'extractState');if(extract.found)actual={found:true,value:extract.value};}
   if(!actual.found){const triple=lookup(conditions,'tripleExtract');if(triple.found)actual={found:true,value:triple.value?'TRIPLE_EXTRACT':'NO_EXTRACT'};}
   if(!actual.found)return 'REAL_SLICE:DAMAGE_STATS_STATE_UNRESOLVED:'+damageStatsState;
   const normalized=actual.value===true?'TRIPLE_EXTRACT':actual.value===false?'NO_EXTRACT':actual.value;
   if(normalized!==damageStatsState)return 'REAL_SLICE:DAMAGE_STATS_STATE_MISMATCH:'+damageStatsState;
   const stateStats=conditions?.stateStatsByState?.[damageStatsState];
   if(!stateStats||typeof stateStats!=='object'||!Number.isFinite(stateStats.attack)||!Number.isFinite(stateStats.element)||!Number.isFinite(stateStats.affinity))return 'REAL_SLICE:STATE_STATS_UNRESOLVED:'+damageStatsState;
  }
  return null;
 };
 const handlers={[weaponType]:({event,build,effects,conditions})=>{
  if(event.type!=='hit'||!uniqueTechniqueIds.includes(event.techniqueId)||!Array.isArray(event.components))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  const physicalEvents=event.components.filter(c=>c.kind==='physical'),elementEvents=event.components.filter(c=>c.kind==='element'),shellingEvents=event.components.filter(c=>c.kind==='shelling'),referenceEvents=event.components.filter(c=>c.kind==='reference'),phialEvents=event.components.filter(c=>c.kind==='phial');
  if(shellingEvents.length){
   if(physicalEvents.length||elementEvents.length||shellingEvents.length!==event.components.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:SHELLING_COMPONENT_MIXED']};
   const unresolved=shellingEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).shelling).map(c=>c.id);
   return {emit:shellingEvents.filter(c=>!unresolved.includes(c.id)).map(c=>c.id),inactive:[],unresolved};
  }
  if(referenceEvents.length){
   if(physicalEvents.length||elementEvents.length||shellingEvents.length||referenceEvents.length!==event.components.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:REFERENCE_COMPONENT_MIXED']};
   const unresolved=referenceEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).reference).map(c=>c.id);
   return {emit:referenceEvents.filter(c=>!unresolved.includes(c.id)).map(c=>c.id),inactive:[],unresolved};
  }
  if(!physicalEvents.length)return {emit:[],inactive:[],unresolved:['REAL_SLICE:PHYSICAL_COMPONENTS_UNRESOLVED']};
  const emit=[],inactive=[],unresolved=[],reasons={};
  for(const physicalEvent of physicalEvents){
   const index=physicalEvent.parameters?.hitIndex,ids=componentIds(event.techniqueId,index),elementEvent=elementEvents.find(c=>c.parameters?.hitIndex===index);
   if(physicalEvent.id!==ids.physical||elementEvent&&elementEvent.id!==ids.element||(!elementEvent&&event.components.some(c=>c.id===ids.element)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
   const modifier=elementEvent?.parameters?.elementModifier??physicalEvent.parameters?.elementModifier;
   const transition=physicalEvent.parameters?.damageStateTransition;
   let stateIssue=requirementIssue(physicalEvent.parameters?.stateRequirement,conditions,transition?null:physicalEvent.parameters?.damageStatsState);
   if(!stateIssue&&transition){
    const activation=transition.requiredAtActivation;
    if(activation==='TRIPLE_EXTRACT')stateIssue=requirementIssue({tripleExtract:true},conditions,null);
    else if(typeof activation!=='string'||!activation)stateIssue='REAL_SLICE:STATE_TRANSITION_UNRESOLVED';
    if(!stateIssue&&typeof transition.damageStatsState!=='string')stateIssue='REAL_SLICE:DAMAGE_STATS_STATE_UNRESOLVED';
    if(!stateIssue){const stateStats=conditions?.stateStatsByState?.[transition.damageStatsState];if(!stateStats||typeof stateStats!=='object'||!Number.isFinite(stateStats.attack)||!Number.isFinite(stateStats.element)||!Number.isFinite(stateStats.affinity))stateIssue='REAL_SLICE:STATE_STATS_UNRESOLVED:'+transition.damageStatsState;}
   }
   if(stateIssue){unresolved.push(ids.physical);reasons[ids.physical]=stateIssue;if(elementEvent){unresolved.push(ids.element);reasons[ids.element]=stateIssue;}continue;}
   if(!Number.isFinite(modifier)||modifier<0){unresolved.push(ids.element);continue;}
   emit.push(ids.physical);
   if(modifier===0){if(elementEvent)inactive.push(ids.element);continue;}
   if(build?.element===0){if(elementEvent)inactive.push(ids.element);continue;}
   if(!Number.isFinite(build?.element)||!Array.isArray(effects)){if(elementEvent)unresolved.push(ids.element);continue;}
   if(elementEvent)emit.push(ids.element);
  }
  const phialUnresolved=phialEvents.filter(c=>c.id!==componentIds(event.techniqueId,c.parameters?.hitIndex).phial).map(c=>c.id);
  unresolved.push(...phialUnresolved);
  emit.push(...phialEvents.filter(c=>!phialUnresolved.includes(c.id)).map(c=>c.id));
  if(event.components.some(c=>!emit.includes(c.id)&&!inactive.includes(c.id)&&!unresolved.includes(c.id)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  return {emit,inactive,unresolved,reasons};
 }};
 return createPipeline({versions,openDataSnapshot,initialState,handlers,formulae:{physical,element:elemental,shelling:shellingFormula,reference:referenceFormula,phial:phialFormula}});
}
module.exports={createRealOneHitPipeline};
