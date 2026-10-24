'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {createRealOneHitPipeline}=require('./real-one-hit-pipeline.cjs');
const {datum}=require('./min2-contract.cjs');
const db=require('../../docs/reports/r250-stage5/evidence/technique/runtime-records.json');
const id='HAM_SIDE_SWING',record=db.db.hammer[id],game=db.spec.gameVersion;
const versions={game,equipment:'eq-proof',technique:'tech-proof',effects:'fx-proof'};
const known=v=>({value:v,gameVersion:game,evidenceRef:'SOURCE_FOR_CONTRACT_TEST_ONLY'});
const input=()=>({schemaVersion:'v10-min2',build:{id:'h'},target:{id:'training',hitZoneKey:'head'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'hammer-one-hit',techniqueIds:[id]}});
function make(hz=known(45)){
 const received=[];
 const p=createRealOneHitPipeline({versions,
  source:{capture:()=>({versions,equipment:{},effects:{},techniques:{[id]:record}})},
  resolveBuild:()=>({weaponType:'hammer',dbVersion:versions.equipment,source:'contract-test',equipment:{ids:['h'],trueAttack:datum('known',200),displayElement:datum('known',0),baseAffinity:datum('known',0)},skills:{entries:[]}}),
  resolveEffects:()=>[],initialState:()=>({}),
  canonicalPhysical:{expectedGameVersion:game,resolveSharpness:()=>known(1.32),resolveHitzone:()=>hz,resolvePartModifier:()=>known(1),
   calculate:(data)=>{received.push(data);return {p:data.mv};}}
 });
 return {p,received};
}
test('real sourced DB MV flows to canonical formula and L5 without invented time',()=>{
 const {p,received}=make(),out=p.evaluate(input());
 a.equal(received.length,2);
 a.equal(received[0].mv,record.hits[0].mv);
 a.equal(received[0].attack,200);
 for(const ch of ['normal','maximum']){
  a.equal(out.channels[ch].metrics.comboTotalDamage.status,'available');
  a.equal(out.channels[ch].metrics.comboDps.reason,'DURATION_UNAVAILABLE');
  a.equal(out.channels[ch].components[0].source,record.evidenceRefs[0]);
 }
});
test('unverified hitzone cannot publish a total or DPS',()=>{
 const {p,received}=make({value:45,gameVersion:game});
 const out=p.evaluate(input());
 a.equal(received.length,0);
 for(const ch of ['normal','maximum']){
  a.equal(out.channels[ch].metrics.comboTotalDamage.status,'unavailable');
  a.equal(out.channels[ch].metrics.comboDps.status,'unavailable');
 }
});
