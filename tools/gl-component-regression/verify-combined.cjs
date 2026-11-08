"use strict";
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
function verifyCombined(){
 const contract=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures-contract.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 for(const e of contract.runtimeFiles)assert.equal(hash(fs.readFileSync(path.join(__dirname,e.destination))),e.sha256,'Runtime mismatch: '+e.destination);
 for(const e of contract.fixtureHarnessFiles)assert.equal(hash(fs.readFileSync(path.join(__dirname,'work/harness',e.path))),e.sha256,'Fixture harness mismatch: '+e.path);
 for(const e of contract.referenceFiles)assert.equal(hash(fs.readFileSync(path.join(__dirname,'reference-pinned',e.path))),e.sha256,'Pinned reference mismatch: '+e.path);
 assert.equal(hash(fs.readFileSync(path.join(__dirname,'baseline-adapter.js'))),contract.publicBaselineAdapter.sha256,'Public baseline adapter mismatch');
 require('./verify-inputs.cjs').verifyPreparedInputs(path.join(__dirname,'work'),contract);
}
module.exports={verifyCombined};
