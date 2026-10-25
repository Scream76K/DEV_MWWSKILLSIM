'use strict';
// Isolated real-DB entry candidate. Does not modify production HTML or define game damage numbers.
// Atomic source.capture must return equipment, effects and raw Technique DB in one immutable version bundle.
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {adaptOrdinaryPhysicalHit}=require('./real-technique-one-hit-adapter.cjs');
const {createSourcedPhysicalFormula,createSourcedElementalFormula}=require('./sourced-physical-formula.cjs');
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function createRealOneHitPipeline({versions,source,resolveBuild,resolveEffects,resolveSkillApplicability,initialState,formulae,canonicalPhysical,weaponType='hammer',techniqueId='HAM_SIDE_SWING'}){
 if(typeof source?.capture!=='function')throw Error('REAL_SLICE:ATOMIC_CAPTURE_REQUIRED');
 const physical=canonicalPhysical?createSourcedPhysicalFormula(canonicalPhysical):formulae?.physical;
 const elemental=canonicalPhysical&&typeof canonicalPhysical.resolveElementSharpness==='function'&&typeof canonicalPhysical.resolveElementHitzone==='function'?createSourcedElementalFormula({...canonicalPhysical,resolveElementSharpness:canonicalPhysical.resolveElementSharpness,resolveHitzone:canonicalPhysical.resolveElementHitzone}):formulae?.element;
 if(typeof physical!=='function')throw Error('REAL_SLICE:PHYSICAL_FORMULA_REQUIRED');
 if(canonicalPhysical?.expectedGameVersion!==undefined && canonicalPhysical.expectedGameVersion!==versions?.game)throw Error('REAL_SLICE:GAME_VERSION_MISMATCH');
 if(typeof resolveBuild!=='function'||typeof resolveEffects!=='function'||typeof initialState!=='function')throw Error('REAL_SLICE:RESOLVERS_REQUIRED');
 // The pinned technique is independent of A/B builds; the physical-only disposition is
 // checked against every build and each channel, rather than cached from one build.
 const openDataSnapshot=createImmutableProvider({
  capture:pinned=>{
   const image=source.capture(pinned);
   if(!image?.techniques||!own(image.techniques,techniqueId))throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
   const record=image.techniques[techniqueId];
   // The element-disposition proof belongs to L2/L3 and must not be fabricated during capture.
   // This narrow bridge accepts physical-only data only after both build and effect gates below.
   // Preserve static element/part values, but do not assert the L2/L3 element
   // disposition while opening the immutable snapshot.
   const adapted=adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion:pinned.technique,allowUnresolvedElement:true});
   return {...image,techniques:{[techniqueId]:adapted}};
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
 const componentId=techniqueId+':physical:0',elementComponentId=techniqueId+':element:0';
 const handlers={[weaponType]:({event,build,effects})=>{
  if(event.type!=='hit'||event.techniqueId!==techniqueId||!Array.isArray(event.components))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  const physicalEvent=event.components.find(c=>c.id===componentId),elementEvent=event.components.find(c=>c.id===elementComponentId);
  if(!physicalEvent||event.components.some(c=>![componentId,elementComponentId].includes(c.id)))throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  const modifier=elementEvent?.parameters?.elementModifier??physicalEvent.parameters?.elementModifier;
  if(!Number.isFinite(modifier)||modifier<0)throw Error('REAL_SLICE:ELEMENT_COMPONENT_UNRESOLVED');
  if(modifier===0)return {emit:[componentId],inactive:[],unresolved:[]};
  if(build?.element===0)return {emit:[componentId],inactive:[elementComponentId],unresolved:[]};
  if(!Number.isFinite(build?.element)||!Array.isArray(effects))return {emit:[componentId],inactive:[],unresolved:[elementComponentId]};
  return {emit:[componentId,elementComponentId],inactive:[],unresolved:[]};
 }};
 return createPipeline({versions,openDataSnapshot,initialState,handlers,formulae:{physical,element:elemental}});
}
module.exports={createRealOneHitPipeline};
