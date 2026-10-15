// r156: strict bridge from generic component calculations to the observed A/B adapter.
// No fallback to observed shelling constants or fabricated durations.
(function(root){'use strict';
const observed=typeof module!=='undefined'&&module.exports?require('./gunlance-combo-observed.js'):root.MHWGunlanceComboObserved;
const compare=typeof module!=='undefined'&&module.exports?require('./gunlance-observed-comparison.js'):root.MHWGunlanceObservedComparison;
const KINDS=['physical','shelling','wyrmstake','other'];
function fromGeneric(input){
 if(!input||input.weaponType!=='gunlance')throw new TypeError('gunlance only');
 if(typeof input.evidenceId!=='string'||!input.evidenceId.trim())throw new TypeError('evidenceId required');
 if(input.source!=='VERIFIED_GENERIC_COMPONENTS')throw new TypeError('verified generic source required');
 if(!Array.isArray(input.components)||!input.components.length)throw new TypeError('components required');
 const events=input.components.map(c=>{
  if(!c||!KINDS.includes(c.component))throw new TypeError('unknown component');
  if(c.verified!==true)throw new TypeError('unverified component');
  if(typeof c.damage!=='number'||!Number.isFinite(c.damage)||c.damage<0)throw new TypeError('invalid damage');
  if(!Number.isInteger(c.hits)||c.hits<0)throw new TypeError('verified hits required');
  if((c.damage>0&&c.hits===0)||(c.damage===0&&c.hits>0))throw new TypeError('damage and hits inconsistent');
  return {component:c.component,damage:c.damage,hits:c.hits};
 });
 const duration=input.durationSeconds;
 if(typeof duration!=='number'||!Number.isFinite(duration)||duration<=0||input.durationVerified!==true)throw new TypeError('verified duration required');
 return observed.composeObservedCombo({events,evidenceId:input.evidenceId,durationSeconds:duration});
}
// r158: accept the typed four-component output of the existing gunlance
// calculation boundary, but only with explicit per-component evidence and hits.
// Numeric totals alone are NEVER promoted to verified DPS.
function fromTypedGeneric(input){
 if(!input||input.weaponType!=='gunlance'||input.source!=='VERIFIED_TYPED_COMPONENTS')throw new TypeError('verified typed gunlance source required');
 const values=input.components,proof=input.componentEvidence;
 if(!values||!proof||typeof values!=='object'||typeof proof!=='object')throw new TypeError('typed components and evidence required');
 const mapping=[['physicalBody','physical'],['elementalBody','physical'],['shelling','shelling'],['wyrmstake','wyrmstake']];
 const components=mapping.map(([key,component])=>{
  if(!Object.prototype.hasOwnProperty.call(values,key)||!Object.prototype.hasOwnProperty.call(proof,key))throw new TypeError('missing typed component: '+key);
  const e=proof[key];
  if(!e||e.verified!==true||typeof e.evidenceRef!=='string'||!e.evidenceRef.trim()||!Number.isInteger(e.hits)||e.hits<0)throw new TypeError('unverified typed component: '+key);
  if(typeof values[key]!=='number'||!Number.isFinite(values[key])||values[key]<0)throw new TypeError('invalid typed damage: '+key);
  if((values[key]>0&&e.hits===0)||(values[key]===0&&e.hits>0))throw new TypeError('typed damage and hits inconsistent: '+key);
  return {component,damage:values[key],hits:e.hits,verified:true};
 });
 return fromGeneric({...input,source:'VERIFIED_GENERIC_COMPONENTS',components});
}
function normalizeGeneric(input){return input?.source==='VERIFIED_TYPED_COMPONENTS'?fromTypedGeneric(input):fromGeneric(input);}
function compareGeneric(a,b){
 if(!a||!b||!a.contextId||a.contextId!==b.contextId)throw new TypeError('same verified context required');
 const result=compare.comparisonFromObserved(normalizeGeneric(a),normalizeGeneric(b));
 return Object.freeze({...result,contextId:a.contextId,calculationScope:'VERIFIED_COMPONENTS_ONLY',techniqueDbFormulaVerified:false});
}
const api=Object.freeze({fromGeneric,fromTypedGeneric,compareGeneric});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWGunlanceGenericBridge=api;
})(typeof window!=='undefined'?window:globalThis);
