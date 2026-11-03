'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('function chargeBladePlanProfileResources(');
const end=html.indexOf('function chargeBladeResolveProfileDamage(',start);
assert.ok(start>=0&&end>start,'missing CB resource-plan function');
const profiles={
 RELEASE_ROUTE:{techniqueIds:['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED']},
 AED_ROUTE:{techniqueIds:['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST','CB_AED','CB_FOLLOWUP_AED']}
};
const rules={status:'OWNER_APPROVED',baseConsumption:1,predecessors:{
 CB_ELEMENT_DISCHARGE_1:['AXE_NEUTRAL'],CB_ELEMENT_DISCHARGE_2:['CB_ELEMENT_DISCHARGE_1'],
 CB_AED:['CB_ELEMENT_DISCHARGE_2','SHIELD_THRUST'],CB_FOLLOWUP_AED:['CB_AED']}};
const window={MHCBDischargeResourceRules:rules,
 MHCBED1ResourceRule:{status:'OWNER_APPROVED',axeBoostedConsumptionMultiplier:0.5},
 MHCBHRouteRule:{status:'OWNER_APPROVED_PROVISIONAL',
  prefixIds:['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST'],techniqueIds:profiles.AED_ROUTE.techniqueIds}};
const plan=Function('CHARGE_BLADE_STANDARD_PROFILES','window',
 html.slice(start,end)+';return chargeBladePlanProfileResources;')(profiles,window);
const R={axeBoosted:true,normalPhials:5,enhancedPhials:0,previousAction:'AXE_NEUTRAL',phialType:'IMPACT'};
const H={...R,mode:'AXE',shieldBoosted:true,swordBoosted:false,enhancedPhial:false};
test('R/H route stock is separately consumed, while caller start state remains unchanged',()=>{
 const r=plan('RELEASE_ROUTE',R),h=plan('AED_ROUTE',H);
 assert.deepEqual(r.steps.map(x=>x.consume),[0.5,0.5,0.5,0.5]);
 assert.deepEqual(h.steps.map(x=>x.consume),[0,0,0.5,0.5]);
 assert.equal(r.finalState.normalPhials,3);
 assert.equal(h.finalState.normalPhials,4);
 assert.equal(R.normalPhials,5);
 assert.equal(H.normalPhials,5);
});
test('enhanced stock takes priority and invalid crossover/underflow fails closed',()=>{
 const enhanced=plan('RELEASE_ROUTE',{...R,enhancedPhials:2});
 assert.equal(enhanced.finalState.enhancedPhials,0);
 assert.equal(enhanced.finalState.normalPhials,5);
 assert.throws(()=>plan('RELEASE_ROUTE',{...R,enhancedPhials:0.75}),/EXPLICIT_PHIAL_STOCK_REQUIRED/);
 assert.throws(()=>plan('RELEASE_ROUTE',{...R,normalPhials:1}),/INSUFFICIENT_PHIALS/);
 assert.throws(()=>plan('RELEASE_ROUTE',{...R,enhancedPhials:0.5}),/INSUFFICIENT_PHIALS|CROSS_TYPE_DAMAGE_ALLOCATION_UNRESOLVED/);
});
test('H adopted start and predecessor constraints cannot be bypassed',()=>{
 assert.throws(()=>plan('AED_ROUTE',{...H,phialType:'POWER_ELEMENT'}),/H_START_CONTRACT_INVALID/);
 assert.throws(()=>plan('AED_ROUTE',{...H,previousAction:'GUARD'}),/H_START_CONTRACT_INVALID/);
 assert.throws(()=>plan('RELEASE_ROUTE',{...R,previousAction:'GUARD'}),/RESOURCE_PREDECESSOR/);
});
