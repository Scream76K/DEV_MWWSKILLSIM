const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=require('../tools/legacy-ocr-source.cjs'),html=source();
const a={id:1,kind:'armor',slot:2,name:'達人珠【2】'};
const b={id:2,kind:'armor',slot:2,name:'痛撃珠【2】'};
const c={id:3,kind:'weapon',slot:1,name:'攻撃珠【1】'};
function context(db=[a,b,c]) {
 const ctx={window:{},decorationDB:db,matchDecorationCandidates:()=>[b]};
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../ui/decoration-ocr-confirmation.js'),'utf8'),ctx);
 vm.runInContext(['parseDecorationSlotLevel','decorationReviewCandidates'].map(n=>source.functionSource(html,n)).join('\n'),ctx);
 return ctx;
}
const receipt=(raw,confidence=55)=>({raw,confidence});
const row=(passRaw='達珠【2】')=>({raw:passRaw,slotLevel:2,passes:[receipt(passRaw)],prefixPasses:[receipt(a.name),receipt(a.name)]});
test('supplemental matching exact compatible IDs reorder review only',()=>{
 const ctx=context(),r=row(),before=JSON.stringify(r);
 assert.equal(ctx.decorationReviewCandidates(r,3,'armor')[0].id,a.id);
 assert.equal(ctx.window.MHWDecorationOCRConfirmation.resolve({passes:r.passes,db:[a,b,c],maxSlot:3,kind:'armor'}).status,'REVIEW');
 assert.equal(JSON.stringify(r),before);
});
test('contradiction/low confidence/empty pass/non-fitting slot or kind all keep baseline suggestion list',()=>{
 const ctx=context();
 for(const p of [receipt(b.name),receipt(a.name,44),receipt(''),receipt(c.name)]) {
  const r=row();r.prefixPasses[1]=p;
  assert.equal(ctx.decorationReviewCandidates(r,3,'armor')[0].id,b.id);
 }
 assert.equal(ctx.decorationReviewCandidates(row(),1,'armor')[0].id,b.id);
 assert.equal(ctx.decorationReviewCandidates(row(),3,'weapon')[0].id,b.id);
 assert.equal(context([a,{...a,id:9},b,c]).decorationReviewCandidates(row(),3,'armor')[0].id,b.id);
});
test('already exact original remains independent of rescue',()=>{
 const ctx=context(),r=row(b.name);
 assert.equal(ctx.decorationReviewCandidates(r,3,'armor')[0].id,b.id);
 assert.equal(ctx.window.MHWDecorationOCRConfirmation.resolve({passes:r.passes,db:[a,b,c],maxSlot:3,kind:'armor'}).status,'AUTO');
});
