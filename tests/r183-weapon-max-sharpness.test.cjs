const {test}=require('node:test');const assert=require('node:assert/strict');const S=require('../weapon-max-sharpness.js');
const ready={rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]};
const w={maxSharpness:'purple',maxSharpnessEvidenceRef:'weapon-specific MHDB record'};
test('maximum purple uses physical and element multiplier separately',()=>{const r=S.resolve(w,ready);assert.equal(r.options.sharpnessPhysicalMultiplier,1.39);assert.equal(r.options.sharpnessElementMultiplier,1.25);assert.equal(r.sharpnessDepletionApplied,false);});
test('unknown weapon max does not default to white',()=>assert.equal(S.resolve({name:'A'},ready).options,null));
test('numeric user-entered sharpness is not accepted',()=>assert.equal(S.resolve({maxSharpness:1.32,maxSharpnessEvidenceRef:'ref'},ready).options,null));
test('weapon-specific provenance required',()=>assert.equal(S.resolve({maxSharpness:'white'},ready).options,null));
test('blocked handoff remains blocked',()=>assert.equal(S.resolve(w,{rows:[{status:'ENGINE_CONTEXT_BLOCKED'}]}).options,null));
test('all colors have distinct physical and elemental lookup',()=>{for(const color of S.colors){const r=S.resolve({...w,maxSharpness:color},ready);assert.ok(r.options.sharpnessPhysicalMultiplier>0);assert.ok(r.options.sharpnessElementMultiplier>0);}});
