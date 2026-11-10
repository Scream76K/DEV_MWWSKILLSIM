'use strict';
const assert=require('node:assert/strict');
function makeConditionCases(db,classification,raw,{smoke=false}={}){
 const ids=[24,82],sort=(a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id;
 const hasSkill=(w,id)=>(w.skills||[]).some(x=>x.skill?.id===id);
 const fire=w=>(w.specials||[]).find(x=>x.kind==='element'&&x.element==='fire'&&x.hidden===false&&Number(x.damage?.raw)>0);
 const eligible=db.weapons.filter(w=>w.kind==='great-sword'&&w.affinity>0&&fire(w)&&ids.every(id=>!hasSkill(w,id))).sort(sort)[0];
 const control=db.weapons.filter(w=>w.kind==='great-sword'&&w.affinity===0&&(w.specials||[]).length===0&&ids.every(id=>!hasSkill(w,id))).sort(sort)[0];
 assert.ok(eligible,'No real fire/positive-affinity GS without target skills');assert.ok(control,'No prerequisite-missing GS control');
 const cases=[];
 for(const id of ids){
  const skill=raw.find(x=>x.id===id),candidate=classification.skillCandidates.find(x=>x.id===id);assert.ok(skill&&candidate);assert.equal(candidate.candidateCategory,'damage');
  for(const level of candidate.candidateEffectiveLevels.filter(x=>!smoke||x===1)){
   const rank=skill.ranks.find(r=>r.level===level);assert.ok(rank);
   cases.push({key:'eligible:'+id+':'+level,skillId:id,name:skill.name,level,rankId:rank.id,weaponId:eligible.id,prerequisites:'ELIGIBLE_FIRE_POSITIVE_AFFINITY_GS',sourceDescription:skill.description,rankDescription:rank.description,sourceV5Case:id+':'+level+':great-sword'});
  }
  cases.push({key:'missing-prerequisites:'+id+':1',skillId:id,name:skill.name,level:1,rankId:skill.ranks.find(r=>r.level===1).id,weaponId:control.id,prerequisites:'NO_ELEMENT_ZERO_AFFINITY_CONTROL',sourceDescription:skill.description,rankDescription:skill.ranks.find(r=>r.level===1).description,sourceV5Case:id+':1:great-sword'});
 }
 return {selectionRule:'Minimum rarity, then numeric ID from the unchanged DB. Eligible: fire element >0, affinity >0, neither target skill already present. Control: no element, zero affinity, neither target skill present.',eligibleWeapon:eligible,prerequisiteMissingWeapon:control,cases};
}
module.exports={makeConditionCases};
