const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,p=x=>JSON.parse(JSON.stringify(x));
test('DB independent alternative corroborates history without promoting calculation',()=>{
 const a=e.audit('dual-blades','DB_DEMON_DANCE');
 assert.equal(a.calculable,false);assert.equal(a.registeredHits.length,27);
 const alt=a.alternatives.find(x=>x.evidenceRef==='KUROYONHON_DB_R50_CHECK');
 assert.equal(alt.hits.length,27);assert.equal(alt.hits.reduce((v,h)=>v+h.mv,0),393);
 assert.ok(Math.abs(alt.hits.reduce((v,h)=>v+h.elementModifier,0)-20)<1e-9);
 assert.deepEqual(p(alt.hits).map(h=>h.elementModifier),p(e.get('dual-blades','DB_DEMON_DANCE').revisionHistory[0].afterElementModifiers));
 assert.throws(()=>e.hits('dual-blades','DB_DEMON_DANCE'),/FAIL_CLOSED/);
});
test('IG alternatives retain six body hits at both charge states and separate kinsect damage',()=>{
 const a=e.audit('insect-glaive','IG_RISING_SPIRAL_SLASH');
 assert.equal(a.registeredHits.length,6);
 assert.deepEqual(p(a.alternatives).map(x=>[x.stateRequirement.chargeLevel,x.hits.length,x.hits[0].mv]),[[1,6,48],[2,6,64]]);
 assert.ok(a.alternatives.every(x=>x.excludedComponents[0].hitCount===6&&x.hits.every(h=>h.elementModifier===.8)));
 assert.equal(a.calculable,false);
});
test('IG descending slash alternatives expose charge-specific hit values without invented modifiers',()=>{
 const a=e.audit('insect-glaive','IG_ENHANCED_DESCENDING_THRUST');
 assert.deepEqual(p(a.alternatives).filter(x=>x.evidenceRef==='KUROYONHON_IG_R49_CHECK').map(x=>x.hits.reduce((v,h)=>v+h.mv,0)),[86.4,108,144]);
 assert.ok(a.alternatives.filter(x=>x.evidenceRef==='KUROYONHON_IG_R49_CHECK').every(x=>x.hits.every(h=>!('elementModifier' in h))));
});
test('profile blockers collect every technique instead of hiding all but the first failure',()=>{
 const av=c.window.BuildComparisonEngine.profileAvailability('insect-glaive');
 assert.equal(av.status,'EVIDENCE_GATED');assert.equal(av.blockers.length,4);
 assert.ok(av.blockers.some(b=>b.reasons.includes('CHARGE_STATE_MAPPING_PENDING')));
 assert.deepEqual(p(c.window.BuildComparisonEngine.profileAvailability('great-sword').blockers),[]);
});
test('audit inspection preserves absent fields and is immutable',()=>{
 const a=e.audit('charge-blade','CB_CHARGED_DOUBLE_SLASH');
 assert.equal(a.registeredHits.length,2);assert.ok(a.registeredHits.every(h=>!('partModifier' in h)));
 assert.ok(Object.isFrozen(a)&&Object.isFrozen(a.registeredHits[0]));
 assert.equal(e.audit('unknown','missing'),null);
});
test('special-only ammo without ordinary hits is never labelled calculable',()=>{
 for(const [kind,id] of [['light-bowgun','LBG_STANDARD_ELEMENT_AMMO'],['heavy-bowgun','HBG_STANDARD_ELEMENT_AMMO']]){
  assert.equal(e.audit(kind,id).calculable,false);
  assert.equal(e.audit(kind,id).registeredHits.length,0);
 }
});
