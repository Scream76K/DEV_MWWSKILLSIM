'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {load,clone,components}=require('./bonus-runtime.cjs');
const ready=r=>['normal','maximum'].every(ch=>components(r,ch,'SHELLING').length>0&&components(r,ch,'SHELLING').every(p=>p.status==='available'&&Number.isFinite(p.value)));
const json=x=>JSON.parse(JSON.stringify(x));
test('validated rank-name bonuses unblock only fixed shells, preserving all body components',async()=>{
 const h=await load();try {const report=[];
 for(const f of h.bonusFixtures){const input=h.capture(f),before=h.baseline.evaluateCurrent(h.copy(input)),after=h.candidate.evaluateCurrent(h.copy(input));
  assert.equal(ready(before),false,'Pinned product must reproduce rank-name blocker: '+f.key);
  assert.equal(ready(after),true,'Valid bonus must not block fixed shells: '+f.key);
  for(const ch of ['normal','maximum']){assert.deepEqual(json(components(after,ch).filter(p=>p.coefficientUnit!=='SHELLING')),json(components(before,ch).filter(p=>p.coefficientUnit!=='SHELLING')),'body unchanged '+f.key+':'+ch);assert.equal(after.channels[ch].metrics.comboTotalDamage.status,'available');}
  const control=h.copy(input);control.skills=control.skills.filter(([name])=>!input.stats.activeBonusEffects.some(e=>e.bonusSkillId===f.id&&e.name===name));control.stats.activeBonusEffects=control.stats.activeBonusEffects.filter(e=>e.bonusSkillId!==f.id);h.replan(control);const matched=h.candidate.evaluateCurrent(control);for(const ch of ['normal','maximum'])assert.deepEqual(json(components(after,ch,'SHELLING')),json(components(matched,ch,'SHELLING')),'matched no-bonus shell control '+f.key+':'+ch);
  report.push({key:f.key,before:json(before),after:json(after)});
 }
 assert.equal(report.length,3);assert.deepEqual(h.errors,[]);
 }finally{h.dom.window.close();}
});

test('full adapter retains activation, identity, plan, state and conversion guards',async()=>{
 const h=await load();const observations=[];try{
 for(const f of h.bonusFixtures){const input=h.capture(f),index=input.stats.activeBonusEffects.findIndex(e=>e.bonusSkillId===f.id),name=input.stats.activeBonusEffects[index].name;
 const cases=[
  ['wrong-id',i=>i.stats.activeBonusEffects[index].bonusSkillId=999],['wrong-parent',i=>i.stats.activeBonusEffects[index].bonusName='Unknown'],['wrong-rank-name',i=>i.stats.activeBonusEffects[index].name='Unknown'],['wrong-source',i=>i.stats.activeBonusEffects[index].source='forged'],['wrong-rank',i=>i.stats.activeBonusEffects[index].rankLevel=3],['wrong-required',i=>i.stats.activeBonusEffects[index].required=1],['short-count',i=>i.stats.activeBonusEffects[index].count=1],['fractional-count',i=>i.stats.activeBonusEffects[index].count=3.5],['wrong-bonus-level',i=>i.stats.activeBonusEffects[index].level=2],['duplicate-activation',i=>i.stats.activeBonusEffects.push(clone(i.stats.activeBonusEffects[index]))],
  ['duplicate-skill',i=>i.skills.push([name,1])],['wrong-skill-level',i=>i.skills.find(x=>x[0]===name)[1]=2],
  ['missing-group',i=>delete i.stats.conditionalConditionPlan.groupPlan],['group-unresolved',i=>i.stats.conditionalConditionPlan.groupPlan.unresolvedEffects.push({reason:'TEST_UNRESOLVED'})],['group-duplicate',i=>i.stats.conditionalConditionPlan.groupPlan.applied.push(clone(i.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skillId===f.id)))],['group-wrong-parent',i=>i.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skillId===f.id).parent='Unknown'],['group-damage',i=>i.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skillId===f.id).attackAdd=1],
  ['missing-self-plan',i=>delete i.stats.conditionalConditionPlan.selfStatePlan],['pending-self-plan',i=>i.stats.conditionalConditionPlan.selfStatePlan.pending.push('normal:TEST_UNRESOLVED')],['wrong-self-id',i=>i.stats.conditionalConditionPlan.selfStatePlan.ids=[]],['wrong-self-source',i=>i.stats.conditionalConditionPlan.selfStatePlan.normal[0].source='forged'],['wrong-self-effect',i=>i.stats.conditionalConditionPlan.selfStatePlan.normal[0].attackAdd=1],['missing-self-row',i=>i.stats.conditionalConditionPlan.selfStatePlan.maximum=[]],['duplicate-self-row',i=>i.stats.conditionalConditionPlan.selfStatePlan.normal.push(clone(i.stats.conditionalConditionPlan.selfStatePlan.normal[0]))],
  ['parent-id-alias-invalid-activation',i=>{i.weapon.skills.push({skill:{id:f.id,name},level:1});i.stats.activeBonusEffects[index].rankLevel=3;}],
  ['parent-name-alias-invalid-activation',i=>{i.skills=i.skills.filter(x=>x[0]!==name);i.skills.push([i.stats.activeBonusEffects[index].bonusName,1]);i.stats.activeBonusEffects[index].rankLevel=3;}]
 ];
 if(f.id===89){cases.push(['missing-sliding-state',i=>delete i.conditions.selfSkillState.normal.sliding],['invalid-sliding-state',i=>i.conditions.selfSkillState.maximum.sliding='true'],['stale-sliding-plan',i=>i.conditions.selfSkillState.normal.sliding=true]);}
 if(f.id===153){for(const [id,name] of [[165,'耐性変換【雷】'],[181,'耐性変換【水】']])cases.push(['veil-conversion-'+id,i=>{i.skills.push([name,1]);h.replan(i);}]);if(f.key==='155:1:gunlance')cases.push(['rank-I-with-four-pieces',i=>i.stats.activeBonusEffects[index].count=4]);}
 for(const [name,mutate] of cases){const altered=h.copy(input);mutate(altered);const r=h.candidate.evaluateCurrent(altered);assert.equal(ready(r),false,f.key+':'+name+' must not acquire shell availability');observations.push({key:f.key,name,status:r.status,reasons:[...new Set(['normal','maximum'].flatMap(ch=>components(r,ch,'SHELLING').map(p=>p.reason)))]});}
 }
 assert.equal(observations.length,86);assert.deepEqual(h.errors,[]);
 }finally{h.dom.window.close();}
});

test('explicit sliding applies the existing +30 affinity once to body, never shell damage',async()=>{
 const h=await load();try {let off=h.capture(h.bonusFixtures[0]);off.conditions.standardSoloPolicy=false;off.conditions.standardEvaluation=false;h.replan(off);let on=h.copy(off);for(const ch of ['normal','maximum'])on.conditions.selfSkillState[ch].sliding=true;h.replan(on);
 const a=h.candidate.evaluateCurrent(off),b=h.candidate.evaluateCurrent(on),pinned=h.baseline.evaluateCurrent(h.copy(on));assert.equal(ready(a),true);assert.equal(ready(b),true);
 for(const ch of ['normal','maximum']){assert.deepEqual(json(components(a,ch,'SHELLING')),json(components(b,ch,'SHELLING')));assert.deepEqual(json(components(b,ch,'MV')),json(components(pinned,ch,'MV')));
 const inactive=components(a,ch,'MV'),active=components(b,ch,'MV');assert.ok(inactive.length>0);
 for(let n=0;n<inactive.length;n++){assert.equal(inactive[n].status,'available');assert.ok(Math.abs(active[n].value-inactive[n].value*1.075)<1e-9,'30% affinity × 25% crit bonus = 7.5% body gain, '+ch+':'+n);}
 }
 }finally{h.dom.window.close();}
});
