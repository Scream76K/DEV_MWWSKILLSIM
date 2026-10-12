const {test}=require('node:test');const assert=require('node:assert/strict');
const a=require('../gunlance-auto-capture-audit.js');
test('reference is never promoted',()=>{const r=a.audit([{kind:'gunlance',name:'A',dps:120,power:{normal:{physical:10}}}],{target:'room'});assert.equal(r.verified,false);assert.equal(r.entries[0].eligibleForVerifiedCapture,false);assert.equal(r.entries[0].missingEvidence.length,5)});
test('missing reference dps remains pending',()=>{const r=a.audit([{kind:'gunlance',dps:null}],{target:'room'});assert.equal(r.entries[0].reason,'REFERENCE_DPS_PENDING')});
test('non-gunlance excluded',()=>{const r=a.audit([{kind:'bow',dps:2}],{target:'room'});assert.deepEqual(r.entries[0].missingEvidence,[])});
test('summary shows missing evidence',()=>{const r=a.audit([{kind:'gunlance',name:'A',dps:100}],{target:'room'});assert.match(a.summary(r),/TECHNIQUE_DB_PROVENANCE/)});
test('invalid comparison rejected',()=>assert.throws(()=>a.audit([],{x:1})));
