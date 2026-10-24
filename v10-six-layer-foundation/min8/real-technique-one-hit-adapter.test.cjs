'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {adaptOrdinaryPhysicalHit}=require('./real-technique-one-hit-adapter.cjs');
const source=require('../../docs/reports/r250-stage5/evidence/technique/runtime-records.json');
const weaponType='hammer', techniqueId='HAM_SIDE_SWING';
const record=source.db[weaponType][techniqueId];
const base={weaponType,techniqueId,record,dbVersion:'1.042.00.02'};
test('real Technique DB ordinary hit remains gated when element disposition is unresolved',()=>{
 assert.equal(record.verificationStatus,'VERIFIED');
 assert.throws(()=>adaptOrdinaryPhysicalHit(base),/REAL_SLICE:ELEMENT_COMPONENT_PENDING/);
});
test('real DB physical-only slice preserves MV, revision and evidence when zero element is explicitly resolved',()=>{
 const t=adaptOrdinaryPhysicalHit({...base,elementContext:{displayElement:0,effectsResolved:true,activeElementEffects:[]}});
 assert.equal(t.events.length,1);
 assert.equal(t.events[0].components[0].coefficient,record.hits[0].mv);
 assert.equal(t.events[0].components[0].source,record.evidenceRefs[0]);
 assert.equal(t.revision,String(record.revision));
 assert.equal(t.excludedElement.coefficient,record.hits[0].elementModifier);
 assert.equal(t.excludedElement.reason,'CONFIRMED_ZERO_ELEMENT_NO_EFFECTS');
});
test('cannot suppress sourced element component with unresolved or active element effects',()=>{
 for(const elementContext of [{displayElement:0,effectsResolved:false,activeElementEffects:[]},{displayElement:0,effectsResolved:true,activeElementEffects:['some-effect']},{displayElement:30,effectsResolved:true,activeElementEffects:[]}]){
  assert.throws(()=>adaptOrdinaryPhysicalHit({...base,elementContext}),/REAL_SLICE:ELEMENT_COMPONENT_PENDING/);
 }
});
