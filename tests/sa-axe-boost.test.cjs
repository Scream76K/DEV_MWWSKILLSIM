'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs'),fixture=require('./fixtures/charge24-sa-input.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');
test('preactivated axe boost changes only the axe body component across both channels and saves explicitly',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://sa-axe.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__data=data;
 w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const snap=structuredClone(fixture);
 snap.charmCustom.skills=[{name:'攻撃',level:5,type:'weapon'}];
 snap.combo={moves:[],switchAxeState:{mode:'SWORD',awakened:false}};
 w.applyBuildSnapshot(snap);w.calcBuild();
 const standard=read('calcState.realOneHit');
 const ids=['SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'];
 for(const id of ids)w.addCombo('canonical:'+id);
 const api=w.MHWRealOneHitBrowserAdapter;let captured;
 w.MHWRealOneHitBrowserAdapter={...api,evaluateCurrent(x){captured=x;return api.evaluateCurrent(x);}};
 const calc=()=>{
  let result;const original=w.calcUserComboDamage;
  w.calcUserComboDamage=(...args)=>(result=original.apply(w,args));
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  return result.pipeline;
 };
 const base=calc();
 assert.equal(base.channels?.normal?.execution.status,'complete',JSON.stringify(base));
 const input=captured;
 function evaluate(axeBoosted,awakened){
  const state={mode:'SWORD',awakened,...(axeBoosted===undefined?{}:{axeBoosted})};
  return api.evaluateCurrent({...input,switchAxeState:state,conditions:{...input.conditions,switchAxeState:state}});
 }
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' != '+b);
 for(const awakened of [false,true]){
  const off=evaluate(false,awakened),on=evaluate(true,awakened);
  for(const ch of ['normal','maximum']){
   const a=off.channels?.[ch],b=on.channels?.[ch];assert.equal(a?.execution.status,'complete',JSON.stringify(off));assert.equal(b?.execution.status,'complete',JSON.stringify(on));
   assert.deepEqual(b.execution.executed,a.execution.executed);
   assert.equal(b.components.length,a.components.length);
   const id='SA_SWORD_MORPH_DOUBLE:physical:1';
   const attackEffect=b.components.find(c=>c.id===id)?.effectsApplied||[];
   assert.ok(attackEffect.some(e=>e.id==='attack-boost-multiply'));
   assert.ok(attackEffect.findIndex(e=>e.id==='attack-boost-multiply')<attackEffect.findIndex(e=>e.id==='sa-preactivated-axe-raw'));

   assert.ok(a.components.some(c=>c.id===id));
   for(const [i,c] of Array.from(b.components).entries()){
    assert.equal(c.id,a.components[i].id);
    if(c.id===id)close(c.value-a.components[i].value,10*.60*1.32*.8*.975);
    else assert.equal(c.value,a.components[i].value,c.id);
   }
  }
 }
 assert.deepEqual(evaluate(undefined,false).channels,evaluate(false,false).channels);
 assert.deepEqual(api.evaluateCurrent({...input,conditions:{...input.conditions,standardEvaluation:true,switchAxeState:{...input.switchAxeState,axeBoosted:true}},switchAxeState:{...input.switchAxeState,axeBoosted:true}}).channels,
  api.evaluateCurrent({...input,conditions:{...input.conditions,standardEvaluation:true}}).channels);
 for(const invalid of ['ON',null,1])assert.match(JSON.stringify(evaluate(invalid,false)),/SA_AXE_BOOST:STATE_INVALID/);
 assert.equal(api.evaluateCurrent({...input,switchAxeState:{...input.switchAxeState,axeBoosted:true},conditions:{...input.conditions,switchAxeState:{...input.switchAxeState,axeBoosted:false}}}).reason,'SA_AXE_BOOST:STATE_INVALID');
 const control=el('comboSAAxeBoosted');assert.ok(control);
 function select(e,v){e.value=v;e.dispatchEvent(new w.Event('change',{bubbles:true}));}
 select(control,'1');assert.equal(calc().channels.normal.diagnostics.saAxeBoost.attackAdd,10);
 el('buildName').value='axe-on';el('saveBuild').click();
 select(control,'0');assert.deepEqual(calc().channels,base.channels);
 const named=read('savedBuildMap()');assert.equal(named['axe-on'].combo.switchAxeState.axeBoosted,true);
 const old=structuredClone(named['axe-on']);delete old.combo.switchAxeState.axeBoosted;
 w.__saved={...named,old};w.eval('storageSet(BUILDS_KEY,JSON.stringify(__saved));renderSavedBuilds()');
 w.document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(e=>e.checked=true);
 w.runBuildCompare();
 const rows=read('lastBuildComparisonRows');
 assert.equal(rows.find(r=>r.name==='axe-on').oneHitPipeline.channels.normal.diagnostics.saAxeBoost.attackAdd,10);
 assert.equal(rows.find(r=>r.name==='old').oneHitPipeline.channels.normal.diagnostics.saAxeBoost,undefined);
 select(el('savedBuildSelect'),'axe-on');el('savedBuildLoad').click();assert.equal(control.value,'1');
 const bad=structuredClone(named['axe-on']);bad.combo.switchAxeState.axeBoosted='ON';w.applyBuildSnapshot(bad);
 assert.equal(read('buildSnapshot().combo.switchAxeState.axeBoosted'),'ON');
 assert.match(JSON.stringify(calc()),/SA_AXE_BOOST:STATE_INVALID/);
 snap.combo.switchAxeState.axeBoosted=true;w.applyBuildSnapshot(snap);
 assert.deepEqual(read('calcState.realOneHit').channels,standard.channels);
 close((205*1.04+9+10)*.45*1.32*.8,110.34144);
});
