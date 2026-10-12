const {test}=require('node:test');const assert=require('node:assert/strict');const B=require('../technique-damage-engine-bridge.js');
const p={weaponType:'great-sword',entries:[{techniqueId:'legacy'}]};
const audit=()=>({weaponType:'great-sword',techniqueId:'GS',calculable:true});
const engine={hits:()=>[{mv:100,elementModifier:1}]};
test('confirmed canonical hit data remains read-only and never yields DPS',()=>{const r=B.inspect(p,[{canonicalTechniqueId:'GS',handler:'physical'}],audit,engine);assert.equal(r.rows[0].hitCount,1);assert.equal(r.rows[0].damage,null);assert.equal(r.captureEligible,false);assert.equal(r.verifiedDps,null);});
test('legacy id cannot silently substitute for canonical id',()=>{const r=B.inspect(p,[{handler:'physical'}],audit,engine);assert.ok(r.rows[0].blockers.includes('CANONICAL_TECHNIQUE_ID_MISSING'));});
test('audit identity mismatch fails closed',()=>{const r=B.inspect(p,[{canonicalTechniqueId:'GS',handler:'physical'}],()=>({...audit(),techniqueId:'OTHER'}),engine);assert.ok(r.rows[0].blockers.includes('CANONICAL_TECHNIQUE_NOT_CONFIRMED'));});
test('missing hit element modifier blocks numeric readiness',()=>{const r=B.inspect(p,[{canonicalTechniqueId:'GS',handler:'physical'}],audit,{hits:()=>[{mv:10}]});assert.equal(r.rows[0].hitCount,null);});
test('engine exceptions are contained',()=>{const r=B.inspect(p,[{canonicalTechniqueId:'GS',handler:'physical'}],audit,{hits:()=>{throw Error('gated');}});assert.ok(r.rows[0].blockers.includes('TECHNIQUE_HITS_GATED'));});
