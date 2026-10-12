const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {audit}=require('../gunlance-auto-capture-audit.js');
test('reference values never promoted to verified capture',()=>{const r=audit([{name:'A',kind:'gunlance',dps:120,power:{normal:{physical:50,element:10}}}],{monster:'test'});assert.equal(r.verified,false);assert.equal(r.entries[0].eligibleForVerifiedCapture,false);assert.equal(r.entries[0].referenceDps,120);assert.equal(r.entries[0].reason,'EVIDENCE_HITS_DURATION_NOT_VERIFIED');});
test('missing DPS remains pending',()=>{assert.equal(audit([{kind:'gunlance',dps:null}],{}).entries[0].reason,'REFERENCE_DPS_PENDING');});
test('other weapons not eligible',()=>{assert.equal(audit([{kind:'bow',dps:20}],{}).entries[0].reason,'NOT_GUNLANCE');});
test('reject empty rows',()=>assert.throws(()=>audit([],{})));
test('page exposes audit button and script',()=>{const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert.match(s,/id="comparisonCaptureAudit"/);assert.match(s,/gunlance-auto-capture-audit\.js/);assert.match(s,/MHWGunlanceAutoCaptureAudit\.audit/);});
