'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

test('hammer vertical picker, named builds, comparison and legacy preset', t => {
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
  const snapshot = profiles.find(p => p.kind === 'hammer').input;
  w.source = data;
  w.snapshot = snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot)');
  const ids = ['I','II'].map(level => 'canonical:HAM_VERTICAL_' + level);
  const labels = ['縦振りⅠ','縦振りⅡ'];
  const options = select => Array.from(select.options, o => [o.value, o.text]);
  const checkChoices = select => {
    assert.equal(options(select).some(([id]) => id === 'hm_swing'), false);
    assert.deepEqual(options(select).filter(([id]) => ids.includes(id)), ids.map((id,i) => [id, labels[i]]));
  };
  const row = () => el('combo').querySelector('.cmove');
  const load = name => { change(el('savedBuildSelect'), name); el('savedBuildLoad').click(); };
  const calc = () => {
    el('calcUserComboDamage').click();
    assert.equal(el('compareOut').dataset.resultMode, 'current-custom');
    return el('compareOut').textContent;
  };
  const checkLanes = (pipeline, id) => {
    for (const channel of ['normal','maximum']) {
      const metric = w.consumerDamageMetric({oneHitPipeline:pipeline}, channel);
      if (id === 'hm_swing') {
        assert.equal(metric.value, null);
        assert.match(metric.reason, /TECHNIQUE_NOT_FOUND:hm_swing/);
      } else {
        assert.equal(metric.value,totals.get(id)[channel].metrics.comboTotalDamage.value);
        assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds), [id.slice(10)]);
      }
    }
  };
  // Only the impact hitzone varies between samples; cut and projectile stay distinct.
  const training=w.trainingRoomMonster;
  let impact=0.4;
  w.trainingRoomMonster=()=>{
    const target=training();
    Object.assign(target.parts[0].multipliers,{slash:0.7,blunt:impact,pierce:0.25});
    return target;
  };
  const totals=new Map();
  const picker = el('comboMovePicker');
  checkChoices(picker);
  for (const id of ids) {
    change(picker, id);
    el('addCombo').click();
    checkChoices(row());
    assert.equal(row().value, id);
    el('buildName').value = id;
    el('saveBuild').click();
    assert.equal(w.savedBuildMap()[id].combo.moves[0].techniqueId, id);
    load(id);
    assert.equal(row().value, id);
    const run=()=>{
      let result;const original=w.calcUserComboDamage;
      w.calcUserComboDamage=(...args)=>(result=original(...args));
      try{calc();}finally{w.calcUserComboDamage=original;}
      assert.ok(result.damage>0,JSON.stringify(result.blocked));
      return result.pipeline.channels;
    };
    impact=0.8;const front=run();
    t.diagnostic(id+' '+['normal','maximum'].map(ch=>front[ch].metrics.comboTotalDamage.value.toFixed(1)).join(' / '));
    impact=0.4;const split=run();
    for(const lane of ['normal','maximum']){
      const hit=(channels,kind)=>channels[lane].components.find(c=>c.id===id.slice(10)+':'+kind+':0').value;
      assert.ok(hit(front,'physical')>0);
      assert.equal(hit(split,'physical'),hit(front,'physical')/2);
      assert.ok(hit(front,'element')>0);
      assert.equal(hit(split,'element'),hit(front,'element'));
    }
    totals.set(id,split);
    const displayed = calc();
    assert.match(displayed, /暫定・参考/);

    el('combo').querySelector('.del').click();
  }
  for(const lane of ['normal','maximum']){
    const parts=ids.map(id=>totals.get(id)[lane].components);
    const values=kind=>parts.map((components,i)=>components.find(c=>c.id===ids[i].slice(10)+':'+kind+':0').value);
    const [first,second]=values('physical');
    assert.ok(Math.abs(first-second*41/45)<1e-9);
    const [a,b]=values('element');assert.equal(a,b);
  }
  const builds = w.savedBuildMap();
  builds.old = {...builds[ids[0]], combo:{...builds[ids[0]].combo, moves:[{techniqueId:'hm_swing'}]}};
  const bytes = JSON.stringify(builds);
  const key = w.eval('BUILDS_KEY');
  w.localStorage.setItem(key, bytes);
  w.renderSavedBuilds();
  load('old');
  w.renderComboForWeapon();
  assert.equal(row().value, 'hm_swing');
  checkChoices(picker);
  assert.match(calc(), /縦振りⅠ・Ⅱを選び直してください/);
  for (const names of [ids, ['old']]) {
    for (const checkbox of el('compareBuilds').querySelectorAll('input')) {
      if (checkbox.checked !== names.includes(checkbox.dataset.compareName)) checkbox.click();
    }
    el('runCompare').click();
    const compared = w.eval('lastBuildComparisonRows');
    assert.ok(compared, el('compareOut').textContent);
    for (const name of names) {
      checkLanes(compared.find(r => r.name === name).oneHitPipeline, name === 'old' ? 'hm_swing' : name);
    }
  }
  assert.equal(row().value, 'hm_swing');
  change(row(), ids[1]);
  checkChoices(row());
  assert.equal(row().value, ids[1]);
  change(el('comboPreset'), 'hm_basic');
  assert.deepEqual(Array.from(el('combo').querySelectorAll('.cmove'), s => s.value), ['hm_swing','hm_side','hm_charge2']);
  assert.match(el('combo').querySelectorAll('.comboMeta')[0].textContent,/縦振りⅠ・Ⅱを選び直してください/);
  checkChoices(picker);
  const presetSwing=el('combo').querySelectorAll('.cmove')[0];
  change(presetSwing,ids[0]);
  checkChoices(presetSwing);
  assert.equal(w.localStorage.getItem(key), bytes);
  for(const moves of [[{techniqueId:ids[0],repeat:2}],[{techniqueId:ids[0],count:2}],[{techniqueId:ids[0]},{techniqueId:ids[1]}]]){
    w.applyBuildSnapshot({...snapshot,combo:{moves}});
    assert.match(calc(),/未算出/);
    assert.equal(w.calcUserComboDamage().damage,null);
  }
});
