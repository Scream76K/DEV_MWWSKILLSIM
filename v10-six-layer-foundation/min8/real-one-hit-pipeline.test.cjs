'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {createRealOneHitPipeline}=require('./real-one-hit-pipeline.cjs');
const {datum}=require('./min2-contract.cjs');
const db=require('../../docs/reports/r250-stage5/evidence/technique/runtime-records.json');
const versions={game:'1.042.00.02',equipment:'eq-real',technique:'tech-real',effects:'effects-real'};
const techniqueId='HAM_SIDE_SWING',record=db.db.hammer[techniqueId];
const request=()=>({schemaVersion:'v10-min2',build:{weapon:'hammer-real'},target:{id:'training',hitZoneKey:'head'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'real-hammer-one-hit',techniqueIds:[techniqueId]}});
const make=(element=0,fx=[],skills=[])=>createRealOneHitPipeline({versions,
 source:{capture:pinned=>({versions:pinned,equipment:{},techniques:{[techniqueId]:record},effects:{}})},
 resolveBuild:()=>({weaponType:'hammer',dbVersion:versions.equipment,source:'REAL_DB_TEST_INPUT',equipment:{ids:['hammer-real'],trueAttack:datum('known',200),displayElement:datum('known',element),baseAffinity:datum('known',0)},skills:{entries:skills}}),
 resolveEffects:()=>fx,initialState:()=>({}),
 // Deliberate test probe, NOT a game damage formula / expected damage.
 formulae:{physical:({coefficient})=>({status:'available',value:coefficient})}
});
test('real sourced MV reaches public evaluation; duration remains unavailable',()=>{
 const r=make().evaluate(request());
 for(const ch of ['normal','maximum']){
  a.equal(r.channels[ch].metrics.comboTotalDamage.status,'available');
  a.equal(r.channels[ch].metrics.comboTotalDamage.value,record.hits[0].mv);
  a.equal(r.channels[ch].metrics.comboDps.reason,'DURATION_UNAVAILABLE');
  a.equal(r.channels[ch].components[0].source,record.evidenceRefs[0]);
  a.equal(r.channels[ch].components[0].revision,String(record.revision));
 }
});
test('nonzero element blocks physical-only bridge without invented output',()=>{
 const r=make(50).safeEvaluate(request());
 a.notEqual(r.channels.normal.metrics.comboTotalDamage.status,'available');
});
test('unhandled effects block single-hit rather than silently ignoring skill',()=>{
 const r=make(0,[{id:'unknown'}]).safeEvaluate(request());
 a.notEqual(r.channels.normal.metrics.comboTotalDamage.status,'available');
});

test('physical-only path rejects skills before published total is returned',()=>{
 const r=make(0,[],[{id:'attack',level:1,rank:1,source:'equipment'}]).safeEvaluate(request());
 a.notEqual(r.channels.normal.metrics.comboTotalDamage.status,'available');
 a.match(r.reason,/REAL_SLICE:SKILL_EFFECTS_NOT_PROVEN_ABSENT/);
});
