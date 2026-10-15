// r173: deterministic, read-only verification worklist. No DPS promotion.
(function(root){'use strict';
const LABELS=Object.freeze({TECHNIQUE_NUMERIC_PENDING:'Technique DBの技数値を確認',TECHNIQUE_PROVENANCE_PENDING:'Technique DBの出典を登録・照合',COMBO_STAGE_BLOCKED:'技の計算保留理由を解消',VERIFIED_STAGE_TIMING_PENDING:'実機で技の所要時間を検証',VERIFIED_COMPONENT_DAMAGE_PENDING:'実機で成分別ダメージを検証',STAGE_TIMING_EVIDENCE_NOT_REGISTERED:'時間の証拠参照をTechnique DBに登録',COMPONENT_DAMAGE_EVIDENCE_NOT_REGISTERED:'ダメージの証拠参照をTechnique DBに登録'});
function create(provenance){
 if(!provenance||!Array.isArray(provenance.entries)||!provenance.entries.length)return Object.freeze({status:'NO_COMBO_STAGES',items:Object.freeze([]),captureEligible:false});
 const items=[];
 provenance.entries.forEach((entry,index)=>{
  const id=typeof entry?.techniqueId==='string'&&entry.techniqueId.trim()?entry.techniqueId:'不明';
  const pending=Array.isArray(entry?.pending)?entry.pending:[];
  [...new Set(pending)].forEach(code=>{
   if(typeof code!=='string')return;
   items.push(Object.freeze({stage:index+1,techniqueId:id,code,action:LABELS[code]||'未定義の検証項目を確認'}));
  });
 });
 return Object.freeze({status:items.length?'EVIDENCE_PENDING':'REFERENCES_MATCHED_DPS_UNVERIFIED',items:Object.freeze(items),captureEligible:false});
}
function format(provenance){
 const work=create(provenance);
 if(work.status==='NO_COMBO_STAGES')return '検証作業リスト：コンボ対象技がありません。';
 const lines=['コンボ検証作業リスト（参照照合のみ・DPS確定ではありません）'];
 if(!work.items.length)lines.push('技別の不足参照なし。ただし実機ダメージ・コンボ総時間の独立検証が必要です。');
 else work.items.forEach(item=>lines.push(item.stage+'. '+item.techniqueId+'：'+item.action+' ['+item.code+']'));
 lines.push('検証済みA/B自動登録：不可（実測ダメージ・コンボ総時間の検証が必要）');
 return lines.join('\n');
}
const api=Object.freeze({create,format});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboEvidenceChecklist=api;
})(typeof window!=='undefined'?window:globalThis);
