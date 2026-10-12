'use strict';
// Deterministic matching of in-game A/B evidence; no damage formula is inferred.
const {inspectEvidence}=require('./evidence-intake.cjs');
const comparableFields=['weaponId','gameVersion','equipmentId','targetId','targetPart','distance','buffState','criticalMode'];
function inspectPair(baseline,variant){
 const a=inspectEvidence(baseline),b=inspectEvidence(variant);
 const errors=[...a.errors.map(x=>'baseline: '+x),...b.errors.map(x=>'variant: '+x)];
 if(!baseline||!variant||typeof baseline!=='object'||typeof variant!=='object') return {comparable:false,errors,verificationStatus:'UNVERIFIED'};
 for(const field of comparableFields){
  if(baseline[field]===undefined||variant[field]===undefined) errors.push('missing comparison field '+field);
  else if(baseline[field]!==variant[field]) errors.push('comparison mismatch '+field);
 }
 if(baseline.skillCondition===undefined||variant.skillCondition===undefined) errors.push('missing skillCondition');
 else if(baseline.skillCondition===variant.skillCondition) errors.push('skillCondition must differ');
 for(const [name,rec] of [['baseline',baseline],['variant',variant]]){
  if(!Array.isArray(rec.hits)||!rec.hits.length||!rec.hits.every(n=>Number.isFinite(n)&&n>=0)) errors.push(name+': invalid hits');
 }
 return {comparable:errors.length===0,errors,verificationStatus:'UNVERIFIED'};
}
function summarizePair(baseline,variant){
 const result=inspectPair(baseline,variant);
 if(!result.comparable)return {...result,baselineTotal:null,variantTotal:null,relativePercent:null};
 const baselineTotal=baseline.hits.reduce((a,b)=>a+b,0);
 const variantTotal=variant.hits.reduce((a,b)=>a+b,0);
 return {...result,baselineTotal,variantTotal,relativePercent:baselineTotal>0?(variantTotal/baselineTotal-1)*100:null};
}
module.exports={inspectPair,summarizePair};
