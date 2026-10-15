// r174: read-only mapping of externally supplied observation references to pending work.
// Intake never certifies evidence, damage, duration or DPS.
(function(root){'use strict';
const checklist=typeof module!=='undefined'&&module.exports?require('./combo-evidence-checklist.js'):root.MHWComboEvidenceChecklist;
function review(provenance,observations){
 if(!Array.isArray(observations))throw new TypeError('observations array required');
 const work=checklist.create(provenance);
 const expected=new Map(work.items.map(item=>[item.stage+'\u0000'+item.techniqueId+'\u0000'+item.code,item]));
 const matched=new Map(),rejected=[];
 for(let i=0;i<observations.length;i++){
  const o=observations[i];
  if(!o||typeof o!=='object'||Array.isArray(o)){rejected.push({index:i,reason:'INVALID_RECORD'});continue;}
  const key=o.stage+'\u0000'+o.techniqueId+'\u0000'+o.code;
  if(!Number.isInteger(o.stage)||o.stage<1||!expected.has(key)){rejected.push({index:i,reason:'NOT_PENDING_FOR_STAGE'});continue;}
  if(typeof o.evidenceRef!=='string'||!o.evidenceRef.trim()||o.evidenceRef.length>500){rejected.push({index:i,reason:'EVIDENCE_REF_REQUIRED'});continue;}
  if(matched.has(key)){rejected.push({index:i,reason:'DUPLICATE_OBSERVATION'});continue;}
  matched.set(key,Object.freeze({stage:o.stage,techniqueId:o.techniqueId,code:o.code,evidenceRef:o.evidenceRef.trim(),status:'SUBMITTED_UNVERIFIED'}));
 }
 return Object.freeze({status:'REFERENCE_INTAKE_ONLY',matched:Object.freeze([...matched.values()]),remaining:Object.freeze(work.items.filter(item=>!matched.has(item.stage+'\u0000'+item.techniqueId+'\u0000'+item.code))),rejected:Object.freeze(rejected.map(r=>Object.freeze(r))),captureEligible:false});
}
function format(report){return ['実機証拠の受付照合（未検証・DPS確定不可）','参照を受付：'+report.matched.length+'件 / 未提出：'+report.remaining.length+'件 / 不一致：'+report.rejected.length+'件',...report.matched.map(x=>x.stage+'. '+x.techniqueId+' '+x.code+' → '+x.evidenceRef+'（内容未検証）'),...report.rejected.map(x=>'入力'+(x.index+1)+'：'+x.reason),'※提出された参照の実在性・内容・数値は検証していません。'].join('\n');}
const api=Object.freeze({review,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboEvidenceIntake=api;
})(typeof window!=='undefined'?window:globalThis);
