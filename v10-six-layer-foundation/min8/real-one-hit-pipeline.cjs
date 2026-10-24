'use strict';
// Isolated real-DB entry candidate. Does not modify production HTML or define game damage numbers.
// Atomic source.capture must return equipment, effects and raw Technique DB in one immutable version bundle.
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {adaptOrdinaryPhysicalHit}=require('./real-technique-one-hit-adapter.cjs');
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function createRealOneHitPipeline({versions,source,resolveBuild,resolveEffects,initialState,formulae,weaponType='hammer',techniqueId='HAM_SIDE_SWING'}){
 if(typeof source?.capture!=='function')throw Error('REAL_SLICE:ATOMIC_CAPTURE_REQUIRED');
 if(typeof formulae?.physical!=='function')throw Error('REAL_SLICE:PHYSICAL_FORMULA_REQUIRED');
 if(typeof resolveBuild!=='function'||typeof resolveEffects!=='function'||typeof initialState!=='function')throw Error('REAL_SLICE:RESOLVERS_REQUIRED');
 // The pinned technique is independent of A/B builds; the physical-only disposition is
 // checked against every build and each channel, rather than cached from one build.
 const openDataSnapshot=createImmutableProvider({
  capture:pinned=>{
   const image=source.capture(pinned);
   if(!image?.techniques||!own(image.techniques,techniqueId))throw Error('REAL_SLICE:TECHNIQUE_NOT_FOUND');
   const record=image.techniques[techniqueId];
   const adapted=adaptOrdinaryPhysicalHit({weaponType,techniqueId,record,dbVersion:pinned.technique,
    elementContext:{displayElement:0,effectsResolved:true,activeElementEffects:[]}});
   return {...image,techniques:{[techniqueId]:adapted}};
  },
  resolveBuild:(raw,equipment,request)=>{
   const result=resolveBuild(raw,equipment,request);
   if(result?.weaponType!==weaponType)throw Error('REAL_SLICE:WEAPON_MISMATCH');
   if(result?.equipment?.displayElement?.status!=='known'||result.equipment.displayElement.value!==0)throw Error('REAL_SLICE:ZERO_ELEMENT_NOT_PROVEN');
   return result;
  },
  resolveEffects:(build,conditions,channel,effects)=>{
   const result=resolveEffects(build,conditions,channel,effects);
   // Any unresolved or active effect requires a future full elemental/skill route.
   if(!Array.isArray(result)||result.length!==0)throw Error('REAL_SLICE:EFFECTS_NOT_RESOLVED_EMPTY');
   return result;
  }
 });
 const componentId=techniqueId+':physical:0';
 const handlers={[weaponType]:({event})=>{
  if(event.type!=='hit'||event.techniqueId!==techniqueId||event.components?.length!==1||event.components[0].id!==componentId)throw Error('REAL_SLICE:UNSUPPORTED_EVENT');
  return {emit:[componentId],inactive:[],unresolved:[]};
 }};
 return createPipeline({versions,openDataSnapshot,initialState,handlers,formulae:{physical:formulae.physical}});
}
module.exports={createRealOneHitPipeline};
