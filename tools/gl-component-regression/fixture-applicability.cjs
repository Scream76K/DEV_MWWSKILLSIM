'use strict';
const assert=require('node:assert/strict');
const DIMENSIONS=['weapon','element','technique','component','conditions'];
const sourced=x=>typeof x?.source==='string'&&x.source.trim().length>0;
// Evidence is supplied by a source-specific plan/observation, never inferred from
// a changed number. This contract does not replace product guards or an oracle.
function assessFixture({dimensions={},productSupport={},nonTarget=null}={}){
 const normalized=Object.fromEntries(DIMENSIONS.map(k=>[k,sourced(dimensions[k])&&['SATISFIED','MISSING'].includes(dimensions[k].status)?dimensions[k]:{status:'UNRESOLVED'}]));
 const missingPrerequisites=DIMENSIONS.filter(k=>normalized[k].status==='MISSING');
 const unresolvedDimensions=DIMENSIONS.filter(k=>normalized[k].status==='UNRESOLVED');
 const deliberateNonTarget=sourced(nonTarget)&&typeof nonTarget.reason==='string'&&nonTarget.reason.trim().length>0;
 const unsupported=sourced(productSupport)&&productSupport.status==='UNSUPPORTED';
 const status=deliberateNonTarget?'DELIBERATE_NON_TARGET':unsupported?'PRODUCT_SCOPE_UNSUPPORTED':missingPrerequisites.length?'FIXTURE_PREREQUISITES_MISSING':unresolvedDimensions.length?'APPLICABILITY_UNRESOLVED':'PREREQUISITES_ESTABLISHED_ACCURACY_UNVERIFIED';
 return {status,dimensions:normalized,missingPrerequisites,unresolvedDimensions,deliberateNonTarget,nonTarget:deliberateNonTarget?nonTarget:null,productSupport:sourced(productSupport)?productSupport:{status:'UNRESOLVED'},numericAccuracyVerified:false,gameActivationObserved:false};
}
const elementOf=(w,element)=>(w.specials||[]).find(s=>s.kind==='element'&&s.element===element&&s.hidden===false&&s.damage?.raw>0);
function selectElementFixture(weapons,{kind,element,excludedSkillIds=[],noElement=false}){
 const found=weapons.filter(w=>w.kind===kind&&!(w.skills||[]).some(s=>excludedSkillIds.includes(s.skill?.id))&&(noElement?(w.specials||[]).length===0:elementOf(w,element))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];
 assert.ok(found,`No matching unchanged fixture: ${kind}/${element}/${noElement?'no-element':'visible-positive-element'}`);
 return found;
}
module.exports={assessFixture,selectElementFixture,elementOf,DIMENSIONS};
