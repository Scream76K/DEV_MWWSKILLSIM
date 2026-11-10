'use strict';
const test=require('node:test'),assert=require('node:assert/strict');let api;try{api=require('./current-evidence.cjs')}catch{api={}}
test('condition case selection keeps fixed skill coverage when current behavior changes',()=>{
 assert.equal(typeof api.selectCurrentCases,'function');const jobs=[{sourceV5Case:'24:1:great-sword'}];
 const scan={runId:'new',sourceCommit:'a'.repeat(40),cases:[{key:'24:1:great-sword',comparison:{decision:'EXPECTED_CHANGE_OBSERVED',channels:{normal:{changed:true}}}}]};
 assert.equal(api.selectCurrentCases(scan,jobs,'a'.repeat(40))[0].key,'24:1:great-sword');
 assert.throws(()=>api.selectCurrentCases(null,jobs,'a'.repeat(40)),/CURRENT_SCAN_REQUIRED/);
 assert.throws(()=>api.selectCurrentCases({...scan,sourceCommit:'b'.repeat(40)},jobs,'a'.repeat(40)),/CURRENT_SCAN_COMMIT_MISMATCH/);
 assert.throws(()=>api.selectCurrentCases({...scan,cases:[]},jobs,'a'.repeat(40)),/CURRENT_SCAN_CASE_MISSING/);
});
