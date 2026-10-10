// r154: presentation adapter for observed combos; never equate partial data with complete DPS.
(function(root){
'use strict';
function comparisonFromObserved(left,right){
 function normalize(x){
  if(!x||x.weaponType!=='gunlance'||x.source!=='VIDEO_OBSERVED'||typeof x.evidenceId!=='string'||!x.evidenceId.trim())throw new TypeError('valid observed gunlance evidence required');
  if(typeof x.knownDamage!=='number'||!Number.isFinite(x.knownDamage)||x.knownDamage<0)throw new TypeError('invalid knownDamage');
  const complete=x.damageComplete===true;
  const durationValid=typeof x.durationSeconds==='number'&&Number.isFinite(x.durationSeconds)&&x.durationSeconds>0;
  const damageValid=typeof x.totalDamage==='number'&&Number.isFinite(x.totalDamage)&&x.totalDamage>=0;
  const dpsValid=typeof x.dps==='number'&&Number.isFinite(x.dps)&&x.dps>=0;
  const ready=complete&&durationValid&&damageValid&&dpsValid&&x.dpsReady===true;
  return Object.freeze({evidenceId:x.evidenceId,knownDamage:x.knownDamage,totalDamage:complete&&damageValid?x.totalDamage:null,knownHits:x.knownHits??null,totalHits:x.hitsComplete===true?x.totalHits:null,dps:ready?x.dps:null,ready,reason:ready?null:!complete?'DAMAGE_INCOMPLETE':!durationValid?'DURATION_UNVERIFIED':'DPS_UNVERIFIED'});
 }
 const a=normalize(left),b=normalize(right);
 const ready=a.ready&&b.ready;
 const ratio=ready&&a.dps>0?Math.round((b.dps/a.dps)*1000)/10:null;
 return Object.freeze({a,b,dpsComparisonReady:ready,relativeDpsPercent:ratio,deltaDps:ready?Math.round((b.dps-a.dps)*10)/10:null,baselineZero:ready&&a.dps===0,source:'VIDEO_OBSERVED',formulaVerified:false});
}
const api=Object.freeze({comparisonFromObserved});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWGunlanceObservedComparison=api;
})(typeof window!=='undefined'?window:globalThis);
