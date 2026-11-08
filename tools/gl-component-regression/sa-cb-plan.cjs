"use strict";
const assert=require('node:assert/strict');
function makeChargeSelections(){
 const db=require('./work/input/normalized-data.json'),classification=require('./work/harness/skill-sources/classification.candidate.json'),raw=require('./work/harness/skill-sources/raw-skills.json');
 const source=require('./work/harness/skill-plan.cjs').makePlan(classification,raw,db),weapons=Object.fromEntries(source.weapons.map(w=>[w.kind,w]));
 const armorFor=job=>{const rows=db.armor.filter(a=>(a.skills||[]).some(g=>g.skill?.id===job.skillId)||db.sets.some(s=>s.id===a.armorSet?.id&&[s.setBonusSkill,s.groupBonusSkill].flat().filter(Boolean).some(sk=>sk.id===job.skillId))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);const distinct=[];for(const a of rows)if(!distinct.some(b=>b.kind===a.kind))distinct.push(a);assert.ok(Number.isInteger(job.requiredPieces));assert.ok(distinct.length>=job.requiredPieces);return distinct.slice(0,job.requiredPieces).map(a=>({id:a.id,kind:a.kind}));};
 const cases=source.jobs.filter(j=>j.applicability!=='NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE'&&!(j.skillId===24&&['switch-axe','charge-blade'].includes(j.kind))).map(j=>({...j,...(j.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES'?{armor:armorFor(j)}:{})}));
 assert.equal(source.jobs.length,2562);assert.equal(cases.length,2357);
 return {weapons,cases};
}
// Controlled single-scope adapter, constructed only in memory from the exact
// hash-bound candidate. No game coefficient or producer is replaced.
function loadChargeControl(w,root,disabled){
 const fs=require('node:fs'),path=require('node:path'),source=fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'),'utf8');
 const marker=disabled==='sa'?'const chargeSaNoElementResolved=':'const cbChargeNoElementResolved=';
 assert.equal(source.split(marker).length,2);const wrapper=w.MHWRealOneHitBrowserAdapter;
 w.eval(source.replace(marker,marker+'false&&'));const control=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter=wrapper;return control;
}
module.exports={makeChargeSelections,loadChargeControl};
