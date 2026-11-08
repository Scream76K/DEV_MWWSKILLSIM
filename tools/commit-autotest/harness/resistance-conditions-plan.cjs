'use strict';
const assert=require('node:assert/strict');
const {selectElementFixture,elementOf,assessFixture}=require('./fixture-applicability.cjs');
const sort=(a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id;
function makeResistanceCases(db,classification,raw,{smoke=false}={}){
 const categories=new Map(classification.skillCandidates.map(s=>[s.id,s.candidateCategory]));
 const armor=db.armor.filter(a=>a.resistances?.water>0&&a.resistances?.thunder>0&&(a.skills||[]).every(s=>categories.get(s.skill.id)==='non-damage'||s.setPiecesRequired>1)).sort(sort)[0];assert.ok(armor);
 const cases=[];
 const add=(element,kind,premise='SAME_ELEMENT_POSITIVE_EQUIPMENT_RESISTANCE')=>{
  const skillId=element==='water'?181:165,skill=raw.find(s=>s.id===skillId);assert.ok(skill);
  const noElement=premise==='NO_MATCHING_ELEMENT_CONTROL';
  const weapon=selectElementFixture(db.weapons,{kind,element,excludedSkillIds:[165,181],noElement});assert.ok(weapon);
  const applicability=assessFixture({dimensions:{weapon:{status:'SATISFIED',value:kind,source:'normalized-data.json:weapons/'+weapon.id},element:{status:noElement?'MISSING':'SATISFIED',value:element,source:'normalized-data.json:weapons/'+weapon.id},conditions:{status:premise==='ZERO_EQUIPMENT_RESISTANCE_CONTROL'?'MISSING':'SATISFIED',value:'positive equipment resistance for increase probe',source:'normalized-data.json:armor/'+armor.id}},productSupport:element==='water'&&!['long-sword','bow'].includes(kind)?{status:'UNSUPPORTED',source:'pinned product MHWaterConversionRule.coefficients'}:{status:'UNRESOLVED'}});
  cases.push({fixtureApplicability:applicability,key:element+':'+kind+':'+premise,skillId,name:skill.name,level:1,rankId:skill.ranks.find(r=>r.level===1).id,element,kind,weaponId:weapon.id,armorId:premise==='ZERO_EQUIPMENT_RESISTANCE_CONTROL'?null:armor.id,premise,sourceCase:skillId+':1:'+kind,sourceDescription:skill.description,rankDescription:skill.ranks.find(r=>r.level===1).description});
 };
 for(const kind of ['long-sword','bow'])add('water',kind);
 for(const kind of ['great-sword','long-sword','bow'])add('thunder',kind);
 add('water','great-sword','OUTSIDE_WATER_ADOPTED_WEAPON_SCOPE_CONTROL');
 add('water','long-sword','NO_MATCHING_ELEMENT_CONTROL');add('thunder','great-sword','NO_MATCHING_ELEMENT_CONTROL');
 add('water','long-sword','ZERO_EQUIPMENT_RESISTANCE_CONTROL');add('thunder','great-sword','ZERO_EQUIPMENT_RESISTANCE_CONTROL');
 return {selectionRule:'Unchanged DB, minimum rarity then numeric ID; matching visible positive element, no innate target conversion. One actual armor piece with positive water/thunder resistance and candidate non-damage skills or unactivated multi-piece bonuses. All innate skills and armor grants preserved. Negative controls change only the stated premise.',armor,cases:smoke?cases.filter(c=>(c.element==='water'&&c.kind==='long-sword')||(c.element==='thunder'&&c.kind==='great-sword'&&c.premise==='SAME_ELEMENT_POSITIVE_EQUIPMENT_RESISTANCE')):cases};
}
module.exports={makeResistanceCases,elementOf};
