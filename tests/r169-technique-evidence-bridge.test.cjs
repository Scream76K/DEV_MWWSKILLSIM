const {test}=require('node:test');const assert=require('node:assert/strict');const {inspect}=require('../technique-evidence-bridge.js');
test('maps canonical audit provenance without promoting DPS',()=>{const r=inspect('gunlance',['a'],()=>({weaponType:'gunlance',techniqueId:'a',calculable:true,verificationStatus:'VERIFIED',evidenceRefs:['source1','source1']}));assert.deepEqual(r.entries[0].evidenceRefs,['source1']);assert.equal(r.captureEligible,false);assert.equal(r.damage,null);assert.equal(r.durationSeconds,null)});
test('unknown technique remains pending',()=>{const r=inspect('gunlance',['missing'],()=>null);assert.equal(r.entries[0].status,'MISSING_TECHNIQUE')});
test('rejects malformed route',()=>assert.throws(()=>inspect('gunlance',[],()=>null)));
test('rejects mismatched audit identity',()=>{const r=inspect('gunlance',['a'],()=>({weaponType:'bow',techniqueId:'a',calculable:true}));assert.equal(r.entries[0].calculable,false)});
test('returns immutable provenance snapshot',()=>{const r=inspect('gunlance',['a'],()=>({weaponType:'gunlance',techniqueId:'a',calculable:false,evidenceRefs:['ref']}));assert.equal(Object.isFrozen(r.entries[0].evidenceRefs),true)});
