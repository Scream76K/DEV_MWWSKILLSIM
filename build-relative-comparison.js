/* r242: pure relative-build comparison. Inputs must come from existing validated damage engine. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.MHBuildRelativeComparison=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const METRICS=['total','physical','elemental'];
function valid(x){return typeof x==='number'&&Number.isFinite(x)&&x>=0;}
function compare(reference,candidate){
 if(!reference||!candidate)throw new TypeError('Both builds are required');
 if(reference.weaponType!==candidate.weaponType)throw new Error('Weapon types must match');
 const output={weaponType:reference.weaponType,baseline:100,metrics:{},critical:{},warnings:[]};
 const unknown=x=>x.elementKnown===false||x.typeKnown===false||x.elementStatus==='UNKNOWN';
 const typeMismatch=reference.elementType&&candidate.elementType&&reference.elementType!==candidate.elementType;
 for(const key of METRICS){
  if((key==='total'||key==='elemental')&&(unknown(reference)||unknown(candidate))){output.metrics[key]=null;output.warnings.push(key+': '+(reference.elementReason||candidate.elementReason||'element state unknown'));continue;}
  if(key==='elemental'&&typeMismatch){output.metrics[key]=null;output.warnings.push('elemental: element types differ');continue;}
  const a=reference[key],b=candidate[key];
  if(!valid(a)||!valid(b)){output.metrics[key]=null;output.warnings.push(key+': missing or invalid engine output');continue;}
  if(a===0){output.metrics[key]=null;output.warnings.push(key+': zero reference, ratio undefined');continue;}
  output.metrics[key]={reference:a,candidate:b,index:100*b/a,changePercent:100*(b/a-1)};
 }
 for(const key of ['affinity','maxAffinity']){
  const a=reference[key],b=candidate[key];
  output.critical[key]=Number.isFinite(a)&&Number.isFinite(b)?{reference:a,candidate:b,deltaPoints:b-a}:null;
 }
 return output;
}
return Object.freeze({compare});
});
