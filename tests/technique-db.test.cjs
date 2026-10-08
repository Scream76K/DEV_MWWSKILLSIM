// Catches hit flattening, accidental promotion of unverified techniques, and r46 regressions.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {test} = require('node:test');
const html = fs.readFileSync(process.env.MH_TEST_HTML || require('node:path').join(__dirname,'../index.html'),'utf8');
const context = {window:{},KINDS:['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'].map(k=>[k])};
vm.createContext(context);
vm.runInContext(html.slice(html.indexOf('const TECHNIQUE_DB_SPEC='),html.indexOf('const GENERIC_STANDARD_PROFILE_CATALOG=')),context);
const engine=context.window.TechniqueDBEngine;
const plain=x=>JSON.parse(JSON.stringify(x));
test('r46 STANDARD hit fixtures remain valid for all 14 registries',()=>{
  assert.equal(engine.selfTest().ok,true);
  assert.equal(Object.keys(engine.db).length,14);
});
test('true charged slash retains two hits and separate strong-hit variant',()=>{
  assert.deepEqual(plain(engine.get('great-sword','GS_TRUE_CHARGED_SLASH_3').hits).map(h=>[h.mv,h.elementModifier,h.partModifier]),[[16,1,0],[209,2.5,1.5]]);
  assert.deepEqual(plain(engine.get('great-sword','GS_TRUE_CHARGED_SLASH_3_STRONG').hits).map(h=>h.mv),[16,267]);
});
test('long sword multi-hit releases are expanded rather than aggregate MV',()=>{
  const t=engine.get('long-sword','LS_SPIRIT_RELEASE');
  assert.equal(t.hits.length,15);
  assert.deepEqual(plain(t.hits).map(h=>h.mv),[5,5,5,10,10,10,15,15,15,22,22,22,35,35,35]);
  assert.equal(engine.get('long-sword','LS_HELM_BREAKER_RED').hits.length,7);
});
test('sword and shield charged multi-hits retain per-hit element modifiers',()=>{
  assert.deepEqual(plain(engine.get('sword-and-shield','SNS_CHARGED_CHOP').hits).map(h=>[h.mv,h.elementModifier]),[[18,1],[28,1.2],[14,.3],[14,.3],[14,.3],[14,.3]]);
});
test('source discrepancies and blank rows fail closed instead of fabricated values',()=>{
  for(const id of ['GS_OFFSET_RISING_SLASH_1','GS_JUMP_SLASH_3','GS_CHARGED_SLASH_2','GS_FALLING_THRUST_1','GS_FOCUS_PIERCING_SLASH']){
    assert.ok(engine.get('great-sword',id),id);
    assert.throws(()=>engine.hits('great-sword',id),/TECHNIQUE_DB_FAIL_CLOSED/);
  }
});
test('source-confirmed numbers are gated until baseline-version audit is verified',()=>{
  assert.equal(engine.get('long-sword','LS_THRUST').numericStatus,'SOURCE_CONFIRMED');
  assert.throws(()=>engine.hits('long-sword','LS_THRUST'),/TECHNIQUE_DB_FAIL_CLOSED/);
  assert.throws(()=>engine.hits('sword-and-shield','SNS_CHARGED_CHOP'),/TECHNIQUE_DB_FAIL_CLOSED/);
});
test('coverage is distinct from STANDARD readiness and retains unresolved counts',()=>{
  assert.equal(engine.completion['great-sword'].complete,false);
  assert.ok(engine.completion['great-sword'].unresolved>0);
  assert.equal(engine.completion['great-sword'].sourceCatalogued,true);
  assert.ok(engine.completion['long-sword'].registered>30);
});
test('registered source evidence is inspectable and immutable',()=>{
  const t=engine.get('great-sword','GS_TRUE_CHARGED_SLASH_3');
  assert.ok(engine.evidence[t.evidenceRefs[0]].url.startsWith('https://macarongamemo.com/'));
  assert.equal(Object.isFrozen(t.hits[0]),true);
  assert.throws(()=>engine.hits('great-sword','UNKNOWN'),/TECHNIQUE_DB_FAIL_CLOSED/);
});
test('already frozen r46 containers cannot leave STANDARD hit values mutable',()=>{
  for(const [kind,id] of [['great-sword','GS_CHARGED_SLASH_3'],['long-sword','LS_RED_BLADE_I'],['dual-blades','DB_DEMON_DANCE']]){
    assert.equal(Object.isFrozen(engine.get(kind,id).hits[0]),true,kind);
  }
});
test('all 110 new records retain evidence and remain fail closed',()=>{
  let count=0;
  for(const [kind,records] of Object.entries(engine.db))for(const t of Object.values(records)){
    if(!t.calculationStatus||!t.evidenceRefs.some(id=>id.endsWith('_R47_SOURCE')))continue;
    count++;
    assert.equal(t.baselineGameVersion,'1.042.00.02');
    assert.ok(t.unresolvedReasons.length>0);
    assert.ok(t.evidenceRefs.every(id=>!!engine.evidence[id]));
    assert.throws(()=>engine.hits(kind,t.techniqueId),/TECHNIQUE_DB_FAIL_CLOSED/);
    for(const hit of t.hits)assert.ok(Number.isFinite(hit.mv)&&Number.isFinite(hit.elementModifier)&&Number.isFinite(hit.partModifier));
  }
  assert.equal(count,110);
});
