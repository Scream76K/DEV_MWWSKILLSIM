// r178: diagnostic-only component comparison. Predictions are explicit external inputs, not computed or verified here.
(function(root){'use strict';
const KEYS=Object.freeze(['physicalBody','elementalBody','shelling','wyrmstake']);
function compare(provenance,measurements,contextAudit,predictions){
 if(!provenance||!Array.isArray(provenance.entries)||!measurements||!Array.isArray(measurements.accepted)||!contextAudit||!Array.isArray(contextAudit.rows)||!Array.isArray(predictions)||predictions.length>200)throw new TypeError('provenance, measurements, context audit, predictions required');
 const seen=new Set(),pred=new Map(),rejected=[];
 predictions.forEach((p,index)=>{
  if(!p||!Number.isInteger(p.stage)||p.stage<1||!provenance.entries[p.stage-1]||p.techniqueId!==provenance.entries[p.stage-1].techniqueId){rejected.push({index,reason:'STAGE_TECHNIQUE_MISMATCH'});return;}
  if(seen.has(p.stage)){rejected.push({index,reason:'DUPLICATE_STAGE'});pred.delete(p.stage);return;}
  seen.add(p.stage);
  if(typeof p.evidenceRef!=='string'||!p.evidenceRef.trim()||typeof p.contextFingerprint!=='string'||!p.contextFingerprint.trim()||!p.damage||typeof p.damage!=='object'||Array.isArray(p.damage)||!Object.keys(p.damage).length||Object.keys(p.damage).some(k=>!KEYS.includes(k)||typeof p.damage[k]!=='number'||!Number.isFinite(p.damage[k])||p.damage[k]<0)){rejected.push({index,reason:'INVALID_PREDICTION'});return;}
  pred.set(p.stage,p);
 });
 const contexts=new Map(contextAudit.rows.map(r=>[r.stage,r]));
 const rows=measurements.accepted.map(m=>{
  const c=contexts.get(m.stage),p=pred.get(m.stage),differences=[],pending=[];
  if(!c||c.status!=='CONTEXT_DOCUMENTED_UNVERIFIED'||!c.contextFingerprint)pending.push('CONTEXT_NOT_COMPARABLE');
  if(!p)pending.push('PREDICTION_MISSING');
  if(p&&c&&p.contextFingerprint!==c.contextFingerprint)pending.push('CONTEXT_FINGERPRINT_MISMATCH');
  if(p&&p.evidenceRef!==m.evidenceRef)pending.push('EVIDENCE_REF_MISMATCH');
  if(!pending.length){
   for(const k of KEYS){const observed=m.damage[k],expected=p.damage[k];if(observed===undefined&&expected===undefined)continue;
    if(observed===undefined||expected===undefined){pending.push('COMPONENT_NOT_PAIRED:'+k);continue;}
    differences.push(Object.freeze({component:k,observed,predicted:expected,delta:observed-expected,absoluteDelta:Math.abs(observed-expected)}));
   }
  }
  return Object.freeze({stage:m.stage,techniqueId:m.techniqueId,status:pending.length?'NOT_COMPARABLE':differences.some(d=>d.delta!==0)?'NUMERIC_DIFFERENCE':'NUMERIC_MATCH_UNVERIFIED',pending:Object.freeze(pending),differences:Object.freeze(pending.length?[]:differences),verified:false});
 });
 return Object.freeze({status:'DAMAGE_DIFFERENCE_DIAGNOSTIC_ONLY',rows:Object.freeze(rows),rejected:Object.freeze(rejected.map(Object.freeze)),captureEligible:false,verifiedDps:null});
}
function format(report){return ['成分別ダメージ差異診断（申告計算値と実測記録・未検証）',...report.rows.map(r=>r.stage+'. '+r.techniqueId+'：'+r.status+(r.pending.length?' / '+r.pending.join(', '):'')+(r.differences.length?' / '+r.differences.map(d=>d.component+' 実測'+d.observed+' 計算'+d.predicted+' 差'+(d.delta>0?'+':'')+d.delta).join(' / '):'')),...report.rejected.map(r=>'入力'+(r.index+1)+'：'+r.reason),'※一致は入力値同士の数値一致であり、計算式・証拠内容・DPSの検証済み判定ではありません。'].join('\n');}
const api=Object.freeze({compare,format,components:KEYS});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboDamageDifference=api;
})(typeof window!=='undefined'?window:globalThis);
