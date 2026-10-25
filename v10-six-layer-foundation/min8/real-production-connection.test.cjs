'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createRealOneHitPipeline}=require('./real-one-hit-pipeline.cjs');
const {datum}=require('./min2-contract.cjs');
const {resolveHopeHammerI}=require('./hope-hammer-source-adapter.cjs');
const sharpnessApi=require('../../weapon-max-sharpness.js');
const db=require('../../docs/reports/r250-stage5/evidence/technique/runtime-records.json');

// Execute the existing product evaluator from index.html; this test does not copy
// or reimplement its arithmetic in the six-layer foundation.
const html=fs.readFileSync(require('node:path').resolve(__dirname,'../../index.html'),'utf8');
const start=html.indexOf('function roundDamage2');
const end=html.indexOf('function damage(){',start);
if(start<0||end<0)throw Error('PRODUCTION_FORMULA_EXPORT_NOT_FOUND');
const box={};
vm.runInNewContext(`(()=>{${html.slice(start,end)};this.damageFromParams=damageFromParams})()`,box);
const calculate=box.damageFromParams;
const trainingStart=html.indexOf('function trainingRoomMonster');
const trainingEnd=html.indexOf('function isTrainingRoom',trainingStart);
vm.runInNewContext(`(()=>{${html.slice(trainingStart,trainingEnd)};this.trainingRoomMonster=trainingRoomMonster})()`,box);
const training=box.trainingRoomMonster();
const trainingFront=training.parts.find(p=>p.id==='training-front');
const game='1.042.00.02',id='HAM_SIDE_SWING',record=db.db.hammer[id];
const adopted=resolveHopeHammerI();
const versions={game,equipment:'mhdb-source-unknown-game-version',technique:'tech-real',effects:'effects-real'};
const request={schemaVersion:'v10-min2',build:{weapon:'hope-hammer-i'},target:{id:'training-room',hitZoneKey:'training-front'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'hope-hammer-one-hit',techniqueIds:[id]}};
const source={capture:pinned=>({versions:pinned,equipment:adopted.weapon,effects:{},techniques:{[id]:record}})};
const make=()=>createRealOneHitPipeline({versions,source,
 resolveBuild:()=>({weaponType:'hammer',dbVersion:versions.equipment,source:'LARTTYLER_MHDB_HOPE_HAMMER_I',equipment:{ids:['game_id:1'],trueAttack:datum('known',adopted.weapon.attackRaw),displayElement:datum('known',0),baseAffinity:datum('known',adopted.weapon.affinity),sourceGameVersion:adopted.provenance.sourceGameVersion},skills:{entries:[]}}),
 resolveEffects:()=>[],initialState:()=>({}),
 canonicalPhysical:{expectedGameVersion:game,
  resolveSharpness:()=>{const r=sharpnessApi.resolve(adopted.weapon,{rows:[{status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED'}]});return {value:r.options.sharpnessPhysicalMultiplier,gameVersion:game,evidenceRef:r.options.sharpnessEvidenceRef,sourceGameVersion:adopted.provenance.sourceGameVersion,status:'PROVISIONAL'};},
  resolveHitzone:()=>({value:trainingFront.multipliers.blunt*100,gameVersion:game,evidenceRef:'index.html:1207 trainingRoomMonster',sourceGameVersion:adopted.provenance.sourceGameVersion,status:'PRODUCT_REFERENCE'}),
  resolvePartModifier:({parameters})=>({value:parameters.partModifier,gameVersion:game,evidenceRef:parameters.partModifierSource}),
  calculate}});

test('Hope Hammer I provisional source reaches existing production formula',()=>{
 const out=make().evaluate(request);
 for(const channel of ['normal','maximum']){
  a.equal(out.channels[channel].metrics.comboTotalDamage.status,'available');
  a.equal(out.channels[channel].metrics.comboTotalDamage.value,17.39);
  a.equal(out.channels[channel].metrics.comboDps.reason,'DURATION_UNAVAILABLE');
  a.equal(out.channels[channel].components[0].source,record.evidenceRefs[0]);
 }
});
