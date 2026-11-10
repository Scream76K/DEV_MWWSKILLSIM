'use strict';
const assert=require('node:assert/strict'),{makePlan}=require('./skill-plan.cjs');
const triage=require('./diagnostic-sources/v7-uncalculated-classification.json');
const bodyMoves={'sword-shield':['SNS_SIDE_SLASH'],hammer:['HAM_SIDE_SWING'],gunlance:['GL_SLAM','GL_SWEEP'],'switch-axe':['SA_SWORD_VERTICAL'],'charge-blade':['CB_ELEMENT_DISCHARGE_1']};
function makeTechniquePlan(db,classification,raw,{smoke=false}={}){
 const source=makePlan(classification,raw,db),selected=triage.cases.filter(c=>['partbreaker_coactivated','airborne_hit_mapping'].includes(c.primaryRootCauseFamily));assert.equal(selected.length,13);
 const grant=(id,level)=>{const s=raw.find(x=>x.id===id);assert.ok(s?.ranks.some(r=>r.level===level));return {id,name:s.name,level,type:s.kind==='weapon'?'weapon':'armor',description:s.description,rankDescription:s.ranks.find(r=>r.level===level).description};};
 const armorFor=job=>{const rows=db.armor.filter(a=>(a.skills||[]).some(s=>s.skill?.id===job.skillId)||db.sets.some(s=>s.id===a.armorSet?.id&&[s.setBonusSkill,s.groupBonusSkill].flat().filter(Boolean).some(x=>x.id===job.skillId))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);const out=[];for(const a of rows)if(!out.some(x=>x.kind===a.kind))out.push(a);return out.slice(0,job.requiredPieces).map(a=>a.id);};
 const cases=selected.map(c=>{const job=source.jobs.find(j=>j.key===c.key),armorIds=job.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES'?armorFor(job):[];return {...job,key:'original:'+c.key,sourceKey:c.key,caseType:armorIds.length?'ORIGINAL_OMEGA_ARMOR':'ORIGINAL_AIRBORNE',techniqueIds:null,armorIds,grants:armorIds.length?[]:[grant(86,1)],originalEvidence:c,matchedControl:armorIds.length===0,expected:'ORIGINAL_GATE'};});
 for(const kind of Object.keys(bodyMoves)){
  cases.push({key:'isolated-partbreaker:'+kind,sourceKey:'173:1:'+kind,kind,caseType:'ISOLATED_PARTBREAKER',techniqueIds:null,armorIds:[],grants:[grant(129,2)],matchedControl:true,expected:'PARTBREAKER_GATE'});
  cases.push({key:'adopted-partbreaker:'+kind,sourceKey:'173:1:'+kind,kind,caseType:'ADOPTED_NO_WOUND_EVENT_CONTROL',techniqueIds:bodyMoves[kind],armorIds:[],grants:[grant(129,2)],matchedControl:true,expected:'AVAILABLE_UNCHANGED'});
 }
 for(const kind of ['sword-shield','gunlance','charge-blade'])cases.push({key:'mapped-airborne:'+kind,sourceKey:'86:1:'+kind,kind,caseType:'EXPLICIT_EMPTY_AIRBORNE_HIT_CONTROL',techniqueIds:bodyMoves[kind],armorIds:[],grants:[grant(86,1)],matchedControl:true,expected:'AVAILABLE_UNCHANGED'});
 cases.push({key:'positive-airborne:dual-blades',sourceKey:null,kind:'dual-blades',caseType:'EXPLICIT_ADOPTED_AIRBORNE_HITS_CONTROL',techniqueIds:null,armorIds:[],grants:[grant(86,1)],matchedControl:true,expected:'ONLY_MAPPED_PHYSICAL_HITS_CHANGE'});
 for(const c of cases)c.weapon=source.weapons.find(w=>w.kind===c.kind);
 const selectedSmoke=['original:173:1:sword-shield','original:86:1:sword-shield','isolated-partbreaker:sword-shield','adopted-partbreaker:sword-shield','mapped-airborne:sword-shield','positive-airborne:dual-blades'];
 return {cases:smoke?cases.filter(c=>selectedSmoke.includes(c.key)):cases,selectionRule:'All original 10 Omega-armor/Partbreaker blockers and 3 Airborne hit-map blockers. Same fixed DB representatives. Original armor and all co-skills retained. Diagnostic single-skill grants and already-adopted techniques are separate controls, not equivalent legal builds.'};
}
module.exports={makeTechniquePlan};
