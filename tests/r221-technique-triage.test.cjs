const {test}=require('node:test');const assert=require('node:assert/strict');
const {triage}=require('../tools/technique-triage-r221.cjs');
const {engine,kinds}=require('./r220-technique-audit.cjs');
test('triage retains the PR #4 blocked inventory and the unverified arc impact record',()=>{
 const report=triage(),{blocked}=require('./fixtures/technique-inventory-pr4.json');
 const keys=report.records.map(r=>r.weaponKind+':'+r.techniqueId);
 assert.deepEqual(keys.sort(),[...blocked,'bow:BOW_ARC_1_IMPACT_ONLY'].sort());
 assert.equal(report.total,keys.length);
 assert.equal(keys.length,Object.values(report.routes).reduce((a,b)=>a+b,0));
});
test('all weapon kinds are covered',()=>assert.deepEqual([...new Set(triage().records.map(x=>x.weaponKind))],kinds));
test('all records follow source, user, measurement escalation policy',()=>assert.deepEqual(triage().policy,['SOURCE_REVIEW','USER_DECISION','MEASUREMENT_ONLY_IF_STILL_UNKNOWN']));
test('no blocked record is automatically confirmed or sent for measurement',()=>{for(const r of triage().records){assert.equal(r.decision,'PENDING_SOURCE_REVIEW');assert.equal(r.measurementRequested,false);assert.ok(engine.get(r.weaponKind,r.techniqueId))}});
test('triage is read-only and repeatable',()=>{const before=JSON.stringify(engine.db);assert.deepEqual(triage(),triage());assert.equal(JSON.stringify(engine.db),before)});
