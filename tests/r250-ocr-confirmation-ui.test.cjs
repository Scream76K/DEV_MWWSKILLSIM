const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs');
function render(rows){const out={innerHTML:''},ctx={window:{lastEquipmentOCR:rows},$:()=>out,equipmentSlotLabel:k=>k,manualEquipmentPickerHtml:()=>'<select>manual</select>'};vm.createContext(ctx);vm.runInContext(source.functionSource(source(),'renderProductionEquipment'),ctx);ctx.renderProductionEquipment();return out.innerHTML;}
const row=(key,status,decision)=>({key,resolutionStatus:status,best:{id:1,name:'装備',decision:{level:decision}},ranked:[{id:1,name:'装備',totalScore:.9,confAvg:90}]});
test('explicit candidate and manual selections are confirmed without claiming image verified',()=>{
 const rows=[row('head','candidate_confirmed','user'),row('arms','manual_confirmed','manual')],before=JSON.stringify(rows),s=render(rows);
 assert.match(s,/ユーザー確定/);assert.match(s,/手動確定/);assert.doesNotMatch(s,/>要確認</);assert.doesNotMatch(s,/verified|画像検証済み/);assert.equal(JSON.stringify(rows),before);
 assert.match(s,/selectEquipmentCandidate/);assert.match(s,/rejectEquipmentCandidates/);
});
test('mixed confirmation states use distinct counts and pending remains visible',()=>{
 const s=render([row('head','auto_confirmed','auto'),row('arms','manual_confirmed','manual'),row('waist','candidate_pending','ambiguous')]);
 assert.match(s,/自動確定1/);assert.match(s,/ユーザー・手動確定1/);assert.match(s,/確認待ち1/);assert.match(s,/>要確認</);
});
