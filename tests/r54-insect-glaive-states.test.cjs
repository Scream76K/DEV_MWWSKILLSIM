const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,plain=x=>JSON.parse(JSON.stringify(x));
test('ground charge variants include physical modifier once and leave reported elements unchanged',()=>{
 const expected=[[19.2,7.2,10.8,10.8,10.8,27.6],[24,9,13.5,13.5,13.5,34.5],[32,12,18,18,18,46]];
 [0,1,2].forEach((charge,i)=>{
  const t=e.get('insect-glaive',`IG_ENHANCED_DESCENDING_CHARGE_${charge}`);
  assert.deepEqual(plain(t.hits).map(h=>h.mv),expected[i]);
  assert.ok(t.hits.every(h=>h.elementModifier===1&&!('partModifier' in h)));
  assert.equal(t.stateRequirement.executionLocation,'GROUND');assert.equal(t.stateRequirement.tripleExtract,true);
  assert.equal(t.sourceStateModifiers.application,'ALREADY_INCLUDED_IN_HIT_MV');
  assert.equal(t.sourceStateModifiers.scope,'PHYSICAL_ONLY');
  assert.equal(t.revisionHistory[0].hits[0].mv,32);
  assert.throws(()=>e.hits('insect-glaive',t.techniqueId),/FAIL_CLOSED/);
 });
});
test('air thrust charge/vault variants are distinct from ground slashes and never infer unknown elements',()=>{
 const base=[28,10,5,18,18,28];
 for(const charge of [1,2])for(const vault of [0,1,2]){
  const id=`IG_ENHANCED_AIR_THRUST_CHARGE_${charge}_VAULT_${vault}`,t=e.get('insect-glaive',id);
  assert.ok(t,id);assert.equal(t.stateRequirement.executionLocation,'AIR');
  assert.equal(t.stateRequirement.chargeLevel,charge);assert.equal(t.stateRequirement.vaultCount,vault);
  const m=(charge===1?.75:1)*[1,1.2,1.5][vault];
  t.hits.forEach((h,i)=>assert.ok(Math.abs(h.mv-base[i]*m)<1e-9));
  assert.equal(t.hits[2].elementModifier,0);
  assert.ok(t.hits.filter((_,i)=>i!==2).every(h=>!('elementModifier' in h)));
  assert.ok(t.sourceAlternatives.some(a=>a.evidenceRef==='MACARONGAMEMO_IG_R54_CHECK'&&a.hits[2].elementModifier===1));
  assert.equal(t.fieldVerification.elementModifiers.status,'CONFLICT');
  assert.throws(()=>e.hits('insect-glaive',id),/FAIL_CLOSED/);
 }
 assert.equal(e.get('insect-glaive','IG_ENHANCED_AIR_THRUST_CHARGE_0_VAULT_0'),null);
});
test('spiral retains six-hit candidate, exposes conflicting five-hit source, and records pre-hit extract consumption',()=>{
 for(const charge of [1,2]){
  const t=e.get('insect-glaive',`IG_SPIRAL_CHARGE_${charge}`),a=e.audit('insect-glaive',t.techniqueId);
  assert.equal(t.hits.length,6);assert.equal(t.hits[0].mv,charge===1?48:64);
  assert.equal(t.hits[0].elementModifier,.8);
  assert.equal(t.fieldVerification.hitCount.status,'CONFLICT');
  assert.ok(t.sourceAlternatives.some(x=>x.hits?.length===5));
  if(charge===2){
   const kuroyon=t.sourceAlternatives.find(x=>x.evidenceRef==='KUROYONHON_IG_R54_SPIRAL');
   assert.equal(kuroyon.hits.length,6);assert.equal(kuroyon.internalConflict,undefined);
  }
  assert.equal(a.damageStateTransition.consumeAt,'ACTIVATION_BEFORE_HITS');
  assert.equal(a.damageStateTransition.damageStatsState,'NO_EXTRACT');
  assert.equal(a.damageStateTransition.postHitRecovery,'VARIABLE_NOT_ASSUMED');
  assert.ok(a.excludedComponents.some(x=>x.id==='KINSECT_DAMAGE'&&!x.includedInComparisonPower));
  assert.ok(a.reasons.includes('SPIRAL_HIT_COUNT_CONFLICT'));
  assert.throws(()=>e.hits('insect-glaive',t.techniqueId),/FAIL_CLOSED/);
 }
 assert.equal(c.window.BuildComparisonEngine.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
 assert.equal(c.window.BuildComparisonEngine.profileAvailability('dual-blades').status,'READY');
 assert.equal(e.completion['insect-glaive'].complete,false);
});
test('audit UI exposes physical-only scaling, extract timing and five/six hit conflict',()=>{
 const elements=Object.fromEntries(['techAuditKind','techAuditId','techAuditOut','techAuditSummary'].map(id=>[id,{value:'',innerHTML:'',addEventListener(event,fn){this[event]=fn;}}]));
 c.document={getElementById:id=>elements[id]||null};
 vm.runInContext(s.match(/<script id="technique-audit-ui">([\s\S]*?)<\/script>/)[1],c);
 elements.techAuditKind.value='insect-glaive';elements.techAuditKind.change();
 elements.techAuditId.value='IG_ENHANCED_DESCENDING_CHARGE_1';elements.techAuditId.change();
 assert.ok(elements.techAuditOut.innerHTML.includes('6Hit / MV合計 108'));
 assert.ok(elements.techAuditOut.innerHTML.includes('物理補正をMVに反映済み'));
 assert.ok(elements.techAuditOut.innerHTML.includes('属性補正には掛けません'));
 elements.techAuditId.value='IG_SPIRAL_CHARGE_2';elements.techAuditId.change();
 assert.ok(elements.techAuditOut.innerHTML.includes('5Hitと6Hit'));
 assert.ok(elements.techAuditOut.innerHTML.includes('発動時にエキスを消費'));
 assert.ok(elements.techAuditOut.innerHTML.includes('エキスなしのステータス'));
 assert.ok(elements.techAuditOut.innerHTML.includes('猟虫ダメージは別成分'));
 assert.ok(elements.techAuditOut.innerHTML.includes('計算保留'));
});
