'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {data}=require('./fixtures/offset-maximum-inputs.json'),{profiles}=require('./fixtures/selected-hp-inputs.json');
const measured=require('./fixtures/bow-arc-blast-measured.json');
test('local arc trial separates six impacts from two natural blasts; baseline and legacy stay isolated',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://arc-trial.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;t.after(()=>w.close());
 w.fixtureData=data;w.fixtureSnapshot={...profiles.find(p=>p.kind==='bow').input,weaponId:'1',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 w.eval('DB=normalizeDB({...fixtureData,weapons:consolidateArtiaFixedVariantRows(fixtureData.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(fixtureSnapshot);');
 const id='BOW_ARC_1_FULL_TRIAL';
 const input=w.eval('({weapon:realPipelineWeapon(selectedWeapon()),stats:calcState.stats,skills:Object.entries(calcState.total||{}),equipmentSkillsResolved:realPipelineSkillsResolved(),conditions:{...compareStep5Snapshot(),standardEvaluation:false,bowArcFullTrial:true},bowState:{chargeLevel:1,coating:"NONE",range:"CRITICAL",guided:false},target:{monster:"training-room",part:"training-front"},techniqueDb:window.TechniqueDBEngine,trainingRoom:trainingRoomMonster()})');
 const adapter=w.MHWRealOneHitBrowserAdapter,run=(extra={})=>adapter.evaluateCurrent({...input,techniqueId:id,techniqueIds:[id],...extra});
 const metric=(r,l)=>w.consumerDamageMetric({oneHitPipeline:r},l).value;
 const before=w.eval('storageGet(BUILDS_KEY)');
 for(const o of measured.observations.filter(x=>x.comparatorHitzone)){
  const r=run({target:{monster:'training-room',part:o.part}}),hz=o.comparatorHitzone/100;
  for(const lane of ['normal','maximum']){
   const ch=r.channels?.[lane],total=metric(r,lane);
   assert.ok(Math.abs(total-(90*.62*hz+o.reportedDamagePerBlast*2))<1e-8,JSON.stringify([r.reason,total]));
   assert.equal(ch.components.length,8);
   assert.deepEqual(Array.from(ch.components.slice(0,6),c=>c.value),[9,9,13,9,9,13].map(v=>90*v/100*hz));
   assert.deepEqual(Array.from(ch.components.slice(6),c=>c.value),[o.reportedDamagePerBlast,o.reportedDamagePerBlast]);
   assert.equal(ch.diagnostics.bowArcFullTrial.liveGameTotalVerification,'PENDING');
   assert.equal(ch.metrics.comboDps?.value??null,null);
  }
 }
 for(const r of [run({conditions:{...input.conditions,bowArcFullTrial:false}}),run({conditions:{...input.conditions,standardEvaluation:true}}),run({bowState:{...input.bowState,coating:'POWER'}}),run({techniqueIds:[id,id]}),run({target:{monster:'training-room',part:'training-side'}}),run({techniqueId:'bow_arc',techniqueIds:['bow_arc']})])assert.equal(metric(r,'normal'),null);
 const impact='BOW_ARC_1_IMPACT_ONLY',r=run({conditions:{...input.conditions,arcContactSingle:true},techniqueId:impact,techniqueIds:[impact]});
 assert.equal(r.channels.normal.metrics.arcImpactReference.value,44.64);
 assert.equal(metric(r,'normal'),null);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),before);
});
