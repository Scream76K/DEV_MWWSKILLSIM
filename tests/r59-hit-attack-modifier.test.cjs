const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const b=c.window.BuildComparisonEngine;
const stats={baseAttack:200,displayedElement:100,physicalHitzone:50,elementalHitzone:20,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:100};
const modifier={multiplier:1.1,adoptionStatus:'ADOPTED',evidenceRef:'TEST_EXPLICIT_ADOPTION'};
const profile={status:'ADOPTED',hits:[{mv:100,elementModifier:1,physicalAttackModifier:modifier},{mv:100,elementModifier:1}]};
// Catches whole-combo or elemental multiplication instead of hit-selective attack modification.
test('adopted attack modifier affects only selected hit physical damage',()=>{
 const x=b.genericProfileDamage(profile,stats);assert.ok(Math.abs(x.physical-210)<1e-10);assert.equal(x.element,4);assert.ok(Math.abs(x.comparisonPower-214)<1e-10);
 assert.equal(x.trace[0].physicalAttackModifier.multiplier,1.1);assert.equal(x.trace[1].physicalAttackModifier,undefined);
});
// Catches silently applying incomplete/source-only modifiers or accepting nonnumeric values.
test('unadopted and invalid hit attack modifiers fail closed',()=>{
 for(const bad of [null,{},1.1,{...modifier,adoptionStatus:'SOURCE_ONLY_NOT_APPLIED'},{...modifier,evidenceRef:''},{...modifier,multiplier:'1.1'},{...modifier,multiplier:NaN},{...modifier,multiplier:Infinity},{...modifier,multiplier:-1}]){
  assert.throws(()=>b.genericProfileDamage({status:'ADOPTED',hits:[{mv:100,elementModifier:1,physicalAttackModifier:bad}]},stats),/FAIL_CLOSED.*HIT_ATTACK_MODIFIER/);
 }
});
// Catches using starting attack or affinity after a state transition.
test('hit attack modifier uses selected state stats and condition affinity',()=>{
 const p={status:'ADOPTED',hits:[{mv:100,elementModifier:1,damageStatsState:'NO_EXTRACT',physicalAttackModifier:modifier}]};
 const x=b.genericProfileDamage(p,stats,'MAX',{statsByState:{NO_EXTRACT:{...stats,baseAttack:100}}});
 assert.ok(Math.abs(x.physical-68.75)<1e-10);assert.equal(x.element,2);
});
// Catches output trace aliasing input and modifying caller-owned evidence.
test('modifier trace does not alias caller metadata',()=>{
 const input=JSON.stringify(profile),x=b.genericProfileDamage(profile,stats);assert.ok(x.trace[0].physicalAttackModifier);x.trace[0].physicalAttackModifier.multiplier=99;assert.equal(JSON.stringify(profile),input);
});
// Catches accidentally turning source audit metadata into an adopted damage input.
test('source-only jump rules do not enable insect glaive calculation',()=>{
 const a=c.window.TechniqueDBEngine.audit('insect-glaive','IG_SPIRAL_CHARGE_2');assert.equal(a.calculable,false);assert.equal(b.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
 assert.throws(()=>b.genericProfileDamage(b.genericProfiles['insect-glaive'],stats),/FAIL_CLOSED/);
 const x=b.genericProfileDamage({status:'ADOPTED',hits:[{mv:100,elementModifier:1}],sourceHitRules:a.sourceHitRules},stats);assert.equal(x.physical,100);
});
