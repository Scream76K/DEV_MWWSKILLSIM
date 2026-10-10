// r150: observed shelling evidence only; no inferred universal coefficients.
(function(root){
  'use strict';
  function finiteNonnegative(n,label){if(typeof n!=='number'||!Number.isFinite(n)||n<0)throw new TypeError(label+' must be finite nonnegative');return n;}
  function burstFromObservedRounds(roundDamages,loadedRounds){
    if(!Array.isArray(roundDamages)||!roundDamages.length)throw new TypeError('roundDamages required');
    if(!Number.isInteger(loadedRounds)||loadedRounds<1)throw new TypeError('loadedRounds invalid');
    if(roundDamages.length>loadedRounds)throw new RangeError('fired rounds exceed loaded rounds');
    const damages=roundDamages.map((v,i)=>finiteNonnegative(v,'round '+i));
    const total=damages.reduce((a,b)=>a+b,0);
    if(!Number.isFinite(total))throw new RangeError('total overflow');
    return Object.freeze({component:'SHELLING',scope:'OBSERVED_ONLY',hitCount:damages.length,loadedRounds,roundDamages:Object.freeze(damages),damageTotal:Math.round(total*10)/10,dpsReady:false});
  }
  function validateObservedCombo({shelling,physical=0,wyrmstake=0,other=0}){
    if(!shelling||shelling.scope!=='OBSERVED_ONLY')throw new TypeError('observed shelling required');
    const components={shelling:shelling.damageTotal,physical:finiteNonnegative(physical,'physical'),wyrmstake:finiteNonnegative(wyrmstake,'wyrmstake'),other:finiteNonnegative(other,'other')};
    const total=Object.values(components).reduce((a,b)=>a+b,0);
    if(!Number.isFinite(total))throw new RangeError('total overflow');
    return Object.freeze({components:Object.freeze(components),damageTotal:Math.round(total*10)/10,dpsReady:false});
  }
  const api=Object.freeze({burstFromObservedRounds,validateObservedCombo});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.MHWObservedShelling=api;
})(typeof window!=='undefined'?window:globalThis);
