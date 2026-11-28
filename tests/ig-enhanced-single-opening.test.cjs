'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs'),{profiles}=require('./fixtures/selected-hp-inputs.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');
for(const [move,expected,baseline] of [
  ['IG_ENHANCED_DOUBLE_SLASH','237.0','IG_ENHANCED_DOUBLE_TRIPLE_REQUIRED'],
  ['IG_ENHANCED_DIAGONAL_SLASH','132.6','STATE_REQUIREMENT_MISMATCH:tripleExtract'],
  ['IG_DIAGONAL_SLASH',47.57352],['IG_SWEEP',56.42808],['IG_DOUBLE_SLASH',107.46288]
 ])test(move+' current opening matches explicit controls',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://ig-opening.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__data=data;
 w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');

 const snap=profiles.find(p=>p.kind==='insect-glaive').input;
 assert.equal(snap.weaponId,'1163');

 const add=move=>{el('comboMovePicker').value=move;assert.equal(el('comboMovePicker').value,move);el('addCombo').click();};
 const set=(control,value)=>{el(control).value=value;el(control).dispatchEvent(new w.Event('change',{bubbles:true}));};
 const calc=()=>{
  let result;const original=w.calcUserComboDamage;
  w.calcUserComboDamage=(...args)=>(result=original.apply(w,args));
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  return result;
 };

  const basic=typeof expected==='number', extract=basic?'NO_EXTRACT':'TRIPLE_EXTRACT';
  const id='canonical:'+move;
  w.applyBuildSnapshot({...snap,combo:{moves:[]}});
  const standard=()=>read('calcState.realOneHit.channels');
  const initialStandard=standard();
  add(id);
  el('buildName').value=move;el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  const blank=calc();
  assert.match(el('compareOut').querySelector('[data-automatic-opening]')?.textContent||'',basic?/無エキス.*猟虫収納/:/三色エキス.*猟虫収納/);
  set('comboIGExtract',extract);
  assert.deepEqual(calc().pipeline.channels,blank.pipeline.channels);
  set('comboIGKinsect','STOWED');
  const explicit=calc();
  if(basic)assert.ok(Math.abs(explicit.damage-expected)<1e-8,explicit.damage);else assert.equal(explicit.damage.toFixed(1),expected);
  if(basic)assert.ok(Math.abs(explicit.maximumDamage-expected)<1e-8);else assert.equal(explicit.maximumDamage.toFixed(1),expected);
  assert.deepEqual(blank.pipeline.channels,explicit.pipeline.channels,JSON.stringify(blank.blocked));
  set('comboIGExtract',basic?'TRIPLE_EXTRACT':'NO_EXTRACT');
  assert.equal(calc().damage,null);
  if(!basic){set('comboIGExtract','');set('comboIGKinsect','');}
  for(const check of el('compareBuilds').querySelectorAll('input'))check.checked=check.dataset.compareName===move;
  el('runCompare').click();
  const saved=read('lastBuildComparisonRows[0]');
 assert.deepEqual(saved.oneHitPipeline.channels,JSON.parse(JSON.stringify(explicit.pipeline.channels)));
 assert.equal(saved.referenceCombo.damage,explicit.damage);
 assert.equal(saved.referenceCombo.stages.length,1);
 const components=saved.oneHitPipeline.channels.normal.components.filter(c=>c.status==='available'&&c.eventId.startsWith('0:'));
 assert.equal(saved.referenceCombo.stages[0].damage,components.reduce((sum,c)=>sum+c.value,0));
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  assert.equal(el('comboIGExtract').value,basic?'TRIPLE_EXTRACT':'');assert.equal(el('comboIGKinsect').value,basic?'STOWED':'');
  set('comboIGExtract','');set('comboIGKinsect','');
  add(id);
  assert.equal(calc().damage,null);
  const key=w.eval('BUILDS_KEY');
  for(const state of [{extractState:'FUTURE'},{kinsectState:'DEPLOYED'},{extra:0},...(basic?[null,{extractState:'RED',kinsectState:'STOWED'},{extractState:'NO_EXTRACT',kinsectState:'STOWED',future:true}]:[])]){
   const snapshot={...snap,combo:{moves:[{techniqueId:id}],insectGlaiveState:state}};
   const imported=JSON.stringify({imported:snapshot});
   w.localStorage.setItem(key,imported);w.renderSavedBuilds();
   set('savedBuildSelect','imported');el('savedBuildLoad').click();
   assert.equal(calc().damage,null);
   if(basic){
    el('compareBuilds').querySelector('[data-compare-name="imported"]').checked=true;
    el('runCompare').click();
    assert.ok(w.eval('lastBuildComparisonRows'),JSON.stringify(state)+' '+el('compareOut').textContent+' '+errors); 
    const row=read('lastBuildComparisonRows[0]');
    assert.equal(row.referenceCombo.damage,null);
    assert.equal(w.consumerDamageMetric(row,'maximum').value,null);
   }
   assert.equal(w.localStorage.getItem(key),imported);
  }
  if(basic){
   for(const partial of [{extractState:'NO_EXTRACT'},{kinsectState:'STOWED'}]){
    const imported=JSON.stringify({partial:{...snap,combo:{moves:[{techniqueId:id}],insectGlaiveState:partial}}});
    w.localStorage.setItem(key,imported);w.renderSavedBuilds();
    el('compareBuilds').querySelector('[data-compare-name="partial"]').checked=true;
    el('runCompare').click();
    const row=read('lastBuildComparisonRows[0]');
    assert.deepEqual(row.oneHitPipeline.channels,saved.oneHitPipeline.channels);
    assert.equal(row.referenceCombo.damage,explicit.damage);
    assert.match(el('compareOut').textContent,/自動設定/);
    assert.equal(w.localStorage.getItem(key),imported);
   }
   w.applyBuildSnapshot({...snap,combo:{moves:[]}});
   assert.deepEqual(standard(),initialStandard);
  }

});

test('急襲突き 赤のみの本体3接触と保存比較',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://ig-descending.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.confirm=()=>true;w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());const el=id=>w.document.getElementById(id);
 const base=profiles.find(p=>p.kind==='insect-glaive').input,id='canonical:IG_DESCENDING_THRUST';
 w.source=data;w.base=base;
 w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot({...base,combo:{moves:[]}})');
 el('comboMovePicker').value=id;el('addCombo').click();
 const calc=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 const blank=calc();assert.ok(blank.damage>0,JSON.stringify(blank.blocked));
 const set=(key,v)=>{el(key).value=v;el(key).dispatchEvent(new w.Event('change',{bubbles:true}));};
 set('customWeaponExtractState_comboIGExtract','RED_ONLY');set('comboIGKinsect','STOWED');
 const result=calc();assert.deepEqual(result.pipeline.channels,blank.pipeline.channels);
 el('buildName').value='red';el('saveBuild').click();
 assert.equal(w.savedBuildMap().red.combo.insectGlaiveState.extractState,'RED_ONLY');
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 set('comboIGExtract','TRIPLE_EXTRACT');assert.equal(calc().damage,null);
 el('compareBuilds').querySelector('[data-compare-name="red"]').checked=true;el('runCompare').click();
 assert.deepEqual(w.eval('lastBuildComparisonRows[0].oneHitPipeline.channels'),result.pipeline.channels);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 t.diagnostic('1163 '+result.damage+' / '+result.maximumDamage);
 const saved=w.savedBuildMap().red;
 const unset=JSON.parse(JSON.stringify(saved));delete unset.combo.insectGlaiveState;
 const map=JSON.stringify({unset});w.localStorage.setItem(w.eval('BUILDS_KEY'),map);w.renderSavedBuilds();
 el('compareBuilds').querySelector('[data-compare-name="unset"]').checked=true;el('runCompare').click();
 assert.deepEqual(w.eval('lastBuildComparisonRows[0].oneHitPipeline.channels'),result.pipeline.channels);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),map);
 w.applyBuildSnapshot(saved);assert.equal(el('comboIGExtract').value,'RED_ONLY');
 assert.equal(el('customWeaponExtractState_comboIGExtract').value,'RED_ONLY');
 for(const state of [{extractState:'FUTURE'},{extractState:'NO_EXTRACT'},{extractState:'TRIPLE_EXTRACT'},{kinsectState:'DEPLOYED'},null]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,insectGlaiveState:state}});
  assert.equal(calc().damage,null,JSON.stringify(state));
 }
 for(const moves of [[{techniqueId:id,repeat:2}],[{techniqueId:id},{techniqueId:id}],[{techniqueId:'ig_rising'}]]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves}});assert.equal(calc().damage,null);
 }
 w.applyBuildSnapshot({...saved,charmCustom:{...saved.charmCustom,skills:[{name:'飛燕',level:1,type:'weapon'}]}});
 assert.equal(calc().damage,null);
 w.eval(`const control=structuredClone(source.weapons.find(w=>w.id===608));DB.weapons.push(control);weaponRows.push(control);rebuildWeaponIndex(weaponRows);control.damage={raw:200,display:620};control.sharpness={...control.sharpness,white:20};
 control.specials=[{kind:'element',element:'dragon',hidden:false,damage:{raw:30,display:300}}];`);
 const training=w.trainingRoomMonster;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{slash:.8,blunt:.4,pierce:.1,dragon:.3});return m;};
 w.applyBuildSnapshot({...saved,weaponId:'608',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}});
 const control=calc();
 for(const lane of Object.values(control.pipeline.channels)){
  const expected=[59.136,10.35,5.28,50.688,10.35];
  assert.deepEqual(Array.from(lane.components,c=>Number(c.value.toFixed(4))),expected);
  assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-135.804)<1e-8);
 }

 w.trainingRoomMonster=()=>{const m=training();m.parts[0].wounded=true;return m;};
 assert.equal(calc().damage,null);
 for(const state of [{extractState:'FUTURE'},{extractState:'TRIPLE_EXTRACT'},null]){
  const map={conflict:{...saved,combo:{...saved.combo,insectGlaiveState:state}}};
  const raw=JSON.stringify(map);w.localStorage.setItem(w.eval('BUILDS_KEY'),raw);w.renderSavedBuilds();
  w.trainingRoomMonster=training;
  el('compareBuilds').querySelector('[data-compare-name="conflict"]').checked=true;el('runCompare').click();
  const report=w.eval('lastBuildComparisonRows[0]');
  assert.ok(!Object.values(report.oneHitPipeline?.channels||{}).some(lane=>lane.metrics.comboTotalDamage.status==='available'));
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),raw);
 }

});
