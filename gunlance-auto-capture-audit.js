// r163: read-only, explicit readiness checklist. Reference calculations are never verified captures.
(function(root){'use strict';
const REQUIRED=Object.freeze(['VERIFIED_COMPONENT_DAMAGE','COMPONENT_HIT_EVIDENCE','VERIFIED_COMBO_DURATION','SAME_CONDITION_CONTEXT','TECHNIQUE_DB_PROVENANCE']);
function audit(rows,context){
 if(!Array.isArray(rows)||!rows.length||!context||typeof context!=='object')throw new TypeError('comparison required');
 const entries=rows.map((row,index)=>{
  if(!row||typeof row!=='object')throw new TypeError('invalid row');
  const gunlance=row.kind==='gunlance';
  const dps=typeof row.dps==='number'&&Number.isFinite(row.dps)&&row.dps>=0?row.dps:null;
  const normal=row.power?.normal;
  const components=normal?{physical:normal.physical??null,element:normal.element??null,special:normal.special??null}:null;
  const missing=gunlance?[...REQUIRED]:[];
  return {index,name:row.name??null,weaponType:row.kind??null,referenceDps:dps,referenceComponents:components,eligibleForVerifiedCapture:false,missingEvidence:missing,reason:!gunlance?'NOT_GUNLANCE':dps===null?'REFERENCE_DPS_PENDING':'EVIDENCE_HITS_DURATION_NOT_VERIFIED'};
 });
 return {format:'MHWildsGunlanceCaptureAudit',revision:'r163',source:'BUILD_COMPARISON_REFERENCE',verified:false,context:JSON.parse(JSON.stringify(context)),requiredEvidence:[...REQUIRED],entries};
}
function summary(report){
 if(!report||report.format!=='MHWildsGunlanceCaptureAudit'||!Array.isArray(report.entries))throw new TypeError('audit report required');
 return report.entries.map(x=>(x.name||'無名')+'：'+(x.referenceDps===null?'DPS未算出':'参考DPS '+x.referenceDps.toFixed(1))+' / '+(x.reason==='NOT_GUNLANCE'?'対象外':'自動登録保留')+'（'+x.reason+'）'+(x.missingEvidence.length?'\n  未確認：'+x.missingEvidence.join(' / '):'')).join('\n')+'\n資料参考値を実機検証済みとして登録しません。';
}
const api=Object.freeze({audit,summary,REQUIRED});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWGunlanceAutoCaptureAudit=api;
})(typeof window!=='undefined'?window:globalThis);
