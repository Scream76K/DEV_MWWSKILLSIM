'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
for(const name of ['sa-regression.cjs','cb-regression.cjs','sa-prior-scope-regression.cjs','sa-full-preservation.cjs'])for(const fault of ['verifier','dependency','parse','runtime','exit','kill'])test(name+' invalidates stale success before '+fault,()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'charge-fresh-')),out=path.join(temp,'report.json');
 try{
  fs.writeFileSync(out,JSON.stringify({runId:'STALE',status:'PASS',cases:[{key:'stale'}]}));
  const prelude=`const M=require('node:module'),load=M._load;M._load=function(id,...args){if(${JSON.stringify(fault)}==='verifier'&&id==='./verify-combined.cjs')throw Error('INJECTED_VERIFY');if(id==='jsdom'){switch(${JSON.stringify(fault)}){case 'dependency':throw Error('INJECTED_MISSING');case 'parse':throw SyntaxError('INJECTED_PARSE');case 'runtime':return {...load.call(this,id,...args),JSDOM:class{constructor(){throw Error('INJECTED_RUNTIME')}}};case 'exit':process.exit(17);case 'kill':process.kill(process.pid,'SIGKILL');}}return load.call(this,id,...args);};`;
  const child=spawnSync(process.execPath,['-e',prelude+'require('+JSON.stringify(path.join(__dirname,name))+')'],{env:{...process.env,REPORT_FILE:out,SA_CB_RUN_ID:'CURRENT'},encoding:'utf8',timeout:30000});assert.equal(child.error,undefined);assert.notEqual(child.status,0);const report=JSON.parse(fs.readFileSync(out));assert.equal(report.runId,'CURRENT');assert.ok(!report.cases.some(c=>c.key==='stale'));assert.equal(report.status,fault==='kill'?'RUNNING':'FAIL');if(fault==='kill')assert.equal(child.signal,'SIGKILL');else assert.ok(report.error);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
