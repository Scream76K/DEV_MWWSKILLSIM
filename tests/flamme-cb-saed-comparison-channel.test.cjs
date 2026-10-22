'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const begin=source.indexOf('function chargeBladeSaedComparisonChannel(');
const end=source.indexOf('function buildComparisonRouter(',begin);
assert.ok(begin!==-1&&end>begin,'production SAED comparison channel missing');
const compile=new Function('chargeBladeConditionStats','chargeBladeSaedDamage',
  source.slice(begin,end)+';return chargeBladeSaedComparisonChannel;');
test('SAED A/B reference is independent of comparison power and skill state',()=>{
  const channel=compile((stats,condition)=>({...stats,condition}),
    (id,stats,state)=>({total:100+(state.ammoLoadingLevel===2?20:0)+(stats.condition==='MAX'?5:0),physical:40,element:60,special:0,trace:{ammoLoadingLevel:state.ammoLoadingLevel}}));
  const a=channel({attack:100},{ammoLoadingLevel:0});
  const b=channel({attack:100},{ammoLoadingLevel:2});
  assert.equal(a.NORMAL.total,100);assert.equal(b.NORMAL.total,120);
  assert.equal(a.MAX.total,105);assert.equal(b.MAX.total,125);
  assert.equal(a.NORMAL.status,'REFERENCE_ONLY');
});
test('SAED failure remains a visible pending channel',()=>{
  const channel=compile((stats,condition)=>({...stats,condition}),()=>{throw Error('CB_SAED:SOURCE_REQUIRED')});
  const result=channel({},{});
  assert.equal(result.NORMAL.status,'PENDING');
  assert.match(result.NORMAL.reason,/CB_SAED:SOURCE_REQUIRED/);
  assert.equal(result.MAX.status,'PENDING');
});
