'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
const names=['off','on'];
test('actual saved ID160 comparison records completed per-channel shot order without changing numeric results',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://used-combo-adapter.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const labels=x=>JSON.parse(JSON.stringify(w.MHWRealOneHitBrowserAdapter.usedComboSteps(x)));
 const clone=x=>JSON.parse(JSON.stringify(x)),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 const load=(kind,on=false)=>{
  const b=clone(profiles.find(x=>x.kind===kind).input);
  const input={...b,armor:{},selectedHp:'FULL_HP',charmCustom:{skills:on?[{name:'刃鱗増装',level:1,type:'weapon'}]:[],slots:[0,0,0],weaponSlots:[]}};
  w.applyBuildSnapshot(input);el('calcBuild').click();
 };
 try {
  w.__pack=data;w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  for(const name of names){load('light-bowgun',name==='on');el('buildName').value=name;el('saveBuild').click();}
  for(const x of w.document.querySelectorAll('#compareBuilds input[data-compare-name]'))x.checked=true;
  const saved=read('savedBuildMap()');el('runCompare').click();
  assert.deepEqual(read('savedBuildMap()'),saved);
  const rows=Object.fromEntries(w.eval('lastBuildComparisonRows').map(r=>[r.name,r.oneHitPipeline.channels]));
  for(const name of names)for(const ch of ['normal','maximum']){
   const row=rows[name][ch],enhanced=name==='on'&&ch==='maximum';
   assert.equal(row.execution.status,'complete');
   assert.ok(Math.abs(row.metrics.comboTotalDamage.value-(enhanced?866.10342:698.4705))<1e-8);
   assert.deepEqual(labels(row),[enhanced?'通常弾 Lv2・刃鱗増装で強化された速射3回 → 通常の速射2回（計25ヒット）':'通常弾 Lv2・速射5回（25ヒット）']);
  }
  // A contradictory contact in one enhanced trigger must not produce a
  // verified label, while numeric evaluation and the normal label survive.
  const normalReference=w.BowgunNormalReference;
  try {
   w.BowgunNormalReference={...normalReference,rapidHit(options,engine){
    const r=normalReference.rapidHit(options,engine);
    if(options.bladescaleLoadingActive&&options.sequenceOrdinal===2&&options.hitIndex===2){
     r.trace[0].bladescale={...r.trace[0].bladescale,segment:'ORDINARY'};
    }
    return r;
   }};
   el('runCompare').click();
   const bad=w.eval('lastBuildComparisonRows').find(r=>r.name==='on').oneHitPipeline.channels;
   assert.equal(bad.maximum.execution.status,'complete');
   assert.equal(bad.maximum.metrics.comboTotalDamage.value,rows.on.maximum.metrics.comboTotalDamage.value);
   assert.equal(labels(bad.maximum),null);
   assert.deepEqual(labels(bad.normal),labels(rows.on.normal));
  }finally{w.BowgunNormalReference=normalReference;}
  load('heavy-bowgun');
  const hbg=w.eval('calcState.realOneHit');
  for(const ch of ['normal','maximum'])assert.deepEqual(labels(hbg.channels[ch]),['通常弾 Lv2・単発射撃10回（30ヒット）']);
  for(const blade of [false,true]){
   load('heavy-bowgun',blade);
   el('buildName').value=blade?'heavy on':'heavy off';el('saveBuild').click();
  }
  for(const x of w.document.querySelectorAll('#compareBuilds input[data-compare-name]'))x.checked=x.dataset.compareName.startsWith('heavy ');
  const heavySaved=read('savedBuildMap()');el('runCompare').click();assert.deepEqual(read('savedBuildMap()'),heavySaved);
  const heavyRows=Object.fromEntries(w.eval('lastBuildComparisonRows').map(r=>[r.name,r.oneHitPipeline.channels]));
  for(const blade of [false,true])for(const ch of ['normal','maximum']){
   const row=heavyRows[blade?'heavy on':'heavy off'][ch],enhanced=blade&&ch==='maximum';
   assert.equal(row.execution.status,'complete');
   assert.ok(Math.abs(row.metrics.comboTotalDamage.value-215*.238*.8*.975*30*(enhanced?1.12:1))<1e-8);
   assert.deepEqual(labels(row),[enhanced?'通常弾 Lv2・刃鱗増装で強化された単発射撃3回 → 通常の単発射撃7回（計30ヒット）':'通常弾 Lv2・単発射撃10回（30ヒット）']);
  }
  load('charge-blade');
  const cb=w.eval('calcState.realOneHit');
  assert.equal(cb.scope,'CB_INDEPENDENT_R_H_SUM');
  for(const ch of ['normal','maximum'])for(const route of ['R','H']){
   const row=cb.routes[route].channels[ch];
   assert.equal(row.execution.status,'complete');
   assert.ok(labels(row).length);
   assert.ok(labels(row).every(s=>/[ぁ-龯]/u.test(s)));
  }
  assert.notDeepEqual(labels(cb.routes.R.channels.normal),labels(cb.routes.H.channels.normal));
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
