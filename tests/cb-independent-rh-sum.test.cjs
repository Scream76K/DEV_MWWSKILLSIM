'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const from='function chargeBladeConditionStats(';
const to='// r26: Build Comparison presentation adapter.';
const start=html.indexOf(from),end=html.indexOf(to,start);
assert.ok(start>=0&&end>start,'CB comparison functions missing');
const source=html.slice(start,end);
function load(resolveProfile){
  return Function('resolveProfile','CHARGE_BLADE_ENGINE_VERSION',
    source+';return {pair:chargeBladeResolveConditionPair,power:chargeBladeCompositePower,compare:chargeBladeBuildComparisonAdapter};'
  )(resolveProfile,'CB_TEST');
}
test('R/H independent starting state and unrounded sum for NORMAL/MAX without time',()=>{
  const calls=[];
  const api=load((route,stats,state)=>{
    calls.push({route,condition:stats.condition,mode:state.mode});
    const total=(route==='RELEASE_ROUTE'?100:200)*(stats.condition==='MAX'?1.4:1);
    return {total,physical:total*0.7,element:total*0.2,special:total*0.1};
  });
  const state={mixMode:'INDEPENDENT',mode:'AXE',mixH:{mode:'SWORD'}};
  const result=api.compare({affinity:20,maxAffinity:80},{affinity:30,maxAffinity:90},state,state);
  assert.equal(result.A.NORMAL.comparisonPower,300);
  assert.equal(result.A.MAX.comparisonPower,420);
  assert.equal(result.B.NORMAL.comparisonPower,300);
  assert.equal(result.A.NORMAL.routes.release,100);
  assert.equal(result.A.NORMAL.routes.aed,200);
  assert.equal(result.A.NORMAL.weights,undefined);
  assert.equal(result.A.NORMAL.basis,'INDEPENDENT_R_PLUS_H_UNROUNDED');
  assert.deepEqual(calls.slice(0,4).map(x=>x.mode),['AXE','SWORD','AXE','SWORD']);
});
test('missing route results and nonfinite components cannot become zero',()=>{
  const api=load(()=>({total:1,physical:1,element:0,special:0}));
  assert.throws(()=>api.pair({affinity:20,maxAffinity:80},{mixMode:'INDEPENDENT'}),/H_INDEPENDENT_START_STATE_REQUIRED/);
  assert.throws(()=>api.power({NORMAL:{release:{total:1,physical:1,element:0,special:0},aed:{total:NaN,physical:1,element:0,special:0}}},'NORMAL'),/CONDITION_COMPONENT/);
});
