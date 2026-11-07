'use strict';
const assert=require('node:assert/strict'),{makePlan}=require('./skill-plan.cjs');
const triage=require('./diagnostic-sources/v7-uncalculated-classification.json');
function makeGlAffinityPlan(db,classification,raw,{smoke=false}={}){
 const original=makePlan(classification,raw,db),weapon=original.weapons.find(w=>w.kind==='gunlance');
 const selected=triage.cases.filter(c=>c.gunlanceBlockedModifiers.length&&c.gunlanceBlockedModifiers.every(n=>['弱点特効','力の解放'].includes(n)));assert.equal(selected.length,15);
 const armorFor=job=>{const rows=db.armor.filter(a=>(a.skills||[]).some(g=>g.skill?.id===job.skillId)||db.sets.some(s=>s.id===a.armorSet?.id&&[s.setBonusSkill,s.groupBonusSkill].flat().filter(Boolean).some(sk=>sk.id===job.skillId))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);const distinct=[];for(const a of rows)if(!distinct.some(x=>x.kind===a.kind))distinct.push(a);return distinct.slice(0,job.requiredPieces).map(a=>a.id);};
 const grant=(id,level)=>{const s=raw.find(s=>s.id===id);assert.ok(s?.ranks.some(r=>r.level===level));return {id,name:s.name,level,type:s.kind==='weapon'?'weapon':'armor'};};
 const cases=selected.map(c=>{const job=original.jobs.find(j=>j.key===c.key);assert.ok(job);const armorIds=job.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES'?armorFor(job):[];return {...job,key:'original:'+job.key,sourceKey:job.key,sourceType:armorIds.length?'ORIGINAL_COACTIVATED_ARMOR':'ORIGINAL_SINGLE_SKILL',route:'STANDARD_MIXED',armorIds,grants:armorIds.length?[]:[grant(job.skillId,job.level)],originalEvidence:c,blockedModifiers:c.gunlanceBlockedModifiers,matchedNoSkillControlPossible:armorIds.length===0};});
 cases.push({key:'control:both-affinity',sourceKey:'131:1:gunlance',sourceType:'ISOLATED_COACTIVATED_AFFINITY_PAIR_NOT_ARMOR_EQUIVALENT',route:'STANDARD_MIXED',armorIds:[],grants:[grant(57,1),grant(142,3)],blockedModifiers:['弱点特効','力の解放'],matchedNoSkillControlPossible:true});
 cases.push({key:'control:maximum-might',sourceKey:null,sourceType:'EXISTING_ID99_EXCEPTION_CONTROL',route:'STANDARD_MIXED',armorIds:[],grants:[grant(99,1)],blockedModifiers:[],matchedNoSkillControlPossible:true});
 for(const id of [57,142])cases.push({key:'body-only:'+id+':1',sourceKey:id+':1:gunlance',sourceType:'EXPLICIT_BODY_ONLY_CONTROL',route:'EXPLICIT_SLAM_SWEEP',armorIds:[],grants:[grant(id,1)],blockedModifiers:[],matchedNoSkillControlPossible:true});
 const smokeKeys=['original:57:1:gunlance','original:142:1:gunlance','control:maximum-might','body-only:57:1','body-only:142:1'];
 return {weapon,cases:smoke?cases.filter(c=>smokeKeys.includes(c.key)):cases,originalSourceCaseCount:15,selectionRule:'All 15 original cases whose returned GL modifiers consist solely of Weakness Exploit and/or Latent Power. Original armor selection is unchanged. Added two-skill diagnostic mirror is not equivalent to the armor build; ID99 is an existing approved-code exception, not a widened allowlist.'};
}
module.exports={makeGlAffinityPlan};
