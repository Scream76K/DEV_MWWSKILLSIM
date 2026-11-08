'use strict';
const assert=require('node:assert/strict'),{makePlan}=require('./work/harness/skill-plan.cjs'),triage=require('./work/harness/diagnostic-sources/v7-uncalculated-classification.json');
function makeChargePlan(db,classification,raw,{smoke=false}={}){
 const source=makePlan(classification,raw,db),skill=raw.find(s=>s.id===24);assert.ok(skill);const selected=triage.cases.filter(c=>c.primaryRootCauseFamily==='charge_master_scope');assert.equal(selected.length,24);
 const grant=level=>({id:24,name:skill.name,level,type:'weapon',description:skill.description,rankDescription:skill.ranks.find(r=>r.level===level).description});
 const cases=selected.map(c=>({key:'original:'+c.key,sourceKey:c.key,kind:c.kind,caseType:'ORIGINAL_UNRESOLVED_CHARGE_MASTER',level:c.level,weapon:source.weapons.find(w=>w.kind===c.kind),grants:[grant(c.level)],armorIds:[],techniqueIds:null,matchedControl:true,originalEvidence:c}));
 for(const kind of ['great-sword','hammer','insect-glaive','bow','light-bowgun','heavy-bowgun'])cases.push({key:'boundary:'+kind+':1',sourceKey:'24:1:'+kind,kind,caseType:['light-bowgun','heavy-bowgun'].includes(kind)?'EXISTING_LIMITED_AMMO_NONAPPLICATION':'EXISTING_CODE_SCOPE_ZERO_ELEMENT',level:1,weapon:source.weapons.find(w=>w.kind===kind),grants:[grant(1)],armorIds:[],techniqueIds:null,matchedControl:true});
 const weapon=db.weapons.filter(w=>w.kind==='long-sword'&&(w.specials||[]).some(s=>s.kind==='element'&&s.hidden===false&&s.damage?.raw>0)&&!(w.skills||[]).some(g=>g.skill?.id===24)).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];assert.ok(weapon);
 cases.push({key:'elemental-control:long-sword:1',sourceKey:'24:1:long-sword',kind:'long-sword',caseType:'ELEMENT_PRESENT_SCOPE_STILL_UNRESOLVED',level:1,weapon:{kind:weapon.kind,uiKind:weapon.kind,id:weapon.id,name:weapon.name},grants:[grant(1)],armorIds:[],techniqueIds:null,matchedControl:true});
 const keys=['original:24:1:long-sword','original:24:1:charge-blade','boundary:great-sword:1','boundary:hammer:1','boundary:light-bowgun:1','elemental-control:long-sword:1'];
 return {cases:smoke?cases.filter(c=>keys.includes(c.key)):cases,selectionRule:'All original 24 unresolved cases (8 weapons, Lv1-3) plus six fixed-DB code-boundary Lv1 controls. One real elemental long-sword is selected by rarity then ID with no innate Charge Master. No non-GS coefficient is adopted or changed.'};
}
module.exports={makeChargePlan};
