'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {engine}=require('./r220-technique-audit.cjs');
for(const [id,mv]of Object.entries({CB_ELEMENT_DISCHARGE_1:[51],CB_ELEMENT_DISCHARGE_2:[25,58]}))test('r236 provisional motion values are not advertised as fully verified: '+id,()=>{
 const record=engine.get('charge-blade',id),audit=engine.audit('charge-blade',id);
 assert.notEqual(audit.verificationStatus,'VERIFIED');
 assert.equal(audit.numericStatus,'PROVISIONALLY_ADOPTED');
 assert.equal(audit.fieldVerification.motionValues.status,'PROVISIONALLY_ADOPTED');
 assert.ok(audit.evidence.some(e=>e.ref==='USER_CB_R236_PROVISIONAL_MV'&&e.registered));
 assert.deepEqual(Array.from(record.hits,h=>h.mv),mv);
 assert.equal(engine.hits('charge-blade',id).length,mv.length,'existing provisional calculation eligibility is retained');
});
