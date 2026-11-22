const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
const clean=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function setup(rows){
 const out={innerHTML:''},ctx={window:{lastEquipmentOCR:rows},$:()=>out,equipmentSlotLabel:k=>k,manualEquipmentPickerHtml:()=>'<select>manual</select>',equipmentSourceCrop:()=> 'data:image/png;base64,AA==',CATEGORY_ANCHORS:{head:['頭防具']},esc:clean,updateEquipmentContext(){},reviewDecorationResults(){},refreshFinalBuildPreview(){}};
 vm.createContext(ctx);
 vm.runInContext(['equipmentCandidateEvidence','equipmentVisibleChoice','acceptVisibleEquipmentChoices','selectEquipmentCandidate','renderProductionEquipment'].map(n=>source.functionSource(html,n)).join('\n'),ctx);
 ctx.renderProductionEquipment();return {ctx,out};
}
const render=rows=>setup(rows).out.innerHTML;
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

function variantRow({raw='銀峰竜グリーヴ',tail='Y',tailConfidence=0,best=0,valid=true}={}){
 const ranked=['α','β','γ'].map((suffix,i)=>({id:10+i,name:'銀峰竜グリーヴ'+suffix,subtype:suffix,totalScore:0.3990194444}));
 const rows=[{raw,conf:82}];
 rows.subtypeEvidence={raw:tail,subtype:'γ',confidence:tailConfidence};
 return {key:'legs',resolutionStatus:'candidate_pending',best:ranked[best],ranked,rows,region:{cropEvidence:{valid}}};
}
test('same-stem tie with a zero-confidence ASCII tail offers alternatives without opting in or accepting the stale α',()=>{
 const row=variantRow(),{ctx,out}=setup([row]);
 for(const suffix of ['α','β','γ'])assert.ok(out.innerHTML.includes('銀峰竜グリーヴ'+suffix));
 assert.match(out.innerHTML,/<img src="data:image\/png/);
 assert.doesNotMatch(out.innerHTML,/\bchecked\b/);
 assert.match(out.innerHTML,/型式を選択してください/);assert.doesNotMatch(out.innerHTML,/候補なし/);
 assert.equal(ctx.acceptVisibleEquipmentChoices(),false);
 assert.equal(row.resolutionStatus,'candidate_pending');
 ctx.selectEquipmentCandidate('legs',2);
 assert.equal(row.resolutionStatus,'candidate_confirmed');
 assert.equal(ctx.equipmentVisibleChoice(row).id,12);
 assert.equal(ctx.acceptVisibleEquipmentChoices(),true);
});
test('preserve distinct winners supported by the current scorer even when the terminal OCR is an alias',()=>{
 for(const [raw,winner,scores] of [
  ['銀峰竜グリーヴB61',1,[.428444,.693444,.428444]],
  ['銀峰竜グリーヴy',2,[.307754,.307754,.852791]],
  ['銀峰竜グリーヴy',2,[.409713,.409713,.619713]],
 ]){
  const row=variantRow({raw,best:winner});
  row.ranked.forEach((candidate,i)=>candidate.totalScore=scores[i]);
  row.ranked.sort((a,b)=>b.totalScore-a.totalScore);
  const {ctx,out}=setup([row]);
  assert.match(out.innerHTML,/name="eq-legs" checked/);
  assert.equal(ctx.equipmentVisibleChoice(row).id,10+winner);
 }
});
test('a two-sibling arm tie, nonfinite sibling score, and invalid crop never precheck a variant',()=>{
 const arms=variantRow();arms.key='arms';arms.ranked.pop();arms.ranked.forEach(c=>c.totalScore=.754283);
 let {ctx,out}=setup([arms]);
 assert.match(out.innerHTML,/型式を選択してください/);assert.doesNotMatch(out.innerHTML,/\bchecked\b/);
 assert.equal(ctx.acceptVisibleEquipmentChoices(),false);
 const invalidScore=variantRow();invalidScore.ranked[0].totalScore=.8;invalidScore.ranked[1].totalScore=NaN;
 assert.doesNotMatch(render([invalidScore]),/\bchecked\b/);
 const badCrop=render([variantRow({valid:false})]);
 assert.match(badCrop,/候補なし/);assert.doesNotMatch(badCrop,/銀峰竜グリーヴ|\bchecked\b/);
});
test('unresolved variant exposes unknown decoration capacity, then explicit gamma reuses the same evidence with its own cap',()=>{
 const leg=variantRow(),head=row('head','candidate_confirmed');
 Object.assign(leg.ranked[0],{kind:'legs',slots:[2,1]});Object.assign(leg.ranked[2],{kind:'legs',slots:[3,3]});
 head.best={...head.best,kind:'head',slots:[2]};
 const {ctx}=setup([head,leg]);ctx.extractDecorationSlotLevels=x=>x?.slots||[];
 for(const name of ['getEquipmentExpectedGroupSlots','updateEquipmentContext']){
  vm.runInContext(source.functionSource(html,name),ctx);
 }
 const slot={slotIndex:1,slotInGroup:1,noSlotMarker:true};
 const group={groupIndex:0,equipmentKey:'legs',expectedSlotLevels:[2,1],physicalMappingVerified:true,slots:[{},slot]};
 const jewel={id:99,kind:'armor',slot:3,name:'達人珠【3】'},receipt={groupIndex:0,slotIndex:1,slotInGroup:1,raw:jewel.name};
 ctx.window.lastDecorationOCR=[receipt];ctx.window.decorationSlotResult={groups:[group]};
 Object.assign(ctx,{decorationDB:[jewel],ocrRandomCharmGroup:()=>null,
  decorationKindForEquipmentKey:()=> 'armor',decorationReviewCandidates:()=>[jewel],updateDecorationContext(){},renderDecorationOCRResult(){},matchDecorationCandidates:()=>[jewel]});
 vm.runInContext(require('node:fs').readFileSync(require('node:path').join(__dirname,'../ui/decoration-ocr-confirmation.js'),'utf8'),ctx);
 vm.runInContext(['reviewDecorationResults','decorationPhysicalNoSlot'].map(n=>source.functionSource(html,n)).join('\n'),ctx);

 const context=ctx.updateEquipmentContext();
 assert.equal(context.results[1].best,null);
 assert.equal(context.results[1].armorVariantPending,true);
 assert.deepEqual([...ctx.getEquipmentExpectedGroupSlots('legs')],[]);
 assert.deepEqual([...ctx.getEquipmentExpectedGroupSlots('head')],[2]);
 vm.runInContext(source.functionSource(html,'decorationRecognitionSlotCap'),ctx);
 assert.equal(ctx.decorationRecognitionSlotCap(group,0),null);
 assert.equal(ctx.decorationRecognitionSlotCap(group,1),null);
 ctx.reviewDecorationResults({render:false});
 assert.notEqual(slot.confirmationStatus,'NO_SLOT');
 assert.equal(receipt.reviewPool[0].id,99);
 assert.equal(leg.best.id,10);assert.equal(leg.rows[0].raw,'銀峰竜グリーヴ');
 ctx.selectEquipmentCandidate('legs',2);
 assert.deepEqual([...ctx.getEquipmentExpectedGroupSlots('legs')],[3,3]);
 assert.equal(ctx.decorationRecognitionSlotCap(group,0),3);
 assert.equal(ctx.decorationRecognitionSlotCap(group,1),3);
 assert.equal(slot.jewel.id,99);
 assert.equal(ctx.decorationRecognitionSlotCap({equipmentKey:'charm',expectedSlotLevels:[1]},0),1);
});
