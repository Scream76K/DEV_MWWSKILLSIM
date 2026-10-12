const {test}=require('node:test');const assert=require('node:assert/strict');
const {triage}=require('../tools/technique-triage-r221.cjs');
const {engine,kinds}=require('./r220-technique-audit.cjs');
test('triage accounts for 497 baseline blocked records plus KAN21 SAED and KAN24 scoped rule',()=>{const t=triage();assert.equal(t.total,499);assert.equal(t.records.filter(r=>r.techniqueId==='CB_SAED_AED_DERIVED').length,1);assert.equal(t.records.filter(r=>r.techniqueId==='LBG_NORMAL_REFERENCE_RULES').length,1);assert.equal(t.records.filter(r=>!['CB_SAED_AED_DERIVED','LBG_NORMAL_REFERENCE_RULES'].includes(r.techniqueId)).length,497);assert.equal(t.records.length,Object.values(t.routes).reduce((a,b)=>a+b,0))});
test('all weapon kinds are covered',()=>assert.deepEqual([...new Set(triage().records.map(x=>x.weaponKind))],kinds));
test('all records follow source, user, measurement escalation policy',()=>assert.deepEqual(triage().policy,['SOURCE_REVIEW','USER_DECISION','MEASUREMENT_ONLY_IF_STILL_UNKNOWN']));
test('no blocked record is automatically confirmed or sent for measurement',()=>{for(const r of triage().records){assert.equal(r.decision,'PENDING_SOURCE_REVIEW');assert.equal(r.measurementRequested,false);assert.ok(engine.get(r.weaponKind,r.techniqueId))}});
test('triage is read-only and repeatable',()=>{const before=JSON.stringify(engine.db);assert.deepEqual(triage(),triage());assert.equal(JSON.stringify(engine.db),before)});
