'use strict';
// Scheduling only: retain the original fail-closed runner and all source hashes.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),a=require('node:assert/strict');
const {spawnSync,execFileSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const heavy={heroics:'tests/lbg-rapid-heroics.test.cjs','resolved-attack':'tests/lbg-rapid-resolved-attack.test.cjs'};
function partition(c){
 a.ok(Array.isArray(c.tests)&&c.tests.length>2);a.equal(new Set(c.tests).size,c.tests.length,'duplicate test');
 a.ok(Number.isInteger(c.expectedTests)&&c.expectedTests>2,'invalid total');
 for(const f of Object.values(heavy))a.ok(c.tests.includes(f),'missing heavy test');
 const p=Object.entries(heavy).map(([name,f])=>({...c,name,tests:[f],expectedTests:1}));
 p.push({...c,name:'remainder',tests:c.tests.filter(f=>!Object.values(heavy).includes(f)),expectedTests:c.expectedTests-2});
 a.deepEqual(p.flatMap(x=>x.tests).sort(),[...c.tests].sort());return p;
}
function validate(c,id,reports){
 const parts=partition(c);a.equal(reports.length,parts.length);a.equal(new Set(reports.map(r=>r.name)).size,parts.length);
 for(const p of parts){const r=reports.find(r=>r.name===p.name);a.ok(r);a.deepEqual(r.identity,id,'stale identity');a.deepEqual(r.tests,p.tests);a.equal(r.expectedTests,p.expectedTests);a.equal(r.status,'PASS');a.equal(r.childExit,0);a.equal(r.childSignal,null);a.deepEqual(r.counts,{tests:p.expectedTests,passed:p.expectedTests,failed:0,skipped:0,cancelled:0});}
 return {tests:c.expectedTests,passed:c.expectedTests,failed:0,skipped:0,cancelled:0};
}
function verifyInputs(root,c){
 for(const f of c.files){a.ok(typeof f.path==='string'&&!path.isAbsolute(f.path)&&!/[\\\x00-\x1f]/.test(f.path)&&f.path.split('/').every(x=>x&&!['.','..','.git'].includes(x)));const n=path.join(root,f.path);a.ok(fs.lstatSync(n).isFile());a.ok(fs.realpathSync(n).startsWith(root+path.sep));a.equal(hash(fs.readFileSync(n)),f.sha256,'INPUT_HASH_MISMATCH:'+f.path);}
}
function main(){
 const [mode,arg]=process.argv.slice(2),root=fs.realpathSync(path.resolve(__dirname,'../..')),contractFile=path.join(__dirname,'contract.json'),bytes=fs.readFileSync(contractFile),c=JSON.parse(bytes),parts=partition(c);
 const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();a.match(sha,/^[a-f0-9]{40}$/);a.equal(sha,process.env.GITHUB_SHA,'wrong checkout');
 const id={sha,run:process.env.GITHUB_RUN_ID,attempt:process.env.GITHUB_RUN_ATTEMPT,contract:hash(bytes)};a.match(id.run||'',/^\d+$/);a.match(id.attempt||'',/^\d+$/);verifyInputs(root,c);
 if(mode==='run'){
  const p=parts.find(x=>x.name===arg);a.ok(p,'unknown partition');const dir=path.resolve(process.env.REPORT_DIR||path.join(os.tmpdir(),'integrated-'+id.run+'-'+id.attempt+'-'+p.name));fs.mkdirSync(dir,{recursive:true});
  const {name,...derived}=p,cf=path.join(dir,'contract.json'),rf=path.join(dir,'summary.json');fs.writeFileSync(cf,JSON.stringify(derived,null,2)+'\n',{flag:'wx'});
  const startedAt=new Date().toISOString(),result=spawnSync(process.execPath,[path.join(root,'tools/input-guard-regression/run.cjs')],{cwd:root,encoding:'utf8',timeout:660000,maxBuffer:40*1024*1024,env:{...process.env,INPUT_GUARD_ROOT:root,INPUT_GUARD_CONTRACT:cf,REPORT_FILE:rf}});
  fs.writeFileSync(path.join(dir,'runner.stdout'),result.stdout||'');fs.writeFileSync(path.join(dir,'runner.stderr'),result.stderr||'');
  const receipt={name,identity:id,tests:p.tests,expectedTests:p.expectedTests,startedAt,finishedAt:new Date().toISOString(),node:process.version,runnerImage:process.env.ImageVersion||null,runnerOS:process.env.RUNNER_OS||null,exit:result.status,signal:result.signal,error:result.error?.message||null,derivedContractSha256:hash(fs.readFileSync(cf)),summarySha256:fs.existsSync(rf)?hash(fs.readFileSync(rf)):null};
  fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});a.equal(result.error,undefined);a.equal(result.signal,null);a.equal(result.status,0);verifyInputs(root,c);a.equal(hash(fs.readFileSync(contractFile)),id.contract);
 }else if(mode==='aggregate'){
  a.ok(arg);const reports=[];
  for(const p of parts){const dir=path.join(path.resolve(arg),p.name),receipt=JSON.parse(fs.readFileSync(path.join(dir,'receipt.json'))),raw=fs.readFileSync(path.join(dir,'summary.json')),r=JSON.parse(raw),{name,...expected}=p;
   a.equal(receipt.name,name);a.equal(receipt.exit,0);a.equal(receipt.signal,null);a.equal(receipt.error,null);a.equal(receipt.summarySha256,hash(raw));
   const cf=fs.readFileSync(path.join(dir,'contract.json'));a.deepEqual(JSON.parse(cf),expected);a.equal(hash(cf),receipt.derivedContractSha256);a.equal(r.contractSha256,hash(cf));a.equal(r.runnerSha256,hash(fs.readFileSync(path.join(root,'tools/input-guard-regression/run.cjs'))));a.equal(r.verifiedInputCount,c.files.length);a.equal(r.childTimeoutMs,c.childTimeoutMs??180000);
   a.match(r.childRunId,/^[a-f0-9-]{36}$/);const tap=fs.readFileSync(path.join(dir,'child-'+r.childRunId+'.tap')),err=fs.readFileSync(path.join(dir,'child-'+r.childRunId+'.stderr'));a.equal(hash(tap),r.childStdoutSha256);a.equal(hash(err),r.childStderrSha256);
   for(const [key,field] of Object.entries({tests:'tests',pass:'passed',fail:'failed',skipped:'skipped',cancelled:'cancelled'})){const matches=[...tap.toString().matchAll(new RegExp('^# '+key+' (\\d+)$','gm'))];a.equal(matches.length,1);a.equal(Number(matches[0][1]),r.counts[field]);}
   reports.push({...r,name,identity:receipt.identity,tests:receipt.tests,expectedTests:receipt.expectedTests});
  }
  const counts=validate(c,id,reports);verifyInputs(root,c);a.equal(hash(fs.readFileSync(contractFile)),id.contract);console.log(JSON.stringify({status:'PASS',identity:id,counts}));
 }else throw Error('usage: run PARTITION | aggregate ARTIFACT_DIRECTORY');
}
module.exports={partition,validate};if(require.main===module){try{main();}catch(e){console.error(e.stack);process.exitCode=1;}}
