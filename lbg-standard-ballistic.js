(function(root){'use strict';
const SOURCE='https://kuroyonhon.com/mhwilds/memo/14.php';
const APPROVAL='Sentinel_6491dfb81bf88191a4dc63af2ae8503f';
const rows={PIERCE:{mv:[0,11,12,12],modifier:.65,projectiles:()=>3,contacts:()=>1},SPREAD:{mv:[0,13,15.6,18.2],modifier:.6,projectiles:()=>2,contacts:level=>level+4},NORMAL:{mv:[0,17,23.8,30.6],modifier:.7,projectiles:()=>5,contacts:()=>1}};
function select(weapon){
 if(weapon?.kind!=='light-bowgun'||!Array.isArray(weapon.ammo))return {reason:'LBG_STANDARD:WEAPON_AMMO_UNRESOLVED'};
 const priority=['NORMAL','PIERCE','SPREAD'],candidates=[];
 for(const type of priority){const a=weapon.ammo.filter(x=>String(x?.kind).toUpperCase()===type);if(a.length>1)return {reason:'LBG_STANDARD:AMBIGUOUS_AMMO_RECORD:'+type};if(!a.length)continue;const row=a[0];if(!Number.isInteger(row.level)||row.level<1||row.level>3||typeof row.rapid!=='boolean')return {reason:'LBG_STANDARD:INVALID_AMMO_RECORD:'+type};if(!row.rapid)continue;candidates.push({ammoType:type,ammoLevel:row.level,baseAmmoLevel:row.level});}
 candidates.sort((a,b)=>b.ammoLevel-a.ammoLevel||priority.indexOf(a.ammoType)-priority.indexOf(b.ammoType));
 if(!candidates.length)return {reason:'LBG_STANDARD:NO_NATIVE_RAPID_AMMO'};
 const chosen=candidates[0],r=rows[chosen.ammoType],projectilesPerTrigger=r.projectiles(chosen.ammoLevel),contactsPerProjectile=r.contacts(chosen.ammoLevel);
 return {...chosen,shotMode:'RAPID',shotCount:5,triggerCount:5,projectilesPerTrigger,contactsPerProjectile,contactCount:5*projectilesPerTrigger*contactsPerProjectile,techniqueId:chosen.ammoType==='NORMAL'?(chosen.ammoLevel===3?'LBG_NORMAL_RAPID_NATIVE_3':'LBG_NORMAL_RAPID_'+chosen.ammoLevel):'LBG_STANDARD_'+chosen.ammoType+'_'+chosen.ammoLevel,policy:'NATIVE_RAPID_HIGHEST_LEVEL_NORMAL_PIERCE_SPREAD',source:SOURCE,approval:APPROVAL,contactConvention:chosen.ammoType==='PIERCE'?'EACH_PROJECTILE_FIRST_CONTACT_AT_SELECTED_HITZONE_NOT_MAXIMUM':'ALL_LISTED_CONTACTS_AT_SELECTED_HITZONE',liveGameVerification:'PENDING'};
}
function calculate(selection,input,shotBonuses=()=>({shotAttackAdd:0,shotAffinityAdd:0})){
 const s=selection,r=rows[s?.ammoType],valid=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 if(!r||!['PIERCE','SPREAD'].includes(s.ammoType)||![1,2,3].includes(s.ammoLevel)||s.shotMode!=='RAPID'||s.triggerCount!==5||s.projectilesPerTrigger!==r.projectiles(s.ammoLevel)||s.contactsPerProjectile!==r.contacts(s.ammoLevel)||s.contactCount!==5*s.projectilesPerTrigger*s.contactsPerProjectile)throw Error('LBG_STANDARD:REFERENCE_CONTRACT_INVALID');
 if(!valid(input.attack,0,10000)||!valid(input.affinity,-100,100)||!valid(input.criticalMultiplier,1,2)||!valid(input.hitzone,0,100)||![0,1].includes(input.ammoUp)||![0,1].includes(input.rapidUp))throw Error('LBG_STANDARD:INVALID_CALCULATION_INPUT');
 const trace=[];
 for(let triggerOrdinal=1;triggerOrdinal<=5;triggerOrdinal++){
 const bonus=shotBonuses(triggerOrdinal);if(!valid(bonus?.shotAttackAdd,0,100)||!valid(bonus?.shotAffinityAdd,0,100))throw Error('LBG_STANDARD:SHOT_SKILL_UNRESOLVED');
 const affinity=Math.min(100,input.affinity+bonus.shotAffinityAdd),critical=affinity>=0?1+affinity/100*(input.criticalMultiplier-1):1+affinity/100*.25;
 const damage=(input.attack+bonus.shotAttackAdd)*r.mv[s.ammoLevel]/100*input.hitzone/100*critical*r.modifier*(input.ammoUp?1.05:1)*(input.rapidUp?1.05:1);
 for(let projectileOrdinal=1;projectileOrdinal<=s.projectilesPerTrigger;projectileOrdinal++)for(let contactOrdinal=1;contactOrdinal<=s.contactsPerProjectile;contactOrdinal++)trace.push({triggerOrdinal,projectileOrdinal,contactOrdinal,physical:damage,element:0,shotAttackAdd:bonus.shotAttackAdd,shotAffinityAdd:bonus.shotAffinityAdd});
 }
 return {total:trace.reduce((sum,h)=>sum+h.physical,0),physical:trace.reduce((sum,h)=>sum+h.physical,0),element:0,trace,scope:'LBG_STANDARD_NATIVE_RAPID_FIVE_TRIGGER_REFERENCE',contactConvention:s.contactConvention,source:SOURCE,skillSources:{pierceUp:'https://game8.jp/mhwilds/673683',spreadUp:'SPREAD_SHOT_SKILL_RULE:OWNER_2026-10-25T23:12Z_SPREAD_POWER_SKILL',rapidUp:'LBG_RAPID_NORMAL_RULE'},liveGameVerification:'PENDING'};
}
const api=Object.freeze({select,calculate});root.LBGStandardBallistic=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
