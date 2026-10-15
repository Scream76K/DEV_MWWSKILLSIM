// r176: diagnostic reconciliation, never promotes observations to verified values.
(function(root){'use strict';
function reconcile(provenance,measurementReport,readAudit,expectedVersion){
 if(!provenance||!Array.isArray(provenance.entries)||!measurementReport||!Array.isArray(measurementReport.accepted)||typeof readAudit!=='function')throw new TypeError('provenance, measurement report and audit reader required');
 const rows=measurementReport.accepted.map(r=>{
  const p=provenance.entries[r.stage-1];
  if(!p||p.techniqueId!==r.techniqueId)return Object.freeze({stage:r.stage,techniqueId:r.techniqueId,status:'UNVERIFIABLE',reasons:Object.freeze(['STAGE_IDENTITY_MISMATCH'])});
  const reasons=[];let hitStatus='UNVERIFIABLE';
  if(typeof expectedVersion==='string'&&expectedVersion&&r.gameVersion!==expectedVersion)reasons.push('GAME_VERSION_MISMATCH');
  const audit=readAudit(provenance.weaponType,r.techniqueId);
  if(!audit||audit.weaponType!==provenance.weaponType||audit.techniqueId!==r.techniqueId){reasons.push('TECHNIQUE_DB_RECORD_MISSING');}
  else{
   const hits=audit.registeredHits;
   if(!Array.isArray(hits)||!hits.length)reasons.push('DB_HIT_COUNT_UNAVAILABLE');
   else if(hits.some(h=>!h||h.eligible!==undefined&&h.eligible!==true||h.variable===true||h.optional===true||h.repeatable===true||h.hitCountVariable===true))reasons.push('DB_HIT_COUNT_VARIABLE_OR_UNRESOLVED');
   else if(!audit.calculable)reasons.push('DB_NUMERIC_NOT_CALCULABLE');
   else {hitStatus=r.hitCount===hits.length?'MATCH':'MISMATCH';if(hitStatus==='MISMATCH')reasons.push('HIT_COUNT_MISMATCH');}
  }
  reasons.push('DAMAGE_CONTEXT_NOT_COMPARABLE','VERIFIED_DURATION_REFERENCE_UNAVAILABLE','OBSERVATION_NOT_INDEPENDENTLY_VERIFIED');
  const status=reasons.includes('GAME_VERSION_MISMATCH')||hitStatus==='MISMATCH'?'MISMATCH':'UNVERIFIABLE';
  return Object.freeze({stage:r.stage,techniqueId:r.techniqueId,status,hitStatus,observedHitCount:r.hitCount,dbHitCount:hitStatus==='UNVERIFIABLE'?null:audit.registeredHits.length,reasons:Object.freeze(reasons)});
 });
 return Object.freeze({status:'TECHNIQUE_DB_DIAGNOSTIC_ONLY',rows:Object.freeze(rows),captureEligible:false,verifiedDps:null});
}
function format(report){return ['Technique DB 実機計測照合（診断のみ）',...report.rows.map(r=>r.stage+'. '+r.techniqueId+'：'+r.status+' / Hit '+r.hitStatus+'（'+r.observedHitCount+' / '+(r.dbHitCount??'未判定')+'） / '+r.reasons.join(', ')),'※ダメージは装備・肉質・会心等の条件未照合、時間は検証済み基準値がないため、いずれも一致判定しません。DPS確定不可。'].join('\n');}
const api=Object.freeze({reconcile,format});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboTechniqueReconciliation=api;
})(typeof window!=='undefined'?window:globalThis);
