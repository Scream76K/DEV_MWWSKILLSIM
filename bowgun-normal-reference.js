(function(root){
 'use strict';
 const valid=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('HBG_NORMAL:INVALID_INPUT');return n;};
 function shot(o,engine){
  if(!engine||typeof engine.get!=='function')throw Error('HBG_NORMAL:TECHNIQUE_DB_REQUIRED');
  const kind=o?.weaponKind||'heavy-bowgun',lbg=kind==='light-bowgun';
  if(!['heavy-bowgun','light-bowgun'].includes(kind))throw Error('BOWGUN_NORMAL:WEAPON_UNSUPPORTED');
  const prefix=lbg?'LBG':'HBG',record=engine.get(kind,prefix+'_NORMAL_REFERENCE_RULES'),rule=record?.specialSourceValues,s=o?.state;
  if(lbg){
   if(!rule||!rule.supportedLevels?.includes(s?.ammoLevel)||s?.shotMode!=='NORMAL'||s?.contactPolicy!=='ALL_THREE'||s?.range!=='CRITICAL'||s?.normalModeLevel!==0)throw Error('LBG_NORMAL:LIMITED_STATE_UNRESOLVED');
   if(o.normalUp!==0||(o.firstShot??0)!==0||(o.forceShot??0)!==0)throw Error('LBG_NORMAL:UNREVIEWED_SKILL');
  }
  if(rule?.status!=='SOURCE_CONFIRMED'||rule.scope!=='EXPLICIT_COMMON_NORMAL_AMMO_SCENARIO')throw Error('HBG_NORMAL:SOURCE_UNRESOLVED');
  if(!s||s.ammoType!=='NORMAL'||!Number.isInteger(s.ammoLevel)||s.ammoLevel<1||s.ammoLevel>3||!Object.hasOwn(rule.physicalRange,s.range)||!Number.isInteger(s.normalModeLevel)||!Object.hasOwn(rule.normalMode,s.normalModeLevel))throw Error('HBG_NORMAL:STATE_UNRESOLVED');
  const source=engine.get(kind,prefix+'_NORMAL_AMMO_'+s.ammoLevel),ammo=source?.specialSourceValues;
  if(!ammo||!Number.isInteger(ammo.hitCount)||ammo.hitCount!==rule.hitCount)throw Error('HBG_NORMAL:AMMO_SOURCE_UNRESOLVED');
  const mv=valid(ammo.mvPerHit,0,100),attack=valid(o.attack,0,10000),affinity=valid(o.affinity,-100,100),criticalMultiplier=valid(o.criticalMultiplier,1,2),hz=valid(o.physicalHitzone,0,100),normalUp=o.normalUp;
  if(!Number.isInteger(normalUp)||!Object.hasOwn(rule.normalUp,normalUp))throw Error('HBG_NORMAL:SKILL_LEVEL_INVALID');
  const range=valid(rule.physicalRange[s.range],0,1),mode=valid(rule.normalMode[s.normalModeLevel],1,2),up=valid(rule.normalUp[normalUp],1,2),crit=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+affinity/100*.25;
  const firstShot=o.firstShot??0,forceShot=o.forceShot??0,rules=rule.shotSkills;
  if(!Number.isInteger(firstShot)||firstShot<0||firstShot>3||!Number.isInteger(forceShot)||forceShot<0||forceShot>3)throw Error('HBG_NORMAL:SKILL_LEVEL_INVALID');
  let shotAttackAdd=0,shotAffinityAdd=0;
  if(firstShot||forceShot){
   if(!rules)throw Error('HBG_NORMAL:SHOT_SKILL_SOURCE_UNRESOLVED');
   if(!Number.isInteger(s.magazineCapacity)||s.magazineCapacity<1||s.magazineCapacity>99||!Number.isInteger(s.shotOrdinal)||s.shotOrdinal<1||s.shotOrdinal>s.magazineCapacity||typeof s.fullMagazine!=='boolean')throw Error('HBG_NORMAL:SHOT_POSITION_PENDING');
   if(s.shotOrdinal===1&&s.fullMagazine)shotAttackAdd+=valid(rules.firstAttack[firstShot],0,100);
   if(rules.forceAttackOrdinals.includes(s.shotOrdinal))shotAttackAdd+=valid(rules.forceAttack[forceShot],0,100);
   if(s.shotOrdinal>=rules.forceAffinityStart)shotAffinityAdd=valid(rules.forceAffinity[forceShot],0,100);
  }
  const effectiveAffinity=Math.min(100,affinity+shotAffinityAdd),shotCrit=effectiveAffinity>=0?1+effectiveAffinity/100*(criticalMultiplier-1):1+effectiveAffinity/100*.25;
  const weaponPhysicalModifier=lbg?valid(rule.weaponPhysicalModifier,0,2):1;
  const core=typeof module==='object'&&module.exports?require('./common-damage-core.js'):root.CommonDamageCore;
  if(!core?.ordinaryHit||!core?.expectedHit||!core?.affinityBranches)throw Error('BOWGUN_NORMAL:COMMON_DAMAGE_CORE_REQUIRED');
  // Normal ammunition has no weapon element or sharpness component. Already
  // resolved skill stats and shot-local additions enter the shared formula once.
  const raw=core.ordinaryHit({stats:{attack:attack+shotAttackAdd,element:0},hit:{
    motionRatio:mv/100,physicalHitzoneRatio:hz/100,physicalSharpness:1,
    physicalMultiplier:range*mode*up*weaponPhysicalModifier,
    elementRatio:0,elementHitzoneRatio:0,elementSharpness:1,elementMultiplier:1}});
  const branches=core.affinityBranches({chance:effectiveAffinity/100,positivePhysical:criticalMultiplier,
    negativePhysical:.75,positiveElement:1,negativeElement:1});
  // Preserve the adopted unrounded reference: neither branches nor sum round.
  const perHit=core.expectedHit(raw,branches,value=>value).physical;
  const trace=Array.from({length:ammo.hitCount},(_,i)=>({calculationEngine:'COMMON_DAMAGE_CORE',hit:i+1,techniqueId:source.techniqueId,mv,physical:perHit,element:0,weaponPhysicalModifier,rangePhysicalModifier:range,normalModeModifier:mode,normalUpModifier:up,criticalExpectation:shotCrit,shotOrdinal:s.shotOrdinal??null,shotAttackAdd,shotAffinityAdd,effectiveAffinity,sharpnessApplied:false,weaponElementApplied:false})),physical=perHit*ammo.hitCount;
  return {status:'SOURCE_REFERENCE',profileId:prefix+'_NORMAL_AMMO_'+s.ammoLevel+'_THREE_CONTACT_REFERENCE',scope:rule.scope,comparisonPower:physical,physical,element:0,special:0,trace,state:{...s},skills:{normalUp,firstShot,forceShot},shotSkills:{shotAttackAdd,shotAffinityAdd,effectiveAffinity},ammoCapacityVerified:false,weaponApplicability:'UNVERIFIED',rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:[...record.evidenceRefs,...source.evidenceRefs]};
 }
 const api=Object.freeze({shot});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowgunNormalReference=api;
})(typeof window!=='undefined'?window:globalThis);
