const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
function run(results,{decoration=null,groups=[],rows=[],charms=[],profiles=[]}={}){
 const imports=[],events=[],status={textContent:''};
 const ctx={window:{lastEquipmentOCR:results,lastDecorationOCR:rows,__getBetaDB:()=>({charms}),__ocrCharmProfiles:()=>profiles,decorationSlotResult:{groups},applyOCRImportPayload:p=>imports.push(p),dispatchEvent:e=>events.push(e)},
 updateEquipmentContext:()=>({results}),updateDecorationContext:()=>decoration,renderBuildReflectionState:()=>{},reviewDecorationResults:()=>{},renderDecorationOCRResult:()=>{},equipmentSlotLabel:k=>k,CATEGORY_ANCHORS:{},
 CustomEvent:function(type,detail){this.type=type;this.detail=detail},$:()=>status,console};
 vm.createContext(ctx);
 vm.runInContext(['equipmentCandidateEvidence','equipmentVisibleChoice','acceptVisibleEquipmentChoices','ocrRandomCharmGroup','ocrCharmLayoutState','reflectAnalysisToBuild'].map(n=>source.functionSource(html,n)).join('\n'),ctx);
 ctx.reflectAnalysisToBuild();return {imports,events,status};
}
const row=(resolutionStatus, valid=false)=>({key:'head',resolutionStatus,best:{id:12,name:'闇夜の剣'},region:{cropEvidence:{valid}},rows:[{raw:'闇夜の剣',conf:80}]});
test('candidate without trustworthy source pixels cannot alter the build through reflect',()=>{
 const r=run([row('candidate_pending',false)]);
 assert.equal(r.imports.length,0);assert.equal(r.events.length,0);assert.match(r.status.textContent,/装備を選ぶ/);
});
test('explicit apply accepts the grounded displayed first choice or already confirmed selection',()=>{
 for(const state of ['candidate_pending','candidate_confirmed','manual_confirmed','auto_confirmed']){
  const r=run([row(state,true)]);
  assert.equal(r.imports.length,1);assert.equal(r.imports[0].equipment[0].id,12);assert.equal(r.imports[0].equipment[0].decision.level,'user');
 }
});
test('unreadable ornament remains pending and cannot be applied as missing',()=>{
 const r=run([], {decoration:{buildGroups:[{groupIndex:0,equipmentKey:'head',label:'頭防具',slots:[{slotInGroup:0,confirmationStatus:'REVIEW'}]}]}});
 assert.equal(r.imports.length,0);assert.equal(r.events.length,0);assert.match(r.status.textContent,/装飾品に未確定の枠/);
});
test('final reflect imports confirmed equipment and jewels, holds unresolved charm intact',()=>{
 const held={key:'charm',resolutionStatus:'candidate_pending',best:{id:55,name:'未確認の護石'},region:{cropEvidence:{valid:false}}};
 const jewel={id:19,name:'防御珠【1】',slot:1};
 const charmJewel={groupIndex:2,slotIndex:2,slotInGroup:0,confirmationStatus:'REVIEW',proposedJewel:jewel};
 const before=structuredClone({held,charmJewel});
 const gear={groupIndex:1,equipmentKey:'head',label:'頭防具',slots:[{slotInGroup:0,confirmationStatus:'AUTO',jewel}]};
 const charm={groupIndex:2,equipmentKey:'charm',label:'護石',slots:[charmJewel]};
 const r=run([row('candidate_pending',true),held],{decoration:{buildGroups:[gear,charm]},groups:[gear,charm],rows:[charmJewel]});
 assert.equal(r.imports.length,1);assert.equal(r.events.length,1);
 const payload=r.imports[0];assert.deepEqual(Array.from(payload.equipment,x=>x.key),['head']);
 assert.deepEqual(Array.from(payload.decorations,x=>x.equipmentKey),['head']);assert.equal(payload.decorations[0].slots[0].id,19);
 assert.equal(payload.charm,null);assert.equal(payload.charmSlotPattern,null);
 assert.match(r.status.textContent,/護石.*未反映/);
 assert.deepEqual({held,charmJewel},before);
});
test('missing other equipment and a pending other jewel are still independently blocked',()=>{
 const held=()=>({key:'charm',resolutionStatus:'candidate_pending',region:{cropEvidence:{valid:false}}});
 assert.match(run([row('candidate_pending',false),held()]).status.textContent,/head/);
 const p=run([row('manual_confirmed',true),held()],{decoration:{buildGroups:[{equipmentKey:'head',label:'頭防具',slots:[{slotInGroup:0,confirmationStatus:'REVIEW'}]}]}});
 assert.equal(p.imports.length,0);assert.match(p.status.textContent,/装飾品に未確定の枠/);
});

test('a confirmed charm must use its displayed and valid profile; it cannot take partial path',()=>{
 const row={key:'charm',resolutionStatus:'manual_confirmed',best:{id:55,name:'生成護石'}};
 const slots=[{slotInGroup:0,confirmationStatus:'AUTO',jewel:{id:19},proposedJewel:{id:19}}];
 const group={groupIndex:0,equipmentKey:'charm',slots};
 const args={decoration:{buildGroups:[group]},groups:[group],charms:[{id:55,random:true}]};
 assert.match(run([row],args).status.textContent,/護石の候補が変わりました/);
 group.visibleCharmLayout={key:JSON.stringify([55,[[0,false,19]],[]]),pattern:null,deferred:false};
 const blocked=run([row],args);
 assert.equal(blocked.imports.length,0);assert.match(blocked.status.textContent,/護石の珠を確認/);
 group.visibleCharmLayout={key:JSON.stringify([55,[[0,false,19]],['防1']]),pattern:'防1',deferred:false};
 const valid=run([row],{...args,profiles:['防1']});
 assert.equal(valid.imports.length,1);assert.equal(valid.imports[0].charmSlotPattern,'防1');
});
test('explicit equipment defer retains previous messaging; automatic hold alone does not apply an empty payload',()=>{
 const deferred={key:'charm',resolutionStatus:'unresolved',failureKnowledge:{status:'unresolved'}};
 const old=run([row('manual_confirmed',true),deferred]);
 assert.equal(old.imports.length,1);assert.doesNotMatch(old.status.textContent,/現在の設定は保持/);
 const held={key:'charm',resolutionStatus:'unresolved',region:{cropEvidence:{valid:false}}};
 const empty=run([held]);
 assert.equal(empty.imports.length,0);assert.equal(empty.events.length,0);assert.match(empty.status.textContent,/反映できる装備や装飾品がありません/);
});
