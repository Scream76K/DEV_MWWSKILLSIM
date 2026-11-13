(function(root){
 'use strict';

 const valid=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('HBG_NORMAL:INVALID_INPUT');return n;};
 function shotSkillBonuses(o,s,rules,sequenceOrdinal=null){
  const firstShot=o.firstShot??0,forceShot=o.forceShot??0;
  if(!Number.isInteger(firstShot)||firstShot<0||firstShot>3||!Number.isInteger(forceShot)||forceShot<0||forceShot>3)throw Error('HBG_NORMAL:SKILL_LEVEL_INVALID');
  const ordinal=sequenceOrdinal===null?s?.shotOrdinal:sequenceOrdinal,first=sequenceOrdinal===null?s?.fullMagazine:sequenceOrdinal===1;
  if(sequenceOrdinal!==null&&(!Number.isInteger(sequenceOrdinal)||sequenceOrdinal<1||sequenceOrdinal>10))throw Error('BOWGUN_TEN_SHOT:ORDINAL_INVALID');
  let shotAttackAdd=0,shotAffinityAdd=0,shotElementMultiplier=1;
  if(firstShot||forceShot){
   if(!rules)throw Error('HBG_NORMAL:SHOT_SKILL_SOURCE_UNRESOLVED');
   if(sequenceOrdinal===null&&(!Number.isInteger(s.magazineCapacity)||s.magazineCapacity<1||s.magazineCapacity>99||!Number.isInteger(s.shotOrdinal)||s.shotOrdinal<1||s.shotOrdinal>s.magazineCapacity||typeof s.fullMagazine!=='boolean'))throw Error('HBG_NORMAL:SHOT_POSITION_PENDING');
   if(ordinal===1&&first)shotAttackAdd+=valid(rules.firstAttack[firstShot],0,100);
   if(rules.forceAttackOrdinals.includes(ordinal))shotAttackAdd+=valid(rules.forceAttack[forceShot],0,100);
   if(ordinal>=rules.forceAffinityStart)shotAffinityAdd=valid(rules.forceAffinity[forceShot],0,100);
  }
  if(firstShot>0&&ordinal===1&&first)shotElementMultiplier*=valid(rules.firstElement[firstShot],1,2);
  if(forceShot>0&&rules.forceAttackOrdinals.includes(ordinal))shotElementMultiplier*=valid(rules.forceElement[forceShot],1,2);
  return {shotAttackAdd,shotAffinityAdd,shotElementMultiplier};
 }
 function physicalHit(attack,mv,hz,crit,modifier){return attack*mv/100*hz/100*crit*modifier;}
 function shot(o,engine,sequenceOrdinal=null){
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
  const shotSkills=hbgBladescaleShotSkills(o,s,rule,sequenceOrdinal,kind);
  const {shotAttackAdd,shotAffinityAdd}=shotSkills;
  const effectiveAffinity=Math.min(100,affinity+shotAffinityAdd),shotCrit=effectiveAffinity>=0?1+effectiveAffinity/100*(criticalMultiplier-1):1+effectiveAffinity/100*.25;
  const weaponPhysicalModifier=lbg?valid(rule.weaponPhysicalModifier,0,2):1;
  const attackAdds=o.hitAttackAdds;if(attackAdds!==undefined&&(!Array.isArray(attackAdds)||attackAdds.length!==ammo.hitCount||attackAdds.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>7)))throw Error('HBG_NORMAL:HIT_ATTACK_INVALID');
  const drawAdds=o.hitAffinityAdds;if(drawAdds!==undefined&&(!Array.isArray(drawAdds)||drawAdds.length!==ammo.hitCount||drawAdds.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>100)))throw Error('HBG_NORMAL:HIT_AFFINITY_INVALID');
  const trace=Array.from({length:ammo.hitCount},(_,i)=>{const hitAffinity=Math.min(100,effectiveAffinity+(drawAdds?.[i]??0)),criticalExpectation=hitAffinity>=0?1+hitAffinity/100*(criticalMultiplier-1):1+hitAffinity/100*.25;return {hit:i+1,hitAttackAdd:attackAdds?.[i]??0,techniqueId:source.techniqueId,mv,physical:physicalHit(attack+shotAttackAdd+(attackAdds?.[i]??0),mv,hz,criticalExpectation,range*mode*up*weaponPhysicalModifier*(shotSkills.bladescale?.physicalMultiplier??1)),element:0,weaponPhysicalModifier,rangePhysicalModifier:range,normalModeModifier:mode,normalUpModifier:up,criticalExpectation,shotOrdinal:sequenceOrdinal??s.shotOrdinal??null,shotAttackAdd,shotAffinityAdd,...(shotSkills.bladescale?{bladescale:shotSkills.bladescale}:{}),effectiveAffinity:hitAffinity,drawAffinityAdd:drawAdds?.[i]??0,sharpnessApplied:false,weaponElementApplied:false};}),physical=trace.reduce((sum,h)=>sum+h.physical,0);
  return {status:'SOURCE_REFERENCE',profileId:prefix+'_NORMAL_AMMO_'+s.ammoLevel+'_THREE_CONTACT_REFERENCE',scope:rule.scope,comparisonPower:physical,physical,element:0,special:0,trace,state:{...s},skills:{normalUp,firstShot,forceShot},shotSkills:{shotAttackAdd,shotAffinityAdd,effectiveAffinity},ammoCapacityVerified:false,weaponApplicability:'UNVERIFIED',rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:[...record.evidenceRefs,...source.evidenceRefs]};
 }
 function hbgBladescaleShotSkills(o,s,rule,ordinal,kind){
  const level=o.bladescaleLoading??0;
  if(!Number.isInteger(level)||![0,1].includes(level)||(level&&typeof o.bladescaleLoadingActive!=='boolean')||(!level&&o.bladescaleLoadingActive===true))throw Error('HBG_BLADESCALE:LEVEL_OR_ACTIVATION_INVALID');
  if(!level)return shotSkillBonuses(o,s,rule.shotSkills,ordinal);
  if(kind!=='heavy-bowgun'||!Number.isInteger(ordinal)||ordinal<1||ordinal>10)throw Error('HBG_BLADESCALE:FIXED_TEN_NORMAL_SCOPE_PENDING');
  const b=rule.bladescaleLoading;
  if(b?.skillId!==160||b.level!==1||b.enhancedRounds!==3||b.physicalMultiplier!==1.4||b.scope!=='HBG_FIXED_TEN_NORMAL_ONLY'||b.status!=='SOURCE_BACKED_PROVISIONAL')throw Error('HBG_BLADESCALE:SOURCE_RULE_UNRESOLVED');
  const active=o.bladescaleLoadingActive,enhanced=active&&ordinal<=3,magazineOrdinal=active&&ordinal>3?ordinal-3:ordinal;
  return {...shotSkillBonuses({...o,forceShot:enhanced?0:o.forceShot},s,rule.shotSkills,magazineOrdinal),bladescale:{...b,active,segment:enhanced?'BLADESCALE':'ORDINARY',magazineOrdinal,remainingEnhancedRounds:active?Math.max(0,3-ordinal):0,physicalMultiplier:enhanced?b.physicalMultiplier:1,elementMultiplier:1,activationAssumption:active?'PREACTIVATED_THREE_THEN_ORDINARY_SEVEN':'INACTIVE_ORDINARY_TEN'}};
 }
 function normalSequence(o,engine,shotCount=10){
  const kind=o?.weaponKind,s=o?.state;
  if(!['heavy-bowgun','light-bowgun'].includes(kind)||!s||typeof s!=='object'||Array.isArray(s))throw Error('BOWGUN_TEN_SHOT:EXPLICIT_WEAPON_AND_STATE_REQUIRED');
  if(s.ammoType!=='NORMAL'||!Number.isInteger(s.ammoLevel)||!(kind==='light-bowgun'?[1,2]:[1,2,3]).includes(s.ammoLevel))throw Error('BOWGUN_TEN_SHOT:EXPLICIT_SUPPORTED_NORMAL_LEVEL_REQUIRED');
  if(s.range!=='CRITICAL'||s.normalModeLevel!==0||s.contactPolicy!=='ALL_THREE'||(kind==='light-bowgun'?s.shotMode!=='NORMAL':s.shotMode!=null&&s.shotMode!=='NORMAL'))throw Error('BOWGUN_TEN_SHOT:NON_RAPID_REFERENCE_STATE_REQUIRED');
  // Per-contact draw effects cannot be repeated ten times without a sequence contract.
  for(const key of ['hitAttackAdds','hitAffinityAdds'])if(o[key]!==undefined&&(!Array.isArray(o[key])||o[key].length!==3||o[key].some(v=>v!==0)))throw Error('BOWGUN_TEN_SHOT:DRAW_SEQUENCE_SCOPE_UNADOPTED');
  if(o.bladescaleLoading&&shotCount!==10)throw Error('HBG_BLADESCALE:FIXED_TEN_NORMAL_SCOPE_PENDING');
  const shots=Array.from({length:shotCount},(_,i)=>shot(o,engine,i+1));
  const physical=shots.reduce((sum,r)=>sum+r.physical,0);
  if(!Number.isFinite(physical)||shots.some(r=>r.trace.length!==3))throw Error('BOWGUN_TEN_SHOT:INCOMPLETE_SEQUENCE');
  return {status:'SOURCE_REFERENCE',profileId:(kind==='light-bowgun'?'LBG':'HBG')+'_NORMAL_'+s.ammoLevel+(shotCount===5?'_FIVE_SHOT_REFERENCE':'_TEN_SHOT_REFERENCE'),scope:shotCount===5?'EXPLICIT_LBG_NORMAL_FIVE_SHOT_NO_RELOAD':'EXPLICIT_NORMAL_TEN_SHOT_NO_RELOAD',comparisonPower:physical,physical,element:0,special:0,shots,trace:shots.flatMap(r=>r.trace),state:{...s},sequence:{shotCount,contactCount:shotCount*3,ordinals:shots.map((_,i)=>i+1),magazinePolicy:o.bladescaleLoadingActive?'SEPARATE_THREE_PLUS_SEVEN_NO_RELOAD':'IGNORED_NO_RELOAD',firstShotPolicy:o.bladescaleLoadingActive?'EACH_SEGMENT_START':'SEQUENCE_START_ONLY',ammoLevel:s.ammoLevel,shotMode:'NORMAL',source:'spec/CURRENT_CONTRACTS.md:C03',standardAdoption:shotCount===5?'OWNER_APPROVED_NONRAPID_FIVE_ROUNDS':'PENDING_LEVEL_AND_LBG_RAPID_DECISION'},ammoCapacityVerified:false,weaponApplicability:'UNVERIFIED',rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:shots[0].evidenceRefs};
 }
 function tenShot(o,engine){return normalSequence(o,engine,10);}
 function fiveShot(o,engine){
  const s=o?.state,a=s?.weaponAmmoEntry;
  if(o?.weaponKind!=='light-bowgun'||!a||a.kind!=='normal'||a.rapid!==false||a.level!==s.ammoLevel||![1,2].includes(a.level)||(s.normalPowder!=null&&s.normalPowder!=='NONE'))throw Error('LBG_NORMAL_FIVE:EXACT_NONRAPID_WEAPON_REQUIRED');
  return normalSequence(o,engine,5);
 }
 function rapidHit(o,engine){
  const record=engine.get('light-bowgun',o.techniqueId||'LBG_NORMAL_RAPID_1'),rule=record?.rapidRule,s=o.state;
  if(rule?.status!=='OWNER_APPROVED_PROVISIONAL'||!Number.isInteger(o.hitIndex)||o.hitIndex<0||o.hitIndex>=rule.hitCount)throw Error('LBG_RAPID:HIT_CONTRACT_INVALID');
  if(s?.shotMode!=='RAPID'||s.rapidReady!==true||s.range!=='CRITICAL'||s.contactPolicy!=='ALL_FIVE'||s.weaponAmmoEntry?.rapid!==true)throw Error('LBG_RAPID:STATE_INVALID');
  if(o.rapidUp!==0&&o.rapidUp!==rule.skillLevel)throw Error('LBG_RAPID:SKILL_LEVEL_INVALID');
  const shotSkills=o.sequenceOrdinal===undefined?null:rapidSequenceShotSkills(o,engine);
  const mv=valid(engine.get('light-bowgun',rule.sourceTechniqueId)?.specialSourceValues?.mvPerHit,0,100),attack=valid(o.attack,0,10000)+(shotSkills?.shotAttackAdd??0),hz=valid(o.physicalHitzone,0,100),aff=Math.min(100,valid(o.affinity,-100,100)+(shotSkills?.shotAffinityAdd??0)),critMult=valid(o.criticalMultiplier,1,2),crit=aff>=0?1+aff/100*(critMult-1):1+aff/100*.25,up=o.rapidUp?rule.skillMultiplier:1;
  const normalUpRules=engine.get('light-bowgun','LBG_NORMAL_REFERENCE_RULES')?.specialSourceValues?.normalUp,normalUpLevel=o.normalUp??0;
  if(!Number.isInteger(normalUpLevel)||!Object.hasOwn(normalUpRules||{},normalUpLevel))throw Error('LBG_RAPID:NORMAL_UP_LEVEL_INVALID');
  const normalUp=valid(normalUpRules[normalUpLevel],1,2);
  const physical=physicalHit(attack,mv,hz,crit,rule.physicalModifier*rule.rangeModifier*up*normalUp*(shotSkills?.bladescale?.physicalMultiplier??1));
  return {comparisonPower:physical,physical,element:0,scope:rule.scope,state:{...s},trace:[{hit:o.hitIndex+1,mv,attack,affinity:aff,criticalExpectation:crit,physical,element:0,rapidModifier:rule.physicalModifier,rapidUp:up,normalUp,rangeModifier:rule.rangeModifier,...(shotSkills?{shotOrdinal:o.sequenceOrdinal,roundOrdinal:o.sequenceOrdinal,triggerOrdinal:o.sequenceOrdinal,shotAttackAdd:shotSkills.shotAttackAdd,shotAffinityAdd:shotSkills.shotAffinityAdd,effectiveAffinity:aff,...(shotSkills.bladescale?{bladescale:shotSkills.bladescale}:{})}:{})}],liveGameVerification:'PENDING'};
 }
 function rapidSequenceShotSkills(o,engine){
  if(!Number.isInteger(o.sequenceOrdinal)||o.sequenceOrdinal<1||o.sequenceOrdinal>5)throw Error('LBG_RAPID_FIVE:SHOT_ORDINAL_INVALID');
  const source=engine.get('heavy-bowgun','HBG_NORMAL_REFERENCE_RULES')?.specialSourceValues,rules=source?.shotSkills;
  // Reuse the existing HBG source and evaluator. Only the consumed-round unit is
  // newly adopted; no magazine state or user-entered shot position is required.
  const ranks=(key,min,max)=>Array.isArray(rules?.[key])&&rules[key].length===4&&rules[key].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max)&&rules[key][0]===min;
  if(source?.status!=='SOURCE_CONFIRMED'||source.scope!=='EXPLICIT_COMMON_NORMAL_AMMO_SCENARIO'||!['firstAttack','forceAttack','forceAffinity'].every(key=>ranks(key,0,100))||!['firstElement','forceElement'].every(key=>ranks(key,1,2))||!Array.isArray(rules.forceAttackOrdinals)||rules.forceAttackOrdinals.length!==2||rules.forceAttackOrdinals[0]!==4||rules.forceAttackOrdinals[1]!==6||rules.forceAffinityStart!==4)throw Error('LBG_RAPID_FIVE:SHOT_SKILL_SOURCE_UNRESOLVED');
  const level=o.bladescaleLoading??0;
  if(!Number.isInteger(level)||![0,1].includes(level)||(level&&typeof o.bladescaleLoadingActive!=='boolean')||(!level&&o.bladescaleLoadingActive===true))throw Error('LBG_BLADESCALE:LEVEL_OR_ACTIVATION_INVALID');
  if(!level)return shotSkillBonuses(o,o.state,rules,o.sequenceOrdinal);
  const bladescaleRule=engine.get('light-bowgun',o.techniqueId)?.rapidRule?.bladescaleLoading;
  if(bladescaleRule?.skillId!==160||bladescaleRule.level!==1||bladescaleRule.enhancedRounds!==3||bladescaleRule.physicalMultiplier!==1.4||bladescaleRule.scope!=='LBG_FIXED_FIVE_NORMAL_RAPID_ONLY'||bladescaleRule.status!=='SOURCE_BACKED_PROVISIONAL')throw Error('LBG_BLADESCALE:SOURCE_RULE_UNRESOLVED');
  const active=o.bladescaleLoadingActive,enhanced=active&&o.sequenceOrdinal<=3,magazineOrdinal=active&&o.sequenceOrdinal>3?o.sequenceOrdinal-3:o.sequenceOrdinal;
  const bonuses=shotSkillBonuses({...o,forceShot:enhanced?0:o.forceShot},o.state,rules,magazineOrdinal);
  return {...bonuses,bladescale:{...bladescaleRule,active,segment:enhanced?'BLADESCALE':'ORDINARY',magazineOrdinal,remainingEnhancedRounds:active?Math.max(0,3-o.sequenceOrdinal):0,physicalMultiplier:enhanced?bladescaleRule.physicalMultiplier:1,elementMultiplier:1,activationAssumption:active?'PREACTIVATED_THREE_THEN_ORDINARY_TWO':'INACTIVE_ORDINARY_FIVE'}};
 }
 function selectStandardAmmo(weapon,state={}){
  const kind=weapon?.kind,rows=Array.isArray(weapon?.ammo)?weapon.ammo.filter(a=>a?.kind==='normal'):null;
  if(!['heavy-bowgun','light-bowgun'].includes(kind)||!Array.isArray(rows)||rows.length!==1)return {reason:'BOWGUN_STANDARD:UNIQUE_NORMAL_AMMO_REQUIRED'};
  const ammo=rows[0];if(!Number.isInteger(ammo.level)||![1,2,3].includes(ammo.level))return {reason:'BOWGUN_STANDARD:AMMO_LEVEL_UNSUPPORTED'};
  if(kind==='heavy-bowgun')return {ammoLevel:ammo.level,baseAmmoLevel:ammo.level,techniqueId:'HBG_NORMAL_AMMO_'+ammo.level,shotCount:10,contactCount:30,shotMode:'NORMAL'};
  if(ammo.rapid===false&&[1,2].includes(ammo.level)&&(!state.normalPowder||state.normalPowder==='NONE'))return {ammoLevel:ammo.level,baseAmmoLevel:ammo.level,techniqueId:'LBG_NORMAL_AMMO_'+ammo.level,shotCount:5,contactCount:15,shotMode:'NORMAL'};
  if(ammo.rapid!==true)return {reason:'BOWGUN_STANDARD:NONRAPID_LEVEL_OR_CAPABILITY_UNSUPPORTED',ammoLevel:ammo.level};
  if(ammo.level===1&&(!state.normalPowder||state.normalPowder==='NONE'))return {ammoLevel:1,baseAmmoLevel:1,techniqueId:'LBG_NORMAL_RAPID_1',shotCount:5,contactCount:25,shotMode:'RAPID'};
  if([2,3].includes(ammo.level)&&(!state.normalPowder||state.normalPowder==='NONE'))return {ammoLevel:ammo.level,baseAmmoLevel:ammo.level,techniqueId:ammo.level===2?'LBG_NORMAL_RAPID_2':'LBG_NORMAL_RAPID_NATIVE_3',shotCount:5,contactCount:25,shotMode:'RAPID'};
  if(ammo.level===2&&state.normalPowder==='LEVEL_PLUS_ONE')return {ammoLevel:3,baseAmmoLevel:2,techniqueId:'LBG_NORMAL_RAPID_3',shotCount:5,contactCount:25,shotMode:'RAPID',normalPowder:'LEVEL_PLUS_ONE'};
  return {reason:'BOWGUN_STANDARD:RAPID_LEVEL_OR_POWDER_SOURCE_UNADOPTED',ammoLevel:ammo.level};
 }
 function rapidFiveShot(o,engine){
  const s=o?.state,record=engine.get('light-bowgun',o?.techniqueId),rule=record?.rapidRule;
  if(!s||!['LBG_NORMAL_RAPID_1','LBG_NORMAL_RAPID_2','LBG_NORMAL_RAPID_3','LBG_NORMAL_RAPID_NATIVE_3'].includes(o.techniqueId)||rule?.status!=='OWNER_APPROVED_PROVISIONAL'||rule.hitCount!==5||rule.consumedRounds!==1)throw Error('LBG_RAPID_FIVE:ADOPTED_SINGLE_TRIGGER_RULE_REQUIRED');
  const selection=selectStandardAmmo({kind:'light-bowgun',ammo:[s.weaponAmmoEntry]},s);
  if(selection.reason||selection.techniqueId!==o.techniqueId||s.ammoType!=='NORMAL'||s.ammoLevel!==selection.ammoLevel||s.normalModeLevel!==0)throw Error('LBG_RAPID_FIVE:WEAPON_AMMO_OR_STATE_UNSUPPORTED');
  const unappliedEffects=[];
  for(const key of ['firstShot','forceShot']){const level=o[key]??0;if(!Number.isInteger(level)||level<0||level>3)throw Error('LBG_RAPID_FIVE:SHOT_SKILL_LEVEL_INVALID');}
  const trace=[];for(let roundOrdinal=1;roundOrdinal<=5;roundOrdinal++)for(let hitIndex=0;hitIndex<5;hitIndex++){const r=rapidHit({...o,hitIndex,sequenceOrdinal:roundOrdinal},engine);if(!Number.isFinite(r.physical))throw Error('LBG_RAPID_FIVE:INCOMPLETE_COMPONENT');trace.push(r.trace[0]);}
  const physical=trace.reduce((a,t)=>a+t.physical,0);
  return {status:unappliedEffects.length?'PARTIAL_REFERENCE':'SOURCE_REFERENCE',physical,comparisonPower:physical,element:0,trace,unappliedEffects,sequence:{consumedRounds:5,triggerCount:5,contactCount:25,magazinePolicy:'IGNORED_NO_RELOAD',scope:'NORMAL_RAPID_FIVE_CONSUMED_ROUNDS'},liveGameVerification:'PENDING',sourceGameVersion:'NOT_ESTABLISHED'};
 }
 const api=Object.freeze({shot:(o,engine)=>shot(o,engine),shotSkillBonuses:(o,s,rules)=>shotSkillBonuses(o,s,rules),tenShot,fiveShot,rapidHit,rapidFiveShot,selectStandardAmmo});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowgunNormalReference=api;
})(typeof window!=='undefined'?window:globalThis);
