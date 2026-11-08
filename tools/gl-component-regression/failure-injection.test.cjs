'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {runFreshCase}=require('./run-fresh-case.cjs');
function fixture(source){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gl-failure-'));const harness=path.join(dir,'child.cjs');fs.writeFileSync(harness,source);return {dir,harness};}
const writer=`const fs=require('fs'),path=require('path');const key=process.argv[3],runId=process.argv[4],dir=process.argv[5];const file=path.join(dir,'gl-affinity-'+key.replaceAll(':','-')+'.json');`;
for(const [name,code,expected,extra] of [
 ['nonzero exit despite plausible JSON',writer+`fs.writeFileSync(file,JSON.stringify({key,runId,status:'COLLECTED'}));process.exit(7);`,'CHILD_EXIT'],
 ['success without output','process.exit(0)','CURRENT_OUTPUT_MISSING'],
 ['wrong run id',writer+`fs.writeFileSync(file,JSON.stringify({key,runId:'old',status:'COLLECTED'}));`,'RUN_ID_MISMATCH'],
 ['wrong case key',writer+`fs.writeFileSync(file,JSON.stringify({key:'other',runId,status:'COLLECTED'}));`,'CASE_KEY_MISMATCH'],
 ['incomplete collection',writer+`fs.writeFileSync(file,JSON.stringify({key,runId,status:'HARNESS_FAILURE'}));`,'COLLECTION_INCOMPLETE'],
 ['timeout','setTimeout(()=>{},10000)','CHILD_PROCESS_ERROR',{timeout:30}],
 ['launch error','', 'CHILD_PROCESS_ERROR',{executable:'/nonexistent-gl-test-executable'}],
 ['signal','process.kill(process.pid,"SIGTERM")','CHILD_SIGNAL']
])test(name+' rejects a pre-existing valid output',()=>{const {dir,harness}=fixture(code),runId=crypto.randomUUID(),key='original:57:1:gunlance';try{fs.writeFileSync(path.join(dir,'gl-affinity-original-57-1-gunlance.json'),JSON.stringify({key,runId,status:'COLLECTED'}));assert.throws(()=>runFreshCase({harness,key,runId,outputDir:dir,...extra}),new RegExp(expected));}finally{fs.rmSync(dir,{recursive:true,force:true});}});
test('current successful collection accepted',()=>{const {dir,harness}=fixture(writer+`fs.writeFileSync(file,JSON.stringify({key,runId,status:'COLLECTED'}));`);try{assert.equal(runFreshCase({harness,key:'control',runId:crypto.randomUUID(),outputDir:dir}).processExitCode,0);}finally{fs.rmSync(dir,{recursive:true,force:true});}});
