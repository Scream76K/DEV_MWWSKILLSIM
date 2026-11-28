'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {data}=require('./fixtures/offset-maximum-inputs.json'),{profiles}=require('./fixtures/selected-hp-inputs.json');
test('isolated Long Sword trial runs through shared damage pipeline without enabling legacy or standard release',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://release-trial.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;t.after(()=>w.close());
 w.fixtureData=data;w.fixtureSnapshot={...profiles.find(p=>p.kind==='long-sword').input,weaponId:'836',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 w.eval('DB=normalizeDB({...fixtureData,weapons:consolidateArtiaFixedVariantRows(fixtureData.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(fixtureSnapshot);');
 const id='LS_SPIRIT_RELEASE';
 const input=w.eval('({weapon:realPipelineWeapon(selectedWeapon()),stats:calcState.stats,skills:Object.entries(calcState.total||{}),equipmentSkillsResolved:realPipelineSkillsResolved(),conditions:{...compareStep5Snapshot(),standardEvaluation:false,longSwordState:{spiritGauge:"YELLOW"},lsSpiritReleaseTrial:"AFTER_RED_HELM_14_HIT"},longSwordState:{spiritGauge:"YELLOW"},target:{monster:"training-room",part:"training-front"},techniqueDb:window.TechniqueDBEngine,trainingRoom:trainingRoomMonster()})');
 assert.equal(input.weapon.id,836);
 const before=w.eval('storageGet(BUILDS_KEY)');
 const adapter=w.MHWRealOneHitBrowserAdapter;
 const run=(extra={})=>adapter.evaluateCurrent({...input,techniqueId:id,techniqueIds:[id],...extra});
 const metric=(r,l)=>w.consumerDamageMetric({oneHitPipeline:r},l).value;
 const r=run();t.diagnostic(JSON.stringify({reason:r.reason,scope:r.scope}));
 for(const lane of ['normal','maximum']){
  assert.ok(Math.abs(metric(r,lane)-203.4018)<1e-8,JSON.stringify([r.reason,metric(r,lane)]));
  const hits=r.channels[lane].components.filter(c=>c.id.startsWith(id+':physical:'));
  assert.equal(hits.length,14);
  assert.equal(r.channels[lane].diagnostics.lsSpiritReleaseTrial.liveGameVerification,'PENDING');
  assert.equal(r.channels[lane].diagnostics.lsSpiritReleaseTrial.observedHitCount,22-1-7);
  assert.equal(r.channels[lane].diagnostics.lsSpiritReleaseTrial.helmIncluded,false);
  assert.deepEqual(Array.from(hits,x=>x.value.toFixed(1)),['4.1','4.1','7.9','7.9','7.9','11.9','11.9','11.9','17.5','17.5','17.5','27.8','27.8','27.8']);
 }
 for(const result of [run({conditions:{...input.conditions,lsSpiritReleaseTrial:'AFTER_RED_HELM_15_HIT'}}),run({conditions:{...input.conditions,lsSpiritReleaseTrial:undefined}}),run({conditions:{...input.conditions,standardEvaluation:true}}),run({techniqueIds:[id,id]}),run({longSwordState:{spiritGauge:'RED'}}),run({conditions:{...input.conditions,spiritGauge:'RED'}}),run({target:{monster:'training-room',part:'training-back'}}),run({conditions:{...input.conditions,combatBuffs:{...input.conditions.combatBuffs,charm:'YES'}}}),run({techniqueId:'ls_release',techniqueIds:['ls_release']}),run({weapon:{...input.weapon,damage:{...input.weapon.damage,raw:100}}})]) assert.equal(metric(result,'normal'),null);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),before);
});
