'use strict';
const {test}=require('node:test'); const assert=require('node:assert/strict'); const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
test('r233 audit gate is reproducible and preserves historical candidates without numerical promotion',()=>{
 execFileSync(process.execPath,['tools/hammer-version-gate-r233.cjs']);
 const g=JSON.parse(fs.readFileSync('HAMMER_VERSION_GATE_r233.json','utf8'));
 assert.equal(g.jumpCharge.length,0);
 assert.deepEqual(g.jumpCharge.map(x=>x.historyAfterHits[0]),[]);
 assert.deepEqual(g.jumpCharge.map(x=>x.dbHits[0]),[]);
 assert.equal(g.summary.numericChanges,0);
 assert.equal(g.summary.gameVersionVerified,0);
 assert.equal(g.focusShinten.verification,'FORMULA_AND_APPLICABILITY_NOT_ESTABLISHED');
});
