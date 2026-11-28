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
  const w = new JSDOM(readSimulatorHtml(), {url:'https://body-contact.invalid/', runScripts:'dangerously', virtualConsole,
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

for(const [id,mvs] of [
 ['CB_AXE_TO_SWORD_MORPH',[30]],['CB_SHIELD_THRUST',[15,6]],['IG_ENHANCED_SWEEP',[12,24]]
])test(id+' single ordinary contacts in current and named comparisons',t=>{
  const ig=id.startsWith('IG_'),morph=id==='CB_AXE_TO_SWORD_MORPH';
  const {w,el,change,snapshot,standard}=setup(t,ig?'insect-glaive':'charge-blade',ig?'1163':'1142');
  const baseline=standard(),move='canonical:'+id;
  const state=ig?{insectGlaiveState:{extractState:'TRIPLE_EXTRACT',kinsectState:'STOWED'}}:
    {chargeBladeState:{mode:morph?'AXE':'SWORD',swordBoosted:false,shieldBoosted:false,axeBoosted:false,enhancedPhial:false}};
  const apply=(moves,settings=state)=>w.applyBuildSnapshot(w.JSON.parse(JSON.stringify({...snapshot,combo:{moves,...settings}})));
  const run=()=>{
    let result;const original=w.calcUserComboDamage;
    w.calcUserComboDamage=(...args)=>(result=original(...args));
    try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
    return result;
  };
  apply([]);change(el('comboMovePicker'),move);
  assert.equal(el('comboMovePicker').value,move);el('addCombo').click();
  const r=run();assert.ok(r.damage>0,JSON.stringify(r.blocked));
  function verify(pipeline){
    assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds),[id]);
    return ['normal','maximum'].map(lane=>{
      const c=pipeline.channels[lane];assert.equal(c.execution.status,'complete');
      assert.equal(c.components.length,2*mvs.length);
      const values=type=>Array.from(c.components).filter(k=>k.id.includes(':'+type+':')).map(k=>k.value);
      const p=values('physical'),e=values('element');
      for(const [i,mv] of mvs.entries()){
        assert.ok(p[i]>0&&Math.abs(p[i]/p[0]-mv/mvs[0])<1e-8);
        assert.ok(e[i]>0&&e[i]===e[0]);
      }
      return c.metrics.comboTotalDamage.value;
    });
  }
  const totals=verify(r.pipeline);
  for(const value of totals)assert.ok(Math.abs(value-({CB_AXE_TO_SWORD_MORPH:76.7592,CB_SHIELD_THRUST:67.18644,IG_ENHANCED_SWEEP:107.100696}[id]))<1e-8);t.diagnostic(JSON.stringify(totals));
  el('buildName').value=id;el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  const wrong=ig?{insectGlaiveState:{extractState:'NO_EXTRACT',kinsectState:'STOWED'}}:
    {chargeBladeState:{...state.chargeBladeState,shieldBoosted:true}};
  apply([{techniqueId:move}],wrong);assert.equal(run().damage,null);
  el('compareBuilds').querySelector('[data-compare-name="'+id+'"]').click();el('runCompare').click();
  assert.ok(w.eval('lastBuildComparisonRows'),el('compareOut').textContent);
  const saved=w.eval('lastBuildComparisonRows[0]');assert.deepEqual(verify(saved.oneHitPipeline),totals);
  assert.equal(saved.referenceCombo.damage,r.damage);assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  for(const moves of [[{techniqueId:move,repeat:2}],[{techniqueId:move},{techniqueId:move}]]){
    apply(moves);assert.equal(run().damage,null);
  }
  if(!ig){
    apply([{techniqueId:'cb_axe'}]);assert.equal(run().damage,null);
    apply([{techniqueId:move}],{chargeBladeState:{...state.chargeBladeState,futureFlag:true}});assert.equal(run().damage,null);
  }else{
    apply([{techniqueId:move}],{insectGlaiveState:{extractState:'TRIPLE_EXTRACT',kinsectState:'DEPLOYED'}});assert.equal(run().damage,null);
  }
  const skill=ig?'飛燕':'高速変形';
  const skilled={...snapshot,combo:{moves:[{techniqueId:move}],...state},
    charmCustom:{...snapshot.charmCustom,skills:[{name:skill,level:ig?1:3,type:'weapon'}]}};
  w.applyBuildSnapshot(w.JSON.parse(JSON.stringify(skilled)));
  const assisted=run();assert.ok(assisted.damage>0,JSON.stringify(assisted.blocked));
  for(const lane of ['normal','maximum']){
    const parts=assisted.pipeline.channels[lane].components,base=r.pipeline.channels[lane].components;
    parts.forEach((v,i)=>assert.ok(Math.abs(v.value-base[i].value*(morph&&v.id.includes(':physical:')?1.2:1))<1e-8));
  }
  w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
});
