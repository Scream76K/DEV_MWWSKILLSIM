'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
function verifyPreparedInputs(work,contract){
 const expected=contract.expectedInputFiles.map(e=>({...e,sha256:e.path==='hope-hammer-browser-adapter.js'?contract.candidateAdapterSha256:e.sha256}));
 const generated=JSON.parse(fs.readFileSync(path.join(work,'harness/expected-inputs.json')));
 assert.deepEqual(generated,expected,'GENERATED_INPUT_MANIFEST_MISMATCH');
 for(const e of expected){const file=path.join(work,'input',e.path);assert.ok(fs.lstatSync(file).isFile(),'INPUT_NOT_REGULAR: '+e.path);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),e.sha256,'PUBLISHED_INPUT_CONTRACT_MISMATCH: '+e.path);}
}
module.exports={verifyPreparedInputs};
