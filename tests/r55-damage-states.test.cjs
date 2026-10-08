const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const b=c.window.BuildComparisonEngine;
const baseline={baseAttack:100,displayedElement:100,physicalHitzone:100,elementalHitzone:100,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:100};
const profile={status:'ADOPTED',hits:[{mv:100,elementModifier:1,damageStatsState:'TRIPLE_EXTRACT'},{mv:100,elementModifier:1,damageStatsState:'NO_EXTRACT'}]};
test('damage state selects explicit stats for each hit with no extract multiplier assumption',()=>{
 const states={TRIPLE_EXTRACT:{...baseline,baseAttack:123,displayedElement:120},NO_EXTRACT:baseline};
 const n=b.genericProfileDamage(profile,baseline,'NORMAL',{statsByState:states});
 assert.equal(n.physical,223);assert.equal(n.element,22);assert.equal(n.comparisonPower,245);
 assert.deepEqual(JSON.parse(JSON.stringify(n.trace)).map(h=>h.damageStatsState),['TRIPLE_EXTRACT','NO_EXTRACT']);
 assert.deepEqual(JSON.parse(JSON.stringify(n.trace)).map(h=>h.physical),[123,100]);
 const m=b.genericProfileDamage(profile,baseline,'MAX',{statsByState:states});
 assert.equal(m.physical,278.75);assert.equal(m.element,22);
 assert.equal(n.trace[0].partModifierAppliedToHp,false);
});
test('missing or incomplete state stats fail closed and never fall back to the starting stats',()=>{
 for(const options of [{},{statsByState:{TRIPLE_EXTRACT:baseline}},{statsByState:{TRIPLE_EXTRACT:baseline,NO_EXTRACT:{baseAttack:100}}}]){
  assert.throws(()=>b.genericProfileDamage(profile,baseline,'NORMAL',options),/FAIL_CLOSED.*STATE/);
 }
 assert.throws(()=>b.genericProfileDamage({status:'ADOPTED',hits:[{mv:100,elementModifier:1,damageStatsState:'UNKNOWN'}]},baseline,'NORMAL',{statsByState:{UNKNOWN:baseline}}),/FAIL_CLOSED.*STATE/);
});
test('state-specific affinity uses each hit expected crit and flags mixed affinity',()=>{
 const n=b.genericProfileDamage(profile,baseline,'NORMAL',{statsByState:{TRIPLE_EXTRACT:{...baseline,affinity:100},NO_EXTRACT:{...baseline,affinity:-100}}});
 assert.equal(n.physical,200);assert.equal(n.affinity,null);
 assert.deepEqual(JSON.parse(JSON.stringify(n.trace)).map(h=>h.affinity),[100,-100]);
});
test('IG state plan consumes before spiral damage and does not assume subsequent recovery',()=>{
 assert.equal(typeof b.insectGlaiveStatePlan,'function');
 const p=b.insectGlaiveStatePlan(['IG_ENHANCED_DESCENDING_CHARGE_2','IG_SPIRAL_CHARGE_2']);
 assert.equal(p.status,'EVIDENCE_GATED');
 assert.equal(p.stages[0].activationState,'TRIPLE_EXTRACT');assert.equal(p.stages[0].damageStatsState,'TRIPLE_EXTRACT');
 assert.equal(p.stages[1].activationState,'TRIPLE_EXTRACT');assert.equal(p.stages[1].damageStatsState,'NO_EXTRACT');
 assert.equal(p.stages[1].exitState,'UNKNOWN');assert.equal(p.finalState,'UNKNOWN');
 assert.deepEqual(JSON.parse(JSON.stringify(p.requiredStatsStates)),['TRIPLE_EXTRACT','NO_EXTRACT']);
 assert.ok(p.blockers.some(x=>x.reasons.includes('SPIRAL_HIT_COUNT_CONFLICT')));
 const repeated=b.insectGlaiveStatePlan(['IG_SPIRAL_CHARGE_2','IG_ENHANCED_DESCENDING_CHARGE_2']);
 assert.ok(repeated.blockers.some(x=>x.reasons.includes('EXTRACT_STATE_UNKNOWN')));
 assert.equal(repeated.stages[1].damageStatsState,'UNKNOWN');
 assert.equal(b.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
});
test('explicit observed recovery is required to restore triple state in an inspection plan',()=>{
 const p=b.insectGlaiveStatePlan(['IG_SPIRAL_CHARGE_2','IG_ENHANCED_DESCENDING_CHARGE_2'],{recoveries:[{beforeTechniqueIndex:1,extractState:'TRIPLE_EXTRACT',evidenceRef:'USER_VIDEO_OBSERVATION'}]});
 assert.equal(p.stages[1].activationState,'TRIPLE_EXTRACT');assert.equal(p.stages[1].damageStatsState,'TRIPLE_EXTRACT');
 assert.equal(p.status,'EVIDENCE_GATED');
 assert.ok(!p.blockers.some(x=>x.reasons.includes('EXTRACT_STATE_UNKNOWN')));
 assert.throws(()=>b.insectGlaiveStatePlan(['missing']),/FAIL_CLOSED/);
 assert.throws(()=>b.insectGlaiveStatePlan(['IG_SPIRAL_CHARGE_2'],{recoveries:[{beforeTechniqueIndex:0,extractState:'TRIPLE_EXTRACT'}]}),/FAIL_CLOSED/);
});
test('state statistics readiness is independent of technique evidence and shown in the audit UI',()=>{
 const av=b.profileAvailability('insect-glaive');
 assert.ok(av.profileBlockers.includes('STATE_STATS_RESOLUTION_PENDING'));
 assert.equal(av.stateStatsResolution,'PENDING');
 assert.equal(b.profileAvailability('dual-blades').status,'READY');
 const elements=Object.fromEntries(['techAuditKind','techAuditId','techAuditOut','techAuditSummary'].map(id=>[id,{value:'',innerHTML:'',addEventListener(event,fn){this[event]=fn;}}]));
 c.document={getElementById:id=>elements[id]||null};
 vm.runInContext(s.match(/<script id="technique-audit-ui">([\s\S]*?)<\/script>/)[1],c);
 elements.techAuditKind.value='insect-glaive';elements.techAuditKind.change();
 elements.techAuditId.value='IG_SPIRAL_CHARGE_2';elements.techAuditId.change();
 assert.ok(elements.techAuditOut.innerHTML.includes('発動前の状態'));
 assert.ok(elements.techAuditOut.innerHTML.includes('三色エキスあり'));
 assert.ok(elements.techAuditOut.innerHTML.includes('通常ダメージ計算時の状態'));
 assert.ok(elements.techAuditOut.innerHTML.includes('エキスなし'));
 assert.ok(elements.techAuditOut.innerHTML.includes('攻撃後の状態'));
 assert.ok(elements.techAuditOut.innerHTML.includes('回収結果未確認'));
 assert.ok(elements.techAuditSummary.innerHTML.includes('状態別ステータスの接続が未完了'));
});
