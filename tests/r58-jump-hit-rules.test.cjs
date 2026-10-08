const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,b=c.window.BuildComparisonEngine,plain=x=>JSON.parse(JSON.stringify(x));
test('jump skill eligibility is per hit even for ground descending attacks',()=>{
 for(const level of [0,1,2]){
  const a=e.audit('insect-glaive','IG_ENHANCED_DESCENDING_CHARGE_'+level);
  assert.deepEqual(plain(a.sourceHitRules.jumpSkill.eligibleBodyHitIndices),[0,1,2,3,4]);
  assert.deepEqual(plain(a.sourceHitRules.jumpSkill.ineligibleBodyHitIndices),[5]);
  assert.equal(a.sourceHitRules.jumpSkill.applicationStatus,'SOURCE_ONLY_NOT_APPLIED');assert.equal(a.calculable,false);
 }
});
test('air thrust first body hit and spiral body are separate from ineligible kinsect component',()=>{
 const a=e.audit('insect-glaive','IG_ENHANCED_AIR_THRUST_CHARGE_2_VAULT_0');
 assert.deepEqual(plain(a.sourceHitRules.jumpSkill.eligibleBodyHitIndices),[0]);
 const z=e.audit('insect-glaive','IG_SPIRAL_CHARGE_2');assert.deepEqual(plain(z.sourceHitRules.jumpSkill.eligibleBodyHitIndices),[0,1,2,3,4,5]);
 assert.deepEqual(plain(z.sourceHitRules.jumpSkill.ineligibleComponents),['KINSECT_DAMAGE']);
 assert.equal(z.sourceHitRules.jumpSkill.hitCountBasis,'REGISTERED_SOURCE_CANDIDATE_NOT_VIDEO_VERIFIED');
 assert.equal(b.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
 assert.ok(Object.isFrozen(z.sourceHitRules.jumpSkill));
});
test('counter samples remain rounded combined observations and wound destruction is identified',()=>{
 const z=e.audit('insect-glaive','IG_SPIRAL_CHARGE_2').evidence.find(x=>x.ref==='USER_IG_VIDEO_B_20261006').observation;
 assert.equal(z.targetStateEvents[0].type,'WOUND_DESTROYED_NOTIFICATION');
 assert.equal(z.damageFormulaVerified,false);assert.equal(z.spiralCounterSamples.at(-1).displayedTotal,966);
 assert.equal(z.counterSamplePolicy,'ROUNDED_COMBINED_COUNTER_NOT_EXACT_PER_HIT_DAMAGE');
 assert.ok(!('adoptedBodyHitCount' in z));
});
test('actual audit UI displays selective jump rule and known target change without enabling comparison',()=>{
 const els=Object.fromEntries(['techAuditKind','techAuditId','techAuditOut','techAuditSummary'].map(id=>[id,{value:'',innerHTML:'',addEventListener(event,fn){this[event]=fn;}}]));
 c.document={getElementById:id=>els[id]||null};vm.runInContext(s.match(/<script id="technique-audit-ui">([\s\S]*?)<\/script>/)[1],c);
 els.techAuditKind.value='insect-glaive';els.techAuditKind.change();els.techAuditId.value='IG_ENHANCED_DESCENDING_CHARGE_2';els.techAuditId.change();
 assert.ok(els.techAuditOut.innerHTML.includes('飛燕のHit別適用（資料）'));
 assert.ok(els.techAuditOut.innerHTML.includes('最終ダメージ全体に一律で掛けません'));
 assert.ok(els.techAuditOut.innerHTML.includes('傷口破壊の通知'));
 assert.ok(els.techAuditOut.innerHTML.includes('計算保留'));
});
