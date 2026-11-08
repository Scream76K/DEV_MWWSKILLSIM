'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load,fixtures,root}=require('./thunder-runtime.cjs');
test('actual predicate and full filter independently reject aliases even when old gates allow them',async()=>{
 const source=fs.readFileSync(root+'/hope-hammer-browser-adapter.js','utf8');
 const fragment=source.match(/  const shellThunderBonusRelated=x=>[^\n]+\n  const shellThunderBonusResolved=x=>\{[\s\S]*?\n  \};/);
 assert.ok(fragment,'new bounded predicate must exist');
 const filter=source.match(/  const shellingInput=\{[^\n]+/)[0];
 const h=await load();try{
  for(const f of fixtures){const input=h.capture(f),name=input.stats.activeBonusEffects.find(e=>e.bonusSkillId===162).name,entry={name,skillId:null,skillKey:'unknown',level:1};
   const run=(entry,extra=[])=>{const context={entry,allSkills:[entry,...extra],stats:input.stats,activeBonusEffects:input.stats.activeBonusEffects,skills:input.skills,conditions:input.conditions,weapon:input.weapon,trainingRoom:input.trainingRoom,target:input.target,root:h.w};return vm.runInNewContext(fragment[0]+'shellThunderBonusResolved(entry)',context);};
   assert.equal(run(entry),true);assert.equal(run({...entry,skillId:162}),true);
   for(const patch of [{name:'海竜の渦雷',skillId:162},{name:'蒼雷一閃',skillId:162},{name:'攻撃',skillId:162,skillKey:'attack'},{name:'Other',skillId:162},{skillId:999},{level:2},{skillKey:'attack'}])assert.equal(run({...entry,...patch}),false,JSON.stringify(patch));
   assert.equal(run(entry,[{...entry}]),false);assert.equal(run(entry,[{name:'Other',skillId:162}]),false);
   // Exercise provenance rejection in this predicate itself, not only downstream plan gates.
   const row=input.stats.conditionalConditionPlan.groupPlan.applied.find(a=>a.skillId===162);
   for(const [key,value] of Object.entries({skillId:999,skill:'Other',parent:'Other',rank:3,attackAdd:1,attackMultiplier:2,bonusSource:false,appliesToNormal:false,annotationOnly:false,bodyEffect:false,policy:'OTHER',evidenceRef:'forged',numericOrigin:'UNVERIFIED',condition:'UNKNOWN',excludedComponents:['FIXED'],annotationActivation:{}})){
    const saved=row[key];try{row[key]=value;assert.equal(run(entry),false,'predicate rejects row '+key);}finally{row[key]=saved;}
   }
   const e=input.stats.activeBonusEffects.find(a=>a.bonusSkillId===162);
   for(const [key,value] of Object.entries({bonusSkillId:999,name:'Other',bonusName:'Other',source:'group',displayType:'group',rankLevel:3,required:1,count:1,level:2})){
    const saved=e[key];try{e[key]=value;assert.equal(run(entry),false,'predicate rejects activation '+key);}finally{e[key]=saved;}
   }
   for(const key of ['affinity','maxAffinity']){const saved=input.stats[key];try{input.stats[key]=NaN;assert.equal(run(entry),false);}finally{input.stats[key]=saved;}}
   for(const alias of [{name:'攻撃',skillId:162,skillKey:'attack',level:1},{name:'海竜の渦雷',skillId:162,skillKey:'selfState',level:1},{name,skillId:999,skillKey:'attack',level:1}]){
    const context={allSkills:[alias],stats:input.stats,gunlanceState:null,loadShellEntries:[],artilleryEntries:[],cornpopperEntries:[],bladescaleEntries:[],shellThunderBonusRelated:x=>Number(x.skillId)===162||['海竜の渦雷','蒼雷一閃','蒼雷一閃Ⅰ','蒼雷一閃Ⅱ'].includes(x.name),shellThunderBonusResolved:()=>false,shellMightResolved:()=>true,shellAffinityOnlyResolved:()=>true,shellDefensiveOnlyResolved:()=>true,shellStateAffinityOnlyResolved:()=>true,shellSelfStateBonusResolved:()=>true,fixedEntrySkill:()=>true};
    assert.deepEqual(Array.from(vm.runInNewContext(filter+'shellingInput.unreviewedSkills',context)),[alias.name],'162 rejection must precede every legacy bypass');
   }
  }
 }finally{h.close();}
});
