'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createSourcedPhysicalFormula}=require('../v10-six-layer-foundation/min8/sourced-physical-formula.cjs');
const gameVersion='1.042.00.02';
const evidence=(value)=>({value,evidenceRef:'SOURCED_TEST_FIXTURE',gameVersion});
const make=(sharpness=1.32)=>{
 const received=[];
 const bridge=createSourcedPhysicalFormula({
  calculate:q=>{received.push({stage:'calculate',q});return {p:q.attack*q.mv/100*q.hz/100*q.sharp}},
  resolveSharpness:ctx=>{received.push({stage:'sharpness',ctx});return evidence(sharpness)},
  resolveHitzone:ctx=>{received.push({stage:'hitzone',ctx});return evidence(40)},
  resolvePartModifier:ctx=>{received.push({stage:'part',ctx});return evidence(1)},
  expectedGameVersion:gameVersion
 });
 return {bridge,received};
};
const input={coefficient:80,coefficientUnit:'MV',parameters:{hitIndex:0},target:{id:'test-body'},stats:{attack:200,affinity:0,element:0},build:{equipment:{}},state:{mode:'DEFAULT'}};
test('non-CB physical formula preserves exact legacy arithmetic with optional provenance',()=>{
 const {bridge,received}=make();
 const old=bridge(input),current=bridge({...input,techniqueId:'GS_CHARGED_SLASH_3',componentId:'GS_CHARGED_SLASH_3:physical:0'});
 assert.equal(old.status,'available');
 assert.deepEqual(current,old);
 assert.equal(old.value,200*80/100*40/100*1.32);
 const sharp=received.filter(r=>r.stage==='sharpness').map(r=>r.ctx);
 assert.equal(sharp.length,2);
 assert.equal(sharp[0].techniqueId,undefined);
 assert.equal(sharp[0].componentId,undefined);
 assert.equal(sharp[1].techniqueId,'GS_CHARGED_SLASH_3');
 assert.equal(sharp[1].componentId,'GS_CHARGED_SLASH_3:physical:0');
 assert.deepEqual(sharp[1].parameters,input.parameters);
 assert.equal(sharp[1].gameVersion,gameVersion);
});
test('provenance is passed only to sharpness; context never silently modifies target or canonical attack',()=>{
 const {bridge,received}=make(1);
 const res=bridge({...input,techniqueId:'CB_AED',componentId:'CB_AED:physical:0'});
 assert.equal(res.status,'available');
 const zone=received.find(r=>r.stage==='hitzone').ctx;
 assert.equal(zone.target.id,'test-body');
 assert.equal(zone.techniqueId,undefined);
 assert.equal(zone.componentId,undefined);
 const calc=received.find(r=>r.stage==='calculate').q;
 assert.equal(calc.attack,200);
 assert.equal(calc.mv,80);
 assert.equal(calc.sharp,1);
});
test('unresolved sharpness remains unavailable, never coerces to unproven damage',()=>{
 const {bridge}=make(0);
 const r=bridge({...input,techniqueId:'CB_SHIELD_THRUST',componentId:'CB_SHIELD_THRUST:physical:0'});
 assert.equal(r.status,'unavailable');
 assert.equal(r.reason,'PHYSICAL_SHARPNESS_UNRESOLVED');
});
test('standalone and bundled engines stay in sync on provenance and zero-cost priority guard',()=>{
 const standalone=[
  fs.readFileSync(path.join(__dirname,'../v10-six-layer-foundation/min8/engine.cjs'),'utf8'),
  fs.readFileSync(path.join(__dirname,'../v10-six-layer-foundation/min8/real-one-hit-pipeline.cjs'),'utf8'),
  fs.readFileSync(path.join(__dirname,'../v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'),'utf8'),
  fs.readFileSync(path.join(__dirname,'../v10-six-layer-foundation/min8/sourced-physical-formula.cjs'),'utf8')
 ];
 const bundled=fs.readFileSync(path.join(__dirname,'../himmel-real-browser-bundle.js'),'utf8');
 const tokens=[
  'techniqueId:ev.techniqueId,componentId:c.id',
  'resource.consumeNormalPhials>0&&actualKey!==resource.resourceKey',
  "r.ownerDecision?.scope==='CB_H_EXACT_ROUTE_POWER_ELEMENT_SHIELD_THRUST'",
  'resolveSharpness({build,state,parameters,componentId,techniqueId,gameVersion:expectedGameVersion})'
 ];
 for(let i=0;i<tokens.length;i++){
  assert.ok(standalone[i].includes(tokens[i]),'standalone '+i+' lost contract');
  assert.equal(bundled.split(tokens[i]).length-1,2,'both bundled aliases must match '+i);
 }
});
