"use strict";
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
// Invalidate success before reading any contract, dependency or private fixture.
const runId=crypto.randomUUID(),file=path.join(__dirname,'combined-summary.json'),summary={runId,status:'RUNNING',outputDir:null,cases:[],numericGameAccuracyVerified:false};
const save=()=>fs.writeFileSync(file,JSON.stringify(summary,null,2)+'\n');save();
try{
 require('./verify-combined.cjs').verifyCombined();
 const runs=path.join(__dirname,'runs');fs.mkdirSync(runs,{recursive:true});summary.outputDir=fs.mkdtempSync(path.join(runs,runId+'-combined-'));
 for(const [name,args] of [['charge-master',['charge-master.cjs']],['gl-bonus',['--test','gl-bonus-full.test.cjs','gl-bonus-predicate.test.cjs']]]){
  const output=path.join(summary.outputDir,name+'.json');
  const child=spawnSync(process.execPath,args,{cwd:__dirname,env:{...process.env,COMBINED_RUN_ID:runId,REPORT_FILE:output},encoding:'utf8',timeout:300000,maxBuffer:32*1024*1024});
  fs.writeFileSync(path.join(summary.outputDir,name+'.log'),String(child.stdout||'')+String(child.stderr||''));
  assert.equal(child.error,undefined,name+' process error');assert.equal(child.status,0,name+' nonzero exit; see fresh log');
  if(name==='charge-master'){const report=JSON.parse(fs.readFileSync(output));assert.equal(report.runId,runId);assert.equal(report.status,'PASS');assert.equal(report.counts.passed,96);assert.equal(report.counts.failed,0);}
  summary.cases.push({name,processExitCode:child.status,status:'PASS'});
 }
 require('./verify-combined.cjs').verifyCombined();summary.status='PASS';save();console.log(JSON.stringify(summary));
}catch(error){summary.status='FAIL';summary.error=error.stack;save();throw error;}
