'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawnSync}=require('node:child_process');
for(const name of ['GL_PRODUCT_REPO','GL_PRODUCT_SHA','GL_PINNED_SNAPSHOT','GL_PINNED_REFERENCES'])assert.ok(process.env[name],name+' required; no silent skip');
const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json')));
for(const e of contract.fixtureHarnessFiles)test('preparation rejects changed fixture dependency '+e.path,()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'gl-prepare-'));
 try{
  const source=path.join(tmp,'snapshot'),output=path.join(tmp,'output');fs.cpSync(process.env.GL_PINNED_SNAPSHOT,source,{recursive:true});
  const target=path.join(source,'harness',e.path);fs.chmodSync(target,0o644);fs.appendFileSync(target,'\n ');
  const r=spawnSync(process.execPath,[path.join(__dirname,'prepare.cjs'),'--repo',process.env.GL_PRODUCT_REPO,'--commit',process.env.GL_PRODUCT_SHA,'--snapshot',source,'--references',process.env.GL_PINNED_REFERENCES,'--output',output],{encoding:'utf8',timeout:30000});
  assert.equal(r.error,undefined);assert.equal(r.status,1);assert.match(r.stderr,/Fixture harness mismatch/);assert.equal(fs.existsSync(output),false);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
