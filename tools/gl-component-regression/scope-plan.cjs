"use strict";
const assert=require('node:assert/strict'),{makePlan}=require('./work/harness/skill-plan.cjs');
function makeScopePlan(db,classification,raw){
 const source=makePlan(classification,raw,db),weapons=Object.fromEntries(source.weapons.map(w=>[w.kind,w]));
 const armorFor=job=>{const rows=db.armor.filter(a=>(a.skills||[]).some(g=>g.skill?.id===job.skillId)||db.sets.some(s=>s.id===a.armorSet?.id&&[s.setBonusSkill,s.groupBonusSkill].flat().filter(Boolean).some(sk=>sk.id===job.skillId))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);const distinct=[];for(const a of rows)if(!distinct.some(b=>b.kind===a.kind))distinct.push(a);assert.ok(Number.isInteger(job.requiredPieces));assert.ok(distinct.length>=job.requiredPieces);return distinct.slice(0,job.requiredPieces).map(a=>({id:a.id,kind:a.kind}));};
 const cases=source.jobs.filter(j=>j.skillId===173&&['sword-shield','hammer','switch-axe'].includes(j.kind)).map(j=>({...j,armor:armorFor(j)}));assert.equal(cases.length,6);
 return {weapons,cases};
}
module.exports={makeScopePlan};
