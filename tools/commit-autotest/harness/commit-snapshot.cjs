'use strict';
// Trusted preparation only: no product code, checkout, hooks or network execution.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const objectHash=(type,b)=>crypto.createHash('sha1').update(`${type} ${b.length}\0`).update(b).digest('hex');
const fail=(code,message)=>{throw Error(code+': '+message)};
const read=p=>JSON.parse(fs.readFileSync(p));
const safe=p=>typeof p==='string'&&p.length>0&&!p.startsWith('/')&&!/[\\\x00-\x1f\x7f]/.test(p)&&p.split('/').every(x=>x&&x!=='.'&&x!=='..'&&x!=='.git');
function regular(file){if(!fs.lstatSync(file).isFile())fail('SNAPSHOT_INVALID','Not a regular file: '+file);return fs.readFileSync(file);}
function entries(root){const out=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())out.push(path.relative(root,p));else fail('SNAPSHOT_INVALID','Non-regular entry: '+p)}}walk(root);return out.sort();}
function fingerprint(root,exclude=[]){return hash(Buffer.from(JSON.stringify(entries(root).filter(p=>!exclude.includes(p)).map(p=>({path:p,sha256:hash(regular(path.join(root,p)))})))));}
function gitRead(repo,...args){try{return execFileSync('git',['--no-replace-objects','--no-optional-locks','-c','core.fsmonitor=false','-c','core.hooksPath=/dev/null','-C',repo,...args],{env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_NO_LAZY_FETCH:'1',GIT_TERMINAL_PROMPT:'0'},maxBuffer:64*1024*1024,stdio:['ignore','pipe','pipe']})}catch(e){fail('INVALID_COMMIT',String(e.stderr||e.message).slice(0,500))}}
function treeEntries(bytes){const out=[];let n=0;while(n<bytes.length){const space=bytes.indexOf(32,n),zero=bytes.indexOf(0,space);if(space<0||zero<0||zero+21>bytes.length)fail('SNAPSHOT_INVALID','Malformed Git tree');const mode=bytes.subarray(n,space).toString(),name=bytes.subarray(space+1,zero).toString();if(!safe(name)||name.includes('/'))fail('SNAPSHOT_INVALID','Unsafe Git tree path');out.push({mode,name,oid:bytes.subarray(zero+1,zero+21).toString('hex')});n=zero+21;}return out;}
function proofEntry(proof,p,getTree){let oid=/^tree ([0-9a-f]{40})\n/.exec(Buffer.from(proof.commit,'base64').toString())?.[1];if(!oid)fail('SNAPSHOT_INVALID','Missing root tree');let found;for(const [i,name] of p.split('/').entries()){const bytes=getTree(oid);if(objectHash('tree',bytes)!==oid)fail('SNAPSHOT_INVALID','Git tree hash mismatch');found=treeEntries(bytes).find(e=>e.name===name);if(!found)fail('SNAPSHOT_INVALID','Missing Git input '+p);if(i<p.split('/').length-1){if(found.mode!=='40000')fail('SNAPSHOT_INVALID','Non-tree parent '+p);oid=found.oid;}}if(!['100644','100755'].includes(found.mode))fail('SNAPSHOT_INVALID','Symlink/gitlink input '+p);return found;}
function canonicalDestination(file){let existing=path.resolve(file);const suffix=[];while(!fs.lstatSync(existing,{throwIfNoEntry:false})){suffix.unshift(path.basename(existing));const parent=path.dirname(existing);if(parent===existing)fail('OUTPUT_LOCATION','No existing path ancestor');existing=parent;}return path.join(fs.realpathSync(existing),...suffix);}
function repositoryPaths(repo){
 const paths=[repo,...['--absolute-git-dir','--git-common-dir'].map(flag=>gitRead(repo,'rev-parse','--path-format=absolute',flag).toString().trim())];
 if(gitRead(repo,'rev-parse','--is-bare-repository').toString().trim()==='false')paths.push(gitRead(repo,'rev-parse','--show-toplevel').toString().trim());
 return [...new Set(paths.map(p=>fs.realpathSync(p)))];
}
function validateContract(contract,commit,b){
 if(contract&&(contract.schemaVersion!==1||contract.sourceCommit!==commit||contract.status!=='REVIEWED_RUNTIME_DEPENDENCIES'||typeof contract.reviewNote!=='string'||!contract.reviewNote.trim()||!Array.isArray(contract.codeFiles)))fail('DEPENDENCY_REVIEW_REQUIRED','Invalid SHA-bound dependency contract');
 const codeFiles=contract?contract.codeFiles:b.codeFiles,names=new Set();
 for(const e of codeFiles){if(!safe(e.path)||names.has(e.path)||['normalized-data.json','tools/dom-test-setup.cjs'].includes(e.path)||!/^[0-9a-f]{64}$/.test(e.sha256||''))fail('SNAPSHOT_INVALID','Unsafe or duplicate contract path');names.add(e.path);}
 for(const e of b.codeFiles)if(!names.has(e.path))fail('DEPENDENCY_REVIEW_REQUIRED','Missing previously required runtime file '+e.path);
 return codeFiles;
}
// Admission is intentionally narrower than HTML: the unchanged trusted loader
// only inlines an empty, quoted-src classic script. Other spellings/attributes
// must not be called covered just because their file is present in the snapshot.
function validateStaticScriptCoverage(html,names,excluded){
 for(const tag of html.matchAll(/<script\b/gi)){
  let end=tag.index+tag[0].length,quote=null;
  for(;end<html.length;end++){
   const c=html[end];
   if(quote){if(c===quote)quote=null;}
   else if(c==='"'||c==="'")quote=c;
   else if(c==='>')break;
  }
  if(end===html.length)fail('DEPENDENCY_REVIEW_REQUIRED','Unsupported static script notation: unclosed opening tag');
  if(!/\bsrc\b/i.test(html.slice(tag.index,end+1)))continue;
  const supported=/^<script[ \t\r\n\f]+src=(["'])([^"']+)\1>\s*<\/script>/i.exec(html.slice(tag.index));
  if(!supported)fail('DEPENDENCY_REVIEW_REQUIRED','Unsupported static script notation; use an empty canonical <script src="relative-file.js"></script> tag');
  const src=supported[2];
  const external=/^(?:[a-z]+:)?\/\//i.test(src);
  if(external?!excluded.some(e=>e.src===src):!names.has(path.posix.normalize(src)))fail('DEPENDENCY_REVIEW_REQUIRED','Script not covered by snapshot loader: '+src);
 }
}
function versions(toolRoot){const b=read(path.join(toolRoot,'contracts/baseline.json'));return {b,harnessSha256:fingerprint(path.join(toolRoot,'harness'),['expected-inputs.json','run-provenance.json']),dependenciesSha256:fingerprint(path.join(toolRoot,'dependencies')),runnerSha256:hash(Buffer.concat(['run-isolated.sh','run-all.sh','run-commit.sh'].filter(n=>fs.existsSync(path.join(toolRoot,n))).map(n=>fs.readFileSync(path.join(toolRoot,n)))))};}
function prepareSnapshot({toolRoot=path.resolve(__dirname,'..'),repo,commit,snapshot,database,converter,dependencyContract}){
 if(!/^[0-9a-f]{40}$/.test(commit||''))fail('COMMIT_REQUIRED','Use an explicit full lowercase 40-character Git commit SHA');
 if(!repo||!snapshot)fail('ARGUMENT_REQUIRED','repo and snapshot are required');
 repo=fs.realpathSync(repo);toolRoot=fs.realpathSync(toolRoot);snapshot=canonicalDestination(snapshot);
 for(const p of [...repositoryPaths(repo),...['input','harness','dependencies','contracts'].map(n=>path.join(toolRoot,n))])if(snapshot===p||snapshot.startsWith(p+path.sep)||p.startsWith(snapshot+path.sep))fail('OUTPUT_LOCATION','Snapshot must be outside repository and protected inputs');
 if(fs.existsSync(snapshot))fail('OUTPUT_EXISTS','Snapshot already exists');
 if(gitRead(repo,'cat-file','-t',commit).toString().trim()!=='commit')fail('INVALID_COMMIT','Object is not a commit');
 const commitBytes=gitRead(repo,'cat-file','commit',commit);if(objectHash('commit',commitBytes)!==commit)fail('INVALID_COMMIT','Commit object hash mismatch');
 const {b,harnessSha256,dependenciesSha256,runnerSha256}=versions(toolRoot);
 const dbBytes=regular(database||path.join(toolRoot,'input/normalized-data.json')),converterBytes=regular(converter||path.join(toolRoot,'contracts/extracted-converter.js'));
 if(hash(dbBytes)!==b.databaseSha256||hash(converterBytes)!==b.converterSha256)fail('ORACLE_NOT_APPLICABLE','Independent DB or converter differs; expectations are never regenerated');
 if(hash(regular(path.join(toolRoot,'harness/skill-sources/classification.candidate.json')))!==b.classificationSha256||Object.entries(b.oracleFiles).some(([p,h])=>hash(regular(path.join(toolRoot,'harness',p)))!==h))fail('ORACLE_NOT_APPLICABLE','Oracle or classification version differs from baseline contract');
 const contract=dependencyContract?read(dependencyContract):null,codeFiles=validateContract(contract,commit,b),names=new Set(codeFiles.map(e=>e.path));
 const proof={commit:commitBytes.toString('base64'),trees:{}};
 const getTree=oid=>{if(!proof.trees[oid])proof.trees[oid]=gitRead(repo,'cat-file','tree',oid).toString('base64');return Buffer.from(proof.trees[oid],'base64')};
 const material=[];for(const e of codeFiles){const g=proofEntry(proof,e.path,getTree),bytes=gitRead(repo,'cat-file','blob',g.oid);if(bytes.subarray(0,120).toString().startsWith('version https://git-lfs.github.com/spec/v1'))fail('LFS_POINTER_UNSUPPORTED','Materialized Git LFS content required: '+e.path);if(objectHash('blob',bytes)!==g.oid)fail('SNAPSHOT_INVALID','Git blob mismatch');if(hash(bytes)!==e.sha256)fail('DEPENDENCY_REVIEW_REQUIRED','Runtime bytes changed without matching reviewed coverage: '+e.path);material.push({...e,gitBlob:g.oid,bytes});}
 const html=material.find(e=>e.path==='index.html').bytes.toString();
 validateStaticScriptCoverage(html,names,b.excludedScriptSources);
 const loader=regular(path.join(toolRoot,'input/tools/dom-test-setup.cjs'));if(hash(loader)!==b.loaderSha256)fail('SNAPSHOT_INVALID','Trusted loader changed');
 fs.mkdirSync(path.dirname(snapshot),{recursive:true});fs.mkdirSync(snapshot);
 for(const e of [...material,{path:'normalized-data.json',bytes:dbBytes},{path:'tools/dom-test-setup.cjs',bytes:loader}]){const file=path.join(snapshot,'input',e.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,e.bytes,{flag:'wx',mode:0o444});}
 const manifest={schemaVersion:1,sourceKind:'git-objects',sourceCommit:commit,sourceTree:/^tree (\w+)/.exec(commitBytes.toString())[1],createdAt:new Date().toISOString(),codeFiles:material.map(({bytes,...e})=>({...e,byteLength:bytes.length})),gitProof:proof,inputFiles:entries(path.join(snapshot,'input')).map(p=>({path:p,sha256:hash(regular(path.join(snapshot,'input',p)))})),database:{relationshipToProductCommit:'INDEPENDENT_FIXED_CAPTURE_NOT_A_GIT_DB_VERSION',sha256:hash(dbBytes),provenanceSha256:hash(regular(path.join(toolRoot,'contracts/database-provenance.json'))),status:'FIXED_CANDIDATE_NOT_NEW_APPROVAL'},converter:{sha256:hash(converterBytes),provenanceSha256:hash(regular(path.join(toolRoot,'contracts/converter-provenance.json'))),executed:false},oracle:{status:'APPLICABLE',files:b.oracleFiles,automaticUpdates:false},classification:{sha256:b.classificationSha256,evidenceSourceCommit:b.sourceCommit,status:'CANDIDATE_NOT_APPROVED'},dependencyCoverage:{status:contract?'EXPLICIT_REVIEWED_CONTRACT':'BASELINE_IDENTICAL_RUNTIME_BYTES',contractSha256:hash(Buffer.from(JSON.stringify(contract||b.codeFiles))),contract,excludedScriptSources:b.excludedScriptSources,limitations:['Static local scripts are inlined by the trusted baseline loader. Dependency review must cover dynamic imports, workers, fetches, module scripts and loader semantics. Unreviewed changed runtime code is refused.']},harness:{sha256:harnessSha256},dependencies:{sha256:dependenciesSha256},runner:{sha256:runnerSha256},productCodeExecuted:false};
 fs.cpSync(path.join(toolRoot,'harness'),path.join(snapshot,'harness'),{recursive:true});
 fs.writeFileSync(path.join(snapshot,'harness/expected-inputs.json'),JSON.stringify(manifest.inputFiles,null,2)+'\n');
 manifest.inputManifestSha256=hash(Buffer.from(JSON.stringify(manifest.inputFiles)));
 const provenance={...manifest};delete provenance.gitProof;fs.writeFileSync(path.join(snapshot,'harness/run-provenance.json'),JSON.stringify(provenance,null,2)+'\n');
 fs.writeFileSync(path.join(snapshot,'snapshot.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o444});
 for(const p of entries(path.join(snapshot,'harness')))fs.chmodSync(path.join(snapshot,'harness',p),0o444);
 validateSnapshot(snapshot,toolRoot);return manifest;
}
function validateSnapshot(snapshot,toolRoot=path.resolve(__dirname,'..')){
 try{
 const m=read(path.join(snapshot,'snapshot.json')),{b,harnessSha256,dependenciesSha256,runnerSha256}=versions(toolRoot);
 if(m.schemaVersion!==1||m.sourceKind!=='git-objects'||!/^[a-f0-9]{40}$/.test(m.sourceCommit)||objectHash('commit',Buffer.from(m.gitProof.commit,'base64'))!==m.sourceCommit)fail('SNAPSHOT_INVALID','Invalid commit proof');
 if(JSON.stringify(entries(path.join(snapshot,'input')))!==JSON.stringify(m.inputFiles.map(e=>e.path).sort()))fail('SNAPSHOT_INVALID','Missing or unexpected input files');
 for(const e of m.inputFiles){if(!safe(e.path)||hash(regular(path.join(snapshot,'input',e.path)))!==e.sha256)fail('SNAPSHOT_INVALID','Input hash mismatch '+e.path);}
 const codeFiles=validateContract(m.dependencyCoverage.contract,m.sourceCommit,b);
 if(m.dependencyCoverage.status!==(m.dependencyCoverage.contract?'EXPLICIT_REVIEWED_CONTRACT':'BASELINE_IDENTICAL_RUNTIME_BYTES')||m.dependencyCoverage.contractSha256!==hash(Buffer.from(JSON.stringify(m.dependencyCoverage.contract||b.codeFiles))))fail('SNAPSHOT_INVALID','Dependency contract identity mismatch');
 const requiredNames=[...codeFiles.map(e=>e.path),'normalized-data.json','tools/dom-test-setup.cjs'].sort();
 if(new Set(requiredNames).size!==requiredNames.length||JSON.stringify(requiredNames)!==JSON.stringify(m.inputFiles.map(e=>e.path).sort()))fail('SNAPSHOT_INVALID','Input list is not exactly Git-bound code plus fixed data/loader');
 for(const e of b.codeFiles)if(!codeFiles.some(c=>c.path===e.path))fail('SNAPSHOT_INVALID','Required runtime file omitted');
 if(m.sourceTree!==/^tree (\w+)/.exec(Buffer.from(m.gitProof.commit,'base64').toString())?.[1])fail('SNAPSHOT_INVALID','Source tree differs from commit');
 if(JSON.stringify(codeFiles.map(e=>[e.path,e.sha256]))!==JSON.stringify(m.codeFiles.map(e=>[e.path,e.sha256])))fail('SNAPSHOT_INVALID','Coverage mismatch');
 if(m.dependencyCoverage.contract&&(m.dependencyCoverage.contract.sourceCommit!==m.sourceCommit||m.dependencyCoverage.contract.status!=='REVIEWED_RUNTIME_DEPENDENCIES'))fail('SNAPSHOT_INVALID','Dependency contract mismatch');
 for(const e of m.codeFiles){const g=proofEntry(m.gitProof,e.path,oid=>Buffer.from(m.gitProof.trees[oid],'base64'));const bytes=regular(path.join(snapshot,'input',e.path));if(g.oid!==e.gitBlob||objectHash('blob',bytes)!==g.oid||hash(bytes)!==e.sha256)fail('SNAPSHOT_INVALID','Code differs from Git proof');}
 validateStaticScriptCoverage(regular(path.join(snapshot,'input/index.html')).toString(),new Set(codeFiles.map(e=>e.path)),b.excludedScriptSources);
 if(m.inputManifestSha256!==hash(Buffer.from(JSON.stringify(m.inputFiles))))fail('SNAPSHOT_INVALID','Input manifest hash mismatch');
 if(m.database.sha256!==b.databaseSha256||hash(regular(path.join(snapshot,'input/normalized-data.json')))!==b.databaseSha256||m.converter.sha256!==b.converterSha256||m.classification.sha256!==b.classificationSha256||JSON.stringify(m.oracle.files)!==JSON.stringify(b.oracleFiles)||m.oracle.status!=='APPLICABLE')fail('ORACLE_NOT_APPLICABLE','Snapshot independent versions mismatch');
 if(m.harness.sha256!==harnessSha256||m.dependencies.sha256!==dependenciesSha256||m.runner.sha256!==runnerSha256||fingerprint(path.join(snapshot,'harness'),['expected-inputs.json','run-provenance.json'])!==harnessSha256)fail('SNAPSHOT_INVALID','Harness/dependencies/runner changed after preparation');
 if(hash(regular(path.join(snapshot,'input/tools/dom-test-setup.cjs')))!==b.loaderSha256||JSON.stringify(read(path.join(snapshot,'harness/expected-inputs.json')))!==JSON.stringify(m.inputFiles))fail('SNAPSHOT_INVALID','Harness input binding mismatch');
 const prov={...m};delete prov.gitProof;if(JSON.stringify(read(path.join(snapshot,'harness/run-provenance.json')))!==JSON.stringify(prov))fail('SNAPSHOT_INVALID','Provenance mismatch');
 return m;
 }catch(e){if(/^(SNAPSHOT_INVALID|ORACLE_NOT_APPLICABLE):/.test(e.message))throw e;fail('SNAPSHOT_INVALID',e.message)}
}
if(require.main===module){try{const [command,...args]=process.argv.slice(2);const options={};for(let i=0;i<args.length;i+=2){if(!args[i].startsWith('--')||!args[i+1])fail('ARGUMENT_REQUIRED','Options require values');const key={'--repo':'repo','--commit':'commit','--snapshot':'snapshot','--database':'database','--converter':'converter','--dependency-contract':'dependencyContract'}[args[i]];if(!key||options[key])fail('ARGUMENT_REQUIRED','Unknown/duplicate option');options[key]=args[i+1];}const m=command==='prepare'?prepareSnapshot(options):command==='validate'?validateSnapshot(options.snapshot):fail('ARGUMENT_REQUIRED','Use prepare or validate');console.log(JSON.stringify({status:'SNAPSHOT_READY_NOT_PRODUCT_TEST',sourceCommit:m.sourceCommit,snapshot:options.snapshot,inputCount:m.inputFiles.length,oracle:m.oracle.status}));}catch(e){console.error(e.message);process.exitCode=3}}
module.exports={prepareSnapshot,validateSnapshot,canonicalDestination,repositoryPaths,validateStaticScriptCoverage};
