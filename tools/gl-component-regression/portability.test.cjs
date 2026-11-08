'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {runFreshCase}=require('./run-fresh-case.cjs');
test('copied collector reads copied input; tampered copy fails despite intact original',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gl-portable-')),source=path.join(__dirname,'work'),copy=path.join(tmp,'work'),outputDir=path.join(tmp,'output');
 try {
  fs.cpSync(source,copy,{recursive:true,filter:p=>!p.startsWith(path.join(source,'output'))});fs.mkdirSync(outputDir);
  const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json')));fs.copyFileSync(path.join(__dirname,'fixtures-contract.json'),path.join(tmp,'fixtures-contract.json'));
  for(const e of contract.runtimeFiles.filter(e=>!e.destination.startsWith('work/')))fs.copyFileSync(path.join(__dirname,e.destination),path.join(tmp,e.destination));
  const harness=path.join(copy,'harness/gl-affinity.cjs'),key='original:57:1:gunlance';
  assert.ok(!fs.readFileSync(harness,'utf8').includes('/workspace/'));
  const result=runFreshCase({harness,key,runId:crypto.randomUUID(),outputDir});assert.equal(result.report.componentComparison.normal.after.total.status,'available');
  const original=fs.readFileSync(path.join(source,'input/hope-hammer-browser-adapter.js'));
  fs.appendFileSync(path.join(copy,'input/hope-hammer-browser-adapter.js'),'\n// deliberate corruption\n');
  assert.throws(()=>runFreshCase({harness,key,runId:crypto.randomUUID(),outputDir}),/CHILD_EXIT/);
  assert.deepEqual(fs.readFileSync(path.join(source,'input/hope-hammer-browser-adapter.js')),original);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
