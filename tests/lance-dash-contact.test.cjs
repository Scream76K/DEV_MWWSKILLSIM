'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

test('single lance dash contact, named comparison and legacy re-selection', t => {
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
  const standard=()=>w.eval('JSON.stringify([calcState.realOneHit.evaluationPlan.techniqueIds,...Object.values(calcState.realOneHit.channels).map(c=>c.metrics.comboTotalDamage.value)])');
  const baseline=standard();
  const historical=w.TechniqueDBEngine.get('lance','LAN_DASH');
  assert.equal(historical.hits.length,0);assert.equal(historical.variableHitSource.hitCount,null);
  const ids = ['canonical:LAN_DASH_SINGLE_CONTACT'];
  const labels = ['突進（1ヒット）'];
  const options = select => Array.from(select.options, o => [o.value, o.text]);
  const checkChoices = select => {
    assert.equal(options(select).some(([id]) => id === 'ln_charge'), false);
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
      if (id === 'ln_charge') {
        assert.equal(metric.value, null);
        assert.match(metric.reason, /TECHNIQUE_NOT_FOUND:ln_charge/);
      } else {
        assert.equal(metric.value,totals.get(id)[channel].metrics.comboTotalDamage.value);
        assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds), [id.slice(10)]);
      }
    }
  };
  // Only the cut hitzone varies between samples; impact and projectile stay distinct.
  const training=w.trainingRoomMonster;
  let cut=0.4, dragon=0.3;
  w.trainingRoomMonster=()=>{
    const target=training();
    Object.assign(target.parts[0].multipliers,{dragon,slash:cut,blunt:0.7,pierce:0.25});
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
    cut=0.8;const front=run();
    t.diagnostic(id+' '+['normal','maximum'].map(ch=>front[ch].metrics.comboTotalDamage.value.toFixed(1)).join(' / '));
    cut=0.4;const split=run();
    for(const lane of ['normal','maximum']){
      const hit=(channels,kind)=>channels[lane].components.find(c=>c.id===id.slice(10)+':'+kind+':0').value;
      assert.ok(hit(front,'physical')>0);
      assert.equal(hit(split,'physical'),hit(front,'physical')/2);
      assert.ok(hit(front,'element')>0);
      assert.equal(hit(split,'element'),hit(front,'element'));
    }
    dragon=0.15;const halfElement=run();dragon=0.3;
    for(const lane of ['normal','maximum']){
      const values=channels=>Array.from(channels[lane].components,c=>c.value);
      const [p,e]=values(split);assert.deepEqual(values(halfElement),[p,e/2]);
    }
    w.applyBuildSnapshot({...w.savedBuildMap()[id],charmCustom:{...snapshot.charmCustom,skills:[{name:'飛燕',level:1,type:'weapon'}]}});
    assert.equal(w.eval('calcState.total')['飛燕'],1);
    const flight=run();
    for(const lane of ['normal','maximum'])assert.deepEqual(flight[lane].components.map(c=>c.value),split[lane].components.map(c=>c.value));
    w.applyBuildSnapshot({...w.savedBuildMap()[id],charmCustom:{...snapshot.charmCustom,skills:[{name:'チャージマスター',level:1,type:'weapon'}]}});
    const omitted=run();
    for(const lane of ['normal','maximum'])assert.equal(omitted[lane].metrics.comboTotalDamage.value,split[lane].metrics.comboTotalDamage.value);
    assert.match(el('compareOut').textContent,/未反映.*チャージマスター/);
    load(id);
    totals.set(id,split);
    const displayed = calc();
    assert.match(displayed, /暫定・参考/);

    el('combo').querySelector('.del').click();
  }
  const builds = w.savedBuildMap();
  builds.old = {...builds[ids[0]], combo:{...builds[ids[0]].combo, moves:[{techniqueId:'ln_charge'}]}};
  const bytes = JSON.stringify(builds);
  const key = w.eval('BUILDS_KEY');
  w.localStorage.setItem(key, bytes);
  w.renderSavedBuilds();
  load('old');
  w.renderComboForWeapon();
  assert.equal(row().value, 'ln_charge');
  checkChoices(picker);
  assert.match(calc(), /突進（1ヒット）を選び直してください/);
  for (const names of [ids, ['old']]) {
    for (const checkbox of el('compareBuilds').querySelectorAll('input')) {
      if (checkbox.checked !== names.includes(checkbox.dataset.compareName)) checkbox.click();
    }
    el('runCompare').click();
    const compared = w.eval('lastBuildComparisonRows');
    assert.ok(compared, el('compareOut').textContent);
    for (const name of names) {
      checkLanes(compared.find(r => r.name === name).oneHitPipeline, name === 'old' ? 'ln_charge' : name);
    }
  }
  assert.equal(row().value, 'ln_charge');
  change(row(), ids[0]);
  checkChoices(row());
  assert.equal(row().value, ids[0]);
  assert.equal(w.localStorage.getItem(key), bytes);
  for(const moves of [[{techniqueId:ids[0],repeat:2}],[{techniqueId:ids[0],count:2}],[{techniqueId:ids[0]},{techniqueId:ids[0]}]]){
    w.applyBuildSnapshot({...snapshot,combo:{moves}});
    assert.match(calc(),/未算出/);
    assert.equal(w.calcUserComboDamage().damage,null);
  }
  w.trainingRoomMonster=training;
  w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});
