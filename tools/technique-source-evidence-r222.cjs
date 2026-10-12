'use strict';
const {triage}=require('./technique-triage-r221.cjs');
const {engine}=require('../tests/r220-technique-audit.cjs');
function audit(){
 const base=triage();const rows=base.records.map(r=>{
  const t=engine.db[r.weaponKind][r.techniqueId];
  const evidence={sourceVersion:t.sourceVersion||null,sourceUrl:t.sourceUrl||null,evidence:t.evidence||null,revision:t.revision||null};
  const hasVersion=Boolean(evidence.sourceVersion);
  const hasReference=Boolean(evidence.sourceUrl||evidence.evidence);
  const conflicts=r.reasons.filter(x=>/CONFLICT/.test(x));
  const decisionRoute=conflicts.length?'USER_REVIEW_AFTER_SOURCE_RECONCILIATION':r.route==='HANDLER_REVIEW'?'HANDLER_SPECIFICATION_REVIEW':hasVersion&&hasReference?'VERIFY_VERSION_AGAINST_TARGET':'LOCATE_VERSIONED_PRIMARY_SOURCE';
  return {...r,sourceEvidence:evidence,hasVersion,hasReference,conflicts,decisionRoute,sourceReviewComplete:false,userDecisionRequested:false};
 });
 const count=(fn)=>rows.filter(fn).length;
 return {referenceGameVersion:base.referenceGameVersion,total:rows.length,withSourceVersion:count(r=>r.hasVersion),withSourceReference:count(r=>r.hasReference),conflictFlagged:count(r=>r.conflicts.length>0),routes:Object.fromEntries([...new Set(rows.map(r=>r.decisionRoute))].map(k=>[k,count(r=>r.decisionRoute===k)])),policy:'Evidence inventory only; missing metadata does not prove that a reference does not exist. No automatic promotion, user decision, or measurement request.',records:rows};
}
if(require.main===module)console.log(JSON.stringify(audit(),null,2));
module.exports={audit};
