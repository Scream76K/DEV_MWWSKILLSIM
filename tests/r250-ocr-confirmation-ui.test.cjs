const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
const clean=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function render(rows){
 const out={innerHTML:''},ctx={window:{lastEquipmentOCR:rows},$:()=>out,equipmentSlotLabel:k=>k,manualEquipmentPickerHtml:()=>'<select>manual</select>',equipmentSourceCrop:()=> 'data:image/png;base64,AA==',CATEGORY_ANCHORS:{head:['頭防具']},esc:clean};
 vm.createContext(ctx);
 vm.runInContext(['equipmentCandidateEvidence','equipmentVisibleChoice','renderProductionEquipment'].map(n=>source.functionSource(html,n)).join('\n'),ctx);
 ctx.renderProductionEquipment();return out.innerHTML;
}
const example={id:1,name:'闇夜の剣'};
const row=(key,resolutionStatus,valid=true)=>({key,resolutionStatus,best:example,ranked:[example,{id:2,name:'無関係な装備'}],region:{cropEvidence:{valid}},rows:[{raw:'闇夜の剣',conf:80}]});
test('explicit selection and grounded first candidate appear checked along with original ROI',()=>{
 const rows=[row('head','candidate_confirmed'),row('arms','manual_confirmed'),row('chest','candidate_pending')],before=JSON.stringify(rows),s=render(rows);
 for(const key of ['head','arms','chest'])assert.match(s,new RegExp('name="eq-'+key+'" checked'));
 assert.equal((s.match(/<img src="data:image\/png/g)||[]).length,3);
 assert.match(s,/selectEquipmentCandidate/);assert.match(s,/rejectEquipmentCandidates/);assert.doesNotMatch(s,/無関係な装備|画像検証済み/);
 assert.equal(JSON.stringify(rows),before);
});
test('bad crop or incompatible text cannot create a selected equipment proposal',()=>{
 const s=render([row('head','candidate_pending',false),{...row('waist','candidate_pending'),rows:[{raw:'頭防具',conf:99}]}]);
 assert.doesNotMatch(s,/\bchecked\b|闇夜の剣/);assert.equal((s.match(/候補なし/g)||[]).length,2);assert.match(s,/<select>manual/);
});
