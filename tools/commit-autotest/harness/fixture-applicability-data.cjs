'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
// Requires exact private inputs restored using source-manifest.json. Not part of source-only CI.
test('actual resistance plan records missing premises and unsupported scope separately',()=>{
 const db=require('../input/normalized-data.json'),classification=require('./skill-sources/classification.candidate.json'),raw=require('./skill-sources/raw-skills.json');
 const plan=require('./resistance-conditions-plan.cjs').makeResistanceCases(db,classification,raw);
 assert.equal(plan.cases.length,10);
 for(const c of plan.cases){assert.equal(c.fixtureApplicability.numericAccuracyVerified,false);assert.ok(c.fixtureApplicability.unresolvedDimensions.includes('technique'));assert.ok(c.fixtureApplicability.unresolvedDimensions.includes('component'));}
 assert.equal(plan.cases.filter(c=>c.fixtureApplicability.status==='PRODUCT_SCOPE_UNSUPPORTED').length,1);
 assert.equal(plan.cases.filter(c=>c.fixtureApplicability.missingPrerequisites.includes('element')).length,2);
 assert.equal(plan.cases.filter(c=>c.fixtureApplicability.missingPrerequisites.includes('conditions')).length,2);
});
test('actual scan keeps all 199 explicit weapon exclusions and leaves unknowns unresolved',()=>{
 const db=require('../input/normalized-data.json'),classification=require('./skill-sources/classification.candidate.json'),raw=require('./skill-sources/raw-skills.json');
 const plan=require('./skill-plan.cjs').makePlan(classification,raw,db);
 assert.equal(plan.jobs.length,2562);
 assert.equal(plan.jobs.filter(c=>c.fixtureApplicability.status==='DELIBERATE_NON_TARGET').length,199);
 for(const c of plan.jobs.filter(c=>c.applicability!=='NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE'))assert.equal(c.fixtureApplicability.status,'APPLICABILITY_UNRESOLVED');
});
