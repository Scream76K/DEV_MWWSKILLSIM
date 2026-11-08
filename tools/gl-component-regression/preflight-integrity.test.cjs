'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json')));
const changes=[['missing contract','fixtures-contract.json','remove'],['missing helper','run-fresh-case.cjs','remove'],['missing pinned reference','reference-pinned/'+contract.referenceFiles[0].path,'remove'],...contract.fixtureHarnessFiles.map(e=>['changed '+e.path,'work/harness/'+e.path,'change'])];
for(const [name,file,mode] of changes)test(name+' invalidates old PASS before any case executes',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gl-preflight-'));
 try{
  fs.cpSync(__dirname,tmp,{recursive:true,filter:p=>!p.startsWith(path.join(__dirname,'runs'))});
  fs.writeFileSync(path.join(tmp,'regression-summary.json'),JSON.stringify({status:'PASS',runId:'obsolete',counts:{passed:37}}));
  if(mode==='remove')fs.rmSync(path.join(tmp,file));else fs.appendFileSync(path.join(tmp,file),'\n ');
  const r=spawnSync(process.execPath,[path.join(tmp,'regression.cjs')],{encoding:'utf8',timeout:10000});assert.equal(r.error,undefined);assert.equal(r.status,1);
  const s=JSON.parse(fs.readFileSync(path.join(tmp,'regression-summary.json')));assert.equal(s.status,'FAIL');assert.notEqual(s.runId,'obsolete');assert.deepEqual(s.cases,[]);assert.equal(s.outputDir,null);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
