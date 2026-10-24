'use strict';
// Physical damage adapter: delegates game arithmetic to the existing canonical formula.
// No MV, sharpness multiplier, hitzone or game constants are embedded here.
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const unavailable=reason=>({status:'unavailable',reason});
function createSourcedPhysicalFormula({calculate,resolveSharpness,resolveHitzone,resolvePartModifier,expectedGameVersion}={}){
 if(typeof calculate!=='function'||typeof resolveSharpness!=='function'||typeof resolveHitzone!=='function'||typeof resolvePartModifier!=='function')throw Error('PHYSICAL_SOURCE_RESOLVERS_REQUIRED');
 return function physical({coefficient,coefficientUnit,parameters,target,stats,build,state}={}){
  if(coefficientUnit!=='MV'||!finite(coefficient)||coefficient<0)return unavailable('PHYSICAL_MV_UNRESOLVED');
  if(!finite(stats?.attack)||stats.attack<=0)return unavailable('PHYSICAL_ATTACK_UNRESOLVED');
  if(stats.element!==0)return unavailable('PHYSICAL_ELEMENT_NOT_ZERO');
  if(stats.affinity!==0)return unavailable('PHYSICAL_AFFINITY_UNSUPPORTED');
  if(Array.isArray(build?.skills?.entries)&&build.skills.entries.length!==0)return unavailable('PHYSICAL_SKILLS_UNSUPPORTED');
  if(!expectedGameVersion||typeof expectedGameVersion!=='string')return unavailable('PHYSICAL_VERSION_UNRESOLVED');
  let sharp,hitzone,part;
  try{
   sharp=resolveSharpness({build,state,gameVersion:expectedGameVersion});
   hitzone=resolveHitzone({target,state,gameVersion:expectedGameVersion});
   part=resolvePartModifier({parameters,build,state,gameVersion:expectedGameVersion});
  }catch(_){return unavailable('PHYSICAL_CONTEXT_RESOLUTION_FAILED')}
  const valid=(x)=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('PHYSICAL_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('PHYSICAL_HITZONE_UNRESOLVED');
  if(!valid(part)||part.value!==1)return unavailable('PHYSICAL_PART_MODIFIER_UNSUPPORTED');
  let result;
  try{result=calculate({attack:stats.attack,affinity:0,element:0,mv:coefficient,hz:hitzone.value,ehz:0,sharp:sharp.value,esharp:1,critBonus:0,elementCrit:false,criticalState:'noncritical'})}
  catch(_){return unavailable('PHYSICAL_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.p)||result.p<0)return unavailable('PHYSICAL_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.p};
 }
}
module.exports={createSourcedPhysicalFormula};
