const {test}=require('node:test');const assert=require('node:assert/strict');const A=require('../weapon-sharpness-schema-adapter.js');
test('accepts explicit sourced maximum',()=>{const w=A.adapt({id:1,maxSharpness:'white',maxSharpnessEvidenceRef:'mhdb:1'});assert.equal(w.weapon.maxSharpness,'white');assert.equal(w.status,'EXPLICIT_SCHEMA_ACCEPTED_REFERENCE_ONLY')});
test('rejects guessed gauge array',()=>{assert.equal(A.adapt({sharpness:[10,20,30]}).weapon,null)});
test('rejects nested upgrade color without selected state',()=>{assert.equal(A.adapt({upgrades:[{sharpness:{color:'purple'}}]}).weapon,null)});
test('rejects unsourced explicit color',()=>{assert.equal(A.adapt({maxSharpness:'purple'}).weapon,null)});
test('rejects conflicting variant metadata',()=>{assert.equal(A.adapt({maxSharpness:'white',maxSharpnessEvidenceRef:'src',selectedArtiaSharpness:'purple'}).weapon,null)});
test('does not mutate original weapon',()=>{const w={maxSharpness:'blue',maxSharpnessEvidenceRef:' ref '};const r=A.adapt(w);assert.equal(w.maxSharpnessEvidenceRef,' ref ');assert.equal(r.weapon.maxSharpnessEvidenceRef,'ref')});
