'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load,fixtures,clean,components,ready,area}=require('./thunder-runtime.cjs');
const channels=['normal','maximum'];
const target=i=>i.stats.activeBonusEffects.find(e=>e.bonusSkillId===162);
const row=i=>i.stats.conditionalConditionPlan.groupPlan.applied.find(e=>e.skillId===162);
const sameNonShell=(a,b,ch)=>assert.deepEqual(clean(components(a,ch).filter(p=>p.coefficientUnit!=='SHELLING')),clean(components(b,ch).filter(p=>p.coefficientUnit!=='SHELLING')));
const write=(name,data)=>fs.writeFileSync(path.join(area,name),JSON.stringify(data,null,2));

for(const f of fixtures)test(f.key+': real armor preserves body and annotation policy while shells compute',async()=>{
 const h=await load();try {
  const input=h.capture(f),after=h.uiResult,before=clean(h.baseline.evaluateCurrent(h.copy(input))),control=h.candidate.evaluateCurrent(h.without162(input));
  assert.equal(ready(before),false);assert.equal(ready(after),true,'valid exact 162 activation should no longer block fixed shell raw/fire');assert.equal(ready(control),true);
  const oracle=[];
  for(const ch of channels){
   sameNonShell(after,before,ch);
   assert.deepEqual(components(after,ch,'SHELLING'),clean(components(control,ch,'SHELLING')),'same-armor synthetic removal control, not another armor build');
   assert.deepEqual(after.channels[ch].execution,before.channels[ch].execution,'no extra events or altered execution order');
   assert.deepEqual(components(after,ch).map(p=>[p.id,p.eventId,p.coefficientUnit]),components(before,ch).map(p=>[p.id,p.eventId,p.coefficientUnit]));
   assert.equal(after.channels[ch].metrics.comboTotalDamage.status,'available');
   const annotation=after.channels[ch].diagnostics.excludedSkillDamage.find(x=>x.skillId===162);
   assert.equal(annotation.bodyEffect,true);assert.equal(annotation.annotationOnly,true);assert.deepEqual(annotation.excludedComponents,['FIXED','THUNDER']);assert.equal(annotation.additionalDamage.includedInPower,false);assert.equal(annotation.additionalDamage.status,'unavailable');
   assert.deepEqual(annotation,before.channels[ch].diagnostics.excludedSkillDamage.find(x=>x.skillId===162));
   // Independent arithmetic oracle. Existing source values only; no reference calculator used.
   const s=input.gunlanceState,rules=h.w.TechniqueDBEngine.get('gunlance','GL_SHELL_NORMAL_MEDIUM').specialSourceValues.p0ReferenceRules;
   const source=h.w.TechniqueDBEngine.get('gunlance','GL_SHELL_'+s.shellingType+'_'+s.shellingPower).specialSourceValues;
   const gl=after.channels[ch].diagnostics.glTarget,r=gl.rules,power=r.powerRows[s.shellingType+'_'+s.shellingPower];
   const attack=input.stats.attackComponents.weaponBase*input.stats.attackComponents.normalMultiplier+input.stats.attackComponents.normalFlat;
   for(const p of components(after,ch,'SHELLING')){
    const action=r.actions[p.techniqueId],burst=p.id.endsWith(':0'),count=burst?6:1;
    const mv=burst?source.unparenthesizedValue:power.explosionMv,mult=burst?r.stakeFullBurstMultiplier[s.shellingType]:action.explosionMultiplier;
    const fire=burst?source.parenthesizedValue:power.explosionFire*action.explosionMultiplier;
    const expected=count*(attack*mv/100*mult+fire/10*rules.fireElementModifier*s.fireHitzone/100);
    assert.ok(Math.abs(p.value-expected)<1e-9,`${p.id}: ${p.value} != ${expected}`);oracle.push({channel:ch,id:p.id,expected,actual:p.value});
   }
  }
  // Existing affinity is retained exactly once. Below cap, +15% times 25% crit = +3.75% of base physical.
  const base=components(after,'normal','MV'),max=components(after,'maximum','MV'),removed=components(control,'maximum','MV');
  for(let n=0;n<base.length;n++){const name=base[n].techniqueId,baseWithoutWex=base[n].value/(1+(target(input).rankLevel===1?5:15)/100*.25);assert.ok(Math.abs(max[n].value-removed[n].value-baseWithoutWex*.0375)<1e-9,name+' retains exactly the existing +15 body affinity');}
  // Observe real generic calls; every accepted shell component passes zero affinity.
  const calls=[],generic=h.w.MHWGenericProfileDamage;h.w.MHWGenericProfileDamage=(profile,stats)=>{calls.push(clean({profile,stats}));return generic(profile,stats);};
  try{assert.equal(ready(h.candidate.evaluateCurrent(h.copy(input))),true);}finally{h.w.MHWGenericProfileDamage=generic;}
  assert.equal(calls.length,8);for(const call of calls){assert.equal(call.stats.affinity,0);assert.equal(call.stats.maxAffinity,0);}
  write('original-'+target(input).rankLevel+'.json',{fixture:f,input:clean({...input,techniqueDb:undefined}),before,after,oracle,genericShellCalls:calls});
 }finally{h.close();}
});

test('both ranks also retain the body-only path and validate the separate ordinary-shell path',async()=>{
 const h=await load();try{
  for(const f of fixtures){
   const body=h.capture({...f,techniqueIds:['canonical:GL_SLAM','canonical:GL_SWEEP']});
   assert.deepEqual(clean(h.candidate.evaluateCurrent(h.copy(body))).channels,clean(h.baseline.evaluateCurrent(h.copy(body))).channels,'body-only input is completely unchanged');
   // Supply required state through the actual public UI controls, before calcBuild.
   const shell=h.capture({...f,techniqueIds:['reference:gl_NORMAL'],glState:{loadedRounds:6,shellingType:'NORMAL',shellingPower:'MEDIUM',fireHitzone:30},selfSkillState:{normal:{sliding:false},maximum:{sliding:false}}});
   const old=h.baseline.evaluateCurrent(h.copy(shell)),current=h.uiResult,control=h.candidate.evaluateCurrent(h.without162(shell));
   assert.equal(ready(old),false);assert.equal(ready(current),true);
   for(const ch of channels){assert.deepEqual(clean(components(current,ch)),clean(components(control,ch)));assert.equal(current.channels[ch].metrics.comboTotalDamage.status,'available');}
   const name=target(shell).name;shell.skills=shell.skills.filter(x=>x[0]!==name);shell.weapon.skills.push({skill:{id:162,name:'攻撃'},level:1});shell.stats.conditionalConditionPlan.groupPlan.applied.push({skillId:10,skill:'攻撃',attackAdd:0,attackMultiplier:1,bonusSource:true});
   assert.equal(ready(h.candidate.evaluateCurrent(shell)),false,'ordinary-shell late allowlist must also retain the 162 guard');
  }
 }finally{h.close();}
});

test('actual three/five armor-piece counts and capped affinity retain the same scoped indicator',async()=>{
 const h=await load();try{
  for(const armorIds of [h.armorIds.slice(0,3),h.armorIds]){
   const input=h.capture({armorIds}),after=h.uiResult,before=h.baseline.evaluateCurrent(h.copy(input));
   assert.equal(target(input).count,armorIds.length);assert.equal(ready(after),true);
   for(const ch of channels){sameNonShell(after,before,ch);assert.deepEqual(after.channels[ch].execution,clean(before.channels[ch].execution));}
  }
  const input=h.capture({...fixtures[1],grants:[{name:'見切り',level:5,type:'weapon'},{name:'力の解放',level:5,type:'armor'}]}),after=h.uiResult,before=h.baseline.evaluateCurrent(h.copy(input));
  assert.equal(input.stats.maxAffinity,100);assert.equal(ready(after),true);
  for(const ch of channels)sameNonShell(after,before,ch);
 }finally{h.close();}
});

test('full adapter rejects malformed 162 activations, stale plans and aliases before old allowlists',async()=>{
 const h=await load(),observations=[];try{
  for(const f of fixtures){const valid=h.capture(f),rank=target(valid).rankLevel,name=target(valid).name;
   const cases=[
    ['activation-missing',i=>i.stats.activeBonusEffects=i.stats.activeBonusEffects.filter(e=>e.bonusSkillId!==162)],
    ...Object.entries({bonusSkillId:999,name:'Other',bonusName:'Other',source:'group',rankLevel:3,required:1,count:1,level:2,displayType:'group'}).map(([k,v])=>['activation-'+k,i=>target(i)[k]=v]),
    ['activation-count-fraction',i=>target(i).count=4.5],['activation-count-string',i=>target(i).count='4'],['activation-duplicate',i=>i.stats.activeBonusEffects.push(structuredClone(target(i)))],
    ['activation-count-999',i=>{target(i).count=999;h.replan(i);}],['activation-count-overspecified',i=>{target(i).count=target(i).rankLevel===1?3:5;h.replan(i);}],['activation-count-negative',i=>{target(i).count=-1;h.replan(i);}],
    ['armor-missing',i=>delete i.stats.armorThunderResistanceInput],['armor-row-missing',i=>i.stats.armorThunderResistanceInput.rows.pop()],['armor-slot-duplicate',i=>i.stats.armorThunderResistanceInput.rows[1]=structuredClone(i.stats.armorThunderResistanceInput.rows[0])],['armor-id-unknown',i=>i.stats.armorThunderResistanceInput.rows[0].id=999999],['armor-id-wrong-slot',i=>i.stats.armorThunderResistanceInput.rows[0].id=h.armorIds[1]],['armor-id-unrelated',i=>i.stats.armorThunderResistanceInput.rows[0].id=h.unrelatedArmorId],['armor-equipped-unknown',i=>i.stats.armorThunderResistanceInput.rows[0].equipped='true'],['armor-source-forged',i=>i.stats.armorThunderResistanceInput.rows[0].sourceUrl='forged'],
    ['activation-related-id-mismatch',i=>i.stats.activeBonusEffects.push({...target(i),bonusSkillId:999})],
    ['skill-duplicate',i=>i.skills.push([name,1])],['skill-level',i=>i.skills.find(x=>x[0]===name)[1]=2],['raw-related-duplicate',i=>i.weapon.skills.push({skill:{id:162,name},level:1})],
    ['group-missing',i=>delete i.stats.conditionalConditionPlan.groupPlan],['group-status',i=>i.stats.conditionalConditionPlan.groupPlan.status='UNVERIFIED'],['group-scope',i=>i.stats.conditionalConditionPlan.groupPlan.scope='OTHER'],['group-unresolved',i=>i.stats.conditionalConditionPlan.groupPlan.unresolvedEffects.push({id:'unknown'})],['group-duplicate',i=>i.stats.conditionalConditionPlan.groupPlan.applied.push(structuredClone(row(i)))],['group-false-nondamage',i=>i.stats.conditionalConditionPlan.groupPlan.nonDamageEffects.push(structuredClone(target(i)))],
    ...Object.entries({skillId:999,skill:'Other',parent:'Other',rank:3,attackAdd:1,attackMultiplier:2,bonusSource:false,appliesToNormal:false,annotationOnly:false,bodyEffect:false,policy:'OTHER',evidenceRef:'forged',numericOrigin:'UNVERIFIED',condition:'UNKNOWN'}).map(([k,v])=>['row-'+k,i=>row(i)[k]=v]),
    ['row-missing-activation',i=>delete row(i).annotationActivation],['row-stale-activation',i=>row(i).annotationActivation.count+=1],['row-extra-element-add',i=>row(i).elementAdd=1],
    ['row-exclusions-missing',i=>delete row(i).excludedComponents],['row-exclusions-changed',i=>row(i).excludedComponents=['FIXED']],['row-exclusions-reordered',i=>row(i).excludedComponents.reverse()],['row-exclusions-duplicated',i=>row(i).excludedComponents.push('THUNDER')],
    ['plan-applied-missing',i=>i.stats.conditionalConditionPlan.applied=i.stats.conditionalConditionPlan.applied.filter(e=>e.skillId!==162)],['plan-applied-body-false',i=>i.stats.conditionalConditionPlan.applied.find(e=>e.skillId===162).bodyEffect=false],['plan-applied-duplicate',i=>i.stats.conditionalConditionPlan.applied.push(structuredClone(row(i)))],
    ['affinity-unknown',i=>i.stats.affinity=NaN],['affinity-string',i=>i.stats.affinity='0'],['max-affinity-unknown',i=>i.stats.maxAffinity=NaN],['max-affinity-stale',i=>i.stats.maxAffinity-=15],
    ['affinity-not-known',i=>i.stats.affinityKnown=false],['plan-normal-affinity-stale',i=>i.stats.conditionalConditionPlan.normal.affinity=15],['plan-max-affinity-stale',i=>i.stats.conditionalConditionPlan.maximum.maxAffinity-=15],
    ['parent-alias',i=>i.skills.find(x=>x[0]===name)[0]='海竜の渦雷'],['unranked-alias',i=>i.skills.find(x=>x[0]===name)[0]='蒼雷一閃'],['wrong-rank-alias',i=>i.skills.find(x=>x[0]===name)[0]=rank===1?'蒼雷一閃Ⅱ':'蒼雷一閃Ⅰ'],
    ['attack-alias-old-allowlist',i=>{i.skills=i.skills.filter(x=>x[0]!==name);i.weapon.skills.push({skill:{id:162,name:'攻撃'},level:1});}],
    ['attack-alias-late-allowlist',i=>{i.skills=i.skills.filter(x=>x[0]!==name);i.weapon.skills.push({skill:{id:162,name:'攻撃'},level:1});i.stats.conditionalConditionPlan.groupPlan.applied.push({skillId:10,skill:'攻撃',attackAdd:0,attackMultiplier:1,bonusSource:true});}],
    ['fixed-skill-alias-old-allowlist',i=>{i.skills=i.skills.filter(x=>x[0]!==name);i.weapon.skills.push({skill:{id:162,name:'海竜の渦雷',damageRelated:false,effectCategory:'non_damage'},level:1});}],
   ];
   if(rank===1)cases.push(['rank-I-with-four-pieces',i=>target(i).count=4]);
   for(const [label,mutate] of cases){const i=h.copy(valid);mutate(i);const r=h.candidate.evaluateCurrent(i);assert.equal(ready(r),false,f.key+':'+label);observations.push({key:f.key,label,reason:r.reason||channels.flatMap(ch=>components(r,ch,'SHELLING').map(p=>p.reason)).join(';')});}
  }
  write('full-adapter-negatives.json',observations);
 }finally{h.close();}
});

test('policy provenance and unknown coexisting conditions remain fail-closed',async()=>{
 const h=await load(),observations=[];try{
  const input=h.capture(fixtures[0]),saved=h.w.MHSkillExtraDamagePolicies;
  for(const [label,value] of [['missing',null],['body-false',{...saved[162],bodyEffect:false}],['wrong-name',{...saved[162],name:'Other'}],['wrong-rank-limit',{...saved[162],maxLevel:3}],['wrong-components',{...saved[162],components:['FIXED']}],['extra-component',{...saved[162],components:['FIXED','THUNDER','FIRE']}]]){
   try{h.w.MHSkillExtraDamagePolicies={...saved,162:value};assert.equal(ready(h.candidate.evaluateCurrent(h.copy(input))),false,label);observations.push(label);}finally{h.w.MHSkillExtraDamagePolicies=saved;}
  }
  for(const [label,mutate] of [['pending-plan',i=>i.stats.conditionalConditionPlan.pending.push('UNRELATED_UNKNOWN')],['unknown-shell-state',i=>i.gunlanceState.fireHitzone=null],['unknown-slide',i=>{delete i.conditions.selfSkillState.normal.sliding;h.replan(i);} ]]){
   const i=h.capture(fixtures[1]);mutate(i);const r=h.candidate.evaluateCurrent(i);assert.equal(channels.every(ch=>r.channels?.[ch]?.metrics?.comboTotalDamage?.status==='available'),false,label);observations.push(label);
  }
  write('policy-and-conditions.json',observations);
 }finally{h.close();}
});
