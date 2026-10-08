const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,b=c.window.BuildComparisonEngine;
test('user video evidence retains observed counter increments without adopting full hit counts',()=>{
 const a=e.audit('insect-glaive','IG_SPIRAL_CHARGE_1');
 const v=a.evidence.find(x=>x.ref==='USER_IG_VIDEO_A_20261006');
 assert.ok(v);assert.equal(v.observation.counterBeforeSpiral.hitCount,6);assert.equal(v.observation.counterAfterSpiral.hitCount,11);
 assert.equal(v.observation.fullTechniqueHitCountVerified,false);
 assert.equal(v.observation.damageFormulaVerified,false);
 assert.equal(a.calculable,false);assert.equal(b.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
 assert.ok(Object.isFrozen(v.observation));
 const p=b.insectGlaiveStatePlan(['IG_SPIRAL_CHARGE_1']);assert.equal(p.finalState,'UNKNOWN');
});
test('same-food displayed stats are evidence only, and single-hit charge ratio is not full formula verification',()=>{
 const a=e.audit('insect-glaive','IG_ENHANCED_DESCENDING_CHARGE_1');
 const v=a.evidence.find(x=>x.ref==='USER_IG_VIDEO_A_20261006');assert.equal(v.observation.firstGroundDamage,69.6);
 const z=e.audit('insect-glaive','IG_ENHANCED_DESCENDING_CHARGE_2').evidence.find(x=>x.ref==='USER_IG_VIDEO_B_20261006');assert.equal(z.observation.firstGroundDamage,92.8);
 assert.equal(v.observation.firstGroundDamage/z.observation.firstGroundDamage,0.75);
 const stats=a.evidence.find(x=>x.ref==='USER_IG_STATS_20261006');assert.equal(stats.observation.displayedAttack.NO_EXTRACT,241);assert.equal(stats.observation.displayedAttack.TRIPLE_EXTRACT,275);
 assert.equal(stats.observation.stateStatsResolverVerified,false);assert.equal(stats.observation.numericGameVersion,null);
 assert.equal(e.audit('insect-glaive','IG_ENHANCED_AIR_THRUST_CHARGE_2_VAULT_0').calculable,false);
});
test('actual audit UI separates video observations from normal hit registration',()=>{
 const els=Object.fromEntries(['techAuditKind','techAuditId','techAuditOut','techAuditSummary'].map(id=>[id,{value:'',innerHTML:'',addEventListener(event,fn){this[event]=fn;}}]));
 c.document={getElementById:id=>els[id]||null};vm.runInContext(s.match(/<script id="technique-audit-ui">([\s\S]*?)<\/script>/)[1],c);
 els.techAuditKind.value='insect-glaive';els.techAuditKind.change();els.techAuditId.value='IG_SPIRAL_CHARGE_1';els.techAuditId.change();
 assert.ok(els.techAuditOut.innerHTML.includes('実機動画の観測記録'));
 assert.ok(els.techAuditOut.innerHTML.includes('命中した回数と技の全Hit数は区別'));
 assert.ok(els.techAuditOut.innerHTML.includes('USER_IG_VIDEO_A_20261006'));
 assert.ok(els.techAuditOut.innerHTML.includes('計算保留'));
});
