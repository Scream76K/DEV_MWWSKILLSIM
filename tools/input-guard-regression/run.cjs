'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const runId=crypto.randomUUID(),reportFile=path.resolve(process.env.REPORT_FILE||path.join(os.tmpdir(),'input-guard-'+runId,'summary.json'));
fs.mkdirSync(path.dirname(reportFile),{recursive:true});
// Invalidate an old result before every contract, product, test or dependency read.
const report={schemaVersion:1,runId,status:'RUNNING',startedAt:new Date().toISOString(),scope:'SYNTHETIC_INGRESS_AND_PREDICATE_ONLY',numericGameAccuracyVerified:false};
const save=()=>fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');save();
process.on('exit',code=>{if(report.status==='RUNNING'){report.status='FAIL';report.error='Unfinished current run: '+code;save();}});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const safe=p=>typeof p==='string'&&p.length>0&&!path.isAbsolute(p)&&!/[\\\x00-\x1f]/.test(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..'&&x!=='.git');
try{
 const probe=process.env.INPUT_GUARD_FAILURE_PROBE;if(probe==='exit17')process.exit(17);if(probe==='sigkill')process.kill(process.pid,'SIGKILL');if(probe==='parse')JSON.parse('{');if(probe==='runtime')throw Error('INJECTED_RUNTIME_FAILURE');
 const root=fs.realpathSync(process.env.INPUT_GUARD_ROOT||path.resolve(__dirname,'../..'));
 const contractFile=process.env.INPUT_GUARD_CONTRACT||path.join(__dirname,'contract.json'),bytes=fs.readFileSync(contractFile);const contract=JSON.parse(bytes);report.contractSha256=hash(bytes);report.runnerSha256=hash(fs.readFileSync(__filename));
 assert.equal(contract.schemaVersion,1);assert.equal(contract.scope,report.scope);assert.ok(Array.isArray(contract.files)&&contract.files.length>0);assert.ok(Array.isArray(contract.tests)&&contract.tests.length>0);assert.ok(Number.isInteger(contract.expectedTests)&&contract.expectedTests>0);
 const childTimeoutMs=contract.childTimeoutMs===undefined?180000:contract.childTimeoutMs;assert.ok(Number.isInteger(childTimeoutMs)&&childTimeoutMs>0&&childTimeoutMs<=600000,'CHILD_TIMEOUT_INVALID');report.childTimeoutMs=childTimeoutMs;
 const names=new Set();for(const f of contract.files){assert.ok(safe(f.path)&&!names.has(f.path));names.add(f.path);assert.match(f.sha256,/^[0-9a-f]{64}$/);}assert.ok(names.has('hope-hammer-browser-adapter.js'));assert.equal(new Set(contract.tests).size,contract.tests.length);for(const t of contract.tests)assert.ok(names.has(t)&&t.endsWith('.test.cjs'));
 function verify(){assert.equal(hash(fs.readFileSync(contractFile)),report.contractSha256,'CONTRACT_CHANGED');assert.equal(hash(fs.readFileSync(__filename)),report.runnerSha256,'RUNNER_CHANGED');for(const f of contract.files){const file=path.join(root,f.path);assert.ok(fs.lstatSync(file).isFile());assert.ok(fs.realpathSync(file).startsWith(root+path.sep));assert.equal(hash(fs.readFileSync(file)),f.sha256,'INPUT_HASH_MISMATCH:'+f.path);}}
 verify();report.adapterSha256=contract.files.find(f=>f.path==='hope-hammer-browser-adapter.js').sha256;report.verifiedInputCount=contract.files.length;report.childRunId=crypto.randomUUID();save();
 const childEnv={...process.env};delete childEnv.NODE_TEST_CONTEXT;
 const child=spawnSync(process.execPath,['--test','--test-reporter=tap',...contract.tests.map(t=>path.join(root,t))],{encoding:'utf8',timeout:childTimeoutMs,maxBuffer:32*1024*1024,env:{...childEnv,NODE_OPTIONS:'',NODE_PATH:'',PRODUCT_ROOT:root,GL_ADAPTER_FILE:path.join(root,'hope-hammer-browser-adapter.js'),INPUT_GUARD_ADAPTER_FILE:path.join(root,'hope-hammer-browser-adapter.js'),SA_HH_ADAPTER_FILE:path.join(root,'hope-hammer-browser-adapter.js'),INPUT_GUARD_RUN_ID:report.childRunId}});
 const stdout=String(child.stdout||''),stderr=String(child.stderr||'');const prefix=path.join(path.dirname(reportFile),'child-'+report.childRunId);fs.writeFileSync(prefix+'.tap',stdout,{flag:'wx'});fs.writeFileSync(prefix+'.stderr',stderr,{flag:'wx'});report.childStdoutSha256=hash(stdout);report.childStderrSha256=hash(stderr);report.childExit=child.status;report.childSignal=child.signal;verify();
 assert.equal(child.error,undefined);assert.equal(child.signal,null);assert.equal(child.status,0,'CHILD_FAILED');
 const count=k=>{const matches=[...stdout.matchAll(new RegExp('^# '+k+' (\\d+)$','gm'))];assert.equal(matches.length,1,'one child summary '+k);return Number(matches[0][1]);};report.counts={tests:count('tests'),passed:count('pass'),failed:count('fail'),skipped:count('skipped'),cancelled:count('cancelled')};
 assert.equal(report.counts.tests,contract.expectedTests);assert.equal(report.counts.passed,contract.expectedTests);assert.equal(report.counts.failed,0);assert.equal(report.counts.skipped,0);assert.equal(report.counts.cancelled,0);
 report.status='PASS';report.finishedAt=new Date().toISOString();save();console.log(JSON.stringify({status:report.status,runId,reportFile,counts:report.counts}));
}catch(error){report.status='FAIL';report.error=error.stack;report.finishedAt=new Date().toISOString();save();console.error(error.message);process.exitCode=1;}
