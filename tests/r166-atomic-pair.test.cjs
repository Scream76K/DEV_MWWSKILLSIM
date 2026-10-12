const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createCapture}=require('../gunlance-result-capture.js');
const {transfer}=require('../gunlance-verified-transfer.js');
function payload(id,context='ctx') {return {weaponType:'gunlance',source:'VERIFIED_GENERIC_COMPONENTS',contextId:context,evidenceId:id,components:[{component:'physical',damage:20,hits:1,verified:true,evidenceRef:"test-hit-source"}],durationSeconds:2,durationVerified:true,durationEvidenceRef:"test-duration-source",techniqueDbRevision:"test-revision"};}
function row(id){return {kind:'gunlance',name:id,verifiedCapture:{...payload(id),origin:'CALCULATOR_VERIFIED_EVIDENCE',buildName:id}};}
test('atomic replacePair updates both slots',()=>{const s=createCapture();s.replacePair(payload('oldA'),payload('oldB'));s.replacePair(payload('newA'),payload('newB'));assert.equal(s.status().A.evidenceId,'newA');assert.equal(s.status().B.evidenceId,'newB')});
test('invalid replacement keeps old pair unchanged',()=>{const s=createCapture();s.replacePair(payload('oldA'),payload('oldB'));assert.throws(()=>s.replacePair(payload('newA'),payload('newB','different')),/same verified context/);assert.equal(s.status().A.evidenceId,'oldA');assert.equal(s.status().B.evidenceId,'oldB')});
test('invalid components preserve old pair',()=>{const s=createCapture();s.replacePair(payload('oldA'),payload('oldB'));const bad=payload('bad');bad.components[0].verified=false;assert.throws(()=>s.replacePair(payload('newA'),bad),/unverified/);assert.equal(s.status().A.evidenceId,'oldA')});
test('transfer uses atomic store interface',()=>{const s=createCapture();s.replacePair(payload('oldA'),payload('oldB'));const result=transfer([row('newA'),row('newB')],{verifiedContextId:'ctx'},s);assert.equal(result.status,'TRANSFERRED_VERIFIED_PAIR');assert.equal(s.status().B.evidenceId,'newB')});
