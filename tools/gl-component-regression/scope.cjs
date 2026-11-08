'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
// Invalidate success before reading any contract, module or fixture.
const runId=crypto.randomUUID(),file=path.join(__dirname,'scope-summary.json'),summary={runId,status:'RUNNING',outputDir:null,cases:[],numericGameAccuracyVerified:false};
const save=()=>fs.writeFileSync(file,JSON.stringify(summary,null,2)+'\n');save();
try{
 require('./verify-combined.cjs').verifyCombined();
 const runs=path.join(__dirname,'runs');fs.mkdirSync(runs,{recursive:true});summary.outputDir=fs.mkdtempSync(path.join(runs,runId+'-scope-'));
 for(const [name,count] of [['conversion',266],['partbreaker',107],['coexistence',27]]){
  const output=path.join(summary.outputDir,name+'.json');
  const child=spawnSync(process.execPath,[name+'.cjs'],{cwd:__dirname,env:{...process.env,SCOPE_RUN_ID:runId,REPORT_FILE:output},encoding:'utf8',timeout:300000,maxBuffer:32*1024*1024});
  fs.writeFileSync(path.join(summary.outputDir,name+'.log'),String(child.stdout||'')+String(child.stderr||''));
  assert.equal(child.error,undefined,name+' process error');assert.equal(child.status,0,name+' nonzero exit; see fresh log');
  const report=JSON.parse(fs.readFileSync(output));assert.equal(report.runId,runId);assert.equal(report.status,'PASS');assert.equal(report.cases.length,count);assert.equal(report.counts.passed,count);assert.equal(report.counts.failed,0);assert.ok(report.cases.every(c=>c.status==='PASS'));assert.equal(report.adapterSha256,JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json'))).candidateAdapterSha256);
  summary.cases.push({name,processExitCode:child.status,assertions:count,status:'PASS'});
 }
 require('./verify-combined.cjs').verifyCombined();summary.status='PASS';save();console.log(JSON.stringify(summary));
}catch(error){summary.status='FAIL';summary.error=error.stack;save();throw error;}
