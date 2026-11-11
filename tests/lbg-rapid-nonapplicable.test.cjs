'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('standard normal rapid non-applicable skills retain numerical and scope boundaries',()=>{const root=path.resolve(__dirname,'..'),r=spawnSync(process.execPath,[path.join(root,'tools/lbg-rapid-nonapplicable-proof.cjs'),root],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(r.status,0,r.stdout+r.stderr);const report=JSON.parse(r.stdout);assert.equal(report.failures.length,0);assert.equal(report.runtimeUnchanged,true);});
