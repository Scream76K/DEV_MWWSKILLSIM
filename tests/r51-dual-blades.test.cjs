const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,p=x=>JSON.parse(JSON.stringify(x));
const ids=['DB_DEMON_DANCE_I','DB_DEMON_DANCE_II','DB_DEMON_DANCE_III'];
const expected=[[18,18,6,6,10,10,4,4,20,20,11,11],[16,16,6,25],[22,8,5,22,5,14,18,8,18,36,36]];
test('three adopted dance motions preserve every hit and agreed totals',()=>{
 ids.forEach((id,i)=>{
  const t=e.get('dual-blades',id);assert.ok(t,id);
  assert.deepEqual(p(t.hits).map(h=>h.mv),expected[i]);
  assert.equal(t.fieldVerification.motionValues.status,'ADOPTED');
  assert.equal(t.fieldVerification.hitCount.status,'VERIFIED');
  assert.equal(t.fieldVerification.elementModifiers.status,'ADOPTED');
  assert.ok(t.evidenceRefs.every(ref=>e.evidence[ref]));
 });
 assert.deepEqual(ids.map(id=>e.get('dual-blades',id).hits.reduce((a,h)=>a+h.mv,0)),[138,63,192]);
});
test('STANDARD references the three canonical motions for HP comparison',()=>{
 const profile=c.window.BuildComparisonEngine.genericProfiles['dual-blades'];
 assert.deepEqual(p(profile.techniqueIds),ids);
 const av=c.window.BuildComparisonEngine.profileAvailability('dual-blades');
 assert.equal(av.status,'READY');assert.deepEqual(p(av.blockers),[]);
 assert.equal(profile.hits.length,27);
});
test('adopted HP attributes never fill unresolved part durability modifiers',()=>{
 for(const id of ids){
  const t=e.get('dual-blades',id);
  assert.ok(t.hits.every(h=>Number.isFinite(h.elementModifier)&&!('partModifier' in h)));
  assert.ok(e.hits('dual-blades',id).every(h=>!('partModifier' in h))); 
  const a=e.audit('dual-blades',id);assert.equal(a.calculable,true);
  assert.equal(a.fieldVerification.motionValues.status,'ADOPTED');
  assert.ok(a.alternatives.some(x=>x.evidenceRole==='HISTORICAL_COMPARISON_ONLY'));
 }
});
test('MV inspection is independently usable while unsupported records fail closed',()=>{
 ids.forEach((id,i)=>assert.deepEqual(p(e.motionValues('dual-blades',id)),expected[i]));
 assert.throws(()=>e.motionValues('dual-blades','DB_DEMON_DANCE'),/FAIL_CLOSED/);
 assert.throws(()=>e.motionValues('dual-blades','missing'),/FAIL_CLOSED/);
 assert.ok(Object.isFrozen(e.motionValues('dual-blades',ids[0])));
});
test('aggregate record is archived and new stages expose separate verification counts',()=>{
 assert.equal(e.get('dual-blades','DB_DEMON_DANCE').recordRole,'LEGACY_AGGREGATE');
 assert.deepEqual(p(e.get('dual-blades','DB_DEMON_DANCE').replacedByTechniqueIds),ids);
 assert.equal(e.completion['dual-blades'].motionValueAdopted,3);
 assert.equal(e.completion['dual-blades'].hitCountConfirmed,3);
 assert.equal(Object.values(e.completion).reduce((n,x)=>n+x.registered,0),537);
});
