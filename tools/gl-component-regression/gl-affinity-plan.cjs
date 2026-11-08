'use strict';
const assert=require('node:assert/strict'),{makePlan}=require('./skill-plan.cjs');
const triage=require('./diagnostic-sources/v7-uncalculated-classification.json');
function makeGlAffinityPlan(db,classification,raw,{smoke=false}={}){
 const original=makePlan(classification,raw,db),weapon=original.weapons.find(w=>w.kind==='gunlance');
 const selected=triage.cases.filter(c=>["10:1:gunlance", "18:1:gunlance", "18:2:gunlance", "18:3:gunlance", "39:1:gunlance", "39:2:gunlance", "39:3:gunlance", "57:1:gunlance", "57:2:gunlance", "57:3:gunlance", "57:4:gunlance", "57:5:gunlance", "62:1:gunlance", "62:2:gunlance", "89:1:gunlance", "118:4:gunlance", "118:5:gunlance", "118:6:gunlance", "118:7:gunlance", "131:1:gunlance", "142:1:gunlance", "142:2:gunlance", "142:3:gunlance", "142:4:gunlance", "142:5:gunlance", "153:2:gunlance", "155:1:gunlance", "156:1:gunlance", "156:2:gunlance", "156:3:gunlance", "162:1:gunlance", "162:2:gunlance", "180:2:gunlance"].includes(c.key));assert.equal(selected.length,33);
 const armorFor=job=>{const rows=db.armor.filter(a=>(a.skills||[]).some(g=>g.skill?.id===job.skillId)||db.sets.some(s=>s.id===a.armorSet?.id&&[s.setBonusSkill,s.groupBonusSkill].flat().filter(Boolean).some(sk=>sk.id===job.skillId))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);const distinct=[];for(const a of rows)if(!distinct.some(x=>x.kind===a.kind))distinct.push(a);return distinct.slice(0,job.requiredPieces).map(a=>a.id);};
 const grant=(id,level)=>{const s=raw.find(s=>s.id===id);assert.ok(s?.ranks.some(r=>r.level===level));return {id,name:s.name,level,type:s.kind==='weapon'?'weapon':'armor'};};
 const cases=selected.map(c=>{const job=original.jobs.find(j=>j.key===c.key);assert.ok(job);const armorIds=job.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES'?armorFor(job):[];return {...job,key:'original:'+job.key,sourceKey:job.key,sourceType:armorIds.length?'ORIGINAL_COACTIVATED_ARMOR':'ORIGINAL_SINGLE_SKILL',route:'STANDARD_MIXED',armorIds,grants:armorIds.length?[]:[grant(job.skillId,job.level)],originalEvidence:c,blockedModifiers:c.gunlanceBlockedModifiers,matchedNoSkillControlPossible:armorIds.length===0};});
 cases.push({key:'control:both-affinity',sourceKey:'131:1:gunlance',sourceType:'ISOLATED_COACTIVATED_AFFINITY_PAIR_NOT_ARMOR_EQUIVALENT',route:'STANDARD_MIXED',armorIds:[],grants:[grant(57,1),grant(142,3)],blockedModifiers:['弱点特効','力の解放'],matchedNoSkillControlPossible:true});
 cases.push({key:'control:maximum-might',sourceKey:null,sourceType:'EXISTING_ID99_EXCEPTION_CONTROL',route:'STANDARD_MIXED',armorIds:[],grants:[grant(99,1)],blockedModifiers:[],matchedNoSkillControlPossible:true});
 for(const id of [57,142])cases.push({key:'body-only:'+id+':1',sourceKey:id+':1:gunlance',sourceType:'EXPLICIT_BODY_ONLY_CONTROL',route:'EXPLICIT_SLAM_SWEEP',armorIds:[],grants:[grant(id,1)],blockedModifiers:[],matchedNoSkillControlPossible:true});
 for(const [id,conversion] of [[118,165],[118,181],[156,165],[156,181]])cases.push({key:`conversion:${id}:${conversion}`,sourceType:'DEFENSIVE_CONVERSION_NEGATIVE',route:'STANDARD_MIXED',armorIds:[],grants:[grant(id,id===118?4:1),grant(conversion,1)],blockedModifiers:[],matchedNoSkillControlPossible:true,defensiveId:id,conversionId:conversion});
 const add=(key,grants,conditionOverrides,expectedAffinity,expectedError=null)=>cases.push({key,grants,conditionOverrides,expectedAffinity,expectedError,armorIds:[],route:'STANDARD_MIXED',sourceType:'STATE_BOUNDARY',blockedModifiers:[],matchedNoSkillControlPossible:true});
 for(let level=1;level<=3;level++)for(const [state,wet,bubble] of [['DRY',false,false],['WET',true,false],['BUBBLE',false,true],['BOTH',true,true]]){
  const amount=(wet?[0,3,6,9][level]:0)+(bubble?[0,7,14,21][level]:0);
  add(`wet:${level}:${state}`,[grant(39,level)],{wetState:{normal:{wet,bubble},maximum:{wet,bubble}}},[amount,amount]);
 }
 for(let level=1;level<=3;level++)for(const state of ['BEFORE','INFECTED','OVERCOME']){
  const overcome=15+[0,3,6,10][level];
  add(`frenzy:${level}:${state}`,[grant(18,level)],{fixedActivationConditions:false,standardEvaluation:false,blackEclipseState:state},[state==='OVERCOME'?overcome:0,state==='BEFORE'?0:overcome]);
 }
 for(const state of [null,'UNKNOWN'])add(`frenzy:1:${state}`,[grant(18,1)],{fixedActivationConditions:false,standardEvaluation:false,blackEclipseState:state},null,'FRENZY_STATE_REQUIRED');
 for(const [key,state] of [['missing',null],['partial',{normal:{wet:true},maximum:{wet:true}}],['invalid',{normal:{wet:'true',bubble:false},maximum:{wet:'true',bubble:false}}]])add(`wet:1:${key}`,[grant(39,1)],{wetState:state},null,'WET_BUBBLE_STATE_REQUIRED');
 add('combined:3:OVERCOME_BOTH',[grant(18,3),grant(39,3)],{fixedActivationConditions:false,standardEvaluation:false,blackEclipseState:'OVERCOME',wetState:{normal:{wet:true,bubble:true},maximum:{wet:true,bubble:true}}},[55,55]);
 assert.equal(cases.length,68);
 for(const job of cases.filter(x=>['wet:3:BOTH','frenzy:3:OVERCOME','combined:3:OVERCOME_BOTH'].includes(x.key)))cases.push({...job,key:'shell:'+job.key,route:'EXPLICIT_NORMAL_SHELL',techniqueIds:['reference:gl_NORMAL']});
 assert.equal(cases.length,71);
 const smokeKeys=['original:57:1:gunlance','original:142:1:gunlance','control:maximum-might','body-only:57:1','body-only:142:1'];
 return {weapon,cases:smoke?cases.filter(c=>smokeKeys.includes(c.key)):cases,originalSourceCaseCount:33,additionalCaseCount:38,selectionRule:'All 33 original primary GL modifier cases with original armor selection unchanged, plus 4 prior affinity controls, 4 defensive conversion negatives, 27 explicit state boundaries and 3 normal-shell controls. Synthetic controls are not equivalent to real armor builds. Source applicability and game accuracy remain unverified.'};
}
module.exports={makeGlAffinityPlan};
