(function(root){
 'use strict';
 const valid=(n,min,max)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max)throw Error('HBG_ELEMENT:INVALID_INPUT');return n;};
 function firstHit(o,engine){
  if(!engine||typeof engine.get!=='function')throw Error('HBG_ELEMENT:TECHNIQUE_DB_REQUIRED');
  const record=engine.get('heavy-bowgun','HBG_ELEMENT_FIRST_HIT_REFERENCE'),rule=record?.specialSourceValues;
  if(rule?.status!=='SOURCE_CONFIRMED'||rule.scope!=='FIRST_HIT_ONLY_NOT_WHOLE_SHOT')throw Error('HBG_ELEMENT:SOURCE_UNRESOLVED');
  if(!o||!Number.isInteger(o.ammoLevel)||!Object.hasOwn(rule.ammo,o.ammoLevel)||!Object.hasOwn(rule.physicalRange,o.range))throw Error('HBG_ELEMENT:STATE_UNRESOLVED');
  const attack=valid(o.attack,0,10000),affinity=valid(o.affinity,-100,100),criticalMultiplier=valid(o.criticalMultiplier,1,2),hz=valid(o.physicalHitzone,0,100),ehz=valid(o.elementalHitzone,0,100),multiplier=valid(o.elementMultiplier,1,10),flat=valid(o.elementFlat,0,10000),ammo=rule.ammo[o.ammoLevel];
  const mv=valid(ammo.physicalMv,0,100),base=valid(ammo.displayedElement,0,10000),range=valid(rule.physicalRange[o.range],0,1),criticalExpectation=affinity>=0?1+affinity/100*(criticalMultiplier-1):1+affinity/100*.25;
  const physical=attack*mv/100*hz/100*range*criticalExpectation;
  const attackDependentElement=attack/100*base/10*multiplier*ehz/100,flatElement=flat/10*ehz/100,element=attackDependentElement+flatElement;
  return {status:'SOURCE_REFERENCE',scope:rule.scope,physical,element,total:physical+element,attackDependentElement,flatElement,ammoLevel:o.ammoLevel,range:o.range,physicalMv:mv,displayedElement:base,criticalExpectation,damageIncluded:false,elementCriticalIncluded:false,rounding:'UNROUNDED_REFERENCE',liveGameVerification:'PENDING',evidenceRefs:[...record.evidenceRefs],formula:'(attack/100*displayedElement*multiplier+flat)/10*elementalHitzone/100'};
 }
 const api=Object.freeze({firstHit});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BowgunElementReference=api;
})(typeof window!=='undefined'?window:globalThis);
