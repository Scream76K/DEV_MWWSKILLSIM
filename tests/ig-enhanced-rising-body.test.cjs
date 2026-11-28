'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('IG rising: actual custom and saved comparison evaluate exactly 24 + 12 + 24 with three held extracts',t=>{
 const vc=new VirtualConsole(),errors=[];
 vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://ig-rising.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),e=id=>w.document.getElementById(id);
 const base=profiles.find(p=>p.kind==='insect-glaive').input;
 w.__db=JSON.stringify(data);w.__build=JSON.stringify({...base,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
 w.eval('const s=JSON.parse(__db);DB=normalizeDB({...s,weapons:consolidateArtiaFixedVariantRows(s.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(JSON.parse(__build));');
 const standard=read('calcState.realOneHit');
 const shot=()=>{let r;const f=w.calcUserComboDamage;w.calcUserComboDamage=(...a)=>(r=f(...a));try{e('calcUserComboDamage').click();}finally{w.calcUserComboDamage=f;}return r;};
 const metric=(p,ch)=>w.consumerDamageMetric({oneHitPipeline:p},ch);
 const ids=['normal','maximum'];
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' != '+b);
 e('comboMovePicker').value='ig_combo';e('addCombo').click();
 const p=shot().pipeline;
 t.diagnostic(JSON.stringify(ids.map(ch=>metric(p,ch))));
 assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),['IG_ENHANCED_RISING_COMBO']);
 for(const ch of ids){
  const c=p.channels[ch],event=c.diagnostics.igGroundEnhancedRising;
  near(metric(p,ch).value,175.92516);
  assert.equal(event.hitCount,3);assert.equal(event.kinsectDamage,'EXCLUDED');
  assert.deepEqual(Array.from(c.execution.executed),['0:0','0:1','0:2']);
  const [a,b,j,k,x,y]=c.components.map(x=>x.value);
  near(a,j*2);near(x,a);near(k,b);near(y,b);assert.ok(b>0);
  near(c.metrics.comboTotalDamage.value,a+b+j+k+x+y);
 }
 assert.match(e('compareOut').textContent,/本体3ヒットのみ/);
 assert.deepEqual(read('compareStep5Snapshot().insectGlaiveState'),{extractState:null,kinsectState:null});
 e('buildName').value='ordinary';e('saveBuild').click();
 const save=read('savedBuildMap().ordinary');
 assert.deepEqual(save.combo.moves,[{techniqueId:'ig_combo'}]);
 const change={...save,combo:{...save.combo,moves:[{techniqueId:'ig_combo',repeat:'1'}]}};
 const scope={...save,combo:{...save.combo,insectGlaiveState:{extractState:'FUTURE',kinsectState:'STOWED'}}};
 w.__more=JSON.stringify({repeat:change,future:scope});w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),...JSON.parse(__more)}));renderSavedBuilds()");
 const compare=name=>{
  for(const el of w.document.querySelectorAll('[data-compare-name]')){el.checked=el.dataset.compareName===name;el.dispatchEvent(new w.Event('change'));}
  e('runCompare').click();return read('lastBuildComparisonRows[0]');
 };
 const load=name=>{e('savedBuildSelect').value=name;e('savedBuildSelect').dispatchEvent(new w.Event('change'));e('savedBuildLoad').click();};
 e('comboIGExtract').value='NO_EXTRACT';e('comboIGKinsect').value='DEPLOYED';
 const same=compare('ordinary');for(const ch of ids)near(metric(same.oneHitPipeline,ch).value,metric(p,ch).value);
 near(same.referenceCombo.damage,metric(p,'normal').value);
 for(const name of ['repeat','future']){
  const fail=compare(name);assert.ok(ids.every(ch=>metric(fail.oneHitPipeline,ch).value===null));
  load(name);assert.ok(ids.every(ch=>metric(shot().pipeline,ch).value===null));
 }
 assert.deepEqual(read('buildSnapshot().combo.insectGlaiveState'),scope.combo.insectGlaiveState);
 const engine=w.TechniqueDBEngine;
 try{
  w.TechniqueDBEngine={...engine,get(kind,id){
   const t=engine.get(kind,id);
   return id==='IG_ENHANCED_RISING_COMBO'?{...t,hits:[t.hits[0],{...t.hits[1],mv:13},t.hits[2]]}:t;
  }};
  const invalid=w.evaluateP0DamageRoute([{techniqueId:'ig_combo'}],{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),insectGlaiveState:{extractState:'TRIPLE_EXTRACT',kinsectState:'STOWED'}}});
  assert.ok(ids.every(ch=>metric(invalid.pipeline,ch).reason==='IG_ENHANCED_RISING_COMBO:SOURCE_PENDING'));
 }finally{w.TechniqueDBEngine=engine;}
 const mixed=w.evaluateP0DamageRoute([{techniqueId:'ig_combo'},{techniqueId:'ig_slash'}],{currentCustom:true});
 assert.equal(mixed.damage,null);
 w.eval('applyBuildSnapshot(JSON.parse(__build));');
 const restored=read('calcState.realOneHit');assert.deepEqual(restored.evaluationPlan.techniqueIds,standard.evaluationPlan.techniqueIds);
 for(const ch of ids)near(metric(restored,ch).value,metric(standard,ch).value);
});
