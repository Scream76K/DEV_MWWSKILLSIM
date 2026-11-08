'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
// Invalidate success before reading any contract, module or fixture.
const runId=crypto.randomUUID(),file=path.join(__dirname,'bounded-summary.json'),summary={runId,status:'RUNNING',outputDir:null,cases:[],numericGameAccuracyVerified:false};
const save=()=>fs.writeFileSync(file,JSON.stringify(summary,null,2)+'\n');save();
try{
 require('./verify-combined.cjs').verifyCombined();
 const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json')));
 const runs=path.join(__dirname,'runs');fs.mkdirSync(runs,{recursive:true});summary.outputDir=fs.mkdtempSync(path.join(runs,runId+'-bounded-'));
 for(const [name,count] of [['pierce',210],['airborne',135],['bounded-coexistence',68],['thunder',8]]){
  const output=path.join(summary.outputDir,name+'.json');
  const args=name==='thunder'?['--test','--test-reporter=tap','gl-thunder-full.test.cjs','gl-thunder-predicate.test.cjs','regression-71.test.cjs']:[name+'.cjs'];
  const child=spawnSync(process.execPath,args,{cwd:__dirname,env:{...process.env,BOUNDED_RUN_ID:runId,BOUNDED_RESULTS_DIR:summary.outputDir,REPORT_FILE:output},encoding:'utf8',timeout:300000,maxBuffer:32*1024*1024});
  fs.writeFileSync(path.join(summary.outputDir,name+'.log'),String(child.stdout||'')+String(child.stderr||''));
  assert.equal(child.error,undefined,name+' process error');assert.equal(child.status,0,name+' nonzero exit; see fresh log');
  if(name==='thunder'){
   assert.match(child.stdout,new RegExp('^# tests '+count+'$','m'));assert.match(child.stdout,new RegExp('^# pass '+count+'$','m'));assert.match(child.stdout,/^# fail 0$/m);assert.match(child.stdout,/^# skipped 0$/m);
   const retained=JSON.parse(fs.readFileSync(path.join(summary.outputDir,'regression-71.json')));assert.equal(retained.status,'PASS');assert.equal(retained.cases.length,71);assert.equal(retained.counts.newlyAvailable,2);assert.equal(JSON.parse(fs.readFileSync(path.join(summary.outputDir,'full-adapter-negatives.json'))).length,143);
  }else{
   const report=JSON.parse(fs.readFileSync(output));assert.equal(report.runId,runId);assert.equal(report.status,'PASS');assert.equal(report.cases.length,count);assert.equal(report.counts.passed,count);assert.equal(report.counts.failed,0);assert.ok(report.cases.every(c=>c.status==='PASS'));assert.equal(report.adapterSha256,contract.candidateAdapterSha256);assert.equal(report.baselineAdapterSha256,contract.boundedBaselineAdapter.sha256);
  }
  summary.cases.push({name,processExitCode:child.status,checks:count,status:'PASS'});
 }
 require('./verify-combined.cjs').verifyCombined();summary.status='PASS';save();console.log(JSON.stringify(summary));
}catch(error){summary.status='FAIL';summary.error=error.stack;save();throw error;}
