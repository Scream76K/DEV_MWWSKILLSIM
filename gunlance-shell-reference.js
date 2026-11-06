(function(root){
 'use strict';
 const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 // Completed Artia metadata can name a sourced power tier without inventing
 // an MHDB numeric level for mutation-specific records.
 function resolveWeaponPower(weapon,rules){
  const e=weapon?.artiaShellEvidence;
  if(e?.status==='SOURCE_CONFIRMED_PROVISIONAL'&&e.source==='https://kuroyonhon.com/mhwilds/memo/38.php'&&e.scope==='GOGMA_ELEMENT_VALUE_AND_MUTATION_SHELL_METADATA'&&e.shellType===weapon.shell&&e.shellByMutation?.[e.mutation]===weapon.shell&&e.shellPower==='HIGH')return e.shellPower;
  return rules?.mhdbShellLevelToPowerByType?.[String(weapon?.shell).toUpperCase()]?.[weapon?.shellLevel]??rules?.mhdbShellLevelToPower?.[weapon?.shellLevel];
 }
 function consumedRounds(action,s){
  if(action==='NORMAL')return 1;
  if(action==='CHARGED'){if(!Number.isInteger(s.chargedRounds)||s.chargedRounds<1||s.chargedRounds>s.loadedRounds)throw Error('GL_SHELL:CHARGED_ROUNDS_PENDING');return s.chargedRounds;}
  if(action==='FULL_BURST')return s.loadedRounds;
  throw Error('GL_SHELL:ACTION_COMPONENT_PENDING');
 }
 // DB owns all adopted coefficients. The existing common engine owns arithmetic.
 function calculate(o,engine,generic){
  const rulesRecord=engine?.get('gunlance','GL_SHELL_NORMAL_MEDIUM'),rules=rulesRecord?.specialSourceValues?.p0ReferenceRules,s=o?.state;
  if(!rules||rules.adoptionStatus!=='PROVISIONALLY_ADOPTED'||typeof generic!=='function')throw Error('GL_SHELL:DB_RULES_PENDING');
  const id='GL_SHELL_'+s?.shellingType+'_'+s?.shellingPower,source=engine.get('gunlance',id),value=source?.specialSourceValues;
  if(!rules.supportedSourceIds.includes(id)||source?.numericStatus!=='SOURCE_CONFIRMED'||!finite(value?.unparenthesizedValue,0,1000)||!finite(value?.parenthesizedValue,0,10000))throw Error('GL_SHELL:SOURCE_VERSION_OR_POWER_PENDING');
  if(s.shellingPower==='HIGH'&&(!rules.highScope||rules.highScope.sourceId!==id||!rules.highScope.supportedActions.includes(o.action)))throw Error('GL_SHELL:HIGH_ACTION_NOT_ADOPTED');
  const metadata=o.weaponShellMetadata;
  if(metadata?.type!=null&&String(metadata.type).toUpperCase()!==s.shellingType)throw Error('GL_SHELL:WEAPON_TYPE_CONFLICT');
  if(metadata?.level!=null){const mapped=Number.isInteger(metadata.level)?(rules.mhdbShellLevelToPowerByType?.[s.shellingType]?.[metadata.level]??rules.mhdbShellLevelToPower?.[metadata.level]):null;if(!mapped||mapped!==s.shellingPower)throw Error('GL_SHELL:WEAPON_POWER_CONFLICT');}
  const guardLevel=o.offensiveGuardLevel??0,guardActive=o.offensiveGuardActive??false;
  if(!Number.isInteger(guardLevel)||guardLevel<0||guardLevel>3||typeof guardActive!=='boolean'||(guardActive&&guardLevel===0))throw Error('GL_SHELL:OFFENSIVE_GUARD_LEVEL_INVALID');
  if(guardActive&&(!rules.offensiveGuardReference||!rules.offensiveGuardReference.supportedActions.includes(o.action)||(o.action==='FULL_BURST'&&(s.shellingPower!==rules.offensiveGuardReference.fullBurstPower||rules.offensiveGuardReference.fullBurstAdoption?.status!=='OWNER_APPROVED_PROVISIONAL'))))throw Error('GL_SHELL:OFFENSIVE_GUARD_ACTION_NOT_ADOPTED');
  const loadLevel=o.loadShellsLevel??0,loadRule=rules.loadShellsReference;
  if(!Number.isInteger(loadLevel)||!loadRule?.supportedLevels?.includes(loadLevel))throw Error('GL_SHELL:LOAD_SHELLS_LEVEL_PENDING');
  const capacityAdd=loadRule.capacityAdds[loadLevel];
  if(!finite(capacityAdd,0,10))throw Error('GL_SHELL:LOAD_SHELLS_SOURCE_PENDING');
  const capacity=rules.baseCapacity[s.shellingType]+capacityAdd;
  if(!Number.isInteger(s.loadedRounds)||s.loadedRounds<1||s.loadedRounds>capacity)throw Error('GL_SHELL:LOADED_ROUNDS_PENDING_OR_EXHAUSTED');
  if(!finite(o.weaponBaseAttack,0,10000))throw Error('GL_SHELL:ORIGINAL_WEAPON_ATTACK_PENDING');
  if(!finite(s.fireHitzone,0,100))throw Error('GL_SHELL:FIRE_HITZONE_PENDING');
  if(o.unreviewedSkills?.length)throw Error('GL_SHELL:UNREVIEWED_MODIFIER:'+o.unreviewedSkills.join('/'));
  const cornLevel=o.cornpopperLevel??0,cornActive=o.cornpopperActive??false,corn=rules.cornpopperReference;
  if(!Number.isInteger(cornLevel)||![0,1].includes(cornLevel)||typeof cornActive!=='boolean'||(cornActive&&cornLevel!==1))throw Error('GL_SHELL:CORNPOPPER_STATE_INVALID');
  if(cornLevel&&(!corn||corn.level!==cornLevel||corn.adoptionStatus!=='OWNER_APPROVED_PROVISIONAL'||corn.fireUnit!=='DISPLAY_ELEMENT'))throw Error('GL_SHELL:CORNPOPPER_RULE_PENDING');
  if(cornActive&&!corn.supportedActions.includes(o.action))throw Error('GL_SHELL:CORNPOPPER_ACTION_NOT_ADOPTED:'+o.action);
  const level=o.artilleryLevel??0,artillery=rules.artilleryReference;
  let artilleryMultiplier=1,fireAdd=0,resolvedPhysicalAttack=o.weaponBaseAttack;
  if(!Number.isInteger(level)||level<0||level>3)throw Error('GL_SHELL:ARTILLERY_LEVEL_PENDING');
  if(level>0||cornActive||guardActive){
    const a=o.normalAttackComponents;
    if(!a||!['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(a[k],0,10000))||Math.abs(a.weaponBase*a.normalMultiplier+a.normalFlat-o.weaponBaseAttack)>1e-7)throw Error('GL_SHELL:ATTACK_COMPONENTS_MISMATCH');
  }
  if(level>0){
    if(!artillery||artillery.adoptionStatus!=='PROVISIONALLY_ADOPTED'||!artillery.supportedActions.includes(o.action))throw Error('GL_SHELL:ARTILLERY_ACTION_PENDING:砲術の技別火加算が未照合です。');
    if(artillery.attackOrder!=='BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT'||artillery.attackOrderAdoption!=='OWNER_APPROVED_PROVISIONAL')throw Error('GL_SHELL:ARTILLERY_ATTACK_ORDER_PENDING');
    artilleryMultiplier=artillery.physicalMultipliers[level];fireAdd=artillery.fireDisplayAdds[level];
    if(!finite(artilleryMultiplier,0,10)||!finite(fireAdd,0,10000)||artillery.fireUnit!=='DISPLAY_ELEMENT')throw Error('GL_SHELL:ARTILLERY_SOURCE_PENDING');
  }
  const cornMultiplier=cornActive?corn.physicalMultiplier:1,cornFireAdd=cornActive?corn.fireDisplayAdd:0;
  if(!finite(cornMultiplier,0,10)||!finite(cornFireAdd,0,10000))throw Error('GL_SHELL:CORNPOPPER_VALUES_INVALID');
  if(level>0||cornActive||guardActive){const a=o.normalAttackComponents;resolvedPhysicalAttack=a.weaponBase*a.normalMultiplier*artilleryMultiplier*cornMultiplier+a.normalFlat;}
  const count=consumedRounds(o.action,s);let multiplier;
  if(o.action==='NORMAL'){multiplier=rules.normalPhysicalMultiplier;}
  else if(o.action==='CHARGED'){multiplier=rules.chargedPhysicalMultiplier;}
  else if(o.action==='FULL_BURST'){multiplier=rules.fullBurstPhysicalMultiplier[s.shellingType];}
  else throw Error('GL_SHELL:ACTION_COMPONENT_PENDING');
  if(!finite(multiplier,0,10))throw Error('GL_SHELL:MODIFIER_SOURCE_PENDING');
  const hit={mv:value.unparenthesizedValue,elementModifier:rules.fireElementModifier,physicalAttackModifier:{multiplier:multiplier,adoptionStatus:'ADOPTED',evidenceRef:level>0?artillery.evidenceRef:rules.evidenceRef}};
  const r=generic({status:'ADOPTED',hits:Array.from({length:count},()=>({...hit}))},{baseAttack:resolvedPhysicalAttack,displayedElement:value.parenthesizedValue+fireAdd+cornFireAdd,elementType:'fire',elementKnown:true,typeKnown:true,physicalHitzone:100,elementalHitzone:s.fireHitzone,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:0});
  return {...r,cornpopperPhysicalMultiplier:cornMultiplier,cornpopperFireDisplayAdd:cornFireAdd,cornpopperScenario:cornLevel?{active:cornActive,normalState:corn.normalState,maximumState:corn.maximumState,adoptionStatus:corn.adoptionStatus,sourceVersion:corn.sourceVersion,liveGameVerification:corn.liveGameVerification,scopeWarning:corn.scopeWarning}:null,resolvedPhysicalAttack,artilleryPhysicalMultiplier:artilleryMultiplier,artilleryFireDisplayAdd:fireAdd,artilleryFireUnit:level>0?artillery.fireUnit:null,artilleryActionAdoption:level>0?(artillery.actionExtensionAdoption||artillery.attackOrderAdoption):null,attackOrder:level>0?artillery.attackOrder:null,attackOrderAdoption:level>0?artillery.attackOrderAdoption:null,total:r.comparisonPower,hits:r.trace.map(h=>({p:h.physical,e:h.element,total:h.physical+h.element,component:'SHELL_RAW_AND_FIRE'})),consumedRounds:count,remainingRounds:s.loadedRounds-count,sourceTechniqueId:id,action:o.action,weaponApplicability:'UNVERIFIED',verificationStatus:'UNVERIFIED',adoptionStatus:rules.adoptionStatus,evidenceRefs:[...source.evidenceRefs,rules.evidenceRef,...(level>0?[artillery.evidenceRef]:[]),...(loadLevel>0?[loadRule.evidenceRef]:[]),...(cornLevel?[corn.evidenceRef]:[])],loadShellsLevel:loadLevel,capacity,artilleryLevel:level,state:{...s},scope:'EXPLICIT_COMMON_SHELL_REFERENCE'};
 }
 // Exact owner target: fixed shell/fire components only. Cutting hits stay in
 // the common physical/element engine, including affinity and weapon element.
 function calculateTargetComponent(o,engine,generic){
  const m=o.parameters?.glTarget?.model,kind=o.parameters?.glTarget?.component;
  const rules=engine?.get('gunlance','GL_SHELL_NORMAL_MEDIUM')?.specialSourceValues?.p0ReferenceRules;
  if(!m||m.rules?.status!=='OWNER_APPROVED_PROVISIONAL'||!rules||!['FULL_BURST','FINAL_EXPLOSION'].includes(kind))throw Error('GL_TARGET:COMPONENT_CONTRACT_INVALID');
  const s=m.input.shellingState,shellRecord=engine.get('gunlance','GL_SHELL_'+s.shellingType+'_'+s.shellingPower),shell=shellRecord?.specialSourceValues;
  if(shellRecord?.numericStatus!=='SOURCE_CONFIRMED'||rules.artilleryReference?.attackOrderAdoption!=='OWNER_APPROVED_PROVISIONAL'||rules.artilleryReference.attackOrder!=='BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT')throw Error('GL_TARGET:ADOPTED_SHELL_RULES_REQUIRED');
  if(!shell||!finite(s.fireHitzone,0,100))throw Error('GL_TARGET:SHELL_OR_FIRE_TARGET_PENDING');
  if(o.cornpopperActive)throw Error('GL_TARGET:CORNPOPPER_COMPONENT_SCOPE_PENDING');
  if(o.unreviewedSkills?.length)throw Error('GL_TARGET:UNREVIEWED_MODIFIER:'+o.unreviewedSkills.join('/'));
  const artillery=m.input.artilleryLevel,a=o.stats?.attackComponents;
  if(!Number.isInteger(artillery)||artillery<0||artillery>3||!a||!['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(a[k],0,10000)))throw Error('GL_TARGET:ATTACK_COMPONENTS_PENDING');
  const physicalAttack=a.weaponBase*a.normalMultiplier*rules.artilleryReference.physicalMultipliers[artillery]+a.normalFlat;
  const fireAdd=rules.artilleryReference.fireDisplayAdds[artillery];
  const count=kind==='FULL_BURST'?o.state?.gunlance?.loadedRounds:1;
  if(!Number.isInteger(count)||count<1||count>m.capacity)throw Error('GL_TARGET:ROUNDS_EXHAUSTED');
  const multiplier=kind==='FULL_BURST'?m.rules.stakeFullBurstMultiplier[s.shellingType]:m.action.explosionMultiplier;
  const mv=kind==='FULL_BURST'?shell.unparenthesizedValue:m.row.explosionMv;
  const fire=kind==='FULL_BURST'?shell.parenthesizedValue:m.row.explosionFire*m.action.explosionMultiplier;
  if(![physicalAttack,mv,multiplier,fire,fireAdd].every(Number.isFinite))throw Error('GL_TARGET:SOURCE_VALUE_PENDING');
  const r=generic({status:'ADOPTED',hits:Array.from({length:count},()=>({mv,elementModifier:rules.fireElementModifier,physicalAttackModifier:{multiplier,adoptionStatus:'ADOPTED',evidenceRef:m.rules.source}}))},{baseAttack:physicalAttack,displayedElement:fire+fireAdd,elementType:'fire',elementKnown:true,typeKnown:true,physicalHitzone:100,elementalHitzone:s.fireHitzone,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:0});
  if(!Number.isFinite(r.comparisonPower))throw Error('GL_TARGET:RESULT_UNAVAILABLE');
  return {total:r.comparisonPower,component:kind,count,physical:r.trace.reduce((n,h)=>n+h.physical,0),element:r.trace.reduce((n,h)=>n+h.element,0),trace:r.trace,attackComponents:a,physicalAttack,artilleryLevel:artillery,fireAdd,baseFire:fire,physicalMultiplier:multiplier,source:m.rules.source,status:'PROVISIONAL',scope:m.rules.scope};
 }
 const api=Object.freeze({calculate,consumedRounds,calculateTargetComponent,resolveWeaponPower});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GunlanceShellReference=api;
})(typeof window!=='undefined'?window:globalThis);
