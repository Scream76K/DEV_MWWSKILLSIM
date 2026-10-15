(function(root){
'use strict';
function finite(x,min=0,max=Infinity){return typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;}
// Shared attack stages: already-resolved skill effects and explicit external entries.
function aggregateAttack(components,entries){
 if(!components||!finite(components.weaponBase)||!finite(components.normalMultiplier)||!finite(components.normalFlat)||!Array.isArray(entries))throw Error('ATTACK_AGGREGATION:INPUT_PENDING');
 const seen=new Set();let externalFlat=0;for(const entry of entries){if(!entry||seen.has(entry.id)||!finite(entry.value))throw Error('ATTACK_AGGREGATION:EXTERNAL_UNKNOWN_OR_DUPLICATE');seen.add(entry.id);externalFlat+=entry.value;}
 const multipliedBase=components.weaponBase*components.normalMultiplier,skillFlat=components.normalFlat;
 return {weaponBase:components.weaponBase,skillMultiplier:components.normalMultiplier,skillFlat,externalFlat,externalEntries:entries.map(x=>({...x})),multipliedBase,attackTrue:multipliedBase+skillFlat+externalFlat};
}
function calculate(input,engine){
 const record=engine?.get('heavy-bowgun','HBG_WYVERN_AMMO'),rules=record?.wyvernRules;
 if(!rules||rules.adoptionStatus!=='PROVISIONAL'||record.hits?.length!==2)throw Error('HBG_WYVERN:MODEL_PENDING');
 if(input.mode!==rules.supportedMode||input.otherBuffs!=='NONE')throw Error('HBG_WYVERN:MODE_OR_OTHER_BUFFS_PENDING');
 if(!Number.isInteger(input.artilleryLevel)||!Number.isInteger(input.fireLevel)||!finite(input.fireHitzone,0,100))throw Error('HBG_WYVERN:SKILL_OR_FIRE_TARGET_PENDING');
 const am=rules.artilleryMultipliers[input.artilleryLevel],fm=rules.fireMultipliers[input.fireLevel],ff=rules.fireFlats[input.fireLevel];
 if(!finite(am)||!finite(fm)||!finite(ff))throw Error('HBG_WYVERN:SKILL_LEVEL_OUTSIDE_SCOPE');
 const meal=rules.mealFlats[input.meal],charm=rules.charmFlats[input.charm];
 if(!finite(meal)||!finite(charm))throw Error('HBG_WYVERN:FOOD_OR_CHARM_PENDING');
 if(input.unreviewedSkills?.length)throw Error('HBG_WYVERN:CONDITIONAL_EFFECT_SCOPE_PENDING:'+input.unreviewedSkills.join('/'));
 const attack=aggregateAttack(input.attackComponents,[{id:'meal',value:meal,source:rules.buffEvidence,status:'PROVISIONAL'},{id:'powercharm',value:charm,source:rules.buffEvidence,status:'PROVISIONAL'}]);
 const hits=record.hits.map(h=>{const physical=h.mv/100*(attack.multipliedBase*(h.artilleryTarget?am:1)+attack.skillFlat+attack.externalFlat);const fireValue=h.fireSkillTarget?h.fireAttack*fm+ff:h.fireAttack;const element=fireValue/rules.displayElementDivisor*input.fireHitzone/100;return {mv:h.mv,p:physical,e:element,total:physical+element,component:'RAW_AND_FIRE',criticalState:'NO_CRITICAL',artilleryTarget:h.artilleryTarget,fireSkillTarget:h.fireSkillTarget};});
 return {total:hits.reduce((n,h)=>n+h.total,0),hits,displayHits:hits.map(h=>Math.round((h.total+Number.EPSILON)*10)/10),attackComponents:attack,verificationStatus:'PROVISIONAL',adoptionStatus:'PROVISIONAL',evidenceRefs:record.evidenceRefs,scope:'STANDARD_MODE_FULL_TWO_HIT_PROVISIONAL',gameVersion:rules.gameVersion};
}
root.CombatAttackAggregation=Object.freeze({aggregate:aggregateAttack});root.HBGWyvernReference=Object.freeze({calculate});
})(typeof window==='undefined'?globalThis:window);
