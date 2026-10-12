'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {engine}=require('./r220-technique-audit.cjs');
const fs=require('node:fs');
const expected=[72,77,88], old=[65,70,80], elems=[1.1,1.2,1.5], stuns=[40,45,55];
test('r234: approved hammer jump charge motion values are adopted, source history preserved',()=>{
 for(let i=1;i<=3;i++){
  const t=engine.db.hammer[`HAM_JUMP_CHARGE_${i}`];
  assert.deepEqual(Array.from(t.hits,h=>h.mv),[expected[i-1]]);
  assert.equal(t.revisionHistory[0].beforeMv,old[i-1]);
  assert.equal(t.revisionHistory[0].afterMv,expected[i-1]);
  assert.equal(t.fieldVerification.motionValues.status,'ADOPTED');
  assert.equal(t.hits[0].elementModifier,elems[i-1]);
  assert.deepEqual(Array.from(t.stunValues),[stuns[i-1]]);
  assert.equal(t.calculationStatus,'EVIDENCE_GATED');
  assert.equal(engine.audit('hammer',t.techniqueId).calculable,false);
  assert.deepEqual(Array.from(engine.motionValues('hammer',t.techniqueId)),[expected[i-1]]);
 }
});
test('r234: full historical hammer audit now matches all 23 move records',()=>{
 const evidence=JSON.parse(fs.readFileSync('HAMMER_FULL_DB_AUDIT_r232.json','utf8'));
 for(const row of evidence.rows){const t=engine.db.hammer[row.techniqueId];assert.deepEqual(Array.from(t.hits,h=>h.mv),row.historyAfterHits,row.techniqueId);}
});
