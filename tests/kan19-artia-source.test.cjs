const {createContext}=require('../tools/legacy-page-test-context.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const E=require('../element-state.js');
// Mutation base attacks and the Gogma identity are source-valid inputs from
// ARTIA_STAGE_ADOPTION / MHDB; the asserted element results remain independent.
function setup(a={}) {
 const ctx=createContext({build:{artia:{element:'dragon',production:'element',...a}}});
 return {ctx,run(v={attack:{attack:200,affinity:180,element:190}[a.production||'element'],affinity:0,element:null,elementKnown:false,elementStatus:'UNKNOWN'}){
  ctx.w={kind:'bow',name:'亡国のクピドバイン',artiaFixedVariants:{[a.production||'element']:v}};
  return vm.runInContext('artiaFixedVariantStats(w)',ctx);
 }};
}
test('source-confirmed bow three parts derives 260 before restore and skills',()=>{const x=setup({sameElementPartCount:3}).run();assert.equal(x.element,260);assert.equal(x.attack,190+3*5);assert.equal(x.stageEvidence.baseAttack,190);assert.equal(x.stageEvidence.productionAttack,15);assert.equal(x.affinity,0);assert.equal(x.elementEvidence.verificationStatus,'SOURCE_CONFIRMED_NOT_GAME_VERIFIED');});
test('two bow parts and three mutation types use separate element deltas',()=>{for(const [production,expected] of [['attack',210],['affinity',190],['element',240]])assert.equal(setup({sameElementPartCount:2,production}).run().element,expected);});
test('completed fixed element is never augmented a second time',()=>{assert.equal(setup({sameElementPartCount:3}).run({attack:190,affinity:0,element:300}).element,300);});
test('unknown material count remains unknown, attack bonuses are not element parts',()=>{const x=setup({parts:['attack','attack','attack']}).run();assert.equal(x.element,null);assert.match(x.elementReason,/PART_COUNT/);});
test('confirmed none stays zero and absent completed weapon stays blocked',()=>{assert.equal(setup({element:'none'}).run({attack:190,affinity:0,element:0,elementType:'none'}).element,0);const s=setup({sameElementPartCount:3});s.ctx.w={kind:'bow'};assert.equal(vm.runInContext('artiaFixedVariantStats(w)',s.ctx),null);});
test('source DB covers fourteen kinds, bowguns do not receive inferred element',()=>{const s=setup();assert.equal(vm.runInContext('Object.keys(ARTIA_ELEMENT_SOURCE_DB.weapons).length',s.ctx),14);s.ctx.w={kind:'light-bowgun',name:'荊冠のデストレーター',artiaFixedVariants:{element:{attack:190,affinity:0,element:null}}};assert.equal(vm.runInContext('artiaFixedVariantStats(w).element',s.ctx),null);});

test('source-derived bow restoration and dragon skill are separate stages',()=>{const s=setup({sameElementPartCount:3,restores:['elem:I','elem:II','elem:EX']});s.run();const r=vm.runInContext('restoreStats(w)',s.ctx);assert.equal(r.element,130);const out=E.applySkill(E.fromValue(260+r.element,'dragon'),{mult:1.2,add:60});assert.equal(out.element,528);});
test('GS uses verified-by-source material row; GL version exception stays limited to adopted inputs',()=>{
 const gs=setup({sameElementPartCount:3});gs.run();
 gs.ctx.w.kind='great-sword';gs.ctx.w.name='忘却のオストランツァ';
 const greatSword=vm.runInContext('artiaFixedVariantStats(w)',gs.ctx);
 assert.equal(greatSword.element,450+30+50);
 assert.equal(greatSword.elementEvidence.verificationStatus,'SOURCE_CONFIRMED_NOT_GAME_VERIFIED');
 const gl=setup({sameElementPartCount:3});gl.run();
 gl.ctx.w.kind='gunlance';gl.ctx.w.name='永訣のクラウクライス';
 const wide=vm.runInContext('artiaFixedVariantStats(w)',gl.ctx);
 assert.equal(wide.element,370+30+80);
 assert.equal(wide.elementEvidence.scopeAdoption.sourceVersionNote,'ver10.11');
 assert.equal(wide.elementEvidence.scopeAdoption.liveGameVerification,'UNVERIFIED');
 vm.runInContext("build.artia.element='poison'",gl.ctx);
 const held=vm.runInContext('artiaFixedVariantStats(w)',gl.ctx);
 assert.equal(held.element,null);assert.equal(held.elementReason,'ELEMENT_ARTIA_SOURCE_VERSION_PENDING');
});

test('unlisted attribute restore level is not silently treated as zero',()=>{assert.equal(setup({sameElementPartCount:3,restores:['elem:III']}).run().element,null);});
