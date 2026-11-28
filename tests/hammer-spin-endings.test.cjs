'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

const endings=[
  ['HAM_SPIN_SIDE_SWING','回転横振り',30],
  ['HAM_SPIN_RETURN_SWING','回転返し振り',55],
  ['HAM_SPIN_STRONG_UPPERCUT','回転強アッパー',100]
];
for(const [id,label,mv] of endings)test(label+' resolves only its finishing contact in current and saved builds',t=>{
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
  const standard=()=>JSON.parse(w.eval('JSON.stringify([calcState.realOneHit.evaluationPlan.techniqueIds,...Object.values(calcState.realOneHit.channels).map(c=>c.metrics.comboTotalDamage.value)])'));
  const baseline=standard();
  assert.deepEqual(baseline[0],['HAM_SIDE_SWING','HAM_VERTICAL_II','HAM_UPPERCUT','HAM_MIGHTY_CHARGE_UPPERCUT']);
  const move='canonical:'+id;
  const picker=el('comboMovePicker');
  change(picker,move);
  assert.equal(picker.selectedOptions[0]?.text,label);
  el('addCombo').click();
  assert.match(el('combo').querySelector('.comboMeta').textContent,/回転攻撃から派生.*終端.*1ヒット.*直前の回転.*相殺追撃.*含めません/);
  const run=()=>{
    const original=w.calcUserComboDamage;
    let result;
    w.calcUserComboDamage=(...args)=>(result=original(...args));
    try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
    return result;
  };
  const values=result=>{
    assert.ok(result.damage>0,JSON.stringify(result.blocked));
    return ['normal','maximum'].map(lane=>{
      const parts=result.pipeline.channels[lane].components;
      assert.deepEqual(Array.from(parts,c=>c.id),[id+':physical:0',id+':element:0']);
      return Array.from(parts,c=>c.value);
    });
  };
  const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' / '+b);
  const training=w.trainingRoomMonster;
  let element=.30,blunt=.8;
  w.trainingRoomMonster=()=>{
    const monster=training(),hz=monster.parts[0].multipliers;
    Object.assign(hz,{slash:.42,blunt,pierce:.23});
    for(const type of ['fire','ice','thunder','water','dragon'])hz[type]=element;
    return monster;
  };
  const control=values(run());
  for(const [physical,elem] of control){near(physical,55.341*mv/25);near(elem,13.2825*1.5/1.1);}
  blunt=.4;
  values(run()).forEach(([p,e],i)=>{near(p,control[i][0]/2);near(e,control[i][1]);});
  blunt=.8;
  element=.15;
  values(run()).forEach(([p,e],i)=>{near(p,control[i][0]);near(e,control[i][1]/2);});
  element=.30;
  el('buildName').value='swing';el('saveBuild').click();
  const saved=w.savedBuildMap().swing;
  assert.equal(saved.combo.moves[0].techniqueId,move);
  assert.equal(saved.combo.moves.length,1);
  const apply=(moves,skills=[])=>w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves},
    charmCustom:{...saved.charmCustom,skills}});
  const row={techniqueId:move};
  for(const [name,level,factor] of [['チャージマスター',3,1],['飛燕',1,1]]){
    apply([row],[{name,level,type:'weapon'}]);
    assert.equal(w.eval('calcState.total')[name],level);
    const active=run();
    for(const lane of ['normal','maximum'])assert.equal(active.pipeline.channels[lane].diagnostics.ignoredSkillEffects?.length||0,0);
    values(active).forEach(([p,e],i)=>{near(p,control[i][0]);near(e,control[i][1]*factor);});
  }
  apply([row],[{name:'溜打強化',level:1,type:'weapon'}]);
  const assertOmitted = result => {
    assert.deepEqual(values(result),control);
    for(const lane of ['normal','maximum']){
      const omissions=result.pipeline.channels[lane].diagnostics?.ignoredSkillEffects || [];
      assert.equal(Array.from(omissions).filter(s=>s.skillId===83 && s.name==='溜打強化').length,1);
    }
  };
  assertOmitted(run());
  assert.match(el('compareOut').textContent,/溜打強化/);
  el('buildName').value='strike';el('saveBuild').click();
  assert.equal(w.savedBuildMap().strike.charmCustom.skills[0].name,'溜打強化');
  for(const moves of [[{techniqueId:'hm_charge2'}],[row,row],[{...row,repeat:2}],[{...row,count:2}],[row,{techniqueId:'hm_side'}]]){
    apply(moves);assert.equal(run().damage,null);
  }
  const offset=w.evaluateP0DamageRoute([row],{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),offsetSuccess:true}});
  assert.equal(offset.damage,null);
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  el('compareBuilds').querySelector('[data-compare-name="swing"]').click();el('compareBuilds').querySelector('[data-compare-name="strike"]').click();el('runCompare').click();
  const rows=w.eval('lastBuildComparisonRows');
  const compared=rows.find(r=>r.name==='swing').oneHitPipeline;
  const savedStrike=rows.find(r=>r.name==='strike').oneHitPipeline;
  assertOmitted({damage:savedStrike.channels.normal.metrics.comboTotalDamage.value,pipeline:savedStrike});
  assert.deepEqual(values({damage:compared.channels.normal.metrics.comboTotalDamage.value,pipeline:compared}),control);
  change(el('savedBuildSelect'),'swing');el('savedBuildLoad').click();
  assert.deepEqual(values(run()),control);
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.deepEqual(standard(),baseline);
  t.diagnostic('normal/maximum [physical,element] '+JSON.stringify(control));
});
