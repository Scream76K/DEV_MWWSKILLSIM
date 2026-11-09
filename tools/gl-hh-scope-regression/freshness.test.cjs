'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const runner=path.join(__dirname,'run.cjs'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'gl-hh-freshness-'));fs.mkdirSync(path.join(root,'tests'));
 fs.writeFileSync(path.join(root,'hope-hammer-browser-adapter.js'),'/* synthetic freshness input, never a game model */\n');
 fs.writeFileSync(path.join(root,'tests/probe.test.cjs'),"require('node:test')('fresh child',()=>{});\n");
 const files=['hope-hammer-browser-adapter.js','tests/probe.test.cjs'].map(p=>({path:p,sha256:hash(fs.readFileSync(path.join(root,p)))}));
 const contract={schemaVersion:1,scope:'SYNTHETIC_PREDICATE_ONLY',files,tests:['tests/probe.test.cjs'],expectedTests:1};
 const contractFile=path.join(root,'contract.json');fs.writeFileSync(contractFile,JSON.stringify(contract));const report=path.join(root,'summary.json');fs.writeFileSync(report,JSON.stringify({status:'PASS',runId:'STALE'}));
 return {root,contract,contractFile,report,env:{...process.env,GL_HH_ROOT:root,GL_HH_CONTRACT:contractFile,REPORT_FILE:report}};
}
function invoke(f,extra={}){return spawnSync(process.execPath,[runner],{env:{...f.env,...extra},encoding:'utf8',timeout:30000});}
function freshFailure(f,r,status='FAIL'){assert.equal(r.error,undefined);assert.notEqual(r.status,0);const s=JSON.parse(fs.readFileSync(f.report));assert.notEqual(s.runId,'STALE');assert.equal(s.status,status);return s;}
test('success is tied to fresh child, current adapter and exact count',()=>{const f=fixture(),r=invoke(f);assert.equal(r.status,0,r.stderr);const s=JSON.parse(fs.readFileSync(f.report));assert.equal(s.status,'PASS');assert.notEqual(s.runId,'STALE');assert.equal(s.counts.tests,1);assert.equal(s.counts.failed,0);assert.equal(s.adapterSha256,f.contract.files[0].sha256);assert.ok(s.childRunId);assert.ok(s.childStdoutSha256);});
for(const [name,mutate,extra] of [
 ['missing root',()=>{},{GL_HH_ROOT:'/nonexistent-gl-hh-root'}],
 ['missing contract',f=>fs.unlinkSync(f.contractFile),{}],
 ['malformed contract',f=>fs.writeFileSync(f.contractFile,'{'),{}],
 ['missing adapter',f=>fs.unlinkSync(path.join(f.root,'hope-hammer-browser-adapter.js')),{}],
 ['changed adapter',f=>fs.appendFileSync(path.join(f.root,'hope-hammer-browser-adapter.js'),'changed'),{}],
 ['missing test',f=>fs.unlinkSync(path.join(f.root,'tests/probe.test.cjs')),{}],
 ['changed test',f=>fs.appendFileSync(path.join(f.root,'tests/probe.test.cjs'),'changed'),{}],
 ['parse failure',()=>{},{GL_HH_FAILURE_PROBE:'parse'}],
 ['runtime failure',()=>{},{GL_HH_FAILURE_PROBE:'runtime'}],
 ['explicit exit',()=>{},{GL_HH_FAILURE_PROBE:'exit17'}],
 ['signal interruption',()=>{},{GL_HH_FAILURE_PROBE:'sigkill'}]
])test(name+' cannot leave stale PASS',()=>{const f=fixture();mutate(f);freshFailure(f,invoke(f,extra),name==='signal interruption'?'RUNNING':'FAIL');});
for(const [name,body] of [['child fail',"require('node:test')('bad',()=>{throw Error('EXPECTED')});"],['child skip',"require('node:test').skip('skip',()=>{});"],['wrong count',"require('node:test')('one',()=>{});require('node:test')('two',()=>{});"]])test(name+' cannot pass parent',()=>{const f=fixture();fs.writeFileSync(path.join(f.root,'tests/probe.test.cjs'),body);f.contract.files[1].sha256=hash(Buffer.from(body));fs.writeFileSync(f.contractFile,JSON.stringify(f.contract));freshFailure(f,invoke(f));});
test('omitted report paths are unique and current',()=>{const f=fixture(),env={...f.env};delete env.REPORT_FILE;const a=spawnSync(process.execPath,[runner],{env,encoding:'utf8'}),b=spawnSync(process.execPath,[runner],{env,encoding:'utf8'});assert.equal(a.status,0,a.stderr);assert.equal(b.status,0,b.stderr);const x=JSON.parse(a.stdout),y=JSON.parse(b.stdout);assert.notEqual(x.reportFile,y.reportFile);assert.notEqual(x.runId,y.runId);assert.equal(JSON.parse(fs.readFileSync(x.reportFile)).status,'PASS');assert.equal(JSON.parse(fs.readFileSync(y.reportFile)).status,'PASS');});

for(const [name,mutate] of [
 ['duplicate input path',f=>f.contract.files.push(f.contract.files[0])],
 ['unsafe path',f=>f.contract.files[0].path='../hope-hammer-browser-adapter.js'],
 ['duplicate test',f=>f.contract.tests.push(f.contract.tests[0])],
 ['unhashed test',f=>f.contract.tests.push('tests/unknown.test.cjs')],
 ['zero expected tests',f=>f.contract.expectedTests=0]
])test(name+' invalidates stale PASS',()=>{const f=fixture();mutate(f);fs.writeFileSync(f.contractFile,JSON.stringify(f.contract));freshFailure(f,invoke(f));});
test('concurrent adapter mutation by child fails post-run integrity',()=>{const f=fixture();const body="require('node:test')('mutate',()=>{require('node:fs').appendFileSync(process.env.GL_HH_ADAPTER_FILE,'changed');});";fs.writeFileSync(path.join(f.root,'tests/probe.test.cjs'),body);f.contract.files[1].sha256=hash(Buffer.from(body));fs.writeFileSync(f.contractFile,JSON.stringify(f.contract));const s=freshFailure(f,invoke(f));assert.match(s.error,/INPUT_HASH_MISMATCH/);});
test('symlink input is rejected',()=>{const f=fixture(),p=path.join(f.root,'hope-hammer-browser-adapter.js'),other=path.join(f.root,'synthetic.js');fs.renameSync(p,other);fs.symlinkSync(other,p);freshFailure(f,invoke(f));});
test('concurrent contract mutation by child fails post-run integrity',()=>{const f=fixture();const body="require('node:test')('mutate contract',()=>{require('node:fs').appendFileSync(process.env.GL_HH_CONTRACT,' ');});";fs.writeFileSync(path.join(f.root,'tests/probe.test.cjs'),body);f.contract.files[1].sha256=hash(Buffer.from(body));fs.writeFileSync(f.contractFile,JSON.stringify(f.contract));const s=freshFailure(f,invoke(f));assert.match(s.error,/CONTRACT_CHANGED/);});
