'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
test('standard LBG rapid First and Force apply to consumed-round Hits without changing inputs',()=>{
 const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'..'));
 const run=spawnSync(process.execPath,[path.join(root,'tools/lbg-rapid-shot-skills-proof.cjs'),root],{encoding:'utf8',maxBuffer:32*1024*1024});
 assert.equal(run.error,undefined);assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
 const report=JSON.parse(run.stdout);assert.equal(report.failures.length,0);assert.equal(report.runtimeUnchanged,true);assert.equal(report.rows.length,179);
});
