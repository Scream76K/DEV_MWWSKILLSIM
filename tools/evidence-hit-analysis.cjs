'use strict';
// Diagnostic-only, does not infer MV, component multipliers or verification.
const {summarizePair}=require('./evidence-pairing.cjs');
function analyzeHits(baseline,variant){
 const pair=summarizePair(baseline,variant);
 const errors=[...pair.errors];
 if(!pair.comparable) return {ready:false,errors,rows:[],verificationStatus:'UNVERIFIED'};
 if(baseline.hits.length!==variant.hits.length) errors.push('hit count mismatch');
 const aTypes=baseline.hitTypes,bTypes=variant.hitTypes;
 if(aTypes!==undefined||bTypes!==undefined){
  if(!Array.isArray(aTypes)||!Array.isArray(bTypes)||aTypes.length!==baseline.hits.length||bTypes.length!==variant.hits.length) errors.push('invalid hitTypes');
  else if(aTypes.some((x,i)=>typeof x!=='string'||!x.trim()||x!==bTypes[i])) errors.push('hit component mismatch');
 }
 if(errors.length) return {ready:false,errors,rows:[],verificationStatus:'UNVERIFIED'};
 const rows=baseline.hits.map((value,i)=>({index:i+1,component:aTypes?aTypes[i]:null,baseline:value,variant:variant.hits[i],delta:variant.hits[i]-value,relativePercent:value>0?(variant.hits[i]/value-1)*100:null}));
 return {ready:true,errors:[],rows,baselineTotal:pair.baselineTotal,variantTotal:pair.variantTotal,relativePercent:pair.relativePercent,verificationStatus:'UNVERIFIED'};
}
module.exports={analyzeHits};
