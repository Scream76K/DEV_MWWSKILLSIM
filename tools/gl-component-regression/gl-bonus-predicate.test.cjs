'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {load}=require('./bonus-runtime.cjs');
const source=fs.readFileSync(require('node:path').join(__dirname,'work/input/hope-hammer-browser-adapter.js'),'utf8');
const predicate=source.match(/  const shellSelfStateBonusResolved=x=>\{[\s\S]*?\n  \};/)[0];
test('actual bonus predicate separately proves conversion and alias guards not masked by downstream gates',async()=>{
 const h=await load();try {
 for(const {armorIds,id} of h.bonusFixtures){
  const input=h.capture({armorIds}),name=input.stats.activeBonusEffects.find(e=>e.bonusSkillId===id).name,x={name,level:1,skillKey:'unknown',skillId:null};
  const accept=(entry=x,allSkills=[entry])=>vm.runInNewContext(predicate+'shellSelfStateBonusResolved(entry)',{entry,allSkills,stats:input.stats,activeBonusEffects:input.stats.activeBonusEffects,skills:input.skills,conditions:input.conditions,root:h.w});
  assert.equal(accept(),true);assert.equal(accept({...x,skillId:id,skillKey:'selfState'}),true);
  assert.equal(accept({...x,name:input.stats.activeBonusEffects.find(e=>e.bonusSkillId===id).bonusName,skillId:id,skillKey:'selfState'}),false);
  assert.equal(accept({...x,skillId:999}),false);assert.equal(accept(x,[x,{...x,skillId:id,skillKey:'selfState'}]),false);
  if(id===153)for(const extra of [{skillId:165,name:'Other',skillKey:'unknown'},{skillId:181,name:'Other',skillKey:'unknown'},{skillId:null,name:'耐性変換【雷】',skillKey:'unknown'},{skillId:null,name:'耐性変換【水】',skillKey:'unknown'},{skillId:null,name:'Other',skillKey:'resistanceConversionThunder'},{skillId:null,name:'Other',skillKey:'resistanceConversionWater'}])assert.equal(accept(x,[x,extra]),false,'conversion must block veil even before downstream conversion gates');
 }
 }finally{h.dom.window.close();}
});
