'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf('function chargeBladeStandardPowerForStats(');
const end=html.indexOf('function standardPowerForStatsSingleHealth(',start);
assert.ok(start>=0&&end>start,'CB STANDARD entry not found');
const source=html.slice(start,end);
const baseState=()=>({mixMode:'INDEPENDENT',mode:'AXE',normalPhials:5,enhancedPhials:0,
 previousAction:'AXE_NEUTRAL',mixH:{mode:'AXE',normalPhials:5,enhancedPhials:0,previousAction:'AXE_NEUTRAL'}});
function setup(failMax=false,planPending=[]){
 const calls=[];
 const deps={
  chargeBladeStateFromBuildStats:(_stats,state)=>({...state}),
  comboCBStoredState:baseState,
  standardPowerConditionPlan:()=>({normal:{attackTrue:100,affinity:10},
   maximum:{attackTrue:140,affinity:80},pending:planPending,scope:'CB_TEST'}),
  chargeBladeStatsFromCalcState:x=>x,
  chargeBladeResolveProfileDamage:(route,stats,state)=>{
   calls.push({route,attack:stats.attackTrue,mode:state.mode});
   if(failMax&&stats.attackTrue===140)throw Error('MAX_ONLY_FAIL');
   const basis=(route==='RELEASE_ROUTE'?100:200)*stats.attackTrue/100;
   return {total:basis,physical:basis*0.7,element:basis*0.2,special:basis*0.1,
    resourcePlan:[{techniqueId:route}]};
  }
 };
 const evaluate=Function('deps','with(deps){return ('+source+');}')(deps);
 return {evaluate,calls};
}
test('real STANDARD dispatch calls CB R/H, returns nonnormalized NORMAL and MAX',()=>{
 assert.ok(html.includes("if(kind==='charge-blade')return chargeBladeStandardPowerForStats(st,cond,total);"));
 const {evaluate,calls}=setup();
 const result=evaluate({}, {chargeBladeState:baseState()}, {});
 assert.equal(result.normal.comparisonPower,300);
 assert.equal(result.maximum.comparisonPower,420);
 assert.equal(result.normal.routes.release,100);
 assert.equal(result.normal.routes.aed,200);
 assert.equal(result.normal.basis,'INDEPENDENT_R_PLUS_H_UNROUNDED');
 assert.deepEqual(calls.map(x=>x.attack),[100,100,140,140]);
});
test('MAX failure or conditional MAX pending retains valid NORMAL',()=>{
 const failed=setup(true).evaluate({}, {chargeBladeState:baseState()}, {});
 assert.equal(failed.normal.comparisonPower,300);
 assert.equal(failed.maximum,null);
 assert.equal(failed.status,'MAXIMUM_PENDING');
 assert.match(failed.maximumReason,/MAX_ONLY_FAIL/);
 const pending=setup(false,['TEST_CONDITION']).evaluate({}, {chargeBladeState:baseState()}, {});
 assert.equal(pending.normal.comparisonPower,300);
 assert.equal(pending.maximum,null);
 assert.match(pending.maximumReason,/TEST_CONDITION/);
});
