// r151: evidence-gated Gunlance observation handler. Never substitutes for the MV/Technique DB formula.
(function(root){
  'use strict';
  const shelling = typeof module !== 'undefined' && module.exports ? require('./observed-shelling.js') : root.MHWObservedShelling;
  function evaluateObservedFullBurst({roundDamages,loadedRounds,physicalDamage=null,physicalHits=null,evidenceId}){
    if(typeof evidenceId!=='string'||!evidenceId.trim()) throw new TypeError('evidenceId required');
    const burst=shelling.burstFromObservedRounds(roundDamages,loadedRounds);
    const hasPhysical=physicalDamage!==null;
    if(hasPhysical && (typeof physicalDamage!=='number'||!Number.isFinite(physicalDamage)||physicalDamage<0)) throw new TypeError('physicalDamage invalid');
    if(physicalHits!==null && (!hasPhysical||!Number.isInteger(physicalHits)||physicalHits<0))throw new TypeError('physicalHits invalid');
    const total=hasPhysical ? Math.round((burst.damageTotal+physicalDamage)*10)/10 : null;
    return Object.freeze({weaponType:'gunlance',action:'FULL_BURST',evidenceId,source:'VIDEO_OBSERVED',shellingHits:burst.hitCount,shellingDamage:burst.damageTotal,physicalDamage,physicalHits,totalHits:physicalHits===null?null:burst.hitCount+physicalHits,totalDamage:total,damageComplete:hasPhysical,dpsReady:false,techniqueDbFormulaVerified:false});
  }
  const api=Object.freeze({evaluateObservedFullBurst});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.MHWGunlanceObservedHandler=api;
})(typeof window!=='undefined'?window:globalThis);
