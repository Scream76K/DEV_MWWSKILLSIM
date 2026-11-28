'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

test('lance high thrust picker, named builds, comparison and legacy preset', t => {
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
  const ids = ['I','II','III'].map(level => 'canonical:LAN_HIGH_THRUST_' + level);
  const labels = ['上段突きⅠ','上段突きⅡ','上段突きⅢ'];
  const options = select => Array.from(select.options, o => [o.value, o.text]);
  const checkChoices = select => {
    assert.equal(options(select).some(([id]) => id === 'ln_high'), false);
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
      if (id === 'ln_high') {
        assert.equal(metric.value, null);
        assert.match(metric.reason, /TECHNIQUE_NOT_FOUND:ln_high/);
      } else {
        assert.equal(metric.value,totals.get(id)[channel].metrics.comboTotalDamage.value);
        assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds), [id.slice(10)]);
      }
    }
  };
  // Only the cut hitzone varies between samples; impact and projectile stay distinct.
  const training=w.trainingRoomMonster;
  let cut=0.4;
  w.trainingRoomMonster=()=>{
    const target=training();
    Object.assign(target.parts[0].multipliers,{slash:cut,blunt:0.7,pierce:0.25});
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
    totals.set(id,split);
    const displayed = calc();
    assert.match(displayed, /暫定・参考/);

    el('combo').querySelector('.del').click();
  }
  const builds = w.savedBuildMap();
  builds.old = {...builds[ids[0]], combo:{...builds[ids[0]].combo, moves:[{techniqueId:'ln_high'}]}};
  const bytes = JSON.stringify(builds);
  const key = w.eval('BUILDS_KEY');
  w.localStorage.setItem(key, bytes);
  w.renderSavedBuilds();
  load('old');
  w.renderComboForWeapon();
  assert.equal(row().value, 'ln_high');
  checkChoices(picker);
  assert.match(calc(), /上段突きⅠ〜Ⅲを選び直してください/);
  for (const names of [ids, ['old']]) {
    for (const checkbox of el('compareBuilds').querySelectorAll('input')) {
      if (checkbox.checked !== names.includes(checkbox.dataset.compareName)) checkbox.click();
    }
    el('runCompare').click();
    const compared = w.eval('lastBuildComparisonRows');
    assert.ok(compared, el('compareOut').textContent);
    for (const name of names) {
      checkLanes(compared.find(r => r.name === name).oneHitPipeline, name === 'old' ? 'ln_high' : name);
    }
  }
  assert.equal(row().value, 'ln_high');
  change(row(), ids[1]);
  checkChoices(row());
  assert.equal(row().value, ids[1]);
  change(el('comboPreset'), 'ln_basic');
  assert.deepEqual(Array.from(el('combo').querySelectorAll('.cmove'), s => s.value), ['ln_mid','ln_high','ln_mid']);
  assert.match(el('combo').querySelectorAll('.comboMeta')[1].textContent,/上段突きⅠ〜Ⅲを選び直してください/);
  checkChoices(picker);
  const presetHigh=el('combo').querySelectorAll('.cmove')[1];
  change(presetHigh,ids[2]);
  checkChoices(presetHigh);
  assert.equal(w.localStorage.getItem(key), bytes);
  for(const moves of [[{techniqueId:ids[0],repeat:2}],[{techniqueId:ids[0],count:2}],[{techniqueId:ids[0]},{techniqueId:ids[1]}]]){
    w.applyBuildSnapshot({...snapshot,combo:{moves}});
    assert.match(calc(),/未算出/);
    assert.equal(w.calcUserComboDamage().damage,null);
  }
  w.applyBuildSnapshot({...snapshot,combo:{moves:[{techniqueId:'ln_counter'}]}});
  assert.equal(row().value,'ln_counter');assert.equal(w.calcUserComboDamage().damage,null);
  el('buildName').value='counter-old';el('saveBuild').click();
  const ret='canonical:LAN_RETURN_THRUST';
  assert.ok(options(picker).some(([id])=>id===ret),'ordinary guard return available');
  change(row(),ret);calc();
  const current=w.calcUserComboDamage();
  assert.ok(current.damage>0,JSON.stringify(current.blocked));
  for(const lane of ['normal','maximum']){
    const parts=current.pipeline.channels[lane].components,high=totals.get(ids[0])[lane].components;
    assert.deepEqual(Array.from(parts,c=>c.id),['LAN_RETURN_THRUST:physical:0','LAN_RETURN_THRUST:element:0']);
    assert.ok(Math.abs(parts[0].value-high[0].value*24/31)<1e-8);
    assert.ok(Math.abs(parts[1].value-high[1].value*1.2)<1e-8);
  }
  el('buildName').value='ordinary-return';el('saveBuild').click();
  const stored=w.localStorage.getItem(key);
  load('counter-old');assert.equal(row().value,'ln_counter');
  const counter=el('comboLANCounter');change(counter,[...counter.options].find(o=>o.value).value);
  for(const box of el('compareBuilds').querySelectorAll('input')){
    if(box.checked!==['ordinary-return','counter-old'].includes(box.dataset.compareName))box.click();
  }
  el('runCompare').click();
  for(const r of w.eval('lastBuildComparisonRows')){
    for(const lane of ['normal','maximum']){
      assert.equal(w.consumerDamageMetric(r,lane).value,r.name==='counter-old'?null:current.pipeline.channels[lane].metrics.comboTotalDamage.value);
    }
  }
  assert.equal(w.localStorage.getItem(key),stored);
  for(const moves of [[{techniqueId:ret,repeat:2}],[{techniqueId:ret},{techniqueId:ids[0]}]]){
    w.applyBuildSnapshot({...snapshot,combo:{moves}});assert.equal(w.calcUserComboDamage().damage,null);
  }
  t.diagnostic('ordinary return: '+current.damage+' / '+current.maximumDamage);

  const single='canonical:LAN_CHARGED_COUNTER';
  w.applyBuildSnapshot({...snapshot,combo:{moves:[]}});
  assert.ok(options(picker).some(([id,label])=>id===single&&label==='溜めカウンター（溜めなし）'));
  change(picker,single);el('addCombo').click();calc();
  const uncharged=w.calcUserComboDamage();
  assert.ok(uncharged.damage>0,JSON.stringify(uncharged.blocked));
  for(const lane of ['normal','maximum']){
    const parts=uncharged.pipeline.channels[lane].components,high=totals.get(ids[0])[lane].components;
    assert.deepEqual(Array.from(parts,c=>c.id),['LAN_CHARGED_COUNTER:physical:0','LAN_CHARGED_COUNTER:element:0']);
    assert.ok(Math.abs(parts[0].value-high[0].value*43/31)<1e-8);
    assert.equal(parts[1].value,high[1].value);
    assert.match(parts[0].source,/Wp06\.csv#L31$/);
  }
  el('buildName').value='uncharged';el('saveBuild').click();
  const unchanged=w.localStorage.getItem(key);
  change(counter,[...counter.options].find(o=>o.value).value);
  assert.equal(w.calcUserComboDamage().damage,null);
  for(const box of el('compareBuilds').querySelectorAll('input')){
    if(box.checked!==(box.dataset.compareName==='uncharged'))box.click();
  }
  el('runCompare').click();
  const saved=w.eval('lastBuildComparisonRows[0]');
  for(const lane of ['normal','maximum'])assert.deepEqual(saved.oneHitPipeline.channels[lane].components,uncharged.pipeline.channels[lane].components);
  assert.equal(w.localStorage.getItem(key),unchanged);
  for(const moves of [[{techniqueId:single,repeat:2}],[{techniqueId:single},{techniqueId:ret}]]){
    w.applyBuildSnapshot({...snapshot,combo:{moves}});assert.equal(w.calcUserComboDamage().damage,null);
  }
  w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
  assert.equal(saved.referenceCombo.damage,uncharged.damage);
  t.diagnostic('uncharged: '+uncharged.damage+' / '+uncharged.maximumDamage);

});
