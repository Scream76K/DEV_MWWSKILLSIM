'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

test('lance mid thrust picker, named builds, comparison and legacy preset', t => {
  const errors = [];
  const virtualConsole = new VirtualConsole().on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(readSimulatorHtml(), {url:'https://lance.invalid/', runScripts:'dangerously', virtualConsole,
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
  const snapshot = profiles.find(p => p.kind === 'lance').input;
  w.source = data;
  w.snapshot = snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot)');
  const ids = ['I','II','III'].map(level => 'canonical:LAN_MID_THRUST_' + level);
  const labels = ['中段突きⅠ','中段突きⅡ','中段突きⅢ'];
  const options = select => Array.from(select.options, o => [o.value, o.text]);
  const checkChoices = select => {
    assert.equal(options(select).some(([id]) => id === 'ln_mid'), false);
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
      if (id === 'ln_mid') {
        assert.equal(metric.value, null);
        assert.match(metric.reason, /TECHNIQUE_NOT_FOUND:ln_mid/);
      } else {
        assert.equal(metric.value.toFixed(1), ['70.0','70.0','92.0'][ids.indexOf(id)]);
        assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds), [id.slice(10)]);
      }
    }
  };
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
    const displayed = calc();
    assert.match(displayed, /暫定・参考/);
    assert.ok(displayed.includes(['70.0','70.0','92.0'][ids.indexOf(id)]), displayed);
    el('combo').querySelector('.del').click();
  }
  const builds = w.savedBuildMap();
  builds.old = {...builds[ids[0]], combo:{...builds[ids[0]].combo, moves:[{techniqueId:'ln_mid'}]}};
  const bytes = JSON.stringify(builds);
  const key = w.eval('BUILDS_KEY');
  w.localStorage.setItem(key, bytes);
  w.renderSavedBuilds();
  load('old');
  w.renderComboForWeapon();
  assert.equal(row().value, 'ln_mid');
  checkChoices(picker);
  assert.match(calc(), /中段突きⅠ〜Ⅲを選び直してください/);
  for (const names of [ids, ['old']]) {
    for (const checkbox of el('compareBuilds').querySelectorAll('input')) {
      if (checkbox.checked !== names.includes(checkbox.dataset.compareName)) checkbox.click();
    }
    el('runCompare').click();
    const compared = w.eval('lastBuildComparisonRows');
    assert.ok(compared, el('compareOut').textContent);
    for (const name of names) {
      checkLanes(compared.find(r => r.name === name).oneHitPipeline, name === 'old' ? 'ln_mid' : name);
    }
  }
  assert.equal(row().value, 'ln_mid');
  change(row(), ids[1]);
  checkChoices(row());
  assert.equal(row().value, ids[1]);
  change(el('comboPreset'), 'ln_basic');
  assert.deepEqual(Array.from(el('combo').querySelectorAll('.cmove'), s => s.value), ['ln_mid','ln_high','ln_mid']);
  assert.match(calc(), /中段突きⅠ〜Ⅲを選び直してください/);
  checkChoices(picker);
  assert.equal(w.localStorage.getItem(key), bytes);
});
