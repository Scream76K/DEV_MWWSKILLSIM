'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const mutation of ['adapter-and-manifest','adapter-only','remove-entry','extra-entry','reorder'])test(mutation+' cannot bypass published input contract',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gl-input-contract-'));
 try{
  fs.cpSync(__dirname,tmp,{recursive:true,filter:p=>!p.startsWith(path.join(__dirname,'runs'))});
  const file=path.join(tmp,'work/input/hope-hammer-browser-adapter.js'),manifest=path.join(tmp,'work/harness/expected-inputs.json'),entries=JSON.parse(fs.readFileSync(manifest));
  if(mutation.startsWith('adapter'))fs.appendFileSync(file,'\n// tamper proof\n');
  if(mutation==='adapter-and-manifest')entries.find(e=>e.path==='hope-hammer-browser-adapter.js').sha256=hash(fs.readFileSync(file));
  if(mutation==='remove-entry')entries.pop();if(mutation==='extra-entry')entries.push({path:'bogus.js',sha256:'0'.repeat(64)});if(mutation==='reorder')entries.reverse();
  fs.writeFileSync(manifest,JSON.stringify(entries));
  const output=path.join(tmp,'collector-output');fs.mkdirSync(output);
  const child=spawnSync(process.execPath,[path.join(tmp,'work/harness/gl-affinity.cjs'),'case','original:57:1:gunlance',crypto.randomUUID(),output],{encoding:'utf8',timeout:10000});
  assert.equal(child.error,undefined);assert.equal(child.status,1);assert.match(child.stderr,/GENERATED_INPUT_MANIFEST_MISMATCH|PUBLISHED_INPUT_CONTRACT_MISMATCH/);assert.deepEqual(fs.readdirSync(output),[]);
  fs.writeFileSync(path.join(tmp,'regression-summary.json'),JSON.stringify({status:'PASS',runId:'old'}));
  const driver=spawnSync(process.execPath,[path.join(tmp,'regression.cjs')],{encoding:'utf8',timeout:10000});assert.equal(driver.error,undefined);assert.equal(driver.status,1);
  const summary=JSON.parse(fs.readFileSync(path.join(tmp,'regression-summary.json')));assert.equal(summary.status,'FAIL');assert.notEqual(summary.runId,'old');assert.deepEqual(summary.cases,[]);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
