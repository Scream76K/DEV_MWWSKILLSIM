// Executes the actual engine region. No DOM or transport mocks participate in numeric results.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const next=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const golden=JSON.parse(fs.readFileSync(path.join(__dirname,'r46-standard-golden.json'),'utf8'));
function load(html){
  const kinds=html.match(/const KINDS=(\[.*?\]);/)[1];
  const c={window:{}};vm.createContext(c);
  const utility=html.match(/const \$=id=>document\.getElementById\(id\), esc=.*?;\n/)[0];
  vm.runInContext(utility+'const KINDS='+kinds+';'+html.slice(html.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),html.indexOf('function compareStep5Snapshot()')),c);
  return c;
}
const c=load(next);
test('all five embedded engine self-tests pass',()=>{
  assert.equal(c.window.TechniqueDBEngine.selfTest().ok,true);
  assert.equal(c.window.StandardProfilesR41.selfTest().ok,true);
  assert.equal(c.window.ChargeBladeEngine.selfTest().ok,true);
  assert.equal(c.window.ChargeBladeEngine.comparisonUi.selfTest().ok,true);
  assert.equal(c.window.BuildComparisonEngine.selfTest().ok,true);
});
test('all inline JavaScript remains syntactically valid',()=>{
  for(const m of next.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(/\bsrc\s*=/.test(m[1])||/application\/json/.test(m[1]))continue;
    new vm.Script(m[2]);
  }
});
test('unaffected STANDARD matches r46; GS HP correction and adopted DB are independently checked',()=>{
  for(const kind of Object.keys(golden.expected)){
    for(const condition of ['NORMAL','MAX']){
      if(kind==='insect-glaive'){
        assert.throws(()=>c.window.BuildComparisonEngine.genericProfileDamage(c.window.BuildComparisonEngine.genericProfiles[kind],golden.stats,condition),/TECHNIQUE_DB_FAIL_CLOSED/);
        continue;
      }
      const now=c.window.BuildComparisonEngine.genericProfileDamage(c.window.BuildComparisonEngine.genericProfiles[kind],golden.stats,condition);
      const actual=JSON.parse(JSON.stringify(now));
      const expected=JSON.parse(JSON.stringify(golden.expected[kind][condition]));
      if(kind==='dual-blades'){
        const g=golden.stats,crit=1+g[condition==='MAX'?'maxAffinity':'affinity']/100*.25;
        assert.ok(Math.abs(now.physical-g.baseAttack*3.93*g.sharpnessPhysical*g.physicalHitzone/100*crit)<1e-9);
        assert.ok(Math.abs(now.element-g.displayedElement/10*20*g.sharpnessElement*g.elementalHitzone/100)<1e-9);
        continue;
      }
      if(kind==='great-sword'){
        assert.ok(Math.abs(now.physical-expected.physical/1.2)<1e-9);
        assert.equal(now.element,expected.element);
        assert.ok(Math.abs(now.comparisonPower-(expected.physical/1.2+expected.element))<1e-9);
        actual.physical=expected.physical;actual.comparisonPower=expected.comparisonPower;
        actual.trace.forEach((h,i)=>{assert.ok(Math.abs(h.physical-expected.trace[i].physical/1.2)<1e-9);h.physical=expected.trace[i].physical;});
      }
      // Old traces defaulted unknown part metadata to 1. Normalize only that metadata;
      // all unchanged numeric output and hit order still match the immutable r46 fixture.
      actual.trace.forEach((h,i)=>{assert.equal(h.partModifierAppliedToHp,false);delete h.partModifierAppliedToHp;h.partModifier=expected.trace[i].partModifier;});
      assert.deepEqual(actual,expected,kind+':'+condition);
    }
  }
});
