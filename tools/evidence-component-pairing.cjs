'use strict';
// Bridges controlled A/B footage to typed observed components; never infers game coefficients.
const {inspectPair}=require('./evidence-pairing.cjs');
const schemas=Object.freeze({
 'gunlance':['physicalBody','elementalBody','shelling','wyrmstake'],
 'charge-blade':['physicalBody','elementalBody','axeBoostPhysical','axeBoostElement','impactPhial','elementalPhial']
});
function compareObservedComponents(baseline,variant){
 const inspection=inspectPair(baseline,variant);
 const errors=[...inspection.errors];
 const weapon=baseline?.weaponId;
 const keys=schemas[weapon];
 if(!keys)errors.push('unsupported typed weapon');
 if(variant?.weaponId!==weapon)errors.push('weapon mismatch');
 const read=(rec,label)=>{
  const c=rec?.observedComponents;
  if(!c||typeof c!=='object'||Array.isArray(c)){errors.push(label+': observedComponents missing');return null;}
  if(keys){
   for(const k of keys)if(typeof c[k]!=='number'||!Number.isFinite(c[k])||c[k]<0)errors.push(label+': invalid '+k);
   for(const k of Object.keys(c))if(!keys.includes(k))errors.push(label+': unexpected '+k);
  }
  if(weapon==='charge-blade'){
   if(!['IMPACT','ELEMENT'].includes(rec.phialType))errors.push(label+': invalid phialType');
   if(rec.phialType==='IMPACT'&&c.elementalPhial!==0)errors.push(label+': phial conflict');
   if(rec.phialType==='ELEMENT'&&c.impactPhial!==0)errors.push(label+': phial conflict');
  }
  return c;
 };
 const a=read(baseline,'baseline'),b=read(variant,'variant');
 if(weapon==='charge-blade'&&baseline?.phialType!==variant?.phialType)errors.push('phial type mismatch');
 if(!errors.length){
  for(const [rec,c,label] of [[baseline,a,'baseline'],[variant,b,'variant']]){
   const sum=keys.reduce((s,k)=>s+c[k],0);
   const hits=rec.hits.reduce((s,n)=>s+n,0);
   if(!Number.isFinite(sum)||!Number.isFinite(hits))errors.push(label+': total overflow');
   else if(Math.abs(sum-hits)>1e-6)errors.push(label+': component total does not match observed hits');
  }
 }
 if(errors.length)return {comparable:false,errors,verificationStatus:'UNVERIFIED',scope:'OBSERVED_ONLY_NOT_STANDARD',dpsReady:false};
 const components={};
 for(const k of keys)components[k]={baseline:a[k],variant:b[k],delta:b[k]-a[k],percent:a[k]>0?(b[k]/a[k]-1)*100:null};
 const totalA=baseline.hits.reduce((s,n)=>s+n,0),totalB=variant.hits.reduce((s,n)=>s+n,0);
 return {comparable:true,errors:[],weaponId:weapon,components,totalA,totalB,delta:totalB-totalA,relativePercent:totalA>0?(totalB/totalA-1)*100:null,verificationStatus:'UNVERIFIED',scope:'OBSERVED_ONLY_NOT_STANDARD',dpsReady:false};
}
module.exports={compareObservedComponents};
