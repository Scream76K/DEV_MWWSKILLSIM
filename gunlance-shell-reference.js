(function(root){
 'use strict';
 const finite=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
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
  const loadLevel=o.loadShellsLevel??0,loadRule=rules.loadShellsReference;
  if(!Number.isInteger(loadLevel)||!loadRule?.supportedLevels?.includes(loadLevel))throw Error('GL_SHELL:LOAD_SHELLS_LEVEL_PENDING');
  const capacityAdd=loadRule.capacityAdds[loadLevel];
  if(!finite(capacityAdd,0,10))throw Error('GL_SHELL:LOAD_SHELLS_SOURCE_PENDING');
  const capacity=rules.baseCapacity[s.shellingType]+capacityAdd;
  if(!Number.isInteger(s.loadedRounds)||s.loadedRounds<1||s.loadedRounds>capacity)throw Error('GL_SHELL:LOADED_ROUNDS_PENDING_OR_EXHAUSTED');
  if(!finite(o.weaponBaseAttack,0,10000))throw Error('GL_SHELL:ORIGINAL_WEAPON_ATTACK_PENDING');
  if(!finite(s.fireHitzone,0,100))throw Error('GL_SHELL:FIRE_HITZONE_PENDING');
  if(o.unreviewedSkills?.length)throw Error('GL_SHELL:UNREVIEWED_MODIFIER:'+o.unreviewedSkills.join('/'));
  const level=o.artilleryLevel??0,artillery=rules.artilleryReference;
  let artilleryMultiplier=1,fireAdd=0,resolvedPhysicalAttack=o.weaponBaseAttack;
  if(!Number.isInteger(level)||level<0||level>3)throw Error('GL_SHELL:ARTILLERY_LEVEL_PENDING');
  if(level>0){
    if(!artillery||artillery.adoptionStatus!=='PROVISIONALLY_ADOPTED'||!artillery.supportedActions.includes(o.action))throw Error('GL_SHELL:ARTILLERY_ACTION_PENDING:砲術の技別火加算が未照合です。');
    const attack=o.normalAttackComponents;
    if(!attack||!['weaponBase','normalMultiplier','normalFlat'].every(k=>finite(attack[k],0,10000))||Math.abs(attack.weaponBase*attack.normalMultiplier+attack.normalFlat-o.weaponBaseAttack)>1e-7)throw Error('GL_SHELL:ATTACK_COMPONENTS_MISMATCH');
    if(artillery.attackOrder!=='BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT'||artillery.attackOrderAdoption!=='OWNER_APPROVED_PROVISIONAL')throw Error('GL_SHELL:ARTILLERY_ATTACK_ORDER_PENDING');
    artilleryMultiplier=artillery.physicalMultipliers[level];fireAdd=artillery.fireDisplayAdds[level];
    if(!finite(artilleryMultiplier,0,10)||!finite(fireAdd,0,10000)||artillery.fireUnit!=='DISPLAY_ELEMENT')throw Error('GL_SHELL:ARTILLERY_SOURCE_PENDING');
  }
  if(level>0){const a=o.normalAttackComponents;resolvedPhysicalAttack=a.weaponBase*a.normalMultiplier*artilleryMultiplier+a.normalFlat;}
  const count=consumedRounds(o.action,s);let multiplier;
  if(o.action==='NORMAL'){multiplier=rules.normalPhysicalMultiplier;}
  else if(o.action==='CHARGED'){multiplier=rules.chargedPhysicalMultiplier;}
  else if(o.action==='FULL_BURST'){multiplier=rules.fullBurstPhysicalMultiplier[s.shellingType];}
  else throw Error('GL_SHELL:ACTION_COMPONENT_PENDING');
  if(!finite(multiplier,0,10))throw Error('GL_SHELL:MODIFIER_SOURCE_PENDING');
  const hit={mv:value.unparenthesizedValue,elementModifier:rules.fireElementModifier,physicalAttackModifier:{multiplier:multiplier,adoptionStatus:'ADOPTED',evidenceRef:level>0?artillery.evidenceRef:rules.evidenceRef}};
  const r=generic({status:'ADOPTED',hits:Array.from({length:count},()=>({...hit}))},{baseAttack:resolvedPhysicalAttack,displayedElement:value.parenthesizedValue+fireAdd,elementType:'fire',elementKnown:true,typeKnown:true,physicalHitzone:100,elementalHitzone:s.fireHitzone,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:0});
  return {...r,resolvedPhysicalAttack,artilleryPhysicalMultiplier:artilleryMultiplier,artilleryFireDisplayAdd:fireAdd,artilleryFireUnit:level>0?artillery.fireUnit:null,artilleryActionAdoption:level>0?(artillery.actionExtensionAdoption||artillery.attackOrderAdoption):null,attackOrder:level>0?artillery.attackOrder:null,attackOrderAdoption:level>0?artillery.attackOrderAdoption:null,total:r.comparisonPower,hits:r.trace.map(h=>({p:h.physical,e:h.element,total:h.physical+h.element,component:'SHELL_RAW_AND_FIRE'})),consumedRounds:count,remainingRounds:s.loadedRounds-count,sourceTechniqueId:id,action:o.action,weaponApplicability:'UNVERIFIED',verificationStatus:'UNVERIFIED',adoptionStatus:rules.adoptionStatus,evidenceRefs:[...source.evidenceRefs,rules.evidenceRef,...(level>0?[artillery.evidenceRef]:[]),...(loadLevel>0?[loadRule.evidenceRef]:[])],loadShellsLevel:loadLevel,capacity,artilleryLevel:level,state:{...s},scope:'EXPLICIT_COMMON_SHELL_REFERENCE'};
 }
 const api=Object.freeze({calculate,consumedRounds});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GunlanceShellReference=api;
})(typeof window!=='undefined'?window:globalThis);
