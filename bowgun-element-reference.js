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
  const attack=valid(o.attack,0,10000),affinity=valid(o.affinity,-100,100),criticalMultiplier=valid(o.criticalMultiplier,1,2),hz=valid(o.physicalHitzone,0,100),ehz=valid(o.elementalHitzone,0,100),multiplier=valid(o.elementMultiplier,1,10),flat=valid(o.elementFlat,0,10000),ammo=rule.ammo[o.ammoLevel];
  const mv=valid(ammo.physicalMv,0,100),base=valid(ammo.displayedElement,0,10000),range=valid(rule.physicalRange[o.range],0,1),criticalExpectation=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+affinity/100*.25;
  const physicalModifier=valid(rule.weaponModifiers?.physical??1,0,1),elementModifier=valid(rule.weaponModifiers?.element??1,0,1);
  const physical=attack*mv/100*hz/100*range*criticalExpectation*physicalModifier;
  const attackDependentElement=attack/100*base/10*multiplier*ehz/100*elementModifier,flatElement=flat/10*ehz/100,element=attackDependentElement+flatElement;
  return {status:'SOURCE_REFERENCE',weaponKind,physicalModifier,elementModifier,adoptionStatus:record.adoptionStatus??'SOURCE_CONFIRMED',sourceVersion:record.sourceVersion??record.baselineGameVersion,scope:rule.scope,physical,element,total:physical+element,attackDependentElement,flatElement,ammoLevel:o.ammoLevel,range:o.range,physicalMv:mv,displayedElement:base,criticalExpectation,damageIncluded:false,elementCriticalIncluded:false,rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:[...record.evidenceRefs],formula:'(attack/100*displayedElement*multiplier*elementModifier+flat)/10*elementalHitzone/100'};
 }
 function contactSequence(o,engine){
  if(!['heavy-bowgun','light-bowgun'].includes(o?.weaponKind))throw Error('HBG_ELEMENT:CONTACT_WEAPON_UNSUPPORTED');
  const model=engine?.get(o.weaponKind,o.weaponKind==='light-bowgun'?'LBG_ELEMENT_FIRST_HIT_REFERENCE':'HBG_ELEMENT_FIRST_HIT_REFERENCE')?.specialSourceValues?.contactModel;
  if(!['OWNER_APPROVED_PROVISIONAL','SOURCE_BACKED_PROVISIONAL'].includes(model?.status))throw Error('HBG_ELEMENT:CONTACT_MODEL_REQUIRED');
  if(!Array.isArray(o.contacts)||o.contacts.length<1||o.contacts.length>model.physicalMultipliers.length)throw Error('HBG_ELEMENT:CONTACT_COUNT_UNSUPPORTED');
  const contacts=o.contacts.map((c,i)=>{
   if(c?.ordinal!==i+1||typeof c.targetId!=='string'||!c.targetId||typeof c.partId!=='string'||!c.partId)throw Error('HBG_ELEMENT:CONTACT_IDENTITY_REQUIRED');
   if(model.rangeScope==='CRITICAL_ONLY'&&c.range!=='CRITICAL')throw Error('LBG_ELEMENT:CONTACT_RANGE_UNSUPPORTED');
   const hit=firstHit({...o,range:c.range,physicalHitzone:c.physicalHitzone,elementalHitzone:c.elementalHitzone},engine);
   const physical=hit.physical*model.physicalMultipliers[i];
   return {...hit,ordinal:i+1,targetId:c.targetId,partId:c.partId,physicalMultiplier:model.physicalMultipliers[i],physical,total:physical+hit.element};
  });
  return {status:model.status,scope:model.scope,model,contacts,physical:contacts.reduce((s,h)=>s+h.physical,0),element:contacts.reduce((s,h)=>s+h.element,0),total:contacts.reduce((s,h)=>s+h.total,0),rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING'};
 }
 const api=Object.freeze({firstHit,contactSequence});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowgunElementReference=api;
})(typeof window!=='undefined'?window:globalThis);
