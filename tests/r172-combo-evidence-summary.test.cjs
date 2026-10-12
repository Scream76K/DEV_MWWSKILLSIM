const {test}=require('node:test');const assert=require('node:assert/strict');
const {summarize}=require('../combo-evidence-summary.js');
test('empty evidence is explicitly unavailable',()=>assert.match(summarize(null),/対象技がありません/));
test('missing timing and component damage shown separately',()=>{const s=summarize({entries:[{techniqueId:'GL1',pending:['VERIFIED_STAGE_TIMING_PENDING','VERIFIED_COMPONENT_DAMAGE_PENDING']}]});assert.match(s,/時間が未検証/);assert.match(s,/ダメージ成分が未検証/);assert.match(s,/自動登録：不可/)});
test('repeated techniques remain separate stages',()=>{const s=summarize({entries:[{techniqueId:'GL1',pending:[]},{techniqueId:'GL1',pending:['COMBO_STAGE_BLOCKED']}]});assert.match(s,/1\. GL1/);assert.match(s,/2\. GL1/);assert.match(s,/計算が保留/)});
test('registered references never imply verified DPS',()=>assert.match(summarize({entries:[{techniqueId:'GL1',pending:[]}]}),/実測DPSは未検証/));
