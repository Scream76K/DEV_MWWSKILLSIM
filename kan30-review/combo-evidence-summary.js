// r172: display-only summary. Never infers damage, duration, or capture eligibility.
(function(root){'use strict';
function summarize(provenance){
 if(!provenance||!Array.isArray(provenance.entries)||!provenance.entries.length)return 'コンボ証拠情報：対象技がありません。';
 const names={TECHNIQUE_NUMERIC_PENDING:'技の数値が未確定',TECHNIQUE_PROVENANCE_PENDING:'Technique DBの出典が未確定',COMBO_STAGE_BLOCKED:'技の計算が保留',VERIFIED_STAGE_TIMING_PENDING:'技の時間が未検証',VERIFIED_COMPONENT_DAMAGE_PENDING:'ダメージ成分が未検証',STAGE_TIMING_EVIDENCE_NOT_REGISTERED:'時間の証拠がDB未登録',COMPONENT_DAMAGE_EVIDENCE_NOT_REGISTERED:'ダメージ証拠がDB未登録'};
 const lines=['コンボ証拠情報（参照用・DPS検証ではありません）'];
 provenance.entries.forEach((entry,i)=>{
  const pending=Array.isArray(entry.pending)?entry.pending:[];
  const id=typeof entry.techniqueId==='string'?entry.techniqueId:'不明';
  lines.push((i+1)+'. '+id+'：'+(pending.length?pending.map(p=>names[p]||p).join(' / '):'登録情報の照合完了（実測DPSは未検証）'));
 });
 lines.push('検証済みA/B自動登録：不可（実測ダメージとコンボ時間の独立検証が必要）');
 return lines.join('\n');
}
const api=Object.freeze({summarize});
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MHWComboEvidenceSummary=api;
})(typeof window!=='undefined'?window:globalThis);
