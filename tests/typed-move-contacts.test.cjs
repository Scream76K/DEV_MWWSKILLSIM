'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

const cases=[
 ['sword-and-shield','SNS_FALLING_BASH','sns_falling',[52,47]],
 ['switch-axe','SA_AXE_POWER_SLAM','sa_heavy',[15,72]],
 ['dual-blades','DB_DEMON_ADVANCING_SLASH','db_flurry',[5,5,4,4,11,11]]
];
for(const [kind,id,legacy,mvs] of cases)test(id+' current and saved contact sequence',t=>{
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
  const shield=kind==='sword-and-shield',axe=kind==='switch-axe',picker=el('comboMovePicker');
  const state=axe?{switchAxeState:{mode:'AXE',awakened:false,axeBoosted:true}}:shield?{}:{dualBladesState:{demonMode:true,requiresDemonGauge:false}};
  const apply=(moves,skills=[],opening=state)=>w.applyBuildSnapshot({...snapshot,combo:{moves,...opening},charmCustom:{...snapshot.charmCustom,skills}});
  const standard=()=>w.eval('JSON.stringify([calcState.realOneHit.evaluationPlan.techniqueIds,...Object.values(calcState.realOneHit.channels).map(c=>c.metrics.comboTotalDamage.value)])');
  const baseline=standard();
  apply([]);change(picker,legacy);assert.equal(picker.value,legacy);el('addCombo').click();
  const run=()=>{
    const orig=w.calcUserComboDamage;let result;
    w.calcUserComboDamage=(...args)=>(result=orig(...args));
    try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=orig;}
    return result;
  };
  const parts=pipeline=>{
    assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds),[id]);
    return ['normal','maximum'].map(lane=>{
      const c=pipeline.channels[lane];assert.equal(c.execution.status,'complete');
      const values=kind=>Array.from(c.components).filter(x=>x.id.includes(':'+kind+':')).map(x=>x.value);
      const p=values('physical'),e=values('element');
      assert.equal(p.length,mvs.length);assert.ok(p.every(x=>x>0));
      if(shield)assert.ok(e.every(x=>x===0));else assert.ok(e.length===mvs.length&&e.every(x=>x>0));
      return {p,e};
    });
  };
  const original=run();assert.ok(original.damage>0,JSON.stringify(original.blocked));
  const base=parts(original.pipeline);
  for(const {p,e} of base){
    mvs.forEach((mv,i)=>assert.ok(Math.abs(p[i]/p[0]-mv/mvs[0])<1e-9));
    if(axe)assert.equal(e[0],e[1]);
    else if(!shield)[.6,.6,.6,.6,1,1].forEach((v,i)=>assert.ok(Math.abs(e[i]/e[0]-v/.6)<1e-9));
  }
  el('buildName').value='legacy';el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');assert.equal(w.savedBuildMap().legacy.combo.moves[0].techniqueId,legacy);
  const row={techniqueId:legacy};
  apply([{techniqueId:'canonical:'+id}]);assert.deepEqual(parts(run().pipeline),base);
  apply([row],[{name:'飛燕',level:1,type:'weapon'}]);
  const flight=run();const active=parts(flight.pipeline);
  if(axe)assert.match(el('compareOut').textContent,/未反映.*飛燕/);
  for(const [lane,{p,e}] of active.entries()){
    assert.deepEqual(e,base[lane].e);
    p.forEach((v,i)=>assert.ok(Math.abs(v-base[lane].p[i]*(shield&&i===0?1.1:1))<1e-8));
  }
  apply([row],[{name:'チャージマスター',level:3,type:'weapon'}]);
  assert.deepEqual(parts(run().pipeline),base);
  for(const moves of [[row,row],[{...row,repeat:2}],[{...row,count:2}]]){
    apply(moves);assert.equal(run().damage,null);
  }
  if(axe){
    for(const opening of [{mode:'AXE',awakened:false},{mode:'AXE',awakened:false,axeBoosted:false},{mode:'SWORD',awakened:false,axeBoosted:true}]){
      apply([row],[],{switchAxeState:opening});assert.equal(run().damage,null);
    }
  }else if(!shield){
    for(const extra of [{demonMode:false},{demonMode:true,archdemonMode:true},{demonMode:true,demonBoost:true}]){
      apply([row],[],{dualBladesState:extra});assert.equal(run().damage,null);
    }
  }
  el('compareBuilds').querySelector('[data-compare-name="legacy"]').click();el('runCompare').click();
  const result=w.eval('lastBuildComparisonRows[0]');
  assert.deepEqual(parts(result.oneHitPipeline),base);assert.equal(result.referenceCombo.damage,original.damage);
  change(el('savedBuildSelect'),'legacy');el('savedBuildLoad').click();assert.equal(el('combo').querySelector('.cmove').value,legacy);
  assert.deepEqual(parts(run().pipeline),base);assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
  t.diagnostic(JSON.stringify(base));
  if(kind==='dual-blades'){
    apply([],[],{});
    const add=id=>{change(picker,id);assert.equal(picker.value,id);el('addCombo').click();};
    add('db_dance1');change(el('comboDBDemonMode'),'ARCHDEMON');
    const first=run();assert.ok(first.damage>0,JSON.stringify(first.blocked));
    el('buildName').value='flurry-I';el('saveBuild').click();
    add('db_dance2');const pair=run();assert.ok(pair.damage>first.damage,JSON.stringify(pair.blocked));
    for(const ch of ['normal','maximum']){
      const c=pair.pipeline.channels[ch].components;
      const phys=Array.from(c).filter(v=>v.id.includes(':physical:')).map(v=>v.value);
      const elem=Array.from(c).filter(v=>v.id.includes(':element:')).map(v=>v.value);
      assert.equal(phys.length,8);assert.equal(elem.length,8);assert.ok(elem[0]>0);
      [15,15,15,15,6,8,18,18].forEach((mv,i)=>assert.ok(Math.abs(phys[i]-phys[0]*mv/15)<1e-8));
      [1,1,1,1,.6,.6,1,1].forEach((em,i)=>assert.ok(Math.abs(elem[i]-elem[0]*em)<1e-8));
    }
    el('buildName').value='flurry';el('saveBuild').click();
    const savedBytes=w.eval('storageGet(BUILDS_KEY)');
    assert.deepEqual(Array.from(w.savedBuildMap().flurry.combo.moves,r=>r.techniqueId),['db_dance1','db_dance2']);
    change(el('comboDBDemonMode'),'1');assert.equal(run().damage,null);
    for(const b of el('compareBuilds').querySelectorAll('input[data-compare-name]'))if(b.checked!==['flurry','flurry-I'].includes(b.dataset.compareName))b.click();
    el('runCompare').click();
    const rows=w.eval('lastBuildComparisonRows');
    assert.equal(rows.length,2);
    for(const saved of rows){
      const result=saved.name==='flurry-I'?first:pair;
      for(const ch of ['normal','maximum'])assert.equal(w.consumerDamageMetric(saved,ch).value,result.pipeline.channels[ch].metrics.comboTotalDamage.value);
      assert.equal(saved.referenceCombo.damage,result.damage);
    }
    assert.equal(w.eval('storageGet(BUILDS_KEY)'),savedBytes);
    const arch={dualBladesState:{archdemonMode:true,demonMode:false,requiresDemonGauge:true}};
    const both=[{techniqueId:'db_dance1'},{techniqueId:'db_dance2'}];
    apply(both,[{name:'飛燕',level:1,type:'weapon'}],arch);
    assert.equal(run().damage,pair.damage);
    for(const field of [{requiresDemonGauge:false},{demonBoost:true},{archdemonMode:'true'}]){
      apply(both,[],{dualBladesState:{...arch.dualBladesState,...field}});assert.equal(run().damage,null);
    }
    for(const moves of [[{techniqueId:'db_dance2'}],[{techniqueId:'db_dance1',repeat:2}],[{techniqueId:'db_dance3'}]]){
      apply(moves,[],arch);assert.equal(run().damage,null);
    }
    w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
    t.diagnostic('flurry I '+first.damage+' / '+first.maximumDamage+'; I+II '+pair.damage+' / '+pair.maximumDamage);
  }
});
