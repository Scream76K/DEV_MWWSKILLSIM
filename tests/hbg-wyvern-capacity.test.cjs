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
  const w = new JSDOM(readSimulatorHtml(), {url:'https://ranged-reference.invalid/', runScripts:'dangerously', virtualConsole,
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

test('one wyvern round reads weapon capacity independently of saved shot position',t=>{
  const {w,el,change,snapshot,standard}=setup(t,'heavy-bowgun','469');
  const base=standard(),move='canonical:HBG_WYVERN_AMMO';
  const buffs={meal:'NONE',charm:'NO',otherBuffs:'NONE'};
  const apply=(position,weaponId='469')=>w.applyBuildSnapshot({...snapshot,weaponId,combatBuffs:buffs,
    combo:{moves:[],hbgReferenceState:position,hbgWyvernState:{mode:'STANDARD'}}});
  const pick=()=>{change(el('comboMovePicker'),move);assert.equal(el('comboMovePicker').value,move);el('addCombo').click();};
  const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
  const position={shotOrdinal:1,fullMagazine:true};
  apply({...position,magazineCapacity:2});pick();
  const control=run();assert.ok(control.damage>0,JSON.stringify(control.blocked));
  function verify(pipeline){
    const values=['normal','maximum'].map(lane=>{
      const c=pipeline.channels[lane],result=c.components[0].details;
      assert.equal(result.hits.length,2);assert.equal(result.shotSkills.shotAttackAdd,5);
      assert.ok(Math.abs(result.hits[0].p-92)<1e-8&&Math.abs(result.hits[1].p-21.85)<1e-8);
      assert.equal(result.hits[0].e,12);assert.ok(Math.abs(result.hits[1].e-6*result.shotSkills.shotElementMultiplier)<1e-8);
      return c.metrics.comboTotalDamage.value;
    });
    assert.deepEqual(values,[control.damage,control.maximumDamage]);return values;
  }
  verify(control.pipeline);apply(position);pick();
  const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));t.diagnostic(JSON.stringify(verify(r.pipeline)));
  el('buildName').value='wyvern';el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  apply({...position,magazineCapacity:1});pick();assert.equal(run().damage,null);
  el('compareBuilds').querySelector('[data-compare-name="wyvern"]').click();el('runCompare').click();
  const saved=w.eval('lastBuildComparisonRows[0]');verify(saved.oneHitPipeline);
  assert.equal(saved.referenceCombo.damage,control.damage);assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  apply({shotOrdinal:2,fullMagazine:false});pick();assert.ok(Math.abs(run().damage-126.9)<1e-8);
  apply({});pick();assert.equal(run().damage,null);
  const unsupported=data.weapons.find(v=>v.kind==='heavy-bowgun'&&!v.ammo.some(a=>a.kind==='wyvern'));
  apply(position,String(unsupported.id));pick();assert.equal(run().damage,null);
  w.applyBuildSnapshot(snapshot);assert.equal(standard(),base);
});

test('legacy Dragon Piercer uses the provisional 13 contacts in current and saved views',t=>{
  const id='17';
  const {w,el,change}=setup(t,'bow',id);
  const training=w.trainingRoomMonster;
  let cut=0.8,fire=0.3;
  w.trainingRoomMonster=()=>{
    const monster=training();
    Object.assign(monster.parts[0].multipliers,{slash:cut,pierce:0.2,fire});
    return monster;
  };
  const move='bow_power';change(el('comboMovePicker'),move);assert.equal(el('comboMovePicker').value,move);el('addCombo').click();
  el('calcUserComboDamage').click();const current=w.calcUserComboDamage();assert.ok(current.damage>0,JSON.stringify(current.blocked));
  assert.match(el('compareOut').textContent,/仮：13ヒット/);
  const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' != '+b);
  const check=(pipeline,scale,elementScale)=>{
    for(const lane of ['normal','maximum']){
      const {details}=pipeline.channels[lane].components[0];
      const base=current.pipeline.channels[lane].components[0].details.trace[0];
      assert.equal(details.trace.length,13);
      [1,1,.75,.75,.75,.75,.75,.75,.75,.75,.35,.35,.1].forEach((decay,i)=>{
        const hit=details.trace[i];
        near(hit.physical,base.physical*decay*scale);
        near(hit.element,base.element*elementScale);
        assert.equal(hit.partModifier,1.2);
      });
      assert.ok(base.element>0);
      near(details.total,base.physical*8.8*scale+13*base.element*elementScale);
    }
  };
  near(current.pipeline.channels.normal.components[0].details.trace[0].physical,100*.25*.8*1.1*1.0125);
  near(current.pipeline.channels.normal.components[0].details.trace[0].element,70/10*.3*.3);
  check(current.pipeline,1,1);
  cut=.4;check(w.calcUserComboDamage().pipeline,.5,1);
  fire=.15;check(w.calcUserComboDamage().pipeline,.5,.5);
  cut=.8;fire=.3;
  el('buildName').value='piercer';el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');assert.equal(w.savedBuildMap().piercer.combo.moves[0].techniqueId,move);
  change(el('powerBowCoating'),'POWER');assert.equal(w.calcUserComboDamage().damage,null);
  el('compareBuilds').querySelector('[data-compare-name="piercer"]').click();el('runCompare').click();
  const p=w.eval('lastBuildComparisonRows[0].oneHitPipeline');
  check(p,1,1);assert.equal(el('powerBowCoating').value,'POWER');
  t.diagnostic('weapon '+id+' normal '+current.damage+' maximum '+current.maximumDamage);
  for(const lane of ['normal','maximum'])assert.equal(w.consumerDamageMetric({oneHitPipeline:p},lane).value,w.consumerDamageMetric({oneHitPipeline:current.pipeline},lane).value);
  assert.match(el('compareOut').textContent,/仮：13ヒット/);assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  const saved=w.savedBuildMap().piercer;
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,bowState:{...saved.combo.bowState,guided:true}}});
  assert.equal(w.calcUserComboDamage().damage,null);
  w.applyBuildSnapshot(saved);
  el('comboMovePicker').value=move;el('addCombo').click();
  assert.equal(w.calcUserComboDamage().damage,null);
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);

});

test('Hope Cannon I explicit base ignition spends the full gauge on forty consecutive contacts',t=>{
 const {w,el,change,snapshot,standard}=setup(t,'heavy-bowgun','464'),base=standard();
 const move='canonical:HBG_IGNITION_MACHINE',profile='HOPE_BASE_FULL_40',training=w.trainingRoomMonster;
 let hz=.4,wound=false;
 w.trainingRoomMonster=()=>{const m=training();m.parts[0].multipliers.pierce=hz;m.parts[0].wounded=wound;return m;};
 const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),move);assert.equal(el('comboMovePicker').value,move);el('addCombo').click();
 assert.equal(run().damage,null);
 change(w.document.querySelector('[data-ignition-profile]'),profile);
 const verify=p=>{
  for(const key of ['normal','maximum']){
   const c=p.channels[key];assert.equal(c.components.length,40);
   for(const [i,n] of [[0,3.6],[2,4.32],[4,5.184],[6,6.2208],[8,7.46496],[39,7.46496]])assert.ok(Math.abs(c.components[i].value-n)<1e-9);
   assert.ok(Math.abs(c.metrics.comboTotalDamage.value-277.52832)<1e-8);
   assert.equal(c.finalState.heavyBowgun.ignitionGauge,0);
  }
 };
 const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));verify(r.pipeline);
 el('buildName').value='gatling';el('saveBuild').click();
 const saved=w.savedBuildMap().gatling,bytes=w.eval('storageGet(BUILDS_KEY)');
 assert.equal(saved.combo.moves[0].ignitionProfile,profile);
 hz=.2;assert.ok(Math.abs(run().damage-r.damage/2)<1e-8);hz=.4;
 wound=true;assert.equal(run().damage,null);wound=false;
 change(w.document.querySelector('[data-ignition-profile]'),'');
 el('compareBuilds').querySelector('[data-compare-name="gatling"]').click();el('runCompare').click();
 const row=w.eval('lastBuildComparisonRows[0]');verify(row.oneHitPipeline);assert.equal(row.referenceCombo.damage,r.damage);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 w.applyBuildSnapshot(saved);assert.equal(w.document.querySelector('[data-ignition-profile]').value,profile);
 for(const row of [{techniqueId:move,ignitionProfile:'CUSTOM'},{techniqueId:'hbg_special'},{...saved.combo.moves[0],repeat:2}]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[row]}});assert.equal(run().damage,null);
 }
 for(const state of [{...saved.combo.hbgReferenceState,ammoLevel:2},{...saved.combo.hbgReferenceState,shotOrdinal:1}]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,hbgReferenceState:state}});assert.equal(run().damage,null);
 }
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[...saved.combo.moves,{techniqueId:'canonical:HBG_NORMAL_AMMO_2'}]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,charmCustom:{...saved.charmCustom,skills:[{name:'攻撃',level:1,type:'weapon'}]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,weaponId:'465'});assert.equal(run().damage,null);
 w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),base);
});

test('464 native sticky Lv1 attaches and explodes once in current and saved comparisons',t=>{
 const {w,el,change,snapshot,standard}=setup(t,'heavy-bowgun','464'),baseline=standard();
 const move='canonical:HBG_STICKY_AMMO_1',training=w.trainingRoomMonster;
 let pierce=.4,fire=.3;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{pierce,fire});return m;};
 const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),move);assert.equal(el('comboMovePicker').value,move);el('addCombo').click();
 const check=p=>{for(const ch of ['normal','maximum']){
  const lane=p.channels[ch];assert.deepEqual(Array.from(lane.components,c=>Number(c.value.toFixed(6))),[.36,27,1.5]);
  assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-28.86)<1e-9);
  assert.equal(lane.finalState.heavyBowgun.stickyRoundBudget,0);
  assert.deepEqual(Array.from(lane.components,c=>c.details.part),['impact','explosion','fire']);
  assert.notEqual(lane.components[0].eventId,lane.components[1].eventId);
  assert.equal(lane.components[1].eventId,lane.components[2].eventId);
 }};
 const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));check(r.pipeline);
 el('buildName').value='sticky';el('saveBuild').click();const bytes=w.eval('storageGet(BUILDS_KEY)'),saved=w.savedBuildMap().sticky;
 assert.equal(saved.combo.moves[0].techniqueId,move);
 fire=0;assert.ok(Math.abs(run().damage-27.36)<1e-9);fire=undefined;assert.equal(run().damage,null);
 fire=.3;pierce=.8;assert.ok(Math.abs(run().damage-29.22)<1e-9);pierce=.4;
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[{techniqueId:'hbg_cluster'}]}});assert.equal(run().damage,null);
 el('compareBuilds').querySelector('[data-compare-name="sticky"]').click();el('runCompare').click();
 const row=w.eval('lastBuildComparisonRows[0]');check(row.oneHitPipeline);assert.equal(row.referenceCombo.damage,r.damage);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 for(const bad of [{range:'FAR'},{ammoLevel:2},{normalModeLevel:1}]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,hbgReferenceState:{...saved.combo.hbgReferenceState,...bad}}});assert.equal(run().damage,null);
 }
 w.applyBuildSnapshot({...saved,charmCustom:{...saved.charmCustom,skills:[{name:'砲術',type:'weapon',level:1}]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[...saved.combo.moves,{techniqueId:move}]}});assert.equal(run().damage,null);
 w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('464 base uncharged ignition counter is one fixed contact with no evaluated ending gauge',t=>{
 const {w,el,change,snapshot,standard}=setup(t,'heavy-bowgun','464'),baseline=standard();
 const move='canonical:HBG_IGNITION_COUNTER',profile='HOPE_BASE_COUNTER_30_NO_OFFSET',training=w.trainingRoomMonster;
 let hz=.4,wounded=false;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{pierce:hz,fire:hz});m.parts[0].wounded=wounded;return m;};
 const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),move);assert.equal(el('comboMovePicker').value,move);el('addCombo').click();
 assert.equal(run().damage,null);change(w.document.querySelector('[data-ignition-profile]'),profile);
 const verify=p=>{for(const key of ['normal','maximum']){
  const lane=p.channels[key];assert.equal(lane.components.length,1);
  assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-29.7)<1e-9);
  assert.equal(lane.components[0].details.endingGauge,'NOT_EVALUATED');
  assert.equal(lane.finalState?.heavyBowgun?.ignitionGauge,undefined);
 }};
 const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));verify(r.pipeline);hz=.8;verify(run().pipeline);
 el('buildName').value='counter';el('saveBuild').click();
 const saved=w.savedBuildMap().counter,bytes=w.eval('storageGet(BUILDS_KEY)');
 assert.equal(saved.combo.moves[0].ignitionProfile,profile);
 wounded=true;assert.equal(run().damage,null);wounded=false;
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[{techniqueId:'hbg_special'}]}});assert.equal(run().damage,null);
 el('compareBuilds').querySelector('[data-compare-name="counter"]').click();el('runCompare').click();
 const row=w.eval('lastBuildComparisonRows[0]');verify(row.oneHitPipeline);assert.equal(row.referenceCombo.damage,r.damage);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 w.applyBuildSnapshot(saved);assert.equal(w.document.querySelector('[data-ignition-profile]').value,profile);
 for(const bad of ['HOPE_BASE_FULL_40','OFFSET_SUCCESS',null]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[{techniqueId:move,ignitionProfile:bad}]}});assert.equal(run().damage,null);
 }
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[...saved.combo.moves,...saved.combo.moves]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,weaponId:'465'});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,charmCustom:{...saved.charmCustom,skills:[{name:'攻撃',level:1,type:'weapon'}]}});assert.equal(run().damage,null);
 w.eval("DB.decorations.push({id:123,name:'対照用の装飾品',skills:[],slot:1})");
 w.applyBuildSnapshot({...saved,decos:{head_0:123}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[{...saved.combo.moves[0],offsetSuccess:true}]}});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,hbgReferenceState:{...saved.combo.hbgReferenceState,normalModeLevel:1}}});assert.equal(run().damage,null);
 w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('464 swapped second slot grenade: only six explicitly split explosions',t=>{
 const {w,el,change,snapshot,standard}=setup(t,'heavy-bowgun','464'),baseline=standard();
 const move='canonical:HBG_IGNITION_GRENADE',profile='HOPE_SWAPPED_GRENADE_30_SPLIT_SIX',training=w.trainingRoomMonster;
 let fire=.3,pierce=.4,wounded=false;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{fire,pierce});m.parts[0].wounded=wounded;return m;};
 const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),move);assert.equal(el('comboMovePicker').value,move);el('addCombo').click();
 assert.equal(run().damage,null);change(w.document.querySelector('[data-ignition-profile]'),profile);
 function verify(p,total){
  for(const key of ['normal','maximum']){
   const lane=p.channels[key];assert.equal(lane.components.length,6);
   assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-total)<1e-8);
   for(const c of lane.components){assert.equal(c.details.physical,14.4);assert.equal(c.details.fire,fire*10);}
   assert.equal(lane.finalState?.heavyBowgun?.ignitionGauge,undefined);
  }
 }
 const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));verify(r.pipeline,104.4);
 fire=0;verify(run().pipeline,86.4);fire=undefined;assert.equal(run().damage,null);
 fire=.3;pierce=.8;verify(run().pipeline,104.4);
 wounded=true;assert.equal(run().damage,null);wounded=false;
 el('buildName').value='grenade';el('saveBuild').click();const saved=w.savedBuildMap().grenade,bytes=w.eval('storageGet(BUILDS_KEY)');
 assert.equal(saved.combo.moves[0].ignitionProfile,profile);
 for(const wrong of ['', 'HOPE_BASE_COUNTER_30_NO_OFFSET','UNSPLIT_TWO']){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[{techniqueId:move,ignitionProfile:wrong}]}});assert.equal(run().damage,null);
 }
 el('compareBuilds').querySelector('[data-compare-name="grenade"]').click();el('runCompare').click();
 const row=w.eval('lastBuildComparisonRows[0]');verify(row.oneHitPipeline,104.4);assert.equal(row.referenceCombo.damage,r.damage);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 w.applyBuildSnapshot(saved);assert.equal(w.document.querySelector('[data-ignition-profile]').value,profile);
 for(const skill of ['砲術','特殊射撃強化']){w.applyBuildSnapshot({...saved,charmCustom:{...saved.charmCustom,skills:[{name:skill,level:1,type:'weapon'}]}});assert.equal(run().damage,null);}
 w.applyBuildSnapshot({...saved,weaponId:'465'});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[...saved.combo.moves,{techniqueId:'hbg_special'}]}});assert.equal(run().damage,null);
 w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('貫通弾Lv2は保存行に条件がない限り7命中を仮定しない',t=>{
  const {w,el,change,snapshot,standard}=setup(t,'light-bowgun','783');
  const baseline=standard();
  change(el('comboMovePicker'),'lbg_pierce2');
  assert.equal(el('comboMovePicker').value,'lbg_pierce2');
  el('addCombo').click();
  const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
  assert.equal(run().damage,null);
  el('buildName').value='legacy';el('saveBuild').click();
  assert.deepEqual(Object.keys(w.savedBuildMap().legacy.combo.moves[0]),['techniqueId']);
  const select=w.document.querySelector('[data-pierce-profile]');
  assert.ok(select,'貫通弾Lv2の行で条件を明示できる');
  assert.equal(select.value,'');
  const condition=Array.from(select.options).find(o=>o.text.includes('通常射撃・同一部位に7ヒット（参考）'));
  assert.ok(condition);
  change(select,condition.value);
  const result=run();
  for(const lane of ['normal','maximum']){
    const channel=result.pipeline.channels[lane];
    assert.ok(channel.metrics.comboTotalDamage.value>0,JSON.stringify(result.blocked));
    for(const [i,rate] of [1,1,.9,.8,.7,.7,.7].entries())
      assert.ok(Math.abs(channel.components[i].value-120*.12*.8*.8*rate)<1e-9);
    assert.ok(Math.abs(channel.metrics.comboTotalDamage.value-53.4528)<1e-9);
    assert.equal(channel.components.length,7);
    assert.equal(channel.finalState.lightBowgun.loadedRounds,3);
  }
  el('buildName').value='seven';el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  assert.equal(JSON.parse(bytes).seven.combo.moves[0].techniqueId,'lbg_pierce2');
  change(el('comboLBGMode'),'RAPID');
  assert.equal(run().damage,null);
  el('compareBuilds').querySelector('[data-compare-name="seven"]').click();el('runCompare').click();
  const row=w.eval('lastBuildComparisonRows[0]');
  assert.deepEqual(Array.from(row.pierceSeven||[]),[result.damage,result.maximumDamage]);
  assert.equal(el('comboLBGMode').value,'RAPID');
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  const saved=w.savedBuildMap().seven;
  w.applyBuildSnapshot(saved);
  assert.equal(w.document.querySelector('[data-pierce-profile]').value,condition.value);
  change(el('monsterPart'),'training-back');
  assert.ok(Math.abs(run().damage-13.3632)<1e-9);
  const reload=(state,moves=saved.combo.moves)=>w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves,lightBowgunState:state}});
  for(const state of [{loadedRounds:0},{ammoLevel:1},{shotMode:'CHASE'},{fullMagazine:false},{contactTargetPolicy:'MULTIPLE'},{normalPowder:'LEVEL_PLUS_ONE'}]){
    reload(state);assert.equal(run().damage,null,JSON.stringify(state));
  }
  reload({},[...saved.combo.moves,...saved.combo.moves]);assert.equal(run().damage,null);
  w.applyBuildSnapshot({...saved,weaponId:'763'});assert.equal(run().damage,null);
  assert.throws(()=>w.applyBuildSnapshot({...saved,decos:{unknown:'invalid'}}),/装飾品がDBに見つかりません/);
  w.applyBuildSnapshot(w.savedBuildMap().legacy);assert.equal(run().damage,null);
  assert.equal(w.document.querySelector('[data-pierce-profile]').value,'');
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('装備480の貫通Lv2は明示した通常射撃1発の7接触のみ',t=>{
 const {w,el,change,snapshot,standard}=setup(t,'heavy-bowgun','480');
 const baseline=standard(),pick='hbg_pierce2',run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),pick);el('addCombo').click();assert.equal(run().damage,null);
 el('buildName').value='旧';el('saveBuild').click();
 const select=w.document.querySelector('[data-pierce-profile]');
 assert.ok(select,'ヘビィの既存行で7命中を明示できる');assert.equal(select.value,'');
 change(select,select.options[1].value);
 const verify=(pipeline,hz)=>{
  for(const key of ['normal','maximum']){
   const lane=pipeline.channels[key];
   assert.equal(lane.components.length,7);
   for(const [i,rate] of [1,1,.9,.8,.7,.7,.7].entries())assert.ok(Math.abs(lane.components[i].value-140*.12*rate*hz)<1e-9);
   assert.equal(lane.finalState.heavyBowgun.loadedRounds,3);
   assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-140*.696*hz)<1e-9);
  }
 };
 const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));verify(r.pipeline,.8);
 el('buildName').value='7打';el('saveBuild').click();const saved=w.savedBuildMap()['7打'],bytes=w.eval('storageGet(BUILDS_KEY)');
 change(el('monsterPart'),'training-back');verify(run().pipeline,.2);
 change(el('monsterPart'),'training-front');change(el('powerHbgCapacity'),'6');assert.equal(run().damage,null);
 el('compareBuilds').querySelector('[data-compare-name="7打"]').click();el('runCompare').click();
 verify(w.eval('lastBuildComparisonRows[0].oneHitPipeline'),.8);assert.equal(el('powerHbgCapacity').value,'6');
 w.applyBuildSnapshot(saved);verify(run().pipeline,.8);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[...saved.combo.moves,...saved.combo.moves]}});assert.equal(run().damage,null);
 for(const state of [{magazineCapacity:6},{shotOrdinal:2},{fullMagazine:false},{range:'FAR'},{ammoLevel:3},
    {normalModeLevel:1},{parts:['PIERCE_MAGAZINE','PIERCE_MAGAZINE']}]){
  w.applyBuildSnapshot({...saved,combo:{...saved.combo,hbgReferenceState:{...saved.combo.hbgReferenceState,...state}}});
  assert.equal(run().damage,null,JSON.stringify(state));
 }
 w.applyBuildSnapshot({...saved,weaponId:'464'});assert.equal(run().damage,null);
 w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves:[{techniqueId:pick,pierceProfile:'FULL_MAGAZINE_FIRST_NORMAL_SEVEN'}]}});
 assert.equal(run().damage,null);
 w.applyBuildSnapshot(w.savedBuildMap()['旧']);assert.equal(run().damage,null);assert.equal(w.document.querySelector('[data-pierce-profile]').value,'');
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});

test('ホープボウⅠ 曲射1の6着弾は単独参考表示で、総計と別',t=>{
 const {w,el,change,snapshot}=setup(t,'bow','1'),id='canonical:BOW_ARC_1_IMPACT_ONLY',training=w.trainingRoomMonster;
 let slash=.8,shot=.8;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{slash,pierce:shot});return m;};
 const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
 change(el('comboMovePicker'),id);assert.equal(el('comboMovePicker').value,id);el('addCombo').click();
 const verify=(p,hz)=>{for(const key of ['normal','maximum']){
   const lane=p.channels[key];assert.equal(lane.metrics.comboTotalDamage.value,null);
   assert.ok(Math.abs(lane.metrics.arcImpactReference.value-90*.62*hz)<1e-8);
   assert.deepEqual(Array.from(lane.components,c=>c.value),[9,9,13,9,9,13].map(mv=>90*mv/100*hz));
 }};
 const r=run();assert.equal(r.damage,null);verify(r.pipeline,.8);
 assert.match(el('compareOut').textContent,/着弾のみ.*44.6/);
 el('buildName').value='着弾';el('saveBuild').click();const saved=w.savedBuildMap()['着弾'],bytes=w.eval('storageGet(BUILDS_KEY)');
 change(el('powerBowCoating'),'POWER');assert.ok(!run().pipeline?.channels?.normal?.metrics?.arcImpactReference);
 el('compareBuilds').querySelector('[data-compare-name="着弾"]').click();el('runCompare').click();
 assert.equal(w.eval('lastBuildComparisonRows[0].referenceCombo.damage'),null);
 verify(w.eval('lastBuildComparisonRows[0].oneHitPipeline'),.8);assert.match(el('compareOut').textContent,/着弾のみ.*44.6/);
 w.applyBuildSnapshot(saved);verify(run().pipeline,.8);slash=shot=0;verify(run().pipeline,0);
 for(const [a,b] of [[.8,.4],[.8,undefined],[undefined,.8]]){slash=a;shot=b;assert.ok(!run().pipeline?.channels?.normal?.metrics?.arcImpactReference);}
 slash=shot=.8;
 for(const combo of [{...saved.combo,moves:[...saved.combo.moves,...saved.combo.moves]},
   {...saved.combo,moves:[{techniqueId:id,repeat:2}]},{...saved.combo,moves:[{techniqueId:id,chargeLevel:3}]},{...saved.combo,bowState:{guided:'unknown'}},{moves:[{techniqueId:'bow_arc'}]}]){
   w.applyBuildSnapshot({...snapshot,combo});assert.ok(!run().pipeline?.channels?.normal?.metrics?.arcImpactReference);
 }
 assert.equal(el('combo').querySelector('.cmove').value,'bow_arc');assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
});
