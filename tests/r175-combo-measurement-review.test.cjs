const test=require('node:test'),assert=require('node:assert/strict');
const {review,format}=require('../combo-measurement-review.js');
const p={entries:[{techniqueId:'a'},{techniqueId:'a'}]};
const a={stage:1,techniqueId:'a',evidenceRef:' video ',gameVersion:'1.042.00.02',hitCount:2,durationSeconds:1.25,damage:{physicalBody:100,elementalBody:20}};
test('stage-specific observation and frozen snapshot without DPS promotion',()=>{const r=review(p,[a]);assert.equal(r.accepted[0].evidenceRef,'video');assert.deepEqual(r.missingStages,[2]);assert.equal(r.captureEligible,false);assert.equal(r.verifiedDps,null);assert.ok(Object.isFrozen(r.accepted[0].damage));assert.match(format(r),/未検証/)});
test('duplicate stage and identity mismatch rejected',()=>{const r=review(p,[a,a,{...a,stage:2,techniqueId:'b'}]);assert.deepEqual(r.rejected.map(x=>x.reason),['DUPLICATE_STAGE','STAGE_TECHNIQUE_MISMATCH'])});
test('invalid timing, hit count, negative damage rejected',()=>{const r=review(p,[{...a,durationSeconds:0},{...a,hitCount:0},{...a,damage:{physicalBody:-1}}]);assert.deepEqual(r.rejected.map(x=>x.reason),['INVALID_DURATION','INVALID_HIT_COUNT','INVALID_DAMAGE_COMPONENTS'])});
test('unknown component, absent evidence and version rejected',()=>{const r=review(p,[{...a,damage:{unknown:2}},{...a,evidenceRef:''},{...a,gameVersion:''}]);assert.deepEqual(r.rejected.map(x=>x.reason),['INVALID_DAMAGE_COMPONENTS','EVIDENCE_REF_REQUIRED','GAME_VERSION_REQUIRED'])});
test('repeated technique stages are distinct',()=>{const r=review(p,[a,{...a,stage:2}]);assert.equal(r.accepted.length,2);assert.equal(r.missingStages.length,0);assert.equal(r.captureEligible,false)});
