(function(root){
 'use strict';
 const valid=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('BOW_REFERENCE:INVALID_INPUT');return n;};
 function standard(o,engine,techniqueIds){
  if(!o||!engine||typeof engine.get!=='function'||typeof engine.hits!=='function'||!Array.isArray(techniqueIds)||techniqueIds.length!==3)throw Error('BOW_REFERENCE:TECHNIQUE_DB_REQUIRED');
  const rule=engine.get('bow','BOW_STATE_MODIFIERS')?.specialSourceValues;
  if(rule?.status!=='SOURCE_CONFIRMED'||rule.scope!=='FIXED_BOW_STANDARD_SOURCE_REFERENCE')throw Error('BOW_REFERENCE:STATE_RULE_UNVERIFIED');
  const state=o.state;
  if(state?.chargeLevel!==3||!Object.hasOwn(rule.rangePhysical,state.range)||!Object.hasOwn(rule.coatingPhysical,state.coating))throw Error('BOW_REFERENCE:STATE_UNRESOLVED');
  if(state.coating==='CLOSE_RANGE'&&state.range!=='CRITICAL')throw Error('BOW_REFERENCE:CLOSE_RANGE_OUTSIDE_CRITICAL');
  const attack=valid(o.attack,0,10000),element=valid(o.element,0,100000),affinity=valid(o.affinity,-100,100),criticalMultiplier=valid(o.criticalMultiplier,1,2),hz=valid(o.physicalHitzone,0,100),ehz=valid(o.elementalHitzone,0,100);
  const rangePhysicalModifier=valid(rule.rangePhysical[state.range],0,2),coatingPhysicalModifier=valid(rule.coatingPhysical[state.coating],1,2);
  const skills={normalUp:0,spreadUp:0,chargeMaster:0,criticalElement:0,bladescaleLoading:0,firstShot:0,forceShot:0,...o.skills},skillRules=rule.skillRules;
  const modifier=name=>{const level=skills[name],r=skillRules?.[name];if(!Number.isInteger(level)||level<0||!r||!Object.hasOwn(r.multipliers,level))throw Error('BOW_REFERENCE:SKILL_LEVEL_INVALID:'+name);return valid(r.multipliers[level],1,2);};
  const normalUp=modifier('normalUp'),spreadUp=modifier('spreadUp'),chargeMaster=modifier('chargeMaster'),criticalElement=modifier('criticalElement'),bladescale=modifier('bladescaleLoading');
  modifier('firstShot');
  if(skillRules.firstShot.component!=='NOT_APPLICABLE_TO_BOW'||skillRules.firstShot.scope!=='BOWGUN_ONLY')throw Error('BOW_REFERENCE:FIRST_SHOT_SCOPE_UNRESOLVED');
  const firstShot={level:skills.firstShot,status:'NOT_APPLICABLE_TO_BOW',damageIncluded:false,scope:skillRules.firstShot.scope};
  const bladeRule=skillRules.bladescaleLoading;
  if(skills.bladescaleLoading&&typeof o.bladescaleLoadingActive!=='boolean')throw Error('BOW_REFERENCE:BLADESCALE_STATE_UNRESOLVED');
  const bladeEligible=bladeRule.coatings.includes(state.coating),bladeActive=!!skills.bladescaleLoading&&o.bladescaleLoadingActive===true&&bladeEligible;
  if(bladeActive&&(techniqueIds.some((id,i)=>id!==bladeRule.techniqueIds[i])||bladeRule.techniqueIds.length!==techniqueIds.length))throw Error('BOW_REFERENCE:BLADESCALE_ROUTE_UNRESOLVED');
  const bladescalePhysicalModifier=bladeActive?bladescale:1;
  let remainingShots=bladeActive?bladeRule.startingShots:0;
  const bladescaleLoading={status:!skills.bladescaleLoading||!o.bladescaleLoadingActive?'INACTIVE':!bladeEligible?'INELIGIBLE_COATING':'ACTIVE_REFERENCE',startingShots:remainingShots,remainingShots,stages:[],condition:bladeActive?'PERFECT_EVADE_PREACTIVATED_THREE_SHOTS':'NOT_APPLIED',scope:'FIXED_STANDARD_ONLY_NOT_UPTIME_OR_DPS'};
  const forceRule=skillRules.forceShot,forceLevel=skills.forceShot;
  if(!Number.isInteger(forceLevel)||forceLevel<0||!forceRule||!Object.hasOwn(forceRule.attackAdds,forceLevel)||!Object.hasOwn(forceRule.affinityAdds,forceLevel))throw Error('BOW_REFERENCE:SKILL_LEVEL_INVALID:forceShot');
  const forceEligible=forceRule.coatings.includes(state.coating),forceActive=!!forceLevel&&forceEligible&&!bladeActive;
  if(forceActive&&(!Number.isInteger(state.startShot)||state.startShot<1||state.startShot+techniqueIds.length-1>forceRule.magazineShots))throw Error('BOW_REFERENCE:FORCE_SHOT_STATE_UNRESOLVED');
  if(forceActive&&techniqueIds.some((id,i)=>id!==forceRule.techniqueIds[i]))throw Error('BOW_REFERENCE:FORCE_SHOT_ROUTE_UNRESOLVED');
  const forceShot={level:forceLevel,status:!forceLevel?'INACTIVE':!forceEligible?'NO_COATING':bladeActive?'EXCLUDED_BLADESCALE_SHOTS':'ACTIVE_REFERENCE',startShot:forceActive?state.startShot:null,stages:[],scope:'EXPLICIT_FIXED_THREE_SHOT_WINDOW_NOT_UPTIME_OR_DPS'};
  let effectiveElement=element;
  if(skills.chargeMaster&&element>0){
   const b=o.elementBasis;
   if(!b||!['weaponBase','normalMultiplier','normalFlat','conditionalFlat'].every(k=>typeof b[k]==='number'&&Number.isFinite(b[k])&&b[k]>=0)||Math.abs(b.weaponBase*b.normalMultiplier+b.normalFlat+b.conditionalFlat-element)>1e-6)throw Error('BOW_REFERENCE:CHARGE_MASTER_ELEMENT_COMPONENTS_UNRESOLVED');
   effectiveElement=b.weaponBase*b.normalMultiplier*chargeMaster+b.normalFlat+b.conditionalFlat;
  }
  let physical=0,elementTotal=0;const trace=[];
  for(const [stageIndex,id] of techniqueIds.entries()){
   const r=engine.get('bow',id);
   if(r?.sourceFormula?.scope!=='FIXED_BOW_STANDARD_SOURCE_REFERENCE'||r.sourceFormula.physicalShotCorrectionOwnedByStateRecord!==true)throw Error('BOW_REFERENCE:TECHNIQUE_SOURCE_UNVERIFIED');
   const hits=engine.hits('bow',id);if(!hits.length)throw Error('BOW_REFERENCE:HITS_UNAVAILABLE');
   if(bladeActive){const cost=bladeRule.shotCosts[id];if(!Number.isInteger(cost)||cost<1||remainingShots<cost)throw Error('BOW_REFERENCE:BLADESCALE_ROUTE_UNRESOLVED');remainingShots-=cost;bladescaleLoading.stages.push({techniqueId:id,shotCost:cost,remainingShots});}
   const ordinal=forceActive?state.startShot+stageIndex:null,forceAttackAdd=forceActive&&forceRule.attackOrdinals.includes(ordinal)?valid(forceRule.attackAdds[forceLevel],0,100):0,forceAffinityAdd=forceActive&&ordinal>=forceRule.affinityFrom?valid(forceRule.affinityAdds[forceLevel],0,100):0;
   const shotAffinity=Math.min(100,affinity+forceAffinityAdd),shotAttack=attack+forceAttackAdd;
   const crit=shotAffinity>=0?1+shotAffinity/100*(criticalMultiplier-1):1+shotAffinity/100*.25,elementCriticalExpectation=1+Math.max(0,shotAffinity)/100*(criticalElement-1);
   forceShot.stages.push({techniqueId:id,ordinal,attackAdd:forceAttackAdd,affinityAdd:forceAffinityAdd,attack:shotAttack,affinity:shotAffinity});
   const shotSkillPhysicalModifier=(skillRules.normalUp.techniqueIds.includes(id)?normalUp:1)*(skillRules.spreadUp.techniqueIds.includes(id)?spreadUp:1);
   if(skills.chargeMaster&&element>0&&!skillRules.chargeMaster.techniqueIds.includes(id))throw Error('BOW_REFERENCE:CHARGE_MASTER_ROUTE_UNRESOLVED');
   for(const h of hits){const mv=valid(h.mv,0,10000),em=valid(h.elementModifier,0,10),p=shotAttack*mv/100*hz/100*crit*rangePhysicalModifier*coatingPhysicalModifier*shotSkillPhysicalModifier*bladescalePhysicalModifier,e=effectiveElement/10*ehz/100*em*elementCriticalExpectation;physical+=p;elementTotal+=e;trace.push({...h,physical:p,element:e,rangePhysicalModifier,coatingPhysicalModifier,shotSkillPhysicalModifier,bladescalePhysicalModifier,forceShotOrdinal:ordinal,forceAttackAdd,forceAffinityAdd,shotAffinity,chargeMasterElementModifier:chargeMaster,criticalElementModifier:criticalElement,elementCriticalExpectation,criticalExpectation:crit,sharpnessApplied:false,coatingElementApplied:false});}
  }
  bladescaleLoading.remainingShots=remainingShots;
  return {status:'SOURCE_REFERENCE',comparisonPower:physical+elementTotal,physical,element:elementTotal,special:0,trace,affinity,state:{...state},skills:{...skills},firstShot,forceShot,bladescaleLoading,effectiveDisplayedElement:effectiveElement,elementBasis:o.elementBasis?{...o.elementBasis}:null,rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING'};
 }
 const api=Object.freeze({standard});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowReference=api;
})(typeof window!=='undefined'?window:globalThis);
