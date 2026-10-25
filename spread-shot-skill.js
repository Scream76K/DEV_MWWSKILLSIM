(function(root){'use strict';
 function resolve(rule,{weaponKind,techniqueId,component,level}={}){
  if(!rule||rule.skillId!==2||rule.component!=='PHYSICAL_ONLY'||!rule.targets||!Array.isArray(rule.multipliers))throw Error('SPREAD_SKILL:CONTRACT_UNRESOLVED');
  if(!Number.isInteger(level)||level<0||!Object.hasOwn(rule.multipliers,level))throw Error('SPREAD_SKILL:LEVEL_UNSUPPORTED');
  const eligible=component==='physical'&&Array.isArray(rule.targets[weaponKind])&&rule.targets[weaponKind].includes(techniqueId);
  const multiplier=eligible?rule.multipliers[level]:1;
  if(!Number.isFinite(multiplier)||multiplier<1)throw Error('SPREAD_SKILL:MULTIPLIER_UNRESOLVED');
  return {id:'spread-power-physical',skillId:rule.skillId,level,eligible,applied:eligible&&level>0,multiplier,source:rule.source,status:rule.status};
 }
 const api=Object.freeze({resolve});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWSpreadShotSkill=api;
})(typeof window!=='undefined'?window:globalThis);
