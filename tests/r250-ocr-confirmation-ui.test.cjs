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
test('same-stem tie shows the first candidate and allows correction before applying',()=>{
 const row=variantRow(),{ctx,out}=setup([row]);
 for(const suffix of ['α','β','γ'])assert.ok(out.innerHTML.includes('銀峰竜グリーヴ'+suffix));
 assert.match(out.innerHTML,/<img src="data:image\/png/);
 assert.match(out.innerHTML,/name="eq-legs" checked/);
 assert.equal(ctx.equipmentVisibleChoice(row).id,10);
 assert.equal(ctx.equipmentVisibleChoice(row,{allowProvisional:false}),null);
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
test('a grounded arm tie is prefilled but an invalid score or crop is not',()=>{
 const arms=variantRow();arms.key='arms';arms.ranked.pop();arms.ranked.forEach(c=>c.totalScore=.754283);
 let {ctx,out}=setup([arms]);
 assert.match(out.innerHTML,/name="eq-arms" checked/);
 assert.equal(ctx.equipmentVisibleChoice(arms,{allowProvisional:false}),null);
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
test('missing dakuten in verified armor crops prefer the evidenced type and preselect it for review',()=>{
 const row={key:'head',rows:[{raw:'エクソルスヘルムy',conf:87}],region:{cropEvidence:{valid:true}}};
 const records=['α','β','γ'].map((suffix,i)=>({id:648+i,kind:'head',name:'エグゾルスヘルム'+suffix}));
 const {ctx,out}=setup([]);
 ctx.armorDB=[...records,{id:469,kind:'head',name:'エグゾルスヘルム'},{id:900,kind:'chest',name:'エグゾルスヘルムγ'}];
 ctx.CATEGORY_ANCHORS={head:['ヘルム'],chest:['メイル']};
 for(const name of ['armorCategoryKey','parseArmorStructure','parseSubtypeFromTail','equipmentArmorFallbackStructure','equipmentArmorVoicingMatch','equipmentArmorRescueEvidence','equipmentEvidenceCandidates']){
  const helper=source.functionSource(html,name);if(helper)vm.runInContext(helper,ctx);
 }
 const candidates=ctx.equipmentEvidenceCandidates(row,[]);
 assert.deepEqual(Array.from(candidates,c=>c.id),[650,648,649]);
 row.ranked=candidates;row.best=candidates[0];ctx.window.lastEquipmentOCR=[row];
 assert.equal(ctx.equipmentVisibleChoice(row).id,650);
 ctx.renderProductionEquipment();
 assert.match(out.innerHTML,/name="eq-head" checked[^>]*><span[^>]*>エグゾルスヘルムγ/);
 assert.equal(row.resolutionStatus,undefined);
 ctx.selectEquipmentCandidate('head',1);
 assert.equal(ctx.equipmentVisibleChoice(row).id,648);
 const chest={key:'chest',rows:[{raw:'コクメイル86',conf:72}],region:{cropEvidence:{valid:true}}};
 ctx.armorDB=[{id:675,kind:'chest',name:'ゴグメイルα'},{id:676,kind:'chest',name:'ゴグメイルβ'}];
 assert.deepEqual(Array.from(ctx.equipmentEvidenceCandidates(chest,[]),x=>x.id),[676,675]);
 for(const bad of [{...chest,region:{cropEvidence:{valid:false}}},{...chest,rows:[{raw:'コクメイル86',conf:69}]},{...chest,rows:[{raw:'メイルβ',conf:99}]},{...chest,rows:[{raw:'コクコイルα',conf:99}]}]){
  assert.equal(ctx.equipmentEvidenceCandidates(bad,[]).length,0);
 }
 assert.equal(ctx.equipmentEvidenceCandidates(chest,[{id:700,name:'他の候補'}]).length,2);
});
test('a highly ranked OCR result without name evidence still needs a rescue pass',()=>{
 const {ctx}=setup([]);
 const helper=source.functionSource(html,'equipmentNeedsOCRRescue');vm.runInContext(helper,ctx);
 ctx.armorDB=[];ctx.charmDB=[];
 vm.runInContext(source.functionSource(html,'equipmentEvidenceCandidates'),ctx);
 const candidate={kind:'chest',name:'ゴグメイルβ',avgSeriesScore:.92};
 const crop={cropEvidence:{valid:true}};
 assert.equal(ctx.equipmentNeedsOCRRescue({key:'chest',rows:[{raw:'シーウーメイルβ',conf:94}],region:crop},[candidate]),true);
 assert.equal(ctx.equipmentNeedsOCRRescue({key:'chest',rows:[{raw:'ゴグメイルβ',conf:94}],region:crop},[candidate]),false);
 assert.equal(ctx.equipmentNeedsOCRRescue({key:'charm',rows:[{raw:'世の',conf:55}],region:crop},[{name:'栄世の護石'}]),true);
 assert.equal(ctx.equipmentNeedsOCRRescue({key:'mainWeapon',rows:[],region:crop},[]),false);
 assert.equal(ctx.equipmentNeedsOCRRescue({key:'chest',rows:[],region:{cropEvidence:{valid:false}}},[]),false);
});
test('observed OCR error in Greaves suffix recovers only the same leg family with the first candidate selected',()=>{
 const {ctx}=setup([]);
 for(const name of ['armorCategoryKey','parseArmorStructure','parseSubtypeFromTail','equipmentArmorFallbackStructure','equipmentArmorVoicingMatch','equipmentArmorRescueEvidence','equipmentEvidenceCandidates']){
  vm.runInContext(source.functionSource(html,name),ctx);
 }
 ctx.CATEGORY_ANCHORS={legs:['グリーヴ'],waist:['コイル']};
 ctx.armorDB=[{id:674,kind:'legs',name:'ゴググリーヴα'},{id:677,kind:'legs',name:'ゴググリーヴβ'},{id:501,kind:'legs',name:'ゴアグリーヴα'}];
 const row={key:'legs',region:{cropEvidence:{valid:true}},rows:[{raw:'コククリーウツウaq',conf:76}]};
 for(const raw of ['コククリーウツウaq','コククリーウao']){
   row.rows=[{raw,conf:76}];
   row.ranked=ctx.equipmentEvidenceCandidates(row,[]);row.best=row.ranked[0];
   assert.deepEqual(Array.from(row.ranked,c=>c.id),[674,677]);
   assert.equal(ctx.equipmentVisibleChoice(row).id,674);
 }
 row.rows=[{raw:'クリーウツウaq',conf:90}];
 assert.equal(ctx.equipmentEvidenceCandidates(row,[]).length,0);
});
test('observed charm glyph confusion preselects the grounded name without confirming charm',()=>{
 const {ctx}=setup([]);
 const fn=['equipmentEvidenceCandidates','parseTalismanLevel','parseTalismanStructure','equipmentCharmGlyphMatch'];
 for(const name of fn)vm.runInContext(source.functionSource(html,name),ctx);
 ctx.charmDB=[{id:64,name:'栄世の護石',kind:'charm'},{id:63,name:'秘歴の護石',kind:'charm'}];
 const row={key:'charm',region:{cropEvidence:{valid:true}},rows:[{raw:'宋世の ビ',conf:66}]};
 row.ranked=ctx.equipmentEvidenceCandidates(row,[]);row.best=row.ranked[0];
 assert.deepEqual(Array.from(row.ranked,c=>c.id),[64]);
 assert.equal(ctx.equipmentVisibleChoice(row).id,64);
 assert.equal(row.resolutionStatus,undefined);
 ctx.window.lastEquipmentOCR=[row];ctx.selectEquipmentCandidate('charm',0);
 assert.equal(ctx.equipmentVisibleChoice(row).id,64);
 for(const raw of ['宋の ビ','宋世ビ','玉世の ビ']){
  row.rows=[{raw,conf:66}];assert.equal(ctx.equipmentEvidenceCandidates(row,[]).length,0);
 }
});
test('clicking apply can accept a prefilled type without requiring another click on its radio',()=>{
 const gog=variantRow({raw:'ゴグメイル'});
 gog.key='chest';
 gog.ranked.forEach((c,i)=>{c.name='ゴグメイル'+['α','β','γ'][i];c.kind='chest';});
 const {ctx,out}=setup([gog]);
 assert.match(out.innerHTML,/name="eq-chest" checked/);
 assert.equal(gog.resolutionStatus,'candidate_pending');
 assert.equal(ctx.acceptVisibleEquipmentChoices(),true);
 assert.equal(gog.resolutionStatus,'candidate_confirmed');
 assert.equal(gog.best.name,'ゴグメイルα');
});
test('same-part OCR rescue recovers a unique supported family and stays closed on missing or conflicting evidence',()=>{
 const {ctx}=setup([]);
 for(const name of ['armorCategoryKey','parseArmorStructure','parseSubtypeFromTail','equipmentArmorFallbackStructure','equipmentArmorVoicingMatch','equipmentArmorRescueEvidence','equipmentEvidenceCandidates']){
  vm.runInContext(source.functionSource(html,name),ctx);
 }
 ctx.CATEGORY_ANCHORS={chest:['メイル'],waist:['コイル']};
 const crop={cropEvidence:{valid:true}};
 const row=(key,reads)=>({key,region:crop,rows:reads.map(([raw,conf])=>({raw,conf}))});
 ctx.armorDB=[
  {id:1,kind:'waist',name:'ラギアコイルα'},{id:2,kind:'waist',name:'ラギアコイルβ'},
  {id:3,kind:'waist',name:'ゴグコイルβ'},{id:4,kind:'chest',name:'シュバルカメイルα'},
  {id:5,kind:'chest',name:'シュバルカメイルγ'}
 ];
 const expected=(r,ids)=>assert.deepEqual(Array.from(ctx.equipmentEvidenceCandidates(r,[]),c=>c.id),ids);
 expected(row('waist',[['フキアコイル86',86]]),[2,1]);
 expected(row('waist',[['フキアコイル86',60]]),[]);
 expected(row('waist',[['フキアコイル',86]]),[]);
 expected(row('waist',[['フキアメイル86',86]]),[]);
 expected(row('chest',[['コハルカメイルy',67],['人ググハルカメイルッ',39]]),[5,4]);
 expected(row('chest',[['コハルカメイルy',67]]),[]);
 expected(row('chest',[['メイルγ',98],['メイルγ',98]]),[]);
 const noCrop=row('waist',[['フキアコイル86',86]]);noCrop.region={cropEvidence:{valid:false}};expected(noCrop,[]);
 ctx.armorDB.push({id:6,kind:'waist',name:'トキアコイルβ'});
 expected(row('waist',[['フキアコイル86',86]]),[]);
 const grounded=ctx.armorDB.find(x=>x.id===2);
 assert.deepEqual(Array.from(ctx.equipmentEvidenceCandidates(row('waist',[['ラギアコイルβ',88],['フキアコイル86',86]]),[grounded]),c=>c.id),[2]);
});
test('OCR background retry is confined to valid unresolved slots and restores the unconstrained worker',async()=>{
 const {ctx}=setup([]);
 for(const name of ['equipmentOCRRetryAlphabet','equipmentRetryWithNameAlphabet']){
   vm.runInContext(source.functionSource(html,name),ctx);
 }
 let grounded=false,alive=true,reads=0;
 ctx.CATEGORY_ANCHORS={arms:["アーム"]};
 const params=[];
 ctx.equipmentEvidenceCandidates=()=>grounded?[{}]:[];
 ctx.equipmentRegionCanvas=(_,mode)=>mode;
 ctx.cleanEquipmentOCRText=s=>String(s||'').trim();
 ctx.equipmentOCRUsableText=s=>s.length>=2;
 const row={key:'arms',region:{cropEvidence:{valid:true}},rows:[]};
 const items=[{id:1,name:'護火竜アームβ',kind:'arms'}];
 const worker={setParameters:async o=>params.push(o.tessedit_char_whitelist),recognize:async mode=>{reads++;return {data:{text:'護火竜B',confidence:mode==='outline'?66:55}}}};
 const run=()=>ctx.equipmentRetryWithNameAlphabet(row,[],items,worker,()=>alive);
 assert.equal(await run(),true);
 assert.equal(reads,2);assert.match(params[0],/護火竜/);assert.equal(params.at(-1),'');
 assert.equal(row.rows.length,2);
 grounded=true;assert.equal(await run(),false);assert.equal(reads,2);grounded=false;
 row.region.cropEvidence.valid=false;assert.equal(await run(),false);assert.equal(reads,2);
 row.region.cropEvidence.valid=true;
 worker.recognize=async()=>{alive=false;return {data:{text:'護火竜B',confidence:99}}};
 assert.equal(await run(),false);assert.equal(params.at(-1),'');assert.equal(row.rows.length,2);
 alive=true;worker.recognize=async()=>{throw Error('unavailable');};
 assert.equal(await run(),false);assert.equal(params.at(-1),'');assert.equal(row.rows.length,2);
 assert.equal(ctx.equipmentOCRRetryAlphabet([{name:Array.from({length:257},(_,i)=>String.fromCharCode(0x4e00+i)).join('')}]),'');
});

test('different Han OCR reads recover only a uniquely corroborated same-slot family and type',()=>{
 const {ctx}=setup([]);
 for(const n of ['armorCategoryKey','parseArmorStructure','parseSubtypeFromTail','equipmentArmorFallbackStructure','equipmentArmorVoicingMatch','equipmentArmorRescueEvidence','equipmentEvidenceCandidates','equipmentHanCorroboratedType','equipmentHanArmorChoices']){
   vm.runInContext(source.functionSource(html,n),ctx);
 }
 ctx.CATEGORY_ANCHORS={head:['ヘルム'],waist:['コイル']};
 ctx.armorDB=[{id:1,kind:'head',name:'護兇爪竜ヘルムα'},{id:2,kind:'head',name:'護兇爪竜ヘルムβ'},{id:3,kind:'head',name:'護火竜ヘルムβ'}];
 const row=(reads,key='head')=>({key,region:{cropEvidence:{valid:true}},rows:reads.map(([raw,conf])=>({raw,conf}))});
 const actual=[['護免爪竜ヘルムB',65],['護喝爪竜ヘルムB',65],['護爪竜ヘルムB',62]];
 const result=r=>Array.from(ctx.equipmentEvidenceCandidates(r,[],{afterRescue:true}),x=>x.id);
 assert.deepEqual(result(row(actual)),[2,1]);
 assert.deepEqual(Array.from(ctx.equipmentEvidenceCandidates(row(actual),[])),[]);
 assert.deepEqual(result(row(actual.slice(0,1))),[]);
 assert.deepEqual(result(row([actual[0],actual[0]])),[]);
 assert.deepEqual(result(row([[actual[0][0],70],['護喝爪竜ヘルムα',80]])),[]);
 assert.deepEqual(result(row([...actual,['護免爪竜ヘルムα',80]])),[]);
 const accepted=row(actual);const choices=ctx.equipmentEvidenceCandidates(accepted,[],{afterRescue:true});
 accepted.best=choices[0];accepted.ranked=choices;
 assert.equal(ctx.equipmentVisibleChoice(accepted).id,2);
 assert.equal(ctx.equipmentVisibleChoice(accepted,{allowProvisional:false}),null);
 assert.deepEqual(result(row(actual,'waist')),[]);
 assert.equal(result(row([['護免爪竜ヘルムB',64],['護喝爪竜ヘルムB',65]])).length,2);
 const bad=row(actual);bad.region.cropEvidence.valid=false;assert.deepEqual(result(bad),[]);
 ctx.armorDB.push({id:4,kind:'head',name:'護獣爪竜ヘルムβ'});
 assert.deepEqual(result(row(actual)),[]);
});
