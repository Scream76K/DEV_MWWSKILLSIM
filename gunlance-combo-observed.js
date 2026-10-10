// r152: compose observed gunlance events without guessing missing components.
(function(root){
'use strict';
const shelling=typeof module!=='undefined'&&module.exports?require('./observed-shelling.js'):root.MHWObservedShelling;
function composeObservedCombo({events,evidenceId,durationSeconds=null}){
 if(typeof evidenceId!=='string'||!evidenceId.trim())throw new TypeError('evidenceId required');
 if(!Array.isArray(events)||!events.length)throw new TypeError('events required');
 if(durationSeconds!==null&&(!Number.isFinite(durationSeconds)||durationSeconds<=0))throw new TypeError('durationSeconds invalid');
 const categories=['physical','shelling','wyrmstake','other'];
 const components=Object.fromEntries(categories.map(k=>[k,0]));
 let hits=0,complete=true,hitsComplete=true,knownDamage=0;
 for(const event of events){
  if(!event||!categories.includes(event.component))throw new TypeError('unknown component');
  if(event.damage===null||event.damage===undefined){
   if(event.hits!==undefined&&event.hits!==null&&(!Number.isInteger(event.hits)||event.hits<0))throw new TypeError('invalid hits');
   if(event.hits===undefined||event.hits===null)hitsComplete=false;else hits+=event.hits;
   complete=false;components[event.component]=null;continue;
  }
  if(typeof event.damage!=='number'||!Number.isFinite(event.damage)||event.damage<0)throw new TypeError('invalid damage');
  if(event.hits!==undefined&&event.hits!==null&&(!Number.isInteger(event.hits)||event.hits<0))throw new TypeError('invalid hits');
  if(event.hits===undefined||event.hits===null)hitsComplete=false;else hits+=event.hits;
  knownDamage+=event.damage;
  if(components[event.component]!==null)components[event.component]+=event.damage;
 }
 const total=complete?Object.values(components).reduce((a,b)=>a+b,0):null;
 if(total!==null&&!Number.isFinite(total))throw new RangeError('overflow');
 const round=v=>v===null?null:Math.round((v+Number.EPSILON)*10)/10;
 const result=Object.freeze({weaponType:'gunlance',source:'VIDEO_OBSERVED',evidenceId,components:Object.freeze(Object.fromEntries(Object.entries(components).map(([k,v])=>[k,round(v)]))),knownHits:hits,hitsComplete,totalHits:hitsComplete?hits:null,knownDamage:round(knownDamage),totalDamage:round(total),damageComplete:complete,durationSeconds,dps:complete&&durationSeconds!==null?round(total/durationSeconds):null,dpsReady:complete&&durationSeconds!==null,techniqueDbFormulaVerified:false});
 return result;
}
function observedBurstEvent(roundDamages,loadedRounds){const burst=shelling.burstFromObservedRounds(roundDamages,loadedRounds);return Object.freeze({component:'shelling',damage:burst.damageTotal,hits:burst.hitCount});}
const api=Object.freeze({composeObservedCombo,observedBurstEvent});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWGunlanceComboObserved=api;
})(typeof window!=='undefined'?window:globalThis);
