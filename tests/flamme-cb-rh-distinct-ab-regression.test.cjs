'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','hope-hammer-browser-adapter.js'),'utf8');
const start=src.indexOf('function evaluateIndependentCBMix(input){');
const end=src.indexOf('function evaluateCurrent(input={}){',start);
assert.ok(start>=0&&end>start,'production CB independent R/H aggregator missing');
const R=['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED'];
const H=['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST','CB_AED','CB_FOLLOWUP_AED'];
const observed=[];
const routeCalc=input=>{
 const route=JSON.stringify(input.techniqueIds)===JSON.stringify(R)?'R':'H';
 assert.deepEqual(input.conditions.chargeBladeState,input.chargeBladeState);
 const stock=input.chargeBladeState.normalPhials,required=route==='R'?2:1;
 observed.push({route,stock,attack:input.stats.attackTrue});
 const complete=Number.isFinite(stock)&&stock>=required;
 return {channels:Object.fromEntries(['normal','maximum'].map((ch,i)=>[ch,{
  execution:{status:complete?'complete':'blocked',reason:complete?null:'INSUFFICIENT_PHIALS'},
  metrics:{comboTotalDamage:complete?{status:'available',value:input.stats.attackTrue*(route==='R'?2:3)+i*(route==='R'?0.125:0.375)}:{status:'unavailable',reason:'INSUFFICIENT_PHIALS'}},
  finalState:{chargeBlade:{normalPhials:complete?stock-required:stock}}
 }]))};
};
const evaluate=new Function('normalizeTechniqueIds','evaluateCurrent','root',src.slice(start,end)+';return evaluateIndependentCBMix;')(
 ids=>({ids,unresolved:ids.filter(x=>x==='canonical:')}),routeCalc,
 {ChargeBladeEngine:{profiles:{RELEASE_ROUTE:{techniqueIds:R},AED_ROUTE:{techniqueIds:H}}}});
const build=(attack,rStock,hStock)=>({
 weapon:{kind:'charge-blade'},stats:{attackTrue:attack},techniqueIds:[...R],
 chargeBladeState:{mixMode:'R_H_INDEPENDENT',shieldBoosted:true,axeBoosted:true,mode:'AXE',previousAction:'CHARGE',normalPhials:rStock,enhancedPhials:0,mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:hStock,enhancedPhials:0}},
 conditions:{target:'training-front'},target:{id:'training-room'}
});
test('distinct A/B inputs use independent R and H start states with raw sum in both channels',()=>{
 const a=evaluate(build(123.4567,2,2)),b=evaluate(build(234.5678,3,1));
 for(const x of [a,b])for(const ch of ['normal','maximum']){
  assert.equal(x.channels[ch].execution.status,'complete');
  assert.equal(x.channels[ch].metrics.comboTotalDamage.value,x.routes.R.channels[ch].metrics.comboTotalDamage.value+x.routes.H.channels[ch].metrics.comboTotalDamage.value);
 }
 assert.notEqual(a.channels.normal.metrics.comboTotalDamage.value,b.channels.normal.metrics.comboTotalDamage.value);
 assert.deepEqual(observed.map(x=>[x.route,x.stock,x.attack]),[['R',2,123.4567],['H',2,123.4567],['R',3,234.5678],['H',1,234.5678]]);
 assert.equal(a.routes.R.channels.normal.finalState.chargeBlade.normalPhials,0);
 assert.equal(a.routes.H.channels.normal.finalState.chargeBlade.normalPhials,1);
 assert.equal(b.routes.R.channels.normal.finalState.chargeBlade.normalPhials,1);
 assert.equal(b.routes.H.channels.normal.finalState.chargeBlade.normalPhials,0);
 assert.ok(Math.abs(a.channels.maximum.metrics.comboTotalDamage.value-a.channels.normal.metrics.comboTotalDamage.value-0.5)<1e-8);
});
test('missing H stock stops only H and never publishes a partial R/H sum',()=>{
 const a=evaluate(build(150,2,1)),b=evaluate(build(150,2,0.5));
 assert.equal(a.channels.normal.execution.status,'complete');
 for(const ch of ['normal','maximum']){
  assert.equal(b.routes.R.channels[ch].execution.status,'complete');
  assert.equal(b.routes.H.channels[ch].execution.status,'blocked');
  assert.equal(b.channels[ch].metrics.comboTotalDamage.status,'unavailable');
  assert.match(b.channels[ch].execution.reason,/H:INSUFFICIENT_PHIALS/);
 }
});
test('malformed canonical ID does not silently select R route',()=>{
 const b=build(150,2,2);b.techniqueIds.push('canonical:');
 assert.equal(evaluate(b).reason,'REAL_SLICE:TECHNIQUE_ID_UNRESOLVED:canonical:');
});
