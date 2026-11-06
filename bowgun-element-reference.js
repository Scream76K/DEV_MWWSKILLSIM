(function(root){
 'use strict';
 const valid=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('HBG_ELEMENT:INVALID_INPUT');return n;};
 function firstHit(o,engine){
  if(!engine||typeof engine.get!=='function')throw Error('HBG_ELEMENT:TECHNIQUE_DB_REQUIRED');
  const weaponKind=o?.weaponKind??'heavy-bowgun',id=({'heavy-bowgun':'HBG_ELEMENT_FIRST_HIT_REFERENCE','light-bowgun':'LBG_ELEMENT_FIRST_HIT_REFERENCE'})[weaponKind];
  if(!id)throw Error('BOWGUN_ELEMENT:WEAPON_UNSUPPORTED');
  const record=engine.get(weaponKind,id),rule=record?.specialSourceValues;
  if(weaponKind==='light-bowgun'&&record?.adoptionStatus!=='OWNER_APPROVED_PROVISIONAL')throw Error('LBG_ELEMENT:ADOPTION_REQUIRED');
  if(rule?.status!=='SOURCE_CONFIRMED'||rule.scope!=='FIRST_HIT_ONLY_NOT_WHOLE_SHOT')throw Error('HBG_ELEMENT:SOURCE_UNRESOLVED');
  if(!o||!Number.isInteger(o.ammoLevel)||!Object.hasOwn(rule.ammo,o.ammoLevel)||!Object.hasOwn(rule.physicalRange,o.range))throw Error('HBG_ELEMENT:STATE_UNRESOLVED');
  const dragon=o.elementType==='dragon',dragonRule=dragon?rule.dragonAmmo:null;
  if(dragon&&(weaponKind!=='heavy-bowgun'||dragonRule?.status!=='OWNER_APPROVED_PROVISIONAL'||o.ammoLevel!==dragonRule.level||o.range!=='CRITICAL'))throw Error('HBG_DRAGON:SCOPE_UNSUPPORTED');
  const attack=valid(o.attack,0,10000),affinity=valid(o.affinity,-100,100),criticalMultiplier=valid(o.criticalMultiplier,1,2),hz=valid(o.physicalHitzone,0,100),ehz=valid(o.elementalHitzone,0,100),multiplier=valid(o.elementMultiplier,1,10),flat=valid(o.elementFlat,0,10000),ammo=dragon?{physicalMv:engine.get(weaponKind,dragonRule.motionTechniqueId)?.variableHitSource?.mvPerHit,displayedElement:dragonRule.displayedElement}:rule.ammo[o.ammoLevel];
  const mv=valid(ammo.physicalMv,0,100),base=valid(ammo.displayedElement,0,10000),range=valid(rule.physicalRange[o.range],0,1),criticalExpectation=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+affinity/100*.25;
  const rapid=o.shotMode==='RAPID';if(rapid&&(weaponKind!=='light-bowgun'||rule.rapidElement?.status!=='SOURCE_BACKED_PROVISIONAL'))throw Error('LBG_ELEMENT:RAPID_RULE_REQUIRED');
  const physicalModifier=valid(rapid?rule.rapidElement.physical:rule.weaponModifiers?.physical??1,0,1),elementModifier=valid(rapid?rule.rapidElement.element:rule.weaponModifiers?.element??1,0,1);
  const physicalAttackAdd=o.range==='CRITICAL'?valid(o.criticalRangeAttackAdd??0,0,100):0;
  const hitAttackAdd=valid(o.hitAttackAdd??0,0,7);
  const shotAttackAdd=valid(o.shotAttackAdd??0,0,100);
  const physical=(attack+physicalAttackAdd+shotAttackAdd+hitAttackAdd)*mv/100*hz/100*range*criticalExpectation*physicalModifier;
  const attackDependentElement=attack/100*base/10*multiplier*ehz/100*elementModifier,flatElement=flat/10*ehz/100,elementCriticalMultiplier=valid(o.elementCriticalMultiplier??1,1,2),elementCriticalExpectation=1+Math.max(0,affinity)/100*(elementCriticalMultiplier-1),elementCapRule=rule.elementCapRule,elementCap=elementCapRule?attack/100*base/10*elementModifier*valid(elementCapRule.multiplier,1,10):Infinity,uncappedElement=attackDependentElement+flatElement,element=Math.min(uncappedElement,elementCap*ehz/100)*elementCriticalExpectation;
  return {status:'SOURCE_REFERENCE',weaponKind,physicalModifier,elementModifier,adoptionStatus:dragon?dragonRule.status:record.adoptionStatus??'SOURCE_CONFIRMED',sourceVersion:dragon?dragonRule.sourceVersion:record.sourceVersion??record.baselineGameVersion,scope:dragon?dragonRule.scope:rule.scope,dragonAmmoEvidence:dragonRule,elementCap,uncappedElement,elementCapRule,physicalAttackAdd,shotAttackAdd,hitAttackAdd,physical,element,total:physical+element,attackDependentElement,flatElement,ammoLevel:o.ammoLevel,range:o.range,physicalMv:mv,displayedElement:base,criticalExpectation,damageIncluded:false,elementCriticalIncluded:elementCriticalMultiplier>1,elementCriticalMultiplier,elementCriticalExpectation,rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:[...record.evidenceRefs],formula:'(attack/100*displayedElement*multiplier*elementModifier+flat)/10*elementalHitzone/100'};
 }
 function contactSequence(o,engine){
  if(!['heavy-bowgun','light-bowgun'].includes(o?.weaponKind))throw Error('HBG_ELEMENT:CONTACT_WEAPON_UNSUPPORTED');
  if(o.elementType==='dragon'&&o.contacts?.length!==1)throw Error('HBG_DRAGON:ONE_CONTACT_REQUIRED');
  const model=engine?.get(o.weaponKind,o.weaponKind==='light-bowgun'?'LBG_ELEMENT_FIRST_HIT_REFERENCE':'HBG_ELEMENT_FIRST_HIT_REFERENCE')?.specialSourceValues?.contactModel;
  if(!['OWNER_APPROVED_PROVISIONAL','SOURCE_BACKED_PROVISIONAL'].includes(model?.status))throw Error('HBG_ELEMENT:CONTACT_MODEL_REQUIRED');
  if(!Array.isArray(o.contacts)||o.contacts.length<1||o.contacts.length>model.physicalMultipliers.length)throw Error('HBG_ELEMENT:CONTACT_COUNT_UNSUPPORTED');
  const contacts=o.contacts.map((c,i)=>{
   if(c?.ordinal!==i+1||typeof c.targetId!=='string'||!c.targetId||typeof c.partId!=='string'||!c.partId)throw Error('HBG_ELEMENT:CONTACT_IDENTITY_REQUIRED');
   if(model.rangeScope==='CRITICAL_ONLY'&&c.range!=='CRITICAL')throw Error('LBG_ELEMENT:CONTACT_RANGE_UNSUPPORTED');
   const hit=firstHit({...o,hitAttackAdd:c.hitAttackAdd??o.hitAttackAdd,affinity:c.resolvedAffinity??o.affinity,range:c.range,physicalHitzone:c.physicalHitzone,elementalHitzone:c.elementalHitzone},engine);
   const physical=hit.physical*model.physicalMultipliers[i];
   return {...hit,ordinal:i+1,targetId:c.targetId,partId:c.partId,physicalMultiplier:model.physicalMultipliers[i],physical,total:physical+hit.element};
  });
  return {status:model.status,scope:o.elementType==='dragon'?'HBG_DRAGON_ONE_CONTACT_CRITICAL_ONLY':model.scope,model,contacts,physical:contacts.reduce((s,h)=>s+h.physical,0),element:contacts.reduce((s,h)=>s+h.element,0),total:contacts.reduce((s,h)=>s+h.total,0),rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING'};
 }
 function rapidTrigger(o,engine){
  const rule=engine?.get('light-bowgun','LBG_ELEMENT_FIRST_HIT_REFERENCE')?.specialSourceValues?.rapidElement;
  if(rule?.status!=='SOURCE_BACKED_PROVISIONAL'||rule.projectiles!==2||o.shotMode!=='RAPID'||o.weaponKind!=='light-bowgun')throw Error('LBG_ELEMENT:RAPID_RULE_REQUIRED');
  if(![0,1].includes(o.rapidUp))throw Error('LBG_ELEMENT:RAPID_SKILL_INVALID');
  const multiplier=o.rapidUp?valid(rule.rapidUp,1,2):1;
  const projectiles=Array.from({length:rule.projectiles},(_,i)=>{const r=o.contacts?contactSequence(o,engine):firstHit(o,engine);return {...r,projectileOrdinal:i+1,physical:r.physical*multiplier,element:r.element*multiplier,total:r.total*multiplier};});
  return {status:rule.status,scope:rule.scope,rule,projectiles,rapidSkillMultiplier:multiplier,physical:projectiles.reduce((s,p)=>s+p.physical,0),element:projectiles.reduce((s,p)=>s+p.element,0),total:projectiles.reduce((s,p)=>s+p.total,0),rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING'};
 }
 const api=Object.freeze({firstHit,contactSequence,rapidTrigger});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowgunElementReference=api;
})(typeof window!=='undefined'?window:globalThis);
