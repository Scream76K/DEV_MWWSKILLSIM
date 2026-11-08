'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
for(const mutation of ['missing-contract','baseline','sa','cb','prior','preservation','selection','adapter-and-manifest','missing-reference','fixture-module'])test('SA/CB driver rejects '+mutation+' without stale PASS',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sa-cb-integrity-'));
 try{
  fs.cpSync(__dirname,tmp,{recursive:true,filter:p=>!p.startsWith(path.join(__dirname,'runs'))});const contract=JSON.parse(fs.readFileSync(path.join(tmp,'fixtures-contract.json')));fs.writeFileSync(path.join(tmp,'sa-cb-summary.json'),JSON.stringify({runId:'stale',status:'PASS'}));
  if(mutation==='missing-contract')fs.rmSync(path.join(tmp,'fixtures-contract.json'));
  else if(mutation==='missing-reference')fs.rmSync(path.join(tmp,'reference-pinned',contract.referenceFiles[0].path));
  else if(mutation==='adapter-and-manifest'){const file=path.join(tmp,'work/input/hope-hammer-browser-adapter.js');fs.appendFileSync(file,'\n// corruption\n');const manifest=path.join(tmp,'work/harness/expected-inputs.json'),entries=JSON.parse(fs.readFileSync(manifest));entries.find(e=>e.path==='hope-hammer-browser-adapter.js').sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');fs.writeFileSync(manifest,JSON.stringify(entries));}
  else{const file={baseline:'sa-cb-baseline-adapter.js',sa:'sa-regression.cjs',cb:'cb-regression.cjs',prior:'sa-prior-scope-regression.cjs',preservation:'sa-full-preservation.cjs',selection:'sa-cb-plan.cjs','fixture-module':'work/harness/skill-plan.cjs'}[mutation];fs.appendFileSync(path.join(tmp,file),'\n// corruption\n');}
  const child=spawnSync(process.execPath,[path.join(tmp,'sa-cb.cjs')],{encoding:'utf8',timeout:10000});assert.equal(child.error,undefined);assert.equal(child.status,1);const report=JSON.parse(fs.readFileSync(path.join(tmp,'sa-cb-summary.json')));assert.equal(report.status,'FAIL');assert.notEqual(report.runId,'stale');assert.equal(report.outputDir,null);assert.deepEqual(report.cases,[]);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
for(const fault of ['nonzero','signal','missing-report','wrong-run-id','incomplete','wrong-count'])test('SA/CB parent rejects '+fault+' child result',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sa-cb-child-'));
 try{
  fs.cpSync(__dirname,tmp,{recursive:true,filter:p=>!p.startsWith(path.join(__dirname,'runs'))});fs.writeFileSync(path.join(tmp,'sa-cb-summary.json'),JSON.stringify({runId:'stale',status:'PASS'}));
  const prelude=`const cp=require('node:child_process'),fs=require('node:fs');cp.spawnSync=function(exe,args,options){const fault=${JSON.stringify(fault)};if(fault!=='missing-report')fs.writeFileSync(options.env.REPORT_FILE,JSON.stringify({runId:fault==='wrong-run-id'?'STALE':options.env.SA_CB_RUN_ID,status:fault==='incomplete'?'RUNNING':'PASS',cases:Array.from({length:fault==='wrong-count'?1:113},()=>({status:'PASS'}))}));return {status:fault==='nonzero'?17:fault==='signal'?null:0,signal:fault==='signal'?'SIGKILL':null,stdout:'',stderr:''};};`;
  const child=spawnSync(process.execPath,['-e',prelude+'require('+JSON.stringify(path.join(tmp,'sa-cb.cjs'))+')'],{encoding:'utf8',timeout:10000});assert.equal(child.error,undefined);assert.equal(child.status,1);const report=JSON.parse(fs.readFileSync(path.join(tmp,'sa-cb-summary.json')));assert.equal(report.status,'FAIL');assert.notEqual(report.runId,'stale');assert.deepEqual(report.cases,[]);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
