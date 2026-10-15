// r180: strict, read-only joining of Technique DB engine readiness and documented combat context.
(function(root){'use strict';
const FIELDS=Object.freeze(['weaponId','weaponAttack','weaponElement','sharpness','affinity','criticalBoostLevel','activeSkills','monsterId','hitZonePhysical','hitZoneElement','targetState','attackConditions','gameVersion']);
function join(readiness,contextAudit,contexts,provenance){
 if(!readiness||!Array.isArray(readiness.rows)||!contextAudit||!Array.isArray(contextAudit.rows)||!Array.isArray(contextAudit.rejected)||!Array.isArray(contexts)||!provenance||!Array.isArray(provenance.entries)||readiness.rows.length!==provenance.entries.length)throw new TypeError('engine readiness, audited contexts and provenance required');
 const rejectedStages=new Set(contextAudit.rejected.filter(x=>x&&x.reason==='DUPLICATE_STAGE').map(x=>contexts[x.index]?.stage).filter(Number.isInteger));
 const rows=readiness.rows.map((r,i)=>{
  const stage=i+1, auditRows=contextAudit.rows.filter(x=>x.stage===stage), matching=contexts.filter(x=>x&&x.stage===stage&&x.techniqueId===provenance.entries[i].techniqueId);
  const blockers=[];
  if(r.stage!==stage||r.legacyTechniqueId!==provenance.entries[i].techniqueId)blockers.push('ENGINE_STAGE_IDENTITY_MISMATCH');
  if(auditRows.length!==1||auditRows[0].status!=='CONTEXT_DOCUMENTED_UNVERIFIED')blockers.push('CONTEXT_NOT_AUDITED');
  if(rejectedStages.has(stage)||matching.length!==1)blockers.push('CONTEXT_DUPLICATE_OR_MISSING');
  const record=matching.length===1?matching[0]:null;
  if(record&&auditRows.length===1&&auditRows[0].contextFingerprint!==JSON.stringify(canonical(record.context)))blockers.push('CONTEXT_CHANGED_AFTER_AUDIT');
  if(!r.canonicalTechniqueId||!Number.isInteger(r.hitCount)||r.hitCount<1||!Array.isArray(r.blockers))blockers.push('TECHNIQUE_ENGINE_NOT_READY');
  if(Array.isArray(r.blockers))blockers.push(...r.blockers.filter(x=>x!=='VERIFIED_DAMAGE_FORMULA_NOT_CONNECTED'&&x!=='LIVE_DAMAGE_AND_DURATION_NOT_VERIFIED'));
  const documented=blockers.length===0;
  const context=documented?Object.freeze(Object.fromEntries(FIELDS.map(k=>[k,record.context[k]]))):null;
  return Object.freeze({stage,legacyTechniqueId:r.legacyTechniqueId,canonicalTechniqueId:r.canonicalTechniqueId||null,hitCount:documented?r.hitCount:null,status:documented?'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED':'ENGINE_CONTEXT_BLOCKED',context,blockers:Object.freeze([...new Set(blockers)]),damage:null,dps:null,verified:false});
 });
 return Object.freeze({scope:'R180_READ_ONLY_ENGINE_CONTEXT_HANDOFF',rows:Object.freeze(rows),captureEligible:false,verifiedDps:null});
}
function canonical(v){if(Array.isArray(v))return v.map(canonical);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=canonical(v[k]);return o;}return v;}
function format(report){return ['Technique DB × 実機計算条件の受渡し診断（未検証）',...report.rows.map(r=>r.stage+'. '+r.legacyTechniqueId+' → '+(r.canonicalTechniqueId||'未対応')+'：'+r.status+(r.blockers.length?' / '+r.blockers.join(', '):' / 条件記録あり')),'※実際のダメージ式・成分別予測・コンボ時間は未接続。DPS確定不可。'].join('\n');}
const api=Object.freeze({join,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWTechniqueEngineContextBridge=api;
})(typeof window!=='undefined'?window:globalThis);
