const {test}=require('node:test');const assert=require('node:assert/strict');
const {createCapture}=require('../gunlance-result-capture.js');
function payload(d=68){return {weaponType:'gunlance',source:'VERIFIED_GENERIC_COMPONENTS',contextId:'same',evidenceId:'capture-01',durationSeconds:2,durationVerified:true,components:[{component:'shelling',damage:d,hits:2,verified:true}]};}
test('registered snapshot is unaffected by subsequent nested mutations',()=>{const s=createCapture(),a=payload();s.put('A',a);s.put('B',payload(70));const original=s.compare().a.dps;a.components[0].damage=999;a.durationSeconds=100;assert.equal(s.compare().a.dps,original)});
test('rejected capture does not overwrite valid snapshot',()=>{const s=createCapture();s.put('A',payload());const bad=payload();bad.components[0].hits=0;assert.throws(()=>s.put('A',bad));assert.equal(s.status().A.evidenceId,'capture-01')});
test('non-JSON nested data cannot enter stored evidence',()=>{const s=createCapture();const a=payload();a.metadata={fn:()=>42};assert.throws(()=>s.put('A',a),/non-JSON/);assert.equal(s.status().A,null)});
test('cyclic evidence cannot be captured',()=>{const s=createCapture();const a=payload();a.metadata={};a.metadata.self=a.metadata;assert.throws(()=>s.put('A',a),/cyclic/)});
