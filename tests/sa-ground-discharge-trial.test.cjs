'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {data}=require('./fixtures/offset-maximum-inputs.json'),{profiles}=require('./fixtures/selected-hp-inputs.json');
const measured=require('./fixtures/sa-ground-discharge-measured.json');
test('ground discharge trial uses all ten slash contacts without changing the measured/standard boundaries',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://sa-trial.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;t.after(()=>w.close());
 w.fixtureData=data;w.fixtureSnapshot={...profiles.find(p=>p.kind==='switch-axe').input,weaponId:'914',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 w.eval('DB=normalizeDB({...fixtureData,weapons:consolidateArtiaFixedVariantRows(fixtureData.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(fixtureSnapshot);');
 const id='SA_GROUND_ELEMENT_DISCHARGE_FULL_TRIAL';
 const input=w.eval('({weapon:realPipelineWeapon(selectedWeapon()),stats:calcState.stats,skills:Object.entries(calcState.total||{}),equipmentSkillsResolved:realPipelineSkillsResolved(),conditions:{...compareStep5Snapshot(),standardEvaluation:false,switchAxeState:{mode:"SWORD",awakened:false},saGroundDischargeTrial:true},switchAxeState:{mode:"SWORD",awakened:false},target:{monster:"training-room",part:"training-front"},techniqueDb:window.TechniqueDBEngine,trainingRoom:trainingRoomMonster()})');
 const run=(extra={})=>w.MHWRealOneHitBrowserAdapter.evaluateCurrent({...input,techniqueId:id,techniqueIds:[id],...extra});
 const metric=(r,l)=>w.consumerDamageMetric({oneHitPipeline:r},l).value;
 const before=w.eval('storageGet(BUILDS_KEY)'), r=run();
 const m=measured.measurement, observed=[m.initialDisplayedDamage,...m.pulseDamages,m.finisherDisplayedDamage];
 for(const lane of ['normal','maximum']){
   assert.ok(Math.abs(metric(r,lane)-248.55012)<1e-8,JSON.stringify([r.reason,metric(r,lane)]));
   const hits=r.channels[lane].components.filter(c=>c.id.startsWith(id+':physical:'));
   assert.equal(hits.length,observed.length);
   const low=Math.max(...hits.map((c,i)=>(observed[i]-.05)/c.value)),high=Math.min(...hits.map((c,i)=>(observed[i]+.05)/c.value));
   assert.ok(low<high,'shape-only comparison; different absolute attack/conditions');
   assert.equal(r.channels[lane].diagnostics.saGroundDischargeTrial.absoluteLiveGameVerification,'PENDING');
 }
 for(const result of [run({conditions:{...input.conditions,saGroundDischargeTrial:undefined}}),run({conditions:{...input.conditions,standardEvaluation:true}}),run({techniqueIds:[id,id]}),run({switchAxeState:{mode:'SWORD',awakened:true}}),run({switchAxeState:{mode:'AXE',awakened:false}}),run({target:{monster:'training-room',part:'training-back'}}),run({techniqueId:'sa_element',techniqueIds:['sa_element']})]) assert.equal(metric(result,'normal'),null);
 const first='SA_ELEMENT_DISCHARGE_FIRST_CONTACT';
 const single=run({techniqueId:first,techniqueIds:[first]});
 assert.ok(Math.abs(metric(single,'normal')-22.113)<1e-8);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),before);
});
