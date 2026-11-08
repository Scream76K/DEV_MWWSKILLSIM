'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const api=require('./fixture-applicability.cjs');
const confirmed=value=>({status:'SATISFIED',value,source:'test-evidence'});
const dimensions=()=>Object.fromEntries(['weapon','element','technique','component','conditions'].map(k=>[k,confirmed(k)]));
test('requires evidence for every applicability dimension, never a numeric oracle',()=>{
 assert.equal(typeof api.assessFixture,'function');
 const result=api.assessFixture({dimensions:dimensions()});
 assert.equal(result.status,'PREREQUISITES_ESTABLISHED_ACCURACY_UNVERIFIED');
 assert.equal(result.numericAccuracyVerified,false);
 for(const name of Object.keys(dimensions())){const d=dimensions();delete d[name];assert.equal(api.assessFixture({dimensions:d}).status,'APPLICABILITY_UNRESOLVED');}
 const d=dimensions();delete d.technique.source;assert.equal(api.assessFixture({dimensions:d}).status,'APPLICABILITY_UNRESOLVED');
});
test('unsupported product and missing fixture premises coexist and are not non-target',()=>{
 assert.equal(typeof api.assessFixture,'function');
 const d=dimensions();d.element={status:'MISSING',source:'actual-fixture'};
 const r=api.assessFixture({dimensions:d,productSupport:{status:'UNSUPPORTED',source:'pinned-product-scope'}});
 assert.equal(r.status,'PRODUCT_SCOPE_UNSUPPORTED');assert.deepEqual(r.missingPrerequisites,['element']);assert.equal(r.deliberateNonTarget,false);
});
test('only sourced explicit exclusions become deliberate non-target',()=>{
 assert.equal(typeof api.assessFixture,'function');
 assert.equal(api.assessFixture({nonTarget:{source:'MHDB-description',reason:'explicit weapon restriction'}}).status,'DELIBERATE_NON_TARGET');
 assert.equal(api.assessFixture({nonTarget:{reason:'unchanged output'}}).status,'APPLICABILITY_UNRESOLVED');
});
test('fixture selector is deterministic, preserves innate skills, and fails on absent match',()=>{
 assert.equal(typeof api.selectElementFixture,'function');
 const weapons=[{id:2,rarity:1,kind:'bow',skills:[{skill:{id:9}}],specials:[{kind:'element',element:'water',hidden:false,damage:{raw:10}}]},{id:1,rarity:2,kind:'bow',specials:[]}];
 assert.equal(api.selectElementFixture(weapons,{kind:'bow',element:'water',excludedSkillIds:[181]}),weapons[0]);
 assert.throws(()=>api.selectElementFixture(weapons,{kind:'bow',element:'thunder'}),/No matching/);
 assert.throws(()=>api.selectElementFixture(weapons,{kind:'bow',element:'water',excludedSkillIds:[9]}),/No matching/);
});
