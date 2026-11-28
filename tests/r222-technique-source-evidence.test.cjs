'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const {audit}=require('../tools/technique-source-evidence-r222.cjs');
test('r222: review inventory retains all baseline IDs and matches current triage',()=>{
 const report=audit(),{blocked}=require('./fixtures/technique-inventory-pr4.json');
 const key=r=>r.weaponKind+':'+r.techniqueId;
 const keys=report.records.map(key).sort();
 assert.deepEqual(keys,[...blocked,'bow:BOW_ARC_1_IMPACT_ONLY'].sort());
 assert.deepEqual(keys,require('../tools/technique-triage-r221.cjs').triage().records.map(key).sort());
 assert.equal(report.total,keys.length);
});
test('r222: source review is never silently marked complete',()=>{for(const r of audit().records){assert.equal(r.sourceReviewComplete,false);assert.equal(r.userDecisionRequested,false);assert.equal(r.measurementRequested,false)}});
test('r222: conflicting sources are routed for review, not auto adoption',()=>{const x=audit();assert.ok(x.conflictFlagged>0);for(const r of x.records.filter(r=>r.conflicts.length))assert.equal(r.decisionRoute,'USER_REVIEW_AFTER_SOURCE_RECONCILIATION')});
test('r222: every record has explicit next route and reference version',()=>{for(const r of audit().records){assert.ok(r.decisionRoute);assert.equal(r.referenceGameVersion,'1.042.00.02');assert.ok(r.sourceEvidence)}});
test('r222: route totals reconcile with inventory',()=>{const x=audit();assert.equal(Object.values(x.routes).reduce((a,b)=>a+b,0),x.total)});
