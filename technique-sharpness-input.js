// r182: explicit reference-input boundary; user-provided values are never verified evidence.
(function(root){'use strict';
function resolve(multiplier,reference,context){
 const blockers=[];
 const n=typeof multiplier==='number'?multiplier:Number(String(multiplier??'').trim());
 if(String(multiplier??'').trim()===''||!Number.isFinite(n)||n<=0||n>2)blockers.push('SHARPNESS_MULTIPLIER_INVALID');
 if(typeof reference!=='string'||!reference.trim()||reference.trim().length>240)blockers.push('SHARPNESS_REFERENCE_REQUIRED');
 if(!context||!Array.isArray(context.rows)||!context.rows.length)blockers.push('HANDOFF_REQUIRED');
 if(context&&Array.isArray(context.rows)&&context.rows.some(r=>r.status!=='ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'))blockers.push('CONTEXT_HANDOFF_NOT_READY');
 return Object.freeze({status:blockers.length?'REFERENCE_INPUT_BLOCKED':'USER_REPORTED_REFERENCE_ONLY',options:blockers.length?null:Object.freeze({sharpnessPhysicalMultiplier:n,sharpnessEvidenceRef:reference.trim()}),blockers:Object.freeze(blockers),verified:false});
}
const api=Object.freeze({resolve});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWTechniqueSharpnessInput=api;
})(typeof window!=='undefined'?window:globalThis);
