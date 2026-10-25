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
  if(!finite(stats.element)||stats.element<0)return unavailable('PHYSICAL_ELEMENT_UNRESOLVED');
  if(!finite(stats.affinity))return unavailable('PHYSICAL_AFFINITY_UNRESOLVED');
  if(!expectedGameVersion||typeof expectedGameVersion!=='string')return unavailable('PHYSICAL_VERSION_UNRESOLVED');
  let sharp,hitzone,part=null;
  try{
   sharp=resolveSharpness({build,state,gameVersion:expectedGameVersion});
   hitzone=resolveHitzone({target,state,gameVersion:expectedGameVersion});
   if(parameters?.partModifier!==null&&parameters?.partModifier!==undefined)part=resolvePartModifier({parameters,build,state,gameVersion:expectedGameVersion});
  }catch(_){return unavailable('PHYSICAL_CONTEXT_RESOLUTION_FAILED')}
  const valid=(x)=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('PHYSICAL_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('PHYSICAL_HITZONE_UNRESOLVED');
  // partModifier is retained as sourced technique metadata, but the existing
  // HP formula does not apply the part-durability modifier to HP damage.
  // Require a resolved, version-matched value and deliberately leave it out
  // of the canonical HP calculation.
  if(part&&!valid(part))return unavailable('PHYSICAL_PART_MODIFIER_UNRESOLVED');
  let result;
   try{result=calculate({attack:stats.attack,affinity:stats.affinity,element:0,mv:coefficient,hz:hitzone.value,ehz:0,sharp:sharp.value,esharp:1,critBonus:Number(build?.equipment?.criticalBoostLevel)||0,elementCrit:false,criticalState:'expected'})}
  catch(_){return unavailable('PHYSICAL_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.p)||result.p<0)return unavailable('PHYSICAL_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.p};
 }
}
function createSourcedElementalFormula({calculate,resolveElementSharpness,resolveHitzone,expectedGameVersion}={}){
 if(typeof calculate!=='function'||typeof resolveElementSharpness!=='function'||typeof resolveHitzone!=='function')throw Error('ELEMENT_SOURCE_RESOLVERS_REQUIRED');
 return function elemental({coefficient,coefficientUnit,target,stats,build,state}={}){
  if(coefficientUnit!=='ELEMENT_MODIFIER'||!finite(coefficient)||coefficient<0)return unavailable('ELEMENT_MODIFIER_UNRESOLVED');
  if(!finite(stats?.element)||stats.element<0)return unavailable('ELEMENT_VALUE_UNRESOLVED');
  if(!finite(stats?.affinity))return unavailable('ELEMENT_AFFINITY_UNRESOLVED');
  if(!expectedGameVersion)return unavailable('ELEMENT_VERSION_UNRESOLVED');
  let sharp,hitzone;
  try{sharp=resolveElementSharpness({build,state,gameVersion:expectedGameVersion});hitzone=resolveHitzone({target,state,gameVersion:expectedGameVersion});}
  catch(_){return unavailable('ELEMENT_CONTEXT_RESOLUTION_FAILED')}
  const valid=x=>x&&x.gameVersion===expectedGameVersion&&typeof x.evidenceRef==='string'&&x.evidenceRef.length>0&&finite(x.value);
  if(!valid(sharp)||sharp.value<=0)return unavailable('ELEMENT_SHARPNESS_UNRESOLVED');
  if(!valid(hitzone)||hitzone.value<0||hitzone.value>100)return unavailable('ELEMENT_HITZONE_UNRESOLVED');
  let result;
  const criticalElementLevel=Number(build?.equipment?.criticalElementLevel)||0;
  try{result=calculate({attack:0,affinity:stats.affinity,element:stats.element*coefficient,elementKnown:true,typeKnown:true,elementType:build.elementType||build.equipment?.elementType||'none',mv:0,hz:0,ehz:hitzone.value,sharp:1,esharp:sharp.value,critBonus:0,elementCrit:criticalElementLevel>0,criticalState:'expected'});}
  catch(_){return unavailable('ELEMENT_CANONICAL_FORMULA_FAILED')}
  if(!result||!finite(result.e)||result.e<0)return unavailable('ELEMENT_CANONICAL_RESULT_INVALID');
  return {status:'available',value:result.e};
 };
}
module.exports={createSourcedPhysicalFormula,createSourcedElementalFormula};
