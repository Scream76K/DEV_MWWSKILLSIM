'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

function setup(t,kind,weaponId){
  const errors = [];
  const virtualConsole = new VirtualConsole().on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(readSimulatorHtml(), {url:'https://gun-recovery.invalid/', runScripts:'dangerously', virtualConsole,
    beforeParse(w) {
      w.fetch = () => Promise.reject(Error('OFFLINE'));
      w.confirm = () => true;
      w.structuredClone = x => w.JSON.parse(w.JSON.stringify(x));
    }
  }).window;
  t.after(() => { w.close(); assert.deepEqual(errors, []); });
  const el = id => w.document.getElementById(id);
  const change = (select, value) => {
    select.value = value;
    select.dispatchEvent(new w.Event('change', {bubbles:true}));
  };
  const snapshot = {...profiles.find(p=>p.kind===kind).input,weaponId,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},combo:{moves:[]}};
  w.source = data;
  w.snapshot = snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot)');
  const standard=()=>w.eval('JSON.stringify([calcState.realOneHit.evaluationPlan.techniqueIds,...Object.values(calcState.realOneHit.channels).map(c=>c.metrics.comboTotalDamage.value)])');
  return {w,el,change,snapshot,standard};
}
for(const [action,count,multiplier] of [['CHARGED',2,1.8],['FULL_BURST',6,1.4]])test(action+' single selected and saved shell action', t => {
  const {w,el,change,snapshot,standard}=setup(t,'gunlance','315');
  const baseline=standard();

  const move='reference:gl_'+action;
  const opening={moves:[],gunlanceState:action==='CHARGED'?{chargedRounds:2}:{}};
  w.applyBuildSnapshot({...snapshot,combo:opening});
  change(el('comboMovePicker'),move);el('addCombo').click();
  function current(){
    let result;const calc=w.calcUserComboDamage;
    w.calcUserComboDamage=(...args)=>(result=calc(...args));
    try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=calc;}
    return result;
  }
  function verify(pipeline){
    for(const lane of ['normal','maximum']){
      const metric=w.consumerDamageMetric({oneHitPipeline:pipeline},lane);
      const expected=count*(90*.08*multiplier+7*.3);
      assert.ok(Math.abs(metric.value-expected)<1e-9,JSON.stringify({metric,expected}));
    }
  }
  const r=current();assert.ok(r.damage>0,JSON.stringify(r.blocked));verify(r.pipeline);
  el('buildName').value=action;el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  assert.equal(w.savedBuildMap()[action].combo.moves[0].techniqueId,move);
  change(el('comboGLLoaded'),'0');assert.equal(current().damage,null);
  el('compareBuilds').querySelector('[data-compare-name="'+action+'"]').click();el('runCompare').click();
  const saved=w.eval('lastBuildComparisonRows[0]');
  verify(saved.oneHitPipeline);assert.equal(saved.referenceCombo.damage,r.damage);
  assert.equal(el('comboGLLoaded').value,'0');assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  const legacy=action==='FULL_BURST'?'gl_burst':'gl_shell';
  const replacement=action==='FULL_BURST'?move:'reference:gl_NORMAL';
  const old={...w.savedBuildMap()[action],combo:{moves:[{techniqueId:legacy}]}};
  w.localStorage.setItem(w.eval('BUILDS_KEY'),JSON.stringify({old}));w.renderSavedBuilds();
  const oldBytes=w.eval('storageGet(BUILDS_KEY)');
  change(el('savedBuildSelect'),'old');el('savedBuildLoad').click();
  const row=el('combo').querySelector('.cmove');
  assert.equal(row.value,legacy);assert.equal(current().damage,null);
  assert.equal(Array.from(el('comboMovePicker').options).some(o=>o.value===legacy&&!o.hidden&&!o.disabled),legacy==='gl_shell');
  el('compareBuilds').querySelector('[data-compare-name="old"]').click();el('runCompare').click();
  const oldPipeline=w.eval('lastBuildComparisonRows[0].oneHitPipeline');
  for(const lane of ['normal','maximum'])assert.equal(w.consumerDamageMetric({oneHitPipeline:oldPipeline},lane).value,null);
  change(row,replacement);assert.ok(current().damage>0);
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),oldBytes);
  for(const bad of [{shellingType:'WIDE'},{shellingPower:'HIGH'},...(action==='CHARGED'?[{chargedRounds:null},{chargedRounds:7}]:[])]){
    w.applyBuildSnapshot({...snapshot,combo:{moves:[{techniqueId:move}],gunlanceState:{...opening.gunlanceState,...bad}}});
    assert.equal(current().damage,null);
  }
  w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('Hope Bullet I keeps its separate single powder rapid trigger',t=>{
  const {w,el,change,snapshot}=setup(t,'light-bowgun','763');
  w.applyBuildSnapshot({...snapshot,combo:{moves:[],lightBowgunState:{normalPowder:'LEVEL_PLUS_ONE',shotMode:'RAPID',rapidReady:true,
    ammoType:'NORMAL',ammoLevel:3,normalModeLevel:0,range:'CRITICAL',contactPolicy:'ALL_FIVE',loadedRounds:4,fullMagazine:true,shotOrdinal:1,specialMagazine:'NONE'}}});
  change(el('comboMovePicker'),'canonical:LBG_NORMAL_RAPID_3');el('addCombo').click();
  el('calcUserComboDamage').click();
  const r=w.calcUserComboDamage();assert.ok(r.damage>0,JSON.stringify(r.blocked));
  for(const lane of ['normal','maximum'])assert.ok(Math.abs(w.consumerDamageMetric({oneHitPipeline:r.pipeline},lane).value-77.112)<1e-8);
});

test('水平砲撃の新規選択だけが装備参照の正式IDになる',t=>{
  const {w,el,change,snapshot}=setup(t,'gunlance','315');
  const ref='reference:gl_NORMAL';
  const pick=id=>{change(el('comboMovePicker'),id);el('addCombo').click();};
  const row=()=>el('combo').querySelector('.cmove');
  const damage=()=>{el('calcUserComboDamage').click();const r=w.calcUserComboDamage();return [r.damage,r.maximumDamage];};
  for(const weaponId of ['315','320','328']){
    const input={...snapshot,weaponId};
    w.applyBuildSnapshot(input);pick(ref);const expected=damage();
    w.applyBuildSnapshot(input);pick('gl_shell');assert.equal(row().value,ref);
    assert.deepEqual(damage(),expected);
    const totals={'315':9.3,'320':23.9,'328':28.7};
    assert.deepEqual(expected,[totals[weaponId],totals[weaponId]]);
    if(weaponId==='315'){
      assert.ok(expected.every(n=>n>0));
      el('buildName').value='水平';el('saveBuild').click();
      const saved=w.savedBuildMap()['水平'];assert.equal(saved.combo.moves[0].techniqueId,ref);
      const bytes=w.eval('storageGet(BUILDS_KEY)');
      w.applyBuildSnapshot(saved);assert.equal(row().value,ref);assert.deepEqual(damage(),expected);
      el('compareBuilds').querySelector('[data-compare-name="水平"]').click();el('runCompare').click();
      const comparison=w.eval('lastBuildComparisonRows[0]');
      assert.deepEqual(['normal','maximum'].map(k=>w.consumerDamageMetric(comparison,k).value),expected);
      w.applyBuildSnapshot({...input,combo:{moves:[{techniqueId:'gl_shell'},{techniqueId:'gl_burst'}]}});
      assert.deepEqual(Array.from(el('combo').querySelectorAll('.cmove'),e=>e.value),['gl_shell','gl_burst']);
      change(row(),'gl_shell');assert.equal(row().value,ref);
      assert.equal(el('combo').querySelectorAll('.cmove')[1].value,'gl_burst');
      assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
    }
  }
  w.applyBuildSnapshot(snapshot);
  w.eval("const originalShellWeapon=selectedWeapon;selectedWeapon=()=>({...originalShellWeapon(),shell:null,shellLevel:null})");
  pick('gl_shell');assert.deepEqual(damage(),[null,null]);

});

test('315 竜撃砲は明示した1ゲージで5接触のみ',t=>{
 const {w,el,change,snapshot,standard}=setup(t,'gunlance','315'),baseline=standard(),training=w.trainingRoomMonster;
 let fire=.3,physical=.8,wounded=false;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{fire,slash:physical,pierce:physical});m.parts[0].wounded=wounded;return m;};
 const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),'gl_wyvern');el('addCombo').click();assert.equal(run().damage,null);
 el('buildName').value='旧';el('saveBuild').click();
 const select=w.document.querySelector('[data-wyvern-profile]');assert.ok(select,'竜撃ゲージと5命中を明示できる');assert.equal(select.value,'');
 change(select,select.options[1].value);
 const check=(p,total)=>{for(const key of ['normal','maximum']){
  const lane=p.channels[key];assert.equal(lane.components.length,5);
  for(const c of lane.components){assert.equal(c.details.physical,38.7);assert.equal(c.details.fire,24*fire);}
  assert.equal(lane.finalState.gunlance.wyvernGauge,0);assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-total)<1e-8);
 }};
 const unavailable=()=>{const r=run();assert.equal(r.damage,null);assert.equal(r.maximumDamage,null);};
 unavailable();fire=.06;unavailable();fire=.05;check(run().pipeline,199.5);
 physical=.2;check(run().pipeline,199.5);fire=0;check(run().pipeline,193.5);fire=undefined;unavailable();
 fire=.05;wounded=true;assert.equal(run().damage,null);wounded=false;
 el('buildName').value='5打';el('saveBuild').click();const saved=w.savedBuildMap()['5打'],bytes=w.eval('storageGet(BUILDS_KEY)');
 w.applyBuildSnapshot(w.savedBuildMap()['旧']);assert.equal(run().damage,null);
 el('compareBuilds').querySelector('[data-compare-name="5打"]').click();el('runCompare').click();check(w.eval('lastBuildComparisonRows[0].oneHitPipeline'),199.5);
 w.applyBuildSnapshot(saved);check(run().pipeline,199.5);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[...saved.combo.moves,...saved.combo.moves]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,gunlanceState:{loadedRounds:0}}});check(run().pipeline,199.5);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,gunlanceState:{shellingType:'WIDE'}}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,charmCustom:{...saved.charmCustom,skills:[{name:'砲術',level:1,type:'weapon'}]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,target:{monsterId:'13',partId:'2699'}});
 assert.equal(el('monster').value,'13');assert.equal(el('monsterPart').value,'2699');
 fire=0;check(run().pipeline,193.5);
 w.applyBuildSnapshot({...saved,weaponId:'320'});assert.equal(run().damage,null);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('retired choices remain editable only on their own restored row',t=>{
  const {w,el,change}=setup(t,'gunlance','315');
  const groups={
    'dual-blades':['db_dance3'],hammer:['hm_charge2'],'hunting-horn':['hh_melody'],
    lance:['ln_counter'],gunlance:['gl_burst'],'charge-blade':['cb_axe'],
    'insect-glaive':['ig_jump','ig_rising'],'light-bowgun':['lbg_rapid','lbg_special'],
    'heavy-bowgun':['hbg_cluster','hbg_special']
  };
  const offered=[];
  for(const [kind,ids] of Object.entries(groups)){
    for(const id of ids){
      const old={...profiles.find(p=>p.kind===kind).input,combo:{moves:[{techniqueId:id}]}};
      const bytes=JSON.stringify({old});
      w.localStorage.setItem(w.eval('BUILDS_KEY'),bytes);w.renderSavedBuilds();
      change(el('savedBuildSelect'),'old');el('savedBuildLoad').click();
      const picker=el('comboMovePicker'),row=el('combo').querySelector('.cmove');
      assert.equal(row.value,id);
      if([...picker.options].some(o=>o.value===id)){offered.push(id);continue;}
      assert.ok(row.closest('.comboRow').querySelector('.comboMeta').textContent.trim());
      assert.equal(w.calcUserComboDamage().damage,null,id);
      const alternative={
        hm_charge2:'canonical:HAM_CHARGED_UPPERCUT',ig_rising:'canonical:IG_DESCENDING_THRUST',
        gl_burst:'reference:gl_FULL_BURST',hbg_special:'canonical:HBG_IGNITION_MACHINE',
        hbg_cluster:'canonical:HBG_STICKY_AMMO_1',hh_melody:'canonical:HH_SELF_IMPROVEMENT_PERFORMANCE',
        ln_counter:'canonical:LAN_CHARGED_COUNTER'
      }[id];
      const next=[...picker.options].find(o=>o.value&&!o.disabled&&!o.hidden&&(!alternative||o.value===alternative));
      assert.ok(next,alternative||kind);
      change(picker,next.value);el('addCombo').click();
      const second=el('combo').querySelectorAll('.cmove')[1];
      assert.ok(![...second.options].some(o=>o.value===id));
      assert.equal(w.calcUserComboDamage().damage,null,id+' mixed');
      change(row,second.value);
      assert.ok(![...row.options].some(o=>o.value===id));
      assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
    }
  }
  assert.deepEqual(offered,[]);
});
