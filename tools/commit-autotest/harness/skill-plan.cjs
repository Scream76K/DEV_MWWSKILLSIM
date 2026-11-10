'use strict';
const assert=require('node:assert/strict');
const {assessFixture}=require('./fixture-applicability.cjs');
const kinds=['great-sword','long-sword','sword-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'];
// Only explicit weapon names in the supplied original skill description narrow this list.
// This is not a game-condition oracle or an inference from missing output changes.
const explicitKinds={2:['light-bowgun','heavy-bowgun','bow'],6:['light-bowgun','heavy-bowgun','bow'],7:['switch-axe','charge-blade'],23:['light-bowgun'],69:['light-bowgun','heavy-bowgun','bow'],83:['hammer'],94:['light-bowgun','heavy-bowgun','bow'],109:['gunlance','charge-blade'],137:['light-bowgun','heavy-bowgun','bow'],140:['light-bowgun','heavy-bowgun'],159:['gunlance']};
function makePlan(classification,raw,database){
 const candidates=classification.skillCandidates;assert.equal(candidates.length,179);
 const skills=[],jobs=[],rankDispositions=[];
 for(const c of candidates){
  const original=raw.find(s=>s.id===c.id);assert.ok(original,'raw skill '+c.id);assert.equal(original.name,c.name);assert.equal(original.kind,c.kind);
  assert.deepEqual(c.allRawLevels,original.ranks.map(r=>r.level));
  for(const r of original.ranks){const review=c.rankReview.find(x=>x.level===r.level);assert.ok(review);assert.equal(review.id,r.id);assert.equal(review.description,r.description);assert.equal(review.setPiecesRequired,r.setPiecesRequired);}
  const levels=c.candidateCategory==='damage'?(c.candidateEffectiveLevels||[]):[];
  assert.equal(new Set(levels).size,levels.length);assert.ok(levels.every(level=>Number.isInteger(level)&&original.ranks.some(r=>r.level===level)),'Candidate effective ranks must exist in the original');
  const dbSkill=database.skills.find(x=>x.id===c.id);assert.ok(dbSkill);assert.equal(dbSkill.name,original.name);assert.deepEqual(dbSkill.ranks,original.ranks);
  const skill={id:c.id,name:c.name,kind:c.kind,category:c.candidateCategory??'unresolved',description:original.description,effectiveLevels:levels,rawRanks:original.ranks,classificationReason:c.reason,sourceEvidence:c.sourceEvidence,classificationApproval:null};skills.push(skill);
  for(const rank of original.ranks){
   const selected=levels.includes(rank.level);const disposition=selected?'TARGET_CANDIDATE':c.candidateCategory===null?'UNVERIFIED_CLASSIFICATION':c.candidateCategory==='damage'?'NON_TARGET_RANK_WITHIN_DIRECT_DAMAGE_SCOPE':'NON_TARGET_'+String(c.candidateCategory).toUpperCase().replace('-','_');
   rankDispositions.push({skillId:c.id,rankId:rank.id,level:rank.level,disposition,reason:selected?'Candidate direct-damage effective rank; not approval or independently verified expectation':c.reason});
   if(!selected)continue;
   assert.ok(original.ranks.some(r=>r.level===rank.level));
   for(const kind of kinds){
    const allowed=explicitKinds[c.id];
    const applies=allowed?!allowed.includes(kind)?'NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE':'WEAPON_KIND_ALLOWED_TRIGGER_UNVERIFIED':'WEAPON_AND_TRIGGER_APPLICABILITY_UNVERIFIED';
    const fixtureApplicability=assessFixture({nonTarget:applies==='NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE'?{source:'MHDB raw-skills.json:'+original.id,reason:original.description}:null});
    jobs.push({fixtureApplicability,key:c.id+':'+rank.level+':'+kind,skillId:c.id,name:c.name,skillKind:c.kind,rankId:rank.id,level:rank.level,kind,requiredPieces:rank.setPiecesRequired,applicability:applies,applicabilityReason:allowed?'Original description explicitly names weapon types; relevant move/ammo/state still must be established.':'No exhaustive weapon/state applicability rule was independently established. Numeric output must not imply effect activation.',equipmentRoute:['set','group'].includes(c.kind)?'REAL_DATABASE_ARMOR_PIECES':'SYNTHETIC_SINGLE_SKILL_CUSTOM_CHARM',equipmentLegality:'UNVERIFIED_NOT_A_COMPLETE_LEGAL_BUILD'});
   }
  }
 }
 const weapons=kinds.map(kind=>{const w=database.weapons.filter(w=>w.kind===kind).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];assert.ok(w);return {kind,uiKind:kind==='sword-shield'?'sword-and-shield':kind,id:w.id,name:w.name};});
 return {skills,rankDispositions,jobs,weapons};
}
module.exports={makePlan,kinds,explicitKinds};
