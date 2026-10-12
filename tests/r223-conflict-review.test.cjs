const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const review=JSON.parse(fs.readFileSync(path.join(root,'TECHNIQUE_CONFLICT_REVIEW_r223.json'),'utf8'));
const evidence=JSON.parse(fs.readFileSync(path.join(root,'TECHNIQUE_SOURCE_EVIDENCE_r222.json'),'utf8'));
test('all 37 conflict-flagged techniques represented exactly once',()=>{
 const expected=evidence.records.filter(x=>x.conflicts.length).map(x=>x.techniqueId).sort();
 assert.equal(review.total,37);assert.deepEqual(review.packets.map(x=>x.techniqueId).sort(),expected);
});
test('every conflict packet preserves weapon, name and original flags',()=>{
 const m=new Map(evidence.records.map(x=>[x.techniqueId,x]));
 for(const p of review.packets){const x=m.get(p.techniqueId);assert.equal(p.weaponKind,x.weaponKind);assert.equal(p.techniqueName,x.techniqueName);assert.deepEqual(p.conflictFlags,x.conflicts);}
});
test('no source completion or numeric promotion is fabricated',()=>{
 for(const p of review.packets){assert.equal(p.state,'SOURCE_RECONCILIATION_REQUIRED');assert.equal(p.automaticNumericPromotion,false);assert.equal(p.userDecisionRequested,false);assert.equal(p.measurementRequested,false);}
});
test('weapon subtotals match and all issues are classified',()=>{
 const counts={};for(const p of review.packets){counts[p.weaponKind]=(counts[p.weaponKind]||0)+1;assert.ok(p.issueTypes.length>0);assert.ok(!p.issueTypes.includes('OTHER'));}
 assert.deepEqual(counts,review.byWeapon);
});
test('source versions and references are not invented',()=>{
 const m=new Map(evidence.records.map(x=>[x.techniqueId,x]));
 for(const p of review.packets){const x=m.get(p.techniqueId);assert.equal(p.existingSourceVersion,x.sourceVersion);assert.equal(p.existingSourceUrl,x.sourceEvidence.sourceUrl);}
});
