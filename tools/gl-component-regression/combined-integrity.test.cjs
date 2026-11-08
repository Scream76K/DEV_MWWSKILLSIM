'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
for(const mutation of ['missing-contract','baseline-adapter','cm-module','bonus-module','adapter-and-manifest','missing-reference','fixture-module'])test('combined driver rejects '+mutation+' without preserving stale PASS',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'combined-integrity-'));
 try{
  fs.cpSync(__dirname,tmp,{recursive:true,filter:p=>!p.startsWith(path.join(__dirname,'runs'))});
  const contract=JSON.parse(fs.readFileSync(path.join(tmp,'fixtures-contract.json')));
  fs.writeFileSync(path.join(tmp,'combined-summary.json'),JSON.stringify({runId:'stale',status:'PASS'}));
  if(mutation==='missing-contract')fs.rmSync(path.join(tmp,'fixtures-contract.json'));
  else if(mutation==='missing-reference')fs.rmSync(path.join(tmp,'reference-pinned',contract.referenceFiles[0].path));
  else if(mutation==='adapter-and-manifest'){
   const file=path.join(tmp,'work/input/hope-hammer-browser-adapter.js');fs.appendFileSync(file,'\n// tampered\n');
   const manifest=path.join(tmp,'work/harness/expected-inputs.json'),entries=JSON.parse(fs.readFileSync(manifest));entries.find(e=>e.path==='hope-hammer-browser-adapter.js').sha256=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');fs.writeFileSync(manifest,JSON.stringify(entries));
  }else{const file={'baseline-adapter':'baseline-adapter.js','cm-module':'charge-master.cjs','bonus-module':'bonus-runtime.cjs','fixture-module':'work/harness/skill-plan.cjs'}[mutation];fs.appendFileSync(path.join(tmp,file),'\n// tampered\n');}
  const r=spawnSync(process.execPath,[path.join(tmp,'combined.cjs')],{encoding:'utf8',timeout:10000});assert.equal(r.error,undefined);assert.equal(r.status,1);
  const summary=JSON.parse(fs.readFileSync(path.join(tmp,'combined-summary.json')));assert.equal(summary.status,'FAIL');assert.notEqual(summary.runId,'stale');assert.equal(summary.outputDir,null);assert.deepEqual(summary.cases,[]);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
