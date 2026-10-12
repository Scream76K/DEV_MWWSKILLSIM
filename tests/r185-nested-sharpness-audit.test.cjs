const {test}=require('node:test');const assert=require('node:assert/strict');const A=require('../weapon-sharpness-source-audit.js');
test('nested sharpness object paths are audited',()=>{const r=A.audit([{id:1,weapon:{sharpness:{base:[1,2],upgraded:[3,4]}}}]);assert.ok(r.candidatePaths.some(p=>p.path==='weapon.sharpness.base'));assert.equal(r.inferredMaxSharpnessCount,0)});
test('nested array item shape audited',()=>{const r=A.audit([{upgrades:[{sharpness:{color:'white'}}]}]);assert.ok(r.candidatePaths.some(p=>p.path==='upgrades[].sharpness.color'))});
test('unrelated nested fields are not counted',()=>{const r=A.audit([{weapon:{attack:12,element:{value:4}}}]);assert.equal(r.candidatePaths.length,0)});
test('cycles do not crash or infer maxima',()=>{const w={id:1,sharpness:{value:3}};w.self=w;const r=A.audit([w]);assert.equal(r.inferredMaxSharpnessCount,0)});
test('field types and samples are read-only diagnostics',()=>{const r=A.audit([{sharpness:{max:'purple'}}]);const p=r.candidatePaths.find(x=>x.path==='sharpness.max');assert.deepEqual(p.samples,['purple']);assert.equal(r.verified,false)});
test('depth and node limits prevent runaway recursion',()=>{let w={};let cur=w;for(let i=0;i<20;i++){cur.child={};cur=cur.child}cur.sharpness='purple';const r=A.audit([w]);assert.equal(r.inferredMaxSharpnessCount,0)});
