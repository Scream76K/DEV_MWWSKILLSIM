'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

test('true charged slash III picker, named builds, comparison and legacy preset', t => {
  const errors = [];
  const virtualConsole = new VirtualConsole().on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(readSimulatorHtml(), {url:'https://great-sword.invalid/', runScripts:'dangerously', virtualConsole,
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
  const snapshot = profiles.find(p => p.kind === 'great-sword').input;
  w.source = data;
  w.snapshot = snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot)');
  const ids = ['canonical:GS_TRUE_CHARGED_SLASH_3','canonical:GS_TRUE_CHARGED_SLASH_3_STRONG'];
  const labels = ['真・溜め斬りⅢ','真・溜め斬りⅢ（強撃）'];
  const options = select => Array.from(select.options, o => [o.value, o.text]);
  const checkChoices = select => {
    assert.equal(options(select).some(([id]) => id === 'gs_tcs3'), false);
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
      if (id === 'gs_tcs3') {
        assert.equal(metric.value, null);
        assert.match(metric.reason, /TECHNIQUE_NOT_FOUND:gs_tcs3/);
      } else {
        assert.deepEqual(Array.from(pipeline.channels[channel].components,c=>[c.id,c.value]),Array.from(totals.get(id)[channel].components,c=>[c.id,c.value]));
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
  for(const [i,id] of ids.entries()){
    for(const lane of ['normal','maximum']){
      const parts=totals.get(id)[lane].components;
      const value=(kind,n)=>parts.find(c=>c.id===id.slice(10)+':'+kind+':'+n).value;
      assert.equal(parts.length,4);
      assert.ok(Math.abs(value('physical',1)/value('physical',0)-[209,267][i]/16)<1e-9);
      assert.ok(Math.abs(value('element',1)/value('element',0)-2.5)<1e-9);
    }
  }
  for(const [name,level] of [['飛燕',1],['チャージマスター',3]]){
    const save=w.savedBuildMap()[ids[1]];
    w.applyBuildSnapshot({...save,charmCustom:{...save.charmCustom,skills:[{name,level,type:'weapon'}]}});
    assert.equal(w.eval('calcState.total')[name],level);
    const result=w.calcUserComboDamage();
    for(const lane of ['normal','maximum']){
      const channel=result.pipeline.channels[lane];
      assert.equal(channel.metrics.comboTotalDamage.value,totals.get(ids[1])[lane].metrics.comboTotalDamage.value);
      if(name==='チャージマスター')assert.ok(channel.diagnostics.ignoredSkillEffects.some(s=>s.name===name));
    }
  }
  const builds = w.savedBuildMap();
  builds.old = {...builds[ids[0]], combo:{...builds[ids[0]].combo, moves:[{techniqueId:'gs_tcs3'}]}};
  const bytes = JSON.stringify(builds);
  const key = w.eval('BUILDS_KEY');
  w.localStorage.setItem(key, bytes);
  w.renderSavedBuilds();
  load('old');
  w.renderComboForWeapon();
  assert.equal(row().value, 'gs_tcs3');
  checkChoices(picker);
  assert.match(calc(), /真・溜め斬りⅢの強撃の有無を選び直してください/);
  for (const names of [ids, ['old']]) {
    for (const checkbox of el('compareBuilds').querySelectorAll('input')) {
      if (checkbox.checked !== names.includes(checkbox.dataset.compareName)) checkbox.click();
    }
    el('runCompare').click();
    const compared = w.eval('lastBuildComparisonRows');
    assert.ok(compared, el('compareOut').textContent);
    for (const name of names) {
      const result=compared.find(r=>r.name===name);
      if(name!=='old'){
        assert.equal(result.referenceCombo.damage,totals.get(name).normal.metrics.comboTotalDamage.value);
        assert.equal(result.referenceCombo.stages[0].damage,result.referenceCombo.damage);
      }
      checkLanes(result.oneHitPipeline, name === 'old' ? 'gs_tcs3' : name);
    }
  }
  assert.equal(row().value, 'gs_tcs3');
  change(row(), ids[1]);
  checkChoices(row());
  assert.equal(row().value, ids[1]);
  change(el('comboPreset'), 'gs_tcs');
  assert.deepEqual(Array.from(el('combo').querySelectorAll('.cmove'), s => s.value), ['gs_charge3','gs_strong3','gs_tcs3']);
  assert.match(el('combo').querySelectorAll('.comboMeta')[2].textContent,/真・溜め斬りⅢの強撃の有無を選び直してください/);
  checkChoices(picker);
  const presetTcs=el('combo').querySelectorAll('.cmove')[2];
  change(presetTcs,ids[0]);
  checkChoices(presetTcs);
  assert.equal(w.localStorage.getItem(key), bytes);
  for(const moves of [[{techniqueId:ids[0],repeat:2}],[{techniqueId:ids[0],count:2}],[{techniqueId:ids[0]},{techniqueId:ids[1]}]]){
    w.applyBuildSnapshot({...snapshot,combo:{moves}});
    assert.match(calc(),/未算出/);
    assert.equal(w.calcUserComboDamage().damage,null);
  }
});
