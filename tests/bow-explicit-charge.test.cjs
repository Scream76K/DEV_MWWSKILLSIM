'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const bow=require('../bow-reference.js');
const input={attack:100,element:100,affinity:0,criticalMultiplier:1.25,physicalHitzone:100,elementalHitzone:100,state:{chargeLevel:3,range:'CRITICAL',coating:'NONE',startShot:1}};
const rows=[['BOW_SHOT_1',1,10,.4],['BOW_SHOT_2',2,11,.7],['BOW_POWER_SHOT_1',3,10,.4],['BOW_POWER_SHOT_2',4,11,.67],['BOW_POWER_VOLLEY_1',4,13,.6],['BOW_POWER_VOLLEY_2',5,14,.87]];
const rules={status:'SOURCE_CONFIRMED',scope:'FIXED_BOW_STANDARD_SOURCE_REFERENCE',rangePhysical:{CRITICAL:1.1},coatingPhysical:{NONE:1},skillRules:Object.fromEntries(['normalUp','spreadUp','chargeMaster','criticalElement','bladescaleLoading','firstShot','forceShot'].map(k=>[k,{multipliers:{0:1},techniqueIds:[],coatings:[],attackAdds:{0:0},affinityAdds:{0:0},component:'NOT_APPLICABLE_TO_BOW',scope:'BOWGUN_ONLY'}]))};
rules.skillRules.spreadUp={skillId:2,component:'PHYSICAL_ONLY',targets:{bow:[]},multipliers:[1]};
const engine={get(kind,id){if(id==='BOW_STATE_MODIFIERS')return {specialSourceValues:rules};return this.getExplicitBowCharge(id);},getExplicitBowCharge(id){return {hits:this.hits('bow',id),sourceFormula:{scope:'EXPLICIT_BOW_CHARGE_UNCOATED_REFERENCE',gameVersion:'1.041',chargeLevel:Number(id.at(-1)),physicalShotCorrectionOwnedByStateRecord:true}};},hits(kind,id){const [,count,mv,elementModifier]=rows.find(r=>r[0]===id);return Array.from({length:count},()=>({mv,elementModifier}));}};
test('explicit uncoated charge IDs use the source arrow count and per-arrow coefficients',()=>{
 for(const [id,count,mv,element] of rows){
  const result=bow.explicitCharge(input,engine,id);
  assert.equal(result.trace.length,count);
  assert.ok(Math.abs(result.physical-count*mv*1.1)<1e-9);
  assert.ok(Math.abs(result.element-count*10*element)<1e-9);
 }
});
test('lower IDs stay out of standard and unconfirmed coating, range, and skill branches',()=>{
 const id=rows[0][0];
 assert.throws(()=>bow.standard(input,engine,[id,id,id]),/TECHNIQUE_SOURCE_UNVERIFIED/);
 for(const change of [{state:{...input.state,coating:'PIERCE'}},{state:{...input.state,range:'NEAR'}},{skills:{chargeMaster:1}}])
  assert.throws(()=>bow.explicitCharge({...input,...change},engine,id),/EXPLICIT_CHARGE_SCOPE/);
});
