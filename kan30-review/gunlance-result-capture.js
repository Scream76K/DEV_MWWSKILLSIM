// r164: defensive immutable snapshots; opt-in, event-driven capture of verified results from the equipment calculator.
// No guessing evidence, hits, duration or verification from displayed totals.
(function(root){'use strict';
const bridge=typeof module!=='undefined'&&module.exports?require('./gunlance-generic-bridge.js'):root.MHWGunlanceGenericBridge;
function cloneVerified(value){
 // JSON-compatible evidence payload only: reject cyclic and non-JSON values.
 const seen=new WeakSet();
 function clone(v){
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='object')throw new TypeError('non-JSON evidence field');
  if(seen.has(v))throw new TypeError('cyclic/shared evidence object');
  seen.add(v);
  if(Array.isArray(v))return Object.freeze(v.map(clone));
  if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)throw new TypeError('plain evidence object required');
  const out={};for(const k of Object.keys(v))Object.defineProperty(out,k,{value:clone(v[k]),enumerable:true,writable:false,configurable:false});
  return Object.freeze(out);
 }
 return clone(value);
}
function createCapture(){
 const slots={A:null,B:null};
 function put(side,result){
  if(side!=='A'&&side!=='B')throw new TypeError('A or B required');
  if(!result||typeof result!=='object')throw new TypeError('result object required');
  // Validate before storing; rejected snapshots never replace previous evidence.
  const normalized=bridge.normalizeGeneric?bridge.normalizeGeneric(result):result.source==='VERIFIED_TYPED_COMPONENTS'?bridge.fromTypedGeneric(result):bridge.fromGeneric(result);
  if(!normalized.dpsReady)throw new TypeError('verified DPS required');
  if(typeof result.contextId!=='string'||!result.contextId.trim())throw new TypeError('contextId required');
  const snapshot=cloneVerified(result);
  slots[side]=snapshot;
  return Object.freeze({side,evidenceId:normalized.evidenceId,contextId:result.contextId,dps:normalized.dps});
 }
 function replacePair(a,b){
  // Stage both independently and commit only after pair compatibility succeeds.
  const staging=createCapture();
  staging.put('A',a);staging.put('B',b);
  const comparison=staging.compare();
  const nextA=cloneVerified(a),nextB=cloneVerified(b);
  slots.A=nextA;slots.B=nextB;
  return comparison;
 }
 function compare(){if(!slots.A||!slots.B)throw new TypeError('both A and B captures required');return bridge.compareGeneric(slots.A,slots.B);}
 function status(){return Object.freeze({A:slots.A?{evidenceId:slots.A.evidenceId,contextId:slots.A.contextId}:null,B:slots.B?{evidenceId:slots.B.evidenceId,contextId:slots.B.contextId}:null});}
 function clear(side){if(side!=='A'&&side!=='B')throw new TypeError('A or B required');slots[side]=null;}
 return Object.freeze({put,replacePair,compare,status,clear});
}
const api=Object.freeze({createCapture});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWGunlanceResultCapture=api;
})(typeof window!=='undefined'?window:globalThis);
