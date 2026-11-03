'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('function chargeBladePlanProfileResources(');
const end=html.indexOf('function chargeBladeComparisonResult(',start);
assert.ok(start>=0&&end>start,'missing CB resource integration');
const profiles={RELEASE_ROUTE:{id:'CB_STANDARD_RELEASE_ROUTE_R',
 techniqueIds:['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED']}};
const window={MHCBDischargeResourceRules:{status:'OWNER_APPROVED',baseConsumption:1,
 predecessors:{CB_ELEMENT_DISCHARGE_1:['AXE_NEUTRAL'],CB_ELEMENT_DISCHARGE_2:['CB_ELEMENT_DISCHARGE_1'],
 CB_AED:['CB_ELEMENT_DISCHARGE_2'],CB_FOLLOWUP_AED:['CB_AED']}},
 MHCBED1ResourceRule:{status:'OWNER_APPROVED',axeBoostedConsumptionMultiplier:0.5}};
test('R consumer picks phial coefficient from each consumed stock, never one global switch',()=>{
 const seen=[];
 const run=Function('profiles','window','resolver','version',html.slice(start,end)+
  ';return chargeBladeResolveProfileDamage;')(profiles,window,(id,stats,state)=>{
   seen.push({id,enhanced:state.enhancedPhial});
   return {techniqueId:id,total:10,physical:6,element:3,special:1};
  },'test');
 const original={axeBoosted:true,normalPhials:5,enhancedPhials:0.5,
  previousAction:'AXE_NEUTRAL',phialType:'IMPACT',enhancedPhial:true};
 const result=run('RELEASE_ROUTE',{},original);
 assert.deepEqual(seen.map(x=>x.enhanced),[true,false,false,false]);
 assert.deepEqual(result.resourcePlan.map(x=>x.stockKind),['enhanced','normal','normal','normal']);
 assert.equal(result.finalResourceState.normalPhials,3.5);
 assert.equal(result.finalResourceState.enhancedPhials,0);
 assert.equal(original.normalPhials,5);
 assert.equal(original.enhancedPhials,0.5);
});
