const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,p=x=>JSON.parse(JSON.stringify(x));
const ids=['DB_DEMON_DANCE_I','DB_DEMON_DANCE_II','DB_DEMON_DANCE_III'];
const expected=[[1,1,.6,.6,.6,.6,.8,.8,.8,.8,.8,.8],[.6,.6,.8,.8],[.6,.6,.6,.6,.8,.8,.8,.8,.8,.8,.8]];
test('adopted dance elemental modifiers preserve exact hit order and total20',()=>{
 ids.forEach((id,i)=>assert.deepEqual(p(e.get('dual-blades',id).hits).map(h=>h.elementModifier),expected[i]));
 assert.deepEqual(ids.map(id=>Number(e.get('dual-blades',id).hits.reduce((n,h)=>n+h.elementModifier,0).toFixed(6))),[9.2,2.8,8]);
 assert.equal(ids.flatMap(id=>p(e.get('dual-blades',id).hits)).length,27);
 assert.equal(ids.flatMap(id=>p(e.get('dual-blades',id).hits)).reduce((n,h)=>n+h.mv,0),393);
});
test('adoption records history, independent corroboration and user authorization without pretending live verification',()=>{
 for(const id of ids){
  const t=e.get('dual-blades',id),v=t.fieldVerification.elementModifiers;
  assert.equal(v.status,'ADOPTED');assert.equal(v.sourceVersion,'1.020.00');
  assert.ok(v.evidenceRefs.includes('MACARONGAMEMO_DB_R52_HISTORY'));
  assert.ok(v.evidenceRefs.includes('KUROYONHON_DB_R50_CHECK'));
  assert.ok(v.evidenceRefs.includes('USER_DB_R52_ELEMENT_ADOPTION'));
  assert.ok(v.evidenceRefs.every(ref=>e.evidence[ref]));
  assert.equal(t.currentVersionAudit,'PENDING');assert.equal(t.liveGameVerification,'PENDING');
  assert.equal(t.fieldVerification.partModifiers.status,'UNVERIFIED');
  assert.equal(t.revision,3);
  assert.equal(t.revisionHistory[0].fieldVerification.elementModifiers.status,'UNVERIFIED');
  assert.ok(t.revisionHistory[0].hits.every(h=>!('elementModifier' in h)));
 }
});
test('source conflict is resolved for active stages and retained as historical comparison only',()=>{
 for(const id of ids){
  const a=e.audit('dual-blades',id);
  assert.ok(!a.reasons.includes('SOURCE_TABLE_HISTORY_ELEMENT_CONFLICT'));
  assert.equal(a.fieldVerification.elementModifiers.status,'ADOPTED');
  assert.equal(a.alternatives.find(x=>x.evidenceRef==='MACARONGAMEMO_DB_R48_SOURCE').evidenceRole,'SUPERSEDED_ELEMENT_VALUES');
  assert.equal(a.alternatives.find(x=>x.evidenceRef==='KUROYONHON_DB_R50_CHECK').evidenceRole,'CORROBORATING_ADOPTED_VALUES');
 }
 assert.equal(e.get('dual-blades','DB_DEMON_DANCE').hits.reduce((n,h)=>n+h.elementModifier,0).toFixed(1),'23.2');
});
test('missing part modifiers are not silently populated or passed to legacy defaulting calculation',()=>{
 for(const id of ids){
  const t=e.get('dual-blades',id);assert.ok(t.hits.every(h=>!('partModifier' in h)));
  assert.ok(e.hits('dual-blades',id).every(h=>!('partModifier' in h))); 
 }
 const av=c.window.BuildComparisonEngine.profileAvailability('dual-blades');
 assert.equal(av.status,'READY');assert.equal(av.blockers.length,0);
 assert.ok(ids.every(id=>e.audit('dual-blades',id).nonBlockingReasons.includes('PART_MODIFIER_NOT_REPORTED_IN_SOURCE')));
});
