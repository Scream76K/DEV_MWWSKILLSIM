const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
function run(results,{decoration=null,groups=[],rows=[]}={}){
 const imports=[],events=[],status={textContent:''};
 const ctx={window:{lastEquipmentOCR:results,lastDecorationOCR:rows,decorationSlotResult:{groups},applyOCRImportPayload:p=>imports.push(p),dispatchEvent:e=>events.push(e)},
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
