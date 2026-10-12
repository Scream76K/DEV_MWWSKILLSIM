const {test}=require('node:test');const assert=require('node:assert/strict');const B=require('../technique-sharpness-input.js');
const ready={rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]};
test('explicit sharpness and source can pass as reference only',()=>{const r=B.resolve('1.32','user reference',ready);assert.equal(r.status,'USER_REPORTED_REFERENCE_ONLY');assert.equal(r.options.sharpnessPhysicalMultiplier,1.32);assert.equal(r.verified,false)});
test('empty multiplier cannot silently become zero',()=>assert.equal(B.resolve('','ref',ready).options,null));
test('missing source blocks',()=>assert.equal(B.resolve(1.32,' ',ready).options,null));
test('out of range multiplier blocks',()=>assert.equal(B.resolve(3,'ref',ready).options,null));
test('blocked handoff blocks even with source',()=>assert.equal(B.resolve(1.32,'ref',{rows:[{status:'ENGINE_CONTEXT_BLOCKED'}]}).options,null));
test('missing handoff blocks',()=>assert.equal(B.resolve(1.32,'ref',null).options,null));
