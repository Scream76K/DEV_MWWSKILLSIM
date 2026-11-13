'use strict';
const test = require('node:test'), a = require('node:assert/strict');
const { partition, validate } = require('../tools/integration-regression/ci-partition.cjs');
const heavy = ['tests/lbg-rapid-heroics.test.cjs', 'tests/lbg-rapid-resolved-attack.test.cjs'];
const c = { tests: [...heavy, 'tests/other.test.cjs'], expectedTests: 6 };
const id = { sha: 'a'.repeat(40), run: '123', attempt: '2', contract: 'b'.repeat(64) };
function good() { return partition(c).map(p => ({ name:p.name, identity:id, tests:p.tests, expectedTests:p.expectedTests, status:'PASS', childExit:0, childSignal:null, counts:{tests:p.expectedTests,passed:p.expectedTests,failed:0,skipped:0,cancelled:0} })); }
test('exact disjoint coverage and count conservation', () => { const p=partition(c); a.deepEqual(p.map(x=>x.expectedTests),[1,1,4]); a.deepEqual(p.flatMap(x=>x.tests).sort(),[...c.tests].sort()); a.equal(validate(c,id,good()).tests,6); });
test('supports ID164 extra assertion without reverting contract',()=>a.deepEqual(partition({...c,expectedTests:7}).map(x=>x.expectedTests),[1,1,5]));
test('reject duplicate test',()=>a.throws(()=>partition({...c,tests:[...c.tests,c.tests[0]]})));
test('reject missing heavy test',()=>a.throws(()=>partition({...c,tests:c.tests.slice(1)})));
test('reject invalid total',()=>a.throws(()=>partition({...c,expectedTests:2})));
test('reject missing report',()=>a.throws(()=>validate(c,id,good().slice(1))));
test('reject duplicate report',()=>{let r=good();r[1]=r[0];a.throws(()=>validate(c,id,r));});
for (const k of ['sha','run','attempt','contract']) test('reject mismatched '+k,()=>{let r=good();r[0].identity={...id,[k]:'invalid'};a.throws(()=>validate(c,id,r));});
for (const k of ['tests','passed','failed','skipped','cancelled']) test('reject incorrect '+k,()=>{let r=good();r[0].counts[k]++;a.throws(()=>validate(c,id,r));});
test('reject FAIL, nonzero, signal, swapped coverage and expected count',()=>{for (const patch of [{status:'FAIL'},{childExit:1},{childSignal:'SIGTERM'},{tests:['tests/unrelated.test.cjs']},{expectedTests:2}]) {let r=good();Object.assign(r[0],patch);a.throws(()=>validate(c,id,r));}});
