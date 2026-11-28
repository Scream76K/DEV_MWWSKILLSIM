'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('HH performance and encore retain their event scope in current and named comparison',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://hh-slam.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x));
 const lanes=p=>['normal','maximum'].map(ch=>w.consumerDamageMetric({oneHitPipeline:p},ch));
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9, a+' != '+b);
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='hunting-horn').input;
 const apply=(id=552,state={},charmSkills=[])=>{
  w.__build=JSON.stringify({...base,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:charmSkills,slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],huntingHornState:state}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(id));
 };
 const click=(...ids)=>{
  for(const b of el('combo').querySelectorAll('.del'))b.click();
  for(const id of ids){
   assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
   el('comboMovePicker').value=id;el('addCombo').click();
  }
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),ids);
  const prev=read('compareStep5Snapshot()'),original=w.calcUserComboDamage;
  let result;
  w.calcUserComboDamage=function(...args){result=original.apply(this,args);return result;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  assert.deepEqual(read('compareStep5Snapshot()'),prev);
  return result;
 };
 const save=name=>{el('buildName').value=name;el('saveBuild').click();assert.match(el('buildSaveStatus').textContent,/保存しました/);};
 const choose=name=>{ for(const b of el('compareBuilds').querySelectorAll('input[data-compare-name]')){b.checked=b.dataset.compareName===name;b.dispatchEvent(new w.Event('change',{bubbles:true}));} };
 const performance='canonical:HH_SELF_IMPROVEMENT_PERFORMANCE',encore='canonical:HH_ENCORE_JUST';
 const state={model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['SELF_IMPROVEMENT'],echoBubbles:1,selfImprovementLevel:0};
 apply(552,state);
 const active=click(performance).pipeline;
 assert.match(el('combo').querySelector('.comboMeta').textContent,/旋律ストック/);
 for(const ch of ['normal','maximum']){
  const values=active.channels[ch].components.map(c=>c.value);
  assert.equal(values.length,4);
  [79.5564,10.35,65.7,27.9].forEach((expected,i)=>near(values[i],expected));
 }
 save('performance');
 const pair=click(performance,encore).pipeline;
 assert.ok(lanes(pair).every(x=>x.value>183.5064));
 save('pair');
 const alone=click(encore).pipeline;
 assert.ok(lanes(alone).every(x=>x.value===null&&x.reason.includes('HH_ENCORE_PREVIOUS_MELODIES_REQUIRED')));
 save('alone');
 apply(552,{});
 const empty=click(performance).pipeline;
 assert.ok(lanes(empty).every(x=>x.value===null));
 save('empty');
 const before=read('calcState.realOneHit');
 const stored=JSON.stringify(w.localStorage);
 for(const [name,expected] of [['performance',active],['pair',pair],['alone',alone],['empty',empty]]){
  choose(name);el('runCompare').click();
  const row=read('lastBuildComparisonRows[0]');
  assert.deepEqual(clone(lanes(row.oneHitPipeline)),clone(lanes(expected)),name);
  for(const ch of ['normal','maximum']){
   assert.deepEqual(row.oneHitPipeline.channels?.[ch]?.components,expected.channels?.[ch]?.components&&clone(expected.channels[ch].components),name);
  }
  assert.equal(row.referenceCombo.damage,lanes(expected)[0].value,name);
  assert.equal(JSON.stringify(w.localStorage),stored);
  assert.equal(el('comboHHModel').checked,false);
 }
 apply(552,{});
 assert.deepEqual(read('calcState.realOneHit'),before);
 t.diagnostic('weapon 552 normal/maximum: performance '+lanes(active).map(x=>x.value)+'; performance + just encore '+lanes(pair).map(x=>x.value));
});
