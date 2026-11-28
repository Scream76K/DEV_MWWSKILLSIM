'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

const cases=[
 ['long-sword','LS_VERTICAL_SLASH','縦斬り','ls_base1',24],
 ['long-sword','LS_VERTICAL_SLASH_2','縦斬り（2回目）','ls_base1',18],
 ['switch-axe','SA_AXE_VERTICAL','斧：縦斬り','sa_vertical',45],
 ['switch-axe','SA_AXE_HORIZONTAL','斧：横斬り','sa_horizontal',23]
];
for(const [kind,id,label,legacy,mv] of cases)test(label+' current, saved and legacy selections',t=>{
  const errors = [];
  const virtualConsole = new VirtualConsole().on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(readSimulatorHtml(), {url:'https://hammer.invalid/', runScripts:'dangerously', virtualConsole,
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
  const snapshot = profiles.find(p => p.kind === kind).input;
  w.source = data;
  w.snapshot = snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot)');
  const move='canonical:'+id,axe=kind==='switch-axe',picker=el('comboMovePicker');
  const standard=()=>JSON.parse(w.eval('JSON.stringify(Object.values(calcState.realOneHit.channels).map(c=>c.metrics.comboTotalDamage.value))'));
  const baseline=standard();
  assert.ok(!Array.from(picker.options,o=>o.value).includes(legacy));
  change(picker,move);assert.equal(picker.selectedOptions[0]?.text,label);el('addCombo').click();
  const run=()=>{
    let result;const orig=w.calcUserComboDamage;
    w.calcUserComboDamage=(...args)=>(result=orig(...args));
    try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=orig;}
    return result;
  };
  const parts=result=>{
    assert.ok(result.damage>0,JSON.stringify(result.blocked));
    return ['normal','maximum'].map(lane=>{
      const cs=result.pipeline.channels[lane].components;
      assert.deepEqual(Array.from(cs,c=>c.id),[id+':physical:0',id+':element:0']);
      return Array.from(cs,c=>c.value);
    });
  };
  const apply=(combo,skills=[])=>w.applyBuildSnapshot({...snapshot,combo,charmCustom:{...snapshot.charmCustom,skills}});
  const row={techniqueId:move},combo={moves:[row]};
  const control=parts(run());
  for(const [p,e] of control){
    assert.ok(Math.abs(p-215*.975*1.32*.8*mv/100)<1e-8);
    assert.ok(Math.abs(e-(axe?9.66:10.35))<1e-8);
  }
  el('buildName').value='single';el('saveBuild').click();
  const saved=w.savedBuildMap().single;
  assert.equal(saved.combo.moves[0].techniqueId,move);
  const state=axe?{switchAxeState:{mode:'AXE',awakened:false}}:{longSwordState:{spiritGauge:'NONE'}};
  apply({...combo,...state});assert.deepEqual(parts(run()),control);
  if(axe){
    change(el('comboSAAxeBoosted'),'1');
    const boosted=parts(run());
    for(const [i,[p,e]] of boosted.entries()){
      // Weapon 1175 has white sharpness and -10% affinity.
      assert.ok(Math.abs(p-control[i][0]-10*mv/100*.8*1.32*.975)<1e-8);
      assert.equal(e,control[i][1]);
    }
    change(el('comboSAAwakened'),'1');assert.equal(run().damage,null);
    change(el('comboSAAwakened'),'0');change(el('comboSAMode'),'SWORD');
  }else change(el('comboLSSpiritGauge'),'RED');
  assert.equal(run().damage,null);
  el('compareBuilds').querySelector('[data-compare-name="single"]').click();el('runCompare').click();
  const compared=w.eval('lastBuildComparisonRows[0]');
  assert.deepEqual(parts({damage:compared.referenceCombo.damage,pipeline:compared.oneHitPipeline}),control);
  for(const [name,level] of [['飛燕',1],['チャージマスター',3]]){
    apply({...combo,...state},[{name,level,type:'weapon'}]);
    assert.equal(w.eval('calcState.total')[name],level);
    const result=run();assert.deepEqual(parts(result),control);
    if(name==='チャージマスター'){
      assert.ok(result.pipeline.channels.maximum.diagnostics.ignoredSkillEffects.some(s=>s.skillId===24));
      assert.match(el('compareOut').textContent,/一部スキル未反映：チャージマスター/);
    }
  }
  for(const moves of [[row,row],[{...row,repeat:2}],[{...row,count:2}]]){
    apply({moves,...state});assert.equal(run().damage,null);
  }
  const builds=w.savedBuildMap();builds.old={...saved,combo:{...saved.combo,moves:[{techniqueId:legacy}]}};
  const bytes=JSON.stringify(builds),key=w.eval('BUILDS_KEY');
  w.localStorage.setItem(key,bytes);w.renderSavedBuilds();
  change(el('savedBuildSelect'),'old');el('savedBuildLoad').click();
  for(const checkbox of el('compareBuilds').querySelectorAll('[data-compare-name]'))checkbox.checked=checkbox.dataset.compareName==='old';
  el('runCompare').click();
  const oldRow=w.eval('lastBuildComparisonRows[0]');
  assert.equal(oldRow.name,'old');
  for(const lane of ['normal','maximum'])assert.equal(w.consumerDamageMetric(oldRow,lane).value,null);
  const select=el('combo').querySelector('.cmove');
  assert.equal(select.value,legacy);assert.equal(run().damage,null);
  change(select,move);assert.deepEqual(parts(run()),control);
  assert.equal(w.localStorage.getItem(key),bytes);
  w.applyBuildSnapshot(snapshot);assert.deepEqual(standard(),baseline);
  t.diagnostic(label+' '+JSON.stringify(control));
});
