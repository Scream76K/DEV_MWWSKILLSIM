'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('HH opening melody affects only body attack and survives named comparison',t=>{
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
 const hope=require('../docs/reports/r252-generic-states/evidence/mhdb-hunting-horn-hope.api.json');
 w.eval(`DB.weapons.push(${JSON.stringify(hope)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);`);
 const click=(id='hh_slam')=>{
  for(const b of el('combo').querySelectorAll('.del'))b.click();
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),[id]);
  const prev=read('compareStep5Snapshot()'),original=w.calcUserComboDamage;
  let result;
  w.calcUserComboDamage=function(...args){result=original.apply(this,args);return result;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  assert.deepEqual(read('compareStep5Snapshot()'),prev);
  return result;
 };
 const save=name=>{el('buildName').value=name;el('saveBuild').click();assert.match(el('buildSaveStatus').textContent,/保存しました/);};
 const choose=name=>{ for(const b of el('compareBuilds').querySelectorAll('input[data-compare-name]')){b.checked=b.dataset.compareName===name;b.dispatchEvent(new w.Event('change',{bubbles:true}));} };
 apply(531,{},[{name:'逆襲',level:3,type:'armor'}]);
 const standardBefore=read('calcState.realOneHit');
 const baseResult=click().pipeline;
 assert.equal(baseResult.channels.normal.execution.status,'complete');
 assert.ok(lanes(baseResult)[1].value>lanes(baseResult)[0].value);
 const family=el('comboHHOpeningFamily'),rank=el('comboHHOpeningRank');
 assert.ok(family&&rank,'separate opening melody controls are available');
 const select=(e,value)=>{e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 assert.deepEqual(Array.from(family.options,o=>o.value),['','ATTACK_SMALL']);
 select(family,'ATTACK_SMALL');select(rank,'0');
 assert.deepEqual(lanes(click().pipeline),lanes(baseResult));
 for(const [level,multiplier] of [[1,1.03],[2,1.05]]){
  select(rank,String(level));
  const result=click().pipeline;
  for(const ch of ['normal','maximum']){
   const lane=result.channels[ch],original=baseResult.channels[ch];
   assert.equal(lane.execution.status,'complete');
   assert.deepEqual(Array.from(lane.components,c=>c.id),Array.from(original.components,c=>c.id));
   assert.ok(lane.components.every(c=>!/(sound|echo|fixed)/i.test(c.id)));
   const attackRatio=ch==='normal'?multiplier:(90*multiplier+25)/115;
   for(const [i,c] of Array.from(lane.components).entries())
    assert.ok(Math.abs(c.value-original.components[i].value*(c.id.includes(':physical:')?attackRatio:1))<=.02);
  }
 }
 const combo=click('canonical:HH_LEFT_SWING').pipeline;
 for(const ch of ['normal','maximum']){
  assert.equal(combo.channels?.[ch]?.execution.status,'complete',JSON.stringify(combo));
  assert.equal(combo.channels[ch].diagnostics.hhOpeningMelody.rank,2);
 }
 click();
 save('preactivated');
 select(rank,'0');
 choose('preactivated');w.runBuildCompare();
 const saved=read('lastBuildComparisonRows[0]');
 assert.equal(saved.oneHitPipeline.channels.normal.diagnostics.hhOpeningMelody.rank,2);
 assert.equal(rank.value,'0');
 select(el('savedBuildSelect'),'preactivated');el('savedBuildLoad').click();
 assert.equal(rank.value,'2');
 const stored=read('buildSnapshot()');
 assert.deepEqual(stored.combo.hhOpeningMelody,{family:'ATTACK_SMALL',rank:2});
 const unavailable={...stored,combo:{...stored.combo,hhOpeningMelody:{family:'ATTACK_LARGE',rank:2}}};
 w.applyBuildSnapshot(clone(unavailable));
 assert.deepEqual(read('buildSnapshot().combo.hhOpeningMelody'),unavailable.combo.hhOpeningMelody);
 assert.equal(el('comboHHOpeningPending').hidden,false);
 assert.match(JSON.stringify(click().pipeline),/HH_OPENING:WEAPON_MELODY_UNCONFIRMED/);
 w.applyBuildSnapshot(clone(stored));
 assert.match(JSON.stringify(click('canonical:HH_SELF_IMPROVEMENT_PERFORMANCE').pipeline),/HH_OPENING:BODY_ONLY/);

 for(const b of el('combo').querySelectorAll('.del'))b.click();
 w.calcBuild();
 assert.deepEqual(read('calcState.realOneHit').channels,standardBefore.channels);
});
