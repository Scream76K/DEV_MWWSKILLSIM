const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=require('../tools/legacy-ocr-source.cjs');
function run(results){
 const imports=[],events=[],status={textContent:''};
 const ctx={window:{applyOCRImportPayload:p=>imports.push(p),dispatchEvent:e=>events.push(e)},
 updateEquipmentContext:()=>({results}),updateDecorationContext:()=>null,renderBuildReflectionState:()=>{},
 CustomEvent:function(type,detail){this.type=type;this.detail=detail},$:()=>status,console};
 vm.createContext(ctx);vm.runInContext(source.functionSource(source(),'reflectAnalysisToBuild'),ctx);ctx.reflectAnalysisToBuild();return {imports,events,status};
}
test('unconfirmed OCR candidates cannot alter the build through reflect',()=>{
 const r=run([{key:'head',resolutionStatus:'candidate_pending',best:{id:12,name:'Wrong candidate',decision:'ambiguous'}}]);
 assert.equal(r.imports.length,0);assert.equal(r.events.length,0);assert.match(r.status.textContent,/確認/);
});
test('explicit user selection and auto confirmation can be reflected',()=>{
 for(const [state,decision] of [['candidate_confirmed','user'],['manual_confirmed','manual'],['auto_confirmed','auto']]){
  const r=run([{key:'head',resolutionStatus:state,best:{id:12,name:'Confirmed',decision}}]);
  assert.equal(r.imports.length,1);assert.equal(r.imports[0].equipment[0].id,12);
 }
});
