"use strict";
const assert=require('node:assert/strict'),{makePlan}=require('./work/harness/skill-plan.cjs');
function makeBoundedPlan(db,classification,raw){
 const source=makePlan(classification,raw,db),weapons=Object.fromEntries(source.weapons.map(w=>[w.kind,w]));
 const cases=source.jobs.filter(j=>(j.skillId===94&&['bow','light-bowgun','heavy-bowgun'].includes(j.kind))||(j.skillId===86&&j.kind==='sword-shield'));
 assert.equal(cases.length,4);
 const elemental= db.weapons.filter(w=>w.kind==='sword-shield'&&w.specials?.some(s=>s.kind==='element'&&s.element==='thunder')).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];
 assert.ok(elemental,'A pinned elemental Sword & Shield control is required');
 return {weapons,cases,elementalSwordShield:elemental.id};
}
module.exports={makeBoundedPlan};
