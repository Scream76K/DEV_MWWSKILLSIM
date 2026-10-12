const {test}=require('node:test');const assert=require('node:assert/strict');const A=require('../weapon-sharpness-source-audit.js');
test('empty MHDB weapon list is safe',()=>{const r=A.audit([]);assert.equal(r.total,0);assert.equal(r.verified,false)});
test('reports sharpness key without guessing color',()=>{const r=A.audit([{id:1,sharpness:[1,2,3]}]);assert.equal(r.candidatePaths[0].path,'sharpness');assert.equal(r.inferredMaxSharpnessCount,0)});
test('unrelated keys not treated as sharpness',()=>assert.equal(A.audit([{id:1,attack:200}]).candidatePaths.length,0));
test('explicit source requires evidence',()=>assert.equal(A.audit([{maxSharpness:'white'}]).explicitSourceRecords.length,0));
test('explicit evidence recognized but never verified',()=>{const r=A.audit([{id:3,maxSharpness:'white',maxSharpnessEvidenceRef:'source'}]);assert.equal(r.explicitSourceRecords.length,1);assert.equal(r.verified,false)});
test('invalid records listed, no crash',()=>assert.deepEqual(A.audit([null,3,{}]).invalidIndices,[0,1]));
test('reject non-array',()=>assert.throws(()=>A.audit({}),TypeError));
