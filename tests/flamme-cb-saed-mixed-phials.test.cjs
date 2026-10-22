'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=source.indexOf('function chargeBladeSaedDamage(');
const end=source.indexOf('function chargeBladeResolveTechniqueDamage(',start);
assert.ok(start>=0&&end>start,'Production SAED function not found');
const formula={POWER_ELEMENT_PHIAL:{evaluate:({displayedElement,coefficient,elementalHitzone,shieldBoosted})=>
  displayedElement/10*coefficient*elementalHitzone/100*(shieldBoosted?1.3:1)}};
const getRecord=()=>({phialReference:{status:'PROVISIONALLY_ADOPTED',hitCount:5,powerElement:{normal:8,enhanced:11},
  shieldElementMultiplier:1.3,shieldPhysicalBodyMultiplier:1.1,source:'independent-test',sourceVersion:'test'},
  hits:[{mv:0,elementModifier:0}],techniqueName:'SAED',verificationStatus:'PROVISIONAL'});
const compute=new Function('techniqueDbGet','equipmentElementPendingReason','equipmentHpElement',
  'CHARGE_BLADE_FORMULAS',source.slice(start,end)+';return chargeBladeSaedDamage;')(
  getRecord,()=>null,stats=>stats.element,formula);
const stats={baseAttack:100,displayedElement:500,physicalHitzone:50,
  elementalHitzone:25,sharpnessPhysical:1,sharpnessElement:1,affinity:0};
const state={phialType:'POWER_ELEMENT',shieldBoosted:false};
test('SAED three enhanced two normal, all five consumed',()=>{
  const r=compute('CB_SAED',stats,{...state,enhancedPhial:false});
  assert.equal(r.trace.enhancedCount,3);assert.equal(r.trace.normalCount,2);
  assert.equal(r.components.elementalPhial,612.5);
});
test('SAED five enhanced and delta equals two upgrades',()=>{
  const a=compute('CB_SAED',stats,{...state,enhancedPhial:false});
  const b=compute('CB_SAED',stats,{...state,enhancedPhial:true});
  assert.equal(b.trace.enhancedCount,5);assert.equal(b.trace.normalCount,0);
  assert.equal(b.components.elementalPhial,687.5);
  assert.equal(b.total-a.total,75);
});
