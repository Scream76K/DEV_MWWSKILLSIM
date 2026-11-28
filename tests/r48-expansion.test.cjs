const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);
vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,plain=x=>JSON.parse(JSON.stringify(x));
test('dual blades six-hit motion keeps final pair element modifiers',()=>{
 assert.deepEqual(plain(e.get('dual-blades','DB_DEMON_ADVANCING_SLASH').hits).map(h=>[h.mv,h.elementModifier]),[[5,.6],[5,.6],[4,.6],[4,.6],[11,1],[11,1]]);
});
test('hammer spinning attack expands to eight hits with distinct finishing modifier',()=>{
 assert.deepEqual(plain(e.get('hammer','HAM_SPIN_ATTACK').hits).map(h=>h.mv),[23,18,18,18,18,18,18,25]);
 assert.equal(e.get('hammer','HAM_SPIN_ATTACK').hits[7].elementModifier,1.5);
});
test('horn bracketed waves are special coefficients, never fake normal hits',()=>{
 const t=e.get('hunting-horn','HH_ECHO_WAVE_FIRE_3');
 assert.equal(t.hits.length,0);assert.equal(t.specialSourceValues.bracketedValue,85);
 assert.throws(()=>e.hits('hunting-horn',t.techniqueId),/FAIL_CLOSED/);
});
test('lance variable hit count is retained as unresolved rather than one assumed hit',()=>{
 const t=e.get('lance','LAN_DASH');assert.equal(t.hits.length,0);
 assert.equal(t.variableHitSource.mvPerHit,17);
 assert.throws(()=>e.hits('lance',t.techniqueId),/FAIL_CLOSED/);
});
test('archived demon dance contradiction stays gated while adopted stages are ready',()=>{
 const t=e.get('dual-blades','DB_DEMON_DANCE');
 assert.equal(t.numericStatus,'SOURCE_CONFLICT');
 assert.equal(t.hits.length,27);
 assert.throws(()=>e.hits('dual-blades','DB_DEMON_DANCE'),/FAIL_CLOSED/);
 assert.equal(c.window.BuildComparisonEngine.profileAvailability('dual-blades').status,'READY');
});
test('all 127 Phase 2 entries keep evidence and reject calculations',()=>{
 let count=0;
 for(const [kind,records] of Object.entries(e.db))for(const t of Object.values(records)){
  if(t.introducedIn!=='r48')continue;
  count++;
  const evidence=e.audit(kind,t.techniqueId).evidence;
  for(const ref of t.evidenceRefs){
   const resolved=evidence.find(entry=>entry.ref===ref);
   assert.equal(resolved?.registered,true,t.techniqueId+' '+ref);
   if(ref.startsWith('https://')){
    assert.equal(resolved.url,ref);
    assert.equal(resolved.scope,t.techniqueId);
    assert.equal(resolved.gameVerification,'UNVERIFIED');
   }
  }
  assert.ok(t.unresolvedReasons.length);
  assert.throws(()=>e.hits(kind,t.techniqueId),/FAIL_CLOSED/);
  for(const h of t.hits){assert.ok([h.mv,h.elementModifier].every(Number.isFinite));if('partModifier' in h)assert.ok(Number.isFinite(h.partModifier));}
 }
 assert.equal(count,127);
 const pinnedUrl='https://github.com/dtlnor/mhws-rcol-record/blob/90ed7dd76b11a165f1d8ed5685e4dd82999d4f13/Player/Wp07.csv#L10';
 for(const id of ['GL_ADVANCING_RISING','GL_RISING_SLASH']){
  const entry=e.audit('gunlance',id).evidence.find(item=>item.ref===pinnedUrl);
  assert.equal(entry?.registered,true,id);
  assert.equal(entry.url,pinnedUrl);
  assert.equal(entry.scope,id);
  assert.equal(entry.sourceLocator,'Wp07.csv#L10');
  assert.equal(entry.sourceVersion,'1.041');
  assert.equal(entry.gameVerification,'UNVERIFIED');
 }
 const pending=e.get('heavy-bowgun','HBG_IGNITION_MACHINE').pendingSourceReferences;
 assert.equal(pending.length,3);
 assert.ok(pending.every(entry=>entry.status==='SOURCE_PENDING'));
 assert.ok(pending.every(entry=>!e.audit('heavy-bowgun','HBG_IGNITION_MACHINE').evidence.some(ref=>ref.ref===entry.url&&ref.registered)));

});
test('dual blades source does not invent an absent part modifier column',()=>{
 for(const t of Object.values(e.db['dual-blades'])){
  if(t.introducedIn!=='r48')continue;
  assert.ok(t.unresolvedReasons.includes('PART_MODIFIER_NOT_REPORTED_IN_SOURCE'));
  assert.ok(t.hits.every(h=>!('partModifier' in h)));
 }
});
