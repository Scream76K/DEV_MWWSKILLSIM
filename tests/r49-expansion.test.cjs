const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,p=x=>JSON.parse(JSON.stringify(x));
test('switch axe discharge retains ten hits and reduced tick modifiers',()=>{
 const t=e.get('switch-axe','SA_ELEMENT_DISCHARGE_FINISH');
 assert.equal(t.hits.length,10);assert.deepEqual(p(t.hits).map(h=>h.mv),[20,12,12,12,12,12,12,12,12,135]);
 assert.equal(t.hits[1].elementModifier,.7);assert.equal(t.hits[1].partModifier,.1);
});
test('charge blade normal techniques omit undocumented part modifiers',()=>{
 const t=e.get('charge-blade','CB_CHARGED_DOUBLE_SLASH');assert.deepEqual(p(t.hits).map(h=>h.mv),[25,16]);
 assert.ok(t.hits.every(h=>!('partModifier' in h)));
});
test('insect glaive aggregate STANDARD records remain archived but fail closed',()=>{
 assert.equal(e.get('insect-glaive','IG_TRIPLE_ADVANCING_COMBO').hits[0].mv,48);
 assert.throws(()=>e.hits('insect-glaive','IG_TRIPLE_ADVANCING_COMBO'),/FAIL_CLOSED/);
 assert.equal(c.window.BuildComparisonEngine.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
});
test('gunlance shell notation is kept separate from ordinary hits',()=>{
 const t=e.get('gunlance','GL_SHELL_NORMAL_MEDIUM');assert.equal(t.hits.length,0);
 assert.equal(t.specialSourceValues.unparenthesizedValue,8);assert.equal(t.specialSourceValues.parenthesizedValue,70);
 assert.throws(()=>e.hits('gunlance',t.techniqueId),/FAIL_CLOSED/);
});
test('bow guiding variants and variable piercers do not collapse into standard arrows',()=>{
 const t=e.get('bow','BOW_GUIDED_POWER_VOLLEY');assert.equal(t.hits.length,6);assert.equal(t.hits[0].mv,16);assert.equal(t.hits[0].elementModifier,.65);
 assert.equal(e.get('bow','BOW_DRAGON_PIERCER').variableHitSource.mvPerHit,25);
});
test('bowgun ammo has no invented element coefficient or fixed pierce hit count',()=>{
 const t=e.get('heavy-bowgun','HBG_NORMAL_AMMO_3');assert.equal(t.specialSourceValues.mvPerHit,32.3);assert.equal(t.specialSourceValues.hitCount,3);
 assert.equal(t.hits.length,0);
 assert.equal(e.get('light-bowgun','LBG_PIERCE_AMMO_3').variableHitSource.hitCount,null);
});
test('all14 source scopes are catalogued without marking DB COMPLETE',()=>{
 assert.equal(Object.values(e.completion).filter(x=>x.sourceCatalogued).length,14);
 assert.ok(Object.values(e.completion).every(x=>!x.complete));
});
test('all238 Phase3 records retain evidence and reject calculation reads',()=>{
 let count=0;
 for(const [kind,records] of Object.entries(e.db))for(const t of Object.values(records)){
  if(t.introducedIn!=='r49')continue;
  count++;assert.ok(t.evidenceRefs.every(ref=>e.evidence[ref]));
  assert.ok(t.unresolvedReasons.length);assert.throws(()=>e.hits(kind,t.techniqueId),/FAIL_CLOSED/);
  for(const h of t.hits){assert.ok(Number.isFinite(h.mv));for(const key of ['elementModifier','partModifier'])if(key in h)assert.ok(Number.isFinite(h[key]));}
 }
 assert.equal(count,238);
});
test('bowgun canonical source view preserves legacy maximum-hit inspection',()=>{
 const b=c.window.BuildComparisonEngine;
 assert.equal(b.bowgunNumeric.normal[3].mv,32.3);assert.equal(b.bowgunNumeric.spread[3].hits,7);
 assert.ok(Math.abs(b.bowgunPierceMaximumProfile(3).effectiveMv-86.4)<1e-9);
});
test('charge blade handler metadata no longer owns normal motion hit arrays',()=>{
 for(const [id,metadata] of Object.entries(c.window.ChargeBladeEngine.techniques)){
  assert.equal(metadata.hits,undefined);
  assert.ok(e.get('charge-blade',id).hits.length>0);
 }
 assert.equal(c.window.ChargeBladeEngine.selfTest().ok,true);
});
