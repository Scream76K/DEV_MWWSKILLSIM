// r165: strictly gated transfer of calculator-attached evidence into A/B capture.
// No evidence is synthesized from reference DPS, totals, or build skill stats.
(function(root){'use strict';
const captureLib=typeof module!=='undefined'&&module.exports?require('./gunlance-result-capture.js'):root.MHWGunlanceResultCapture;
function prepare(rows,context){
 if(!Array.isArray(rows)||rows.length!==2||!context||typeof context!=='object')throw new TypeError('A/B comparison required');
 return ['A','B'].map((side,i)=>{
  const row=rows[i];if(!row||row.kind!=='gunlance')throw new TypeError(side+': gunlance required');
  const e=row.verifiedCapture;
  if(!e||typeof e!=='object')throw new TypeError(side+': verified component evidence missing');
  if(e.origin!=='CALCULATOR_VERIFIED_EVIDENCE')throw new TypeError(side+': calculator evidence origin required');
  if(typeof e.buildName!=='string'||e.buildName!==row.name)throw new TypeError(side+': build identity mismatch');
  if(typeof e.contextId!=='string'||!e.contextId.trim())throw new TypeError(side+': verified context missing');
  if(e.source!=='VERIFIED_TYPED_COMPONENTS'&&e.source!=='VERIFIED_GENERIC_COMPONENTS')throw new TypeError(side+': unsupported evidence source');
  if(e.weaponType!=='gunlance')throw new TypeError(side+': weapon type mismatch');
  // Transfer requires independently traceable per-component and timing provenance.
  // A bare `verified: true` flag is insufficient to claim calculator verification.
  if(e.source==='VERIFIED_GENERIC_COMPONENTS'){
   if(!Array.isArray(e.components)||!e.components.length)throw new TypeError(side+': component evidence missing');
   for(const c of e.components){
    if(!c||typeof c.evidenceRef!=='string'||!c.evidenceRef.trim())throw new TypeError(side+': component evidenceRef required');
   }
  }
  if(e.source==='VERIFIED_TYPED_COMPONENTS'){
   if(!e.componentEvidence||typeof e.componentEvidence!=='object')throw new TypeError(side+': typed component evidence required');
   for(const key of ['physicalBody','elementalBody','shelling','wyrmstake']){
    const proof=e.componentEvidence[key];
    if(!proof||typeof proof.evidenceRef!=='string'||!proof.evidenceRef.trim())throw new TypeError(side+': typed component evidenceRef required: '+key);
   }
  }
  if(typeof e.durationEvidenceRef!=='string'||!e.durationEvidenceRef.trim())throw new TypeError(side+': duration evidenceRef required');
  if(typeof e.techniqueDbRevision!=='string'||!e.techniqueDbRevision.trim())throw new TypeError(side+': Technique DB revision required');
  if(typeof context.techniqueDbRevision==='string'&&context.techniqueDbRevision!==e.techniqueDbRevision)throw new TypeError(side+': Technique DB revision mismatch');
  if(typeof context.verifiedContextId!=='string'||context.verifiedContextId!==e.contextId)throw new TypeError(side+': comparison context mismatch');
  // Do not use reference DPS to fill any missing verified components.
  if(i===1&&rows[0].verifiedCapture.techniqueDbRevision!==e.techniqueDbRevision)throw new TypeError('A/B Technique DB revision mismatch');
  const {origin,buildName,...payload}=e;
  return {side,payload};
 });
}
function transfer(rows,context,store){
 const prepared=prepare(rows,context);
 // Validate both before committing either side; failed verification leaves the store unchanged.
 const staging=captureLib.createCapture();
 for(const item of prepared)staging.put(item.side,item.payload);
 const result=staging.compare(); // same verified context required
 if(!store||typeof store.replacePair!=='function')throw new TypeError('atomic capture store required');
 // Atomic replacement preserves both previous slots if any verification fails.
 store.replacePair(prepared[0].payload,prepared[1].payload);
 return Object.freeze({status:'TRANSFERRED_VERIFIED_PAIR',comparison:result});
}
const api=Object.freeze({prepare,transfer});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWGunlanceVerifiedTransfer=api;
})(typeof window!=='undefined'?window:globalThis);
