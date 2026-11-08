'use strict';
const fs=require('fs'),assert=require('assert/strict'),path=require('path'),crypto=require('crypto');
// Invalidate a previous success before any local module, fixture, or plan is read.
const runId=crypto.randomUUID(),summary={runId,outputDir:null,status:'RUNNING',scope:'ISOLATED_CANDIDATE_NOT_ADOPTED',cases:[],numericGameAccuracyVerified:false};
const summaryFile=path.join(__dirname,'regression-summary.json');
fs.writeFileSync(summaryFile,JSON.stringify(summary,null,2));
try{
 const work=path.join(__dirname,'work'),old=path.join(__dirname,'reference-pinned');
 const read=p=>JSON.parse(fs.readFileSync(p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 const contract=read(path.join(__dirname,'fixtures-contract.json'));
 for(const e of contract.runtimeFiles)assert.equal(hash(fs.readFileSync(path.join(__dirname,e.destination))),e.sha256,'Runtime mismatch: '+e.destination);
 for(const e of contract.fixtureHarnessFiles)assert.equal(hash(fs.readFileSync(path.join(work,'harness',e.path))),e.sha256,'Fixture harness mismatch: '+e.path);
 for(const e of contract.referenceFiles)assert.equal(hash(fs.readFileSync(path.join(old,e.path))),e.sha256,'Pinned reference mismatch: '+e.path);
 require('./verify-inputs.cjs').verifyPreparedInputs(work,contract);
 const {runFreshCase}=require('./run-fresh-case.cjs');
 const plan=require('./work/harness/gl-affinity-plan.cjs').makeGlAffinityPlan(read(work+'/input/normalized-data.json'),read(work+'/harness/skill-sources/classification.candidate.json'),read(work+'/harness/skill-sources/raw-skills.json'));
 fs.mkdirSync(path.join(__dirname,'runs'),{recursive:true});
 const outputDir=fs.mkdtempSync(path.join(__dirname,'runs',runId+'-'));summary.outputDir=outputDir;
for(const job of plan.cases){
 const filename='gl-affinity-'+job.key.replaceAll(':','-')+'.json';
 const {report:r,processExitCode,outputFile}=runFreshCase({harness:work+'/harness/gl-affinity.cjs',key:job.key,runId,outputDir});
 const remaining=job.blockedModifiers.filter(x=>!['弱点特効','力の解放'].includes(x));
 for(const ch of ['normal','maximum']){
  const p=r.componentComparison[ch];
  if(remaining.length){assert.equal(p.after.total.status,'unavailable');assert.deepEqual([...p.blockedModifiers].sort(),remaining.sort());}
  else{assert.equal(p.after.total.status,'available');assert.equal(p.after.shelling.available,p.after.shelling.count);}
  if(fs.existsSync(old+'/'+filename)){
   const prior=read(old+'/'+filename).componentComparison[ch];
   assert.deepEqual(p.after.cutting,prior.after.cutting,'Cutting must be byte-equivalent '+job.key);
   assert.deepEqual(p.after.element,prior.after.element,'Element must be byte-equivalent '+job.key);
   assert.deepEqual(p.before,prior.before,'Empty baseline must be unchanged '+job.key);
  }
  if(job.matchedNoSkillControlPossible&&!remaining.length&&p.after.shelling.count)assert.equal(p.shellDelta,0,'Affinity must not affect shelling '+job.key);
 }
 assert.equal(r.savedDataUnchanged,true);assert.equal(r.baselineRestored,true);assert.equal(r.memorySourceUnchanged,true);assert.equal(r.inputFilesUnchanged,true);
 summary.cases.push({key:job.key,runId:r.runId,processExitCode,outputFile,remainingBlockers:remaining,status:'PASS',cuttingComparedToPinned:fs.existsSync(old+'/'+filename)});
 console.log('PASS '+job.key+' residual='+remaining.join('/'));
}
summary.counts={passed:summary.cases.length,originalResolved:summary.cases.filter(c=>c.key.startsWith('original:')&&!c.remainingBlockers.length).length,originalStillBlocked:summary.cases.filter(c=>c.key.startsWith('original:')&&c.remainingBlockers.length).length};
summary.status='PASS';fs.writeFileSync(__dirname+'/regression-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary.counts));

}catch(error){summary.status='FAIL';summary.error=error.stack;fs.writeFileSync(__dirname+'/regression-summary.json',JSON.stringify(summary,null,2));throw error;}
