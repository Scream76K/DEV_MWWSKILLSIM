'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${a} != ${b}`);
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://explicit-defaults.invalid',virtualConsole:vc,runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const ev=s=>w.eval(s),read=s=>JSON.parse(ev('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 w.__pack=data;
 ev('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 function apply(kind, combo={},skills=[]){
  const input=profiles.find(x=>x.kind===kind).input;
  w.__s=JSON.stringify({...input,selectedHp:'FULL_HP',charmCustom:{...input.charmCustom,skills},combo:{...input.combo,moves:[],...combo}});
  ev('applyBuildSnapshot(JSON.parse(__s));');
 }
 function add(id){
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
 }
 function save(){ ev("storageSet(BUILDS_KEY,JSON.stringify({PROBE:buildSnapshot()}));renderSavedBuilds();"); }
 function compare(){
  const saved=ev('storageGet(BUILDS_KEY)'),before=read('buildSnapshotComparable(buildSnapshot())'),cond=read('compareStep5Snapshot()');
  w.document.querySelector('[data-compare-name="PROBE"]').checked=true;el('runCompare').click();
  const row=read('lastBuildComparisonRows')?.[0];assert.ok(row,el('compareOut').textContent);
  assert.deepEqual(read('buildSnapshotComparable(buildSnapshot())'),before);
  assert.deepEqual(read('compareStep5Snapshot()'),cond);assert.equal(ev('storageGet(BUILDS_KEY)'),saved);
  return row;
 }
 function run(kind,id,combo={},skills=[]){
  apply(kind, combo, skills);add(id);const before=read('compareStep5Snapshot()');
  const p=w.calcUserComboDamage().pipeline;assert.ok(p);
  assert.deepEqual(read('compareStep5Snapshot()'),before);
  save();const row=compare();
  for(const ch of ['normal','maximum'])assert.deepEqual(JSON.parse(JSON.stringify(p.channels?.[ch]?.metrics||null)),row.oneHitPipeline.channels?.[ch]?.metrics||null);
  return {...p,row};
 }
 return {w,ev,el,read,apply,add,save,compare,run,close(){w.close();assert.deepEqual(errors,[]);}};
}
const value=(p,ch='normal')=>p.channels?.[ch]?.metrics?.comboTotalDamage?.value??null;
const stock=(p,key,field)=>p.channels?.normal?.finalState?.[key]?.[field];
const component=(p,key)=>p.channels.normal.components.filter(x=>x.id.includes(':'+key+':')).reduce((n,x)=>n+x.value,0);
test('CB blanks use technique-specific starts; explicit differences and stock zero survive',()=>{
 const t=setup(),ed='canonical:CB_ELEMENT_DISCHARGE_1',rm=[{name:'高速変形',level:3,type:'weapon'}];
 try{
  const blank=t.run('charge-blade',ed,{},rm);
  near(value(blank),280.029924);assert.equal(stock(blank,'chargeBlade','normalPhials'),4.5);near(blank.row.referenceCombo.damage,value(blank));
  assert.ok(blank.evaluationPlan.automaticOpening.includes('斧ニュートラル'));
  const charge=t.run('charge-blade',ed,{chargeBladeState:{previousAction:'CHARGE'}},rm);
  near(value(charge),326.1179088);assert.equal(stock(charge,'chargeBlade','normalPhials'),4.5);
  near(component(charge,'physical'),component(blank,'physical')*1.2);
  near(component(charge,'element'),component(blank,'element'));near(component(charge,'phial'),component(blank,'phial'));
  assert.ok(!charge.evaluationPlan.automaticOpening.includes('斧ニュートラル'));
  const off=t.run('charge-blade',ed,{chargeBladeState:{axeBoosted:false}},rm);
  near(value(off),165.495204);assert.equal(stock(off,'chargeBlade','normalPhials'),4);
  const zero=t.run('charge-blade',ed,{chargeBladeState:{normalPhials:0}},rm);
  assert.equal(value(zero),null);assert.equal(stock(zero,'chargeBlade','normalPhials'),0);
  const morph=t.run('charge-blade','canonical:CB_SWORD_TO_AXE_MORPH');
  near(value(morph),256.374936);assert.ok(morph.evaluationPlan.automaticOpening.includes('剣始動'));
  assert.ok(!morph.evaluationPlan.automaticOpening.includes('通常ビン5本'));
  assert.equal(value(t.run('charge-blade','canonical:CB_SHIELD_THRUST')),null);
 }finally{t.close();}
});
test('ordinary GL shot takes valid defaults, but preserves zero fire and exhausted stock',()=>{
 const t=setup(),normal='reference:gl_NORMAL';
 try{
  const gl=t.run('gunlance',normal);
  near(value(gl),21.75);assert.equal(stock(gl,'gunlance','loadedRounds'),5);near(gl.row.referenceCombo.damage,21.75);
  const zero=t.run('gunlance',normal,{gunlanceState:{fireHitzone:0}});
  assert.ok(value(zero)>0&&value(zero)<value(gl));assert.equal(stock(zero,'gunlance','loadedRounds'),5);
  assert.ok(!zero.evaluationPlan.automaticOpening.includes('対象部位の火肉質'));
  assert.equal(value(t.run('gunlance',normal,{gunlanceState:{shellingType:'WIDE'}})),null);
  assert.equal(value(t.run('gunlance',normal,{gunlanceState:{loadedRounds:0}})),null);
  assert.equal(value(t.run('gunlance','reference:gl_CHARGED')),null);
  assert.equal(value(t.run('gunlance','reference:gl_FULL_BURST')),null);
 }finally{t.close();}
});
test('saved GL route uses its own explicit zero, not the live editor setting',()=>{
 const t=setup();
 try{
  t.apply('gunlance',{gunlanceState:{loadedRounds:0}});t.add('reference:gl_NORMAL');t.save();
  t.apply('gunlance',{gunlanceState:{loadedRounds:4,fireHitzone:30,shellingType:'NORMAL',shellingPower:'HIGH'}});t.add('canonical:GL_SLAM');
  const row=t.compare();assert.equal(value(row.oneHitPipeline),null);assert.equal(row.referenceCombo.damage,null);
  assert.equal(row.referenceCombo.stages[0]?.techniqueId,'reference:gl_NORMAL');
 }finally{t.close();}
});
test('previous explicit-opening scope restores representative LS/DB defaults and preserves explicit Bow/HBG settings',()=>{
 const t=setup();
 try{
  t.apply('long-sword');const red=t.read("consumerEvaluationPlan('long-sword',[{techniqueId:'LS_RED_BLADE_I'}]).conditions.longSwordState||null");
  assert.equal(red?.spiritGauge,'RED');
  t.apply('dual-blades');const db=t.read("consumerEvaluationPlan('dual-blades',[{techniqueId:'DB_DEMON_DANCE_I'}],{dualBladesState:{demonMode:false}}).conditions.dualBladesState");
  assert.equal(db.demonMode,false);assert.equal(db.requiresDemonGauge,true);
  t.apply('bow');const bow=t.read("consumerEvaluationPlan('bow',[{techniqueId:'BOW_POWER_SHOT_3'}],{bowState:{coating:'NONE',range:'FAR',startShot:2}}).conditions.bowState");
  assert.deepEqual(bow,{coating:'NONE',range:'FAR',startShot:2});
  t.apply('heavy-bowgun');assert.equal(t.read("consumerEvaluationPlan('heavy-bowgun',[{techniqueId:'HBG_NORMAL_AMMO_2'}],{hbgState:{range:'FAR',fullMagazine:false}}).conditions.hbgState.range"),'FAR');
 }finally{t.close();}
});
