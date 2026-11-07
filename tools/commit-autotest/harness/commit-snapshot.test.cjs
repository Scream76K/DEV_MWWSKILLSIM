'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const sourceRoot=path.resolve(__dirname,'..');
// The production regression caught by these tests is reading a dirty checkout,
// accepting an unsupported snapshot, or mislabelling old evidence as target code.
let api;try{api=require('./commit-snapshot.cjs')}catch{api={}}
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'commit-runner-unit-'));
const toolRoot=require('./test-support/synthetic-tool.cjs').createSyntheticTool(path.join(scratch,'synthetic-tool'),sourceRoot);
const repo=path.join(scratch,'repo');fs.mkdirSync(repo);
const git=(...a)=>execFileSync('git',['-C',repo,...a],{encoding:'utf8'}).trim();
git('init','-q');git('config','user.name','Fixture');git('config','user.email','fixture@example.invalid');
const base=JSON.parse(fs.readFileSync(path.join(toolRoot,'input-manifest.json')));
for(const e of base.filter(x=>!['normalized-data.json','tools/dom-test-setup.cjs'].includes(x.path))){fs.mkdirSync(path.dirname(path.join(repo,e.path)),{recursive:true});fs.copyFileSync(path.join(toolRoot,'input',e.path),path.join(repo,e.path));}
git('add','.');git('commit','-qm','baseline fixture');const sha=git('rev-parse','HEAD');
let serial=0;const opts=(more={})=>({toolRoot,repo,commit:sha,snapshot:path.join(scratch,'snapshot-'+(++serial)),...more});
test('prepares full SHA from Git blobs, records independent versions, ignores dirty worktree',()=>{
 assert.equal(typeof api.prepareSnapshot,'function','prepareSnapshot must exist');
 const index=fs.readFileSync(path.join(repo,'index.html'));fs.writeFileSync(path.join(repo,'index.html'),'dirty worktree');
 const before=git('status','--porcelain'),o=opts(),m=api.prepareSnapshot(o);
 assert.equal(m.sourceCommit,sha);assert.equal(m.sourceKind,'git-objects');assert.equal(m.oracle.status,'APPLICABLE');assert.ok(m.converter.sha256);assert.ok(m.classification.sha256);assert.ok(m.harness.sha256);
 assert.equal(git('status','--porcelain'),before);assert.deepEqual(fs.readFileSync(path.join(o.snapshot,'input/index.html')),index);
 assert.equal(api.validateSnapshot(o.snapshot,toolRoot).sourceCommit,sha);
 fs.writeFileSync(path.join(repo,'index.html'),index);
});
test('rejects short SHA, refs, unknown objects and non-commit objects',()=>{
 assert.equal(typeof api.prepareSnapshot,'function');
 for(const commit of ['HEAD',sha.slice(0,12),'0'.repeat(40),git('rev-parse',sha+':index.html')])assert.throws(()=>api.prepareSnapshot(opts({commit})),/COMMIT_REQUIRED|INVALID_COMMIT/);
});
test('refuses output overwrite including empty directory',()=>{assert.equal(typeof api.prepareSnapshot,'function');const o=opts();fs.mkdirSync(o.snapshot);assert.throws(()=>api.prepareSnapshot(o),/OUTPUT_EXISTS/);});
test('changed DB or converter explicitly makes oracle inapplicable',()=>{
 assert.equal(typeof api.prepareSnapshot,'function');
 const database=path.join(scratch,'db.json');fs.writeFileSync(database,'{}');assert.throws(()=>api.prepareSnapshot(opts({database})),/ORACLE_NOT_APPLICABLE/);
 const converter=path.join(scratch,'converter.js');fs.writeFileSync(converter,'changed');assert.throws(()=>api.prepareSnapshot(opts({converter})),/ORACLE_NOT_APPLICABLE/);
});
test('corrupted snapshot, extra files and symlink inputs are rejected',()=>{
 assert.equal(typeof api.prepareSnapshot,'function');const o=opts();api.prepareSnapshot(o);const p=path.join(o.snapshot,'input/element-state.js');fs.chmodSync(p,0o644);fs.appendFileSync(p,'\nchanged');assert.throws(()=>api.validateSnapshot(o.snapshot,toolRoot),/SNAPSHOT_INVALID/);
 const o2=opts();api.prepareSnapshot(o2);fs.chmodSync(path.join(o2.snapshot,'input'),0o755);fs.writeFileSync(path.join(o2.snapshot,'input/extra.js'),'');assert.throws(()=>api.validateSnapshot(o2.snapshot,toolRoot),/SNAPSHOT_INVALID/);
});
test('changed runtime code fails closed until explicit dependency review',()=>{
 assert.equal(typeof api.prepareSnapshot,'function');fs.appendFileSync(path.join(repo,'element-state.js'),'\n// candidate change');git('add','.');git('commit','-qm','changed runtime');const commit=git('rev-parse','HEAD');assert.throws(()=>api.prepareSnapshot(opts({commit})),/DEPENDENCY_REVIEW_REQUIRED/);
});
test('reviewed candidate with new local script is copied from its own SHA',()=>{
 const crypto=require('node:crypto'),h=b=>crypto.createHash('sha256').update(b).digest('hex');
 fs.writeFileSync(path.join(repo,'extra-runtime.js'),'window.__candidateMarker = 1;');
 fs.appendFileSync(path.join(repo,'index.html'),'\n<script src="extra-runtime.js"></script>');git('add','.');git('commit','-qm','new script');const commit=git('rev-parse','HEAD');
 assert.throws(()=>api.prepareSnapshot(opts({commit})),/DEPENDENCY_REVIEW_REQUIRED/);
 const contract={schemaVersion:1,sourceCommit:commit,status:'REVIEWED_RUNTIME_DEPENDENCIES',reviewNote:'Test fixture: one explicit static inlineable local script; no other dependency change.',codeFiles:[...base.filter(x=>!['normalized-data.json','tools/dom-test-setup.cjs'].includes(x.path)).map(x=>({path:x.path,sha256:h(fs.readFileSync(path.join(repo,x.path)))})),{path:'extra-runtime.js',sha256:h(fs.readFileSync(path.join(repo,'extra-runtime.js')))}]};
 const f=path.join(scratch,'review.json');fs.writeFileSync(f,JSON.stringify(contract));const o=opts({commit,dependencyContract:f}),m=api.prepareSnapshot(o);assert.equal(m.sourceCommit,commit);assert.equal(m.inputFiles.length,6);assert.ok(fs.existsSync(path.join(o.snapshot,'input/extra-runtime.js')));
});
test('Git symlink, missing file and LFS pointer are rejected',()=>{
 fs.copyFileSync(path.join(toolRoot,'input/index.html'),path.join(repo,'index.html'));
 const p=path.join(repo,'element-state.js'),restore=()=>fs.copyFileSync(path.join(toolRoot,'input/element-state.js'),p);
 fs.unlinkSync(p);fs.symlinkSync('/etc/passwd',p);git('add','.');git('commit','-qm','symlink');assert.throws(()=>api.prepareSnapshot(opts({commit:git('rev-parse','HEAD')})),/SNAPSHOT_INVALID/);
 fs.unlinkSync(p);git('add','.');git('commit','-qm','missing');assert.throws(()=>api.prepareSnapshot(opts({commit:git('rev-parse','HEAD')})),/SNAPSHOT_INVALID/);
 restore();fs.writeFileSync(p,'version https://git-lfs.github.com/spec/v1\noid sha256:'+'a'.repeat(64)+'\nsize 1\n');git('add','.');git('commit','-qm','LFS pointer');assert.throws(()=>api.prepareSnapshot(opts({commit:git('rev-parse','HEAD')})),/LFS_POINTER_UNSUPPORTED/);
});
test('forged manifest cannot add an input outside the Git-bound code list',()=>{
 const o=opts();api.prepareSnapshot(o);const f=path.join(o.snapshot,'snapshot.json'),m=JSON.parse(fs.readFileSync(f));const crypto=require('node:crypto');
 fs.writeFileSync(path.join(o.snapshot,'input/forged.js'),'bad');m.inputFiles.push({path:'forged.js',sha256:crypto.createHash('sha256').update('bad').digest('hex')});m.inputFiles.sort((a,b)=>a.path.localeCompare(b.path));fs.chmodSync(f,0o644);fs.writeFileSync(f,JSON.stringify(m));
 const expected=path.join(o.snapshot,'harness/expected-inputs.json'),prov=path.join(o.snapshot,'harness/run-provenance.json');fs.chmodSync(expected,0o644);fs.writeFileSync(expected,JSON.stringify(m.inputFiles));const p={...m};delete p.gitProof;fs.chmodSync(prov,0o644);fs.writeFileSync(prov,JSON.stringify(p));
 assert.throws(()=>api.validateSnapshot(o.snapshot,toolRoot),/SNAPSHOT_INVALID/);
});
test('symlink ancestors cannot put snapshot or output in repository or protected inputs',()=>{
 const link=path.join(scratch,'repo-link');fs.symlinkSync(repo,link,'dir');
 const destination=path.join(link,'forbidden-snapshot');try{assert.throws(()=>api.prepareSnapshot(opts({snapshot:destination})),/OUTPUT_LOCATION/);}finally{fs.rmSync(path.join(repo,'forbidden-snapshot'),{recursive:true,force:true});}
 const {spawnSync}=require('node:child_process');
 for(const [target,label] of [[repo,'repo'],[path.join(toolRoot,'input'),'input']]){
  const alias=path.join(scratch,'alias-'+label);fs.symlinkSync(target,alias,'dir');const name='forbidden-output-'+process.pid,dest=path.join(alias,name);
  const result=spawnSync(process.execPath,[path.join(toolRoot,'harness/run-commit.cjs'),'--repo',repo,'--commit',sha,'--output',dest,'--prepare-only'],{encoding:'utf8'});
  try{assert.equal(result.status,3);assert.equal(fs.existsSync(path.join(target,name)),false,'No output created through symlink ancestor');}finally{fs.rmSync(path.join(target,name),{recursive:true,force:true});}
 }
});
test('snapshot revalidation rejects weakened review contract and stale contract hash',()=>{
 const contract={schemaVersion:1,sourceCommit:sha,status:'REVIEWED_RUNTIME_DEPENDENCIES',reviewNote:'Test: same exact baseline bytes.',codeFiles:base.filter(x=>!['normalized-data.json','tools/dom-test-setup.cjs'].includes(x.path))};
 const f=path.join(scratch,'baseline-review.json');fs.writeFileSync(f,JSON.stringify(contract));
 for(const mutate of [m=>delete m.dependencyCoverage.contract.reviewNote,m=>m.dependencyCoverage.contract.schemaVersion=99,m=>m.dependencyCoverage.contractSha256='0'.repeat(64)]){
  const o=opts({dependencyContract:f});api.prepareSnapshot(o);const file=path.join(o.snapshot,'snapshot.json'),m=JSON.parse(fs.readFileSync(file));mutate(m);fs.chmodSync(file,0o644);fs.writeFileSync(file,JSON.stringify(m));const prov={...m};delete prov.gitProof;const p=path.join(o.snapshot,'harness/run-provenance.json');fs.chmodSync(p,0o644);fs.writeFileSync(p,JSON.stringify(prov));assert.throws(()=>api.validateSnapshot(o.snapshot,toolRoot),/SNAPSHOT_INVALID/);
 }
});
test('repository subdirectory cannot hide worktree root or common Git storage',()=>{
 const subdir=path.join(repo,'ui'),output=path.join(repo,'forbidden-subdir-output');
 try{assert.throws(()=>api.prepareSnapshot(opts({repo:subdir,snapshot:output})),/OUTPUT_LOCATION/);}finally{fs.rmSync(output,{recursive:true,force:true});}
 const linked=path.join(scratch,'linked-worktree');git('worktree','add','--detach',linked,sha);
 const destination=path.join(repo,'.git','forbidden-common-output');
 try{assert.throws(()=>api.prepareSnapshot(opts({repo:linked,snapshot:destination})),/OUTPUT_LOCATION/);}finally{fs.rmSync(destination,{recursive:true,force:true});}
});
test.after(()=>{fs.rmSync(scratch,{recursive:true,force:true});});
