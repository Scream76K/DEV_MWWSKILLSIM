(function(root){
 'use strict';
 const valid=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('HBG_NORMAL:INVALID_INPUT');return n;};
 function shotSkillBonuses(o,s,rules){
  const firstShot=o.firstShot??0,forceShot=o.forceShot??0;
  if(!Number.isInteger(firstShot)||firstShot<0||firstShot>3||!Number.isInteger(forceShot)||forceShot<0||forceShot>3)throw Error('HBG_NORMAL:SKILL_LEVEL_INVALID');
  let shotAttackAdd=0,shotAffinityAdd=0,shotElementMultiplier=1;
  if(firstShot||forceShot){
   if(!rules)throw Error('HBG_NORMAL:SHOT_SKILL_SOURCE_UNRESOLVED');
   if(!Number.isInteger(s.magazineCapacity)||s.magazineCapacity<1||s.magazineCapacity>99||!Number.isInteger(s.shotOrdinal)||s.shotOrdinal<1||s.shotOrdinal>s.magazineCapacity||typeof s.fullMagazine!=='boolean')throw Error('HBG_NORMAL:SHOT_POSITION_PENDING');
   if(s.shotOrdinal===1&&s.fullMagazine)shotAttackAdd+=valid(rules.firstAttack[firstShot],0,100);
   if(rules.forceAttackOrdinals.includes(s.shotOrdinal))shotAttackAdd+=valid(rules.forceAttack[forceShot],0,100);
   if(s.shotOrdinal>=rules.forceAffinityStart)shotAffinityAdd=valid(rules.forceAffinity[forceShot],0,100);
  }
  if(firstShot>0&&s.shotOrdinal===1&&s.fullMagazine)shotElementMultiplier*=valid(rules.firstElement[firstShot],1,2);
  if(forceShot>0&&rules.forceAttackOrdinals.includes(s.shotOrdinal))shotElementMultiplier*=valid(rules.forceElement[forceShot],1,2);
  return {shotAttackAdd,shotAffinityAdd,shotElementMultiplier};
 }
 function shot(o,engine){
  if(!engine||typeof engine.get!=='function')throw Error('HBG_NORMAL:TECHNIQUE_DB_REQUIRED');
  const kind=o?.weaponKind||'heavy-bowgun',lbg=kind==='light-bowgun';
  if(!['heavy-bowgun','light-bowgun'].includes(kind))throw Error('BOWGUN_NORMAL:WEAPON_UNSUPPORTED');
  const prefix=lbg?'LBG':'HBG',record=engine.get(kind,prefix+'_NORMAL_REFERENCE_RULES'),rule=record?.specialSourceValues,s=o?.state;
  if(lbg){
   if(!rule||!rule.supportedLevels?.includes(s?.ammoLevel)||s?.shotMode!=='NORMAL'||s?.contactPolicy!=='ALL_THREE'||s?.range!=='CRITICAL'||s?.normalModeLevel!==0)throw Error('LBG_NORMAL:LIMITED_STATE_UNRESOLVED');
  }
  if(rule?.status!=='SOURCE_CONFIRMED'||rule.scope!=='EXPLICIT_COMMON_NORMAL_AMMO_SCENARIO')throw Error('HBG_NORMAL:SOURCE_UNRESOLVED');
  if(!s||s.ammoType!=='NORMAL'||!Number.isInteger(s.ammoLevel)||s.ammoLevel<1||s.ammoLevel>3||!Object.hasOwn(rule.physicalRange,s.range)||!Number.isInteger(s.normalModeLevel)||!Object.hasOwn(rule.normalMode,s.normalModeLevel))throw Error('HBG_NORMAL:STATE_UNRESOLVED');
  const source=engine.get(kind,prefix+'_NORMAL_AMMO_'+s.ammoLevel),ammo=source?.specialSourceValues;
  if(!ammo||!Number.isInteger(ammo.hitCount)||ammo.hitCount!==rule.hitCount)throw Error('HBG_NORMAL:AMMO_SOURCE_UNRESOLVED');
  const mv=valid(ammo.mvPerHit,0,100),attack=valid(o.attack,0,10000),affinity=valid(o.affinity,-100,100),criticalMultiplier=valid(o.criticalMultiplier,1,2),hz=valid(o.physicalHitzone,0,100),normalUp=o.normalUp;
  if(!Number.isInteger(normalUp)||!Object.hasOwn(rule.normalUp,normalUp))throw Error('HBG_NORMAL:SKILL_LEVEL_INVALID');
  const range=valid(rule.physicalRange[s.range],0,1),mode=valid(rule.normalMode[s.normalModeLevel],1,2),up=valid(rule.normalUp[normalUp],1,2),crit=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+affinity/100*.25;
  const firstShot=o.firstShot??0,forceShot=o.forceShot??0;
  const {shotAttackAdd,shotAffinityAdd}=shotSkillBonuses(o,s,rule.shotSkills);
  const effectiveAffinity=Math.min(100,affinity+shotAffinityAdd),shotCrit=effectiveAffinity>=0?1+effectiveAffinity/100*(criticalMultiplier-1):1+effectiveAffinity/100*.25;
  const weaponPhysicalModifier=lbg?valid(rule.weaponPhysicalModifier,0,2):1;
  const attackAdds=o.hitAttackAdds;if(attackAdds!==undefined&&(!Array.isArray(attackAdds)||attackAdds.length!==ammo.hitCount||attackAdds.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>7)))throw Error('HBG_NORMAL:HIT_ATTACK_INVALID');
  const drawAdds=o.hitAffinityAdds;if(drawAdds!==undefined&&(!Array.isArray(drawAdds)||drawAdds.length!==ammo.hitCount||drawAdds.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>100)))throw Error('HBG_NORMAL:HIT_AFFINITY_INVALID');
  const trace=Array.from({length:ammo.hitCount},(_,i)=>{const hitAffinity=Math.min(100,effectiveAffinity+(drawAdds?.[i]??0)),criticalExpectation=hitAffinity>=0?1+hitAffinity/100*(criticalMultiplier-1):1+hitAffinity/100*.25;return {hit:i+1,hitAttackAdd:attackAdds?.[i]??0,techniqueId:source.techniqueId,mv,physical:(attack+shotAttackAdd+(attackAdds?.[i]??0))*mv/100*hz/100*range*mode*up*criticalExpectation*weaponPhysicalModifier,element:0,weaponPhysicalModifier,rangePhysicalModifier:range,normalModeModifier:mode,normalUpModifier:up,criticalExpectation,shotOrdinal:s.shotOrdinal??null,shotAttackAdd,shotAffinityAdd,effectiveAffinity:hitAffinity,drawAffinityAdd:drawAdds?.[i]??0,sharpnessApplied:false,weaponElementApplied:false};}),physical=trace.reduce((sum,h)=>sum+h.physical,0);
  return {status:'SOURCE_REFERENCE',profileId:prefix+'_NORMAL_AMMO_'+s.ammoLevel+'_THREE_CONTACT_REFERENCE',scope:rule.scope,comparisonPower:physical,physical,element:0,special:0,trace,state:{...s},skills:{normalUp,firstShot,forceShot},shotSkills:{shotAttackAdd,shotAffinityAdd,effectiveAffinity},ammoCapacityVerified:false,weaponApplicability:'UNVERIFIED',rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:[...record.evidenceRefs,...source.evidenceRefs]};
 }
 const api=Object.freeze({shot,shotSkillBonuses});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowgunNormalReference=api;
})(typeof window!=='undefined'?window:globalThis);
