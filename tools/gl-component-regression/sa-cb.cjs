'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
// Invalidate stale success before any dependency, contract or fixture read.
const runId=crypto.randomUUID(),file=path.join(__dirname,'sa-cb-summary.json'),summary={runId,status:'RUNNING',outputDir:null,cases:[],numericGameAccuracyVerified:false};
const save=()=>fs.writeFileSync(file,JSON.stringify(summary,null,2)+'\n');save();
try{
 require('./verify-combined.cjs').verifyCombined();
 const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json'))),runs=path.join(__dirname,'runs');fs.mkdirSync(runs,{recursive:true});summary.outputDir=fs.mkdtempSync(path.join(runs,runId+'-sa-cb-'));
 for(const [name,count] of [['sa-regression',113],['cb-regression',342],['sa-prior-scope-regression',95],['sa-full-preservation',2357]]){
  const output=path.join(summary.outputDir,name+'.json'),child=spawnSync(process.execPath,[path.join(__dirname,name+'.cjs')],{cwd:__dirname,env:{...process.env,SA_CB_RUN_ID:runId,REPORT_FILE:output},encoding:'utf8',timeout:300000,maxBuffer:32*1024*1024});
  fs.writeFileSync(path.join(summary.outputDir,name+'.log'),String(child.stdout||'')+String(child.stderr||''));assert.equal(child.error,undefined,name+' process error');assert.equal(child.status,0,name+' nonzero exit; see fresh log');
  const report=JSON.parse(fs.readFileSync(output));assert.equal(report.runId,runId);assert.equal(report.status,'PASS');assert.equal(report.cases.length,count);assert.equal(report.cases.filter(c=>c.status==='PASS').length,count);assert.equal(report.adapterSha256,contract.candidateAdapterSha256);summary.cases.push({name,status:'PASS',checks:count,processExitCode:child.status});
 }
 require('./verify-combined.cjs').verifyCombined();summary.status='PASS';save();console.log(JSON.stringify(summary));
}catch(error){summary.status='FAIL';summary.error=error.stack;save();throw error;}
