'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const args=process.argv.slice(2),o={};for(let i=0;i<args.length;i+=2){assert.ok(['--repo','--commit','--snapshot','--references','--output'].includes(args[i]));assert.ok(args[i+1]);assert.ok(!o[args[i]]);o[args[i]]=args[i+1];}for(const k of ['--repo','--commit','--snapshot','--references','--output'])assert.ok(o[k],k+' required');
assert.match(o['--commit'],/^[0-9a-f]{40}$/);const destination=path.resolve(o['--output']),source=fs.realpathSync(o['--snapshot']),refs=fs.realpathSync(o['--references']),repo=fs.realpathSync(o['--repo']);
assert.ok(!fs.existsSync(destination),'Output must be new');
for(const x of [source,refs,repo,__dirname])assert.ok(destination!==x&&!destination.startsWith(x+path.sep),'Output must be outside sources');
const read=p=>JSON.parse(fs.readFileSync(p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),contract=read(path.join(__dirname,'fixtures-contract.json'));
const git=(...a)=>execFileSync('git',['--no-replace-objects','--no-optional-locks','-c','core.hooksPath=/dev/null','-C',repo,...a],{env:{...process.env,GIT_NO_LAZY_FETCH:'1',GIT_TERMINAL_PROMPT:'0'},maxBuffer:32*1024*1024});
assert.equal(git('cat-file','-t',o['--commit']).toString().trim(),'commit');
// Verify all fixture bytes and collect exact target Git objects before writing anything.
const material=contract.expectedInputFiles.map(e=>{
 const input=fs.readFileSync(path.join(source,'input',e.path));assert.equal(hash(input),e.sha256,'Fixture mismatch: '+e.path);
 const fixtureOnly=['normalized-data.json','tools/dom-test-setup.cjs'].includes(e.path);
 const bytes=fixtureOnly?input:git('show',o['--commit']+':'+e.path);
 assert.equal(hash(bytes),e.path==='hope-hammer-browser-adapter.js'?contract.candidateAdapterSha256:e.sha256,'Unexpected product change: '+e.path);
 return {path:e.path,sha256:hash(bytes),bytes};
});
for(const e of contract.referenceFiles)assert.equal(hash(fs.readFileSync(path.join(refs,e.path))),e.sha256,'Reference mismatch: '+e.path);
const harnessMaterial=contract.fixtureHarnessFiles.map(e=>{const bytes=fs.readFileSync(path.join(source,'harness',e.path));assert.equal(hash(bytes),e.sha256,'Fixture harness mismatch: '+e.path);return {...e,bytes};});
const runtimeMaterial=contract.runtimeFiles.map(e=>{const bytes=fs.readFileSync(path.join(__dirname,e.source));assert.equal(hash(bytes),e.sha256,'Publication runtime mismatch: '+e.source);return {...e,bytes};});
fs.mkdirSync(destination,{recursive:true});fs.mkdirSync(path.join(destination,'reference-pinned'));
const write=(relative,bytes)=>{const file=path.join(destination,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes,{flag:'wx'});};
// Copy only declared, verified bytes. Unlisted modules/fixtures never enter the runtime.
for(const e of material)write('work/input/'+e.path,e.bytes);
for(const e of harnessMaterial)write('work/harness/'+e.path,e.bytes);
for(const e of runtimeMaterial)write(e.destination,e.bytes);
for(const e of contract.referenceFiles)fs.copyFileSync(path.join(refs,e.path),path.join(destination,'reference-pinned',e.path));
for(const f of ['failure-injection.test.cjs','portability.test.cjs','preflight-integrity.test.cjs','input-integrity.test.cjs','fixtures-contract.json'])fs.copyFileSync(path.join(__dirname,f),path.join(destination,f));
write('work/harness/expected-inputs.json',JSON.stringify(material.map(({bytes,...e})=>e),null,2)+'\n');
fs.writeFileSync(path.join(destination,'preparation.json'),JSON.stringify({sourceCommit:o['--commit'],productBaseline:contract.productBaseline,privateDataCommit:contract.privateDataCommit,sourceKind:'EXACT_GIT_OBJECTS_WITH_PINNED_FIXTURES',files:material.map(({bytes,...e})=>e)},null,2)+'\n');
console.log(JSON.stringify({status:'PREPARED_NOT_EXECUTED',sourceCommit:o['--commit'],output:destination}));
