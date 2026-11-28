'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');

test('explicit legacy Bow and HBG picker IDs use the same damage routes as their exact level equivalents',()=>runParity('ranged'));
test('legacy high-output AED preserves explicit phials and never redirects actual SAED',()=>runParity('cb'));
function runParity(group){
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://legacy-route.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 const actual=(p,ch)=>w.consumerDamageMetric({oneHitPipeline:p},ch);
 const lanes=p=>['normal','maximum'].map(ch=>{const {value,reason}=actual(p,ch);return {value,reason};});
 const apply=(kind,id,combo={})=>{
  const {input}=profiles.find(p=>p.kind===kind);
  w.__build=JSON.stringify({...input,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],...combo}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');
  assert.equal(read('String(selectedWeapon().id)'),String(id));
 };
 const click=(id,expectedId=id)=>{
  for(const button of el('combo').querySelectorAll('.del'))button.click();
  const picker=el('comboMovePicker');
  assert.ok([...picker.options].some(x=>x.value===id&&!x.disabled),id);
  picker.value=id;el('addCombo').click();
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),[expectedId]);
  const before=read('compareStep5Snapshot()');
  const original=w.calcUserComboDamage;
  let result;
  w.calcUserComboDamage=function(...args){result=original.apply(this,args);return result;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  assert.equal(el('compareOut').dataset.resultMode,'current-custom');
  assert.deepEqual(read('compareStep5Snapshot()'),before);
  return {lanes:lanes(result.pipeline),text:el('compareOut').querySelector('[data-custom-damage="total"]').textContent,ids:Array.from(result.pipeline.evaluationPlan.techniqueIds),opening:JSON.parse(JSON.stringify(result.pipeline.evaluationPlan.automaticOpening??[])),stages:Array.from(result.stages,x=>({total:x.result.total,trace:JSON.parse(JSON.stringify(x.result.trace??[]))}))};
 };
 const compare=(legacy,canonical,id)=>{
  const selected=['LEGACY '+id,'CANONICAL '+id];
  for(const b of w.document.querySelectorAll('#compareBuilds input[data-compare-name]')){
   b.checked=selected.includes(b.dataset.compareName);b.dispatchEvent(new w.Event('change',{bubbles:true}));
  }
  const before=read('savedBuildMap()'),live=read('buildSnapshotComparable(buildSnapshot())');
  assert.deepEqual(before[selected[0]].combo.moves.map(x=>x.techniqueId),[legacy]);
  assert.deepEqual(before[selected[1]].combo.moves.map(x=>x.techniqueId),['canonical:'+canonical]);
  el('runCompare').click();
  assert.deepEqual(read('savedBuildMap()'),before);
  assert.deepEqual(read('buildSnapshotComparable(buildSnapshot())'),live);
  const rows=read('lastBuildComparisonRows'), a=rows.find(r=>r.name===selected[0]),b=rows.find(r=>r.name===selected[1]);
  assert.ok(a&&b,el('compareOut').textContent);
  assert.deepEqual(lanes(a.oneHitPipeline),lanes(b.oneHitPipeline));
  assert.deepEqual(a.oneHitPipeline.evaluationPlan.techniqueIds,b.oneHitPipeline.evaluationPlan.techniqueIds);
  assert.ok(Number.isFinite(b.referenceCombo.damage));
  assert.equal(a.referenceCombo.damage,b.referenceCombo.damage);
  assert.deepEqual(a.referenceCombo.stages.map(x=>x.damage),b.referenceCombo.stages.map(x=>x.damage));
  assert.ok(b.referenceCombo.stages.every(x=>Number.isFinite(x.damage)));
  for(const metric of ['power-index','max-power-index']){
   const cells=[...el('compareOut').querySelectorAll('[data-comparison-metric="'+metric+'"] td')].map(x=>x.textContent);
   assert.equal(cells.length,2);
   assert.equal(cells[0],cells[1]); assert.notEqual(cells[0],'未算出');
  }
 };
 try{
  assert.equal(el('comboMovePicker').disabled,true);
  el('calcUserComboDamage').click();
  assert.match(el('compareOut').textContent,/武器を選択してください/);
  w.__dbText=JSON.stringify(data);
  w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const save=name=>{el('buildName').value=name;el('saveBuild').click();assert.match(el('buildSaveStatus').textContent,/保存しました/);};
  if(group==='cb'){
   const state={mode:'AXE',previousAction:'CB_ELEMENT_DISCHARGE_2',phialType:'IMPACT',normalPhials:5,enhancedPhials:0,enhancedPhial:false,axeBoosted:true,shieldBoosted:true,swordBoosted:false};
   apply('charge-blade',1142,{chargeBladeState:state});
   const expected=click('canonical:CB_AED');
   assert.ok(expected.lanes.every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(expected));
   save('CANONICAL 1142');
   assert.deepEqual(click('cb_saed'),expected);
   save('LEGACY 1142');
   assert.deepEqual(read('savedBuildMap()["LEGACY 1142"].combo.chargeBladeState'),read('comboCBStoredState()'));
   assert.deepEqual(click('canonical:CB_SAED').ids,['CB_SAED']);
   // A blank editor opening cannot overwrite the saved phials/axe state.
   apply('charge-blade',1142);
   compare('cb_saed','CB_AED',1142);
   const blank=click('canonical:CB_AED');
   assert.ok(blank.lanes.every(x=>x.value===null&&x.reason.includes('EXPLICIT_AXE_REQUIRED')),JSON.stringify(blank));
   assert.deepEqual(click('cb_saed'),blank);
   assert.deepEqual(errors,[]);
   return;
  }
  for(const [kind,id,legacy,canonical] of [['bow',1139,'bow_shot','BOW_SHOT_3'],['heavy-bowgun',517,'hbg_normal3','HBG_NORMAL_AMMO_3']]){
   apply(kind,id);
   const canonicalId='canonical:'+canonical, expected=click(canonicalId);
   const expectedDamage=id===1139?113.67288:128.4894;
   assert.ok(expected.lanes.every(x=>Math.abs(x.value-expectedDamage)<1e-8),JSON.stringify(expected));
   save('CANONICAL '+id);
   assert.deepEqual(click(legacy),expected);
   save('LEGACY '+id);
   compare(legacy,canonical,id);
  }
  apply('heavy-bowgun',1157);
  const unavailable=click('canonical:HBG_NORMAL_AMMO_3');
  assert.ok(unavailable.lanes.every(x=>x.value===null&&x.reason&&!x.reason.includes('TECHNIQUE_NOT_FOUND')));
  assert.deepEqual(click('hbg_normal3'),unavailable);
  apply('bow',17,{moves:[{techniqueId:'bow_spread'}]});
  const current=()=>lanes(w.calcUserComboDamage().pipeline);
  const blocked=values=>assert.ok(values.every(x=>x.value===null&&x.reason.includes('TECHNIQUE_NOT_FOUND')));
  const select=()=>el('combo').querySelector('.cmove');
  const level=()=>el('combo').querySelector('[data-bow-charge-level]');
  const change=(control,value)=>{control.value=value;control.dispatchEvent(new w.Event('change',{bubbles:true}));};
  blocked(current());save('旧剛射');
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  el('savedBuildSelect').value='旧剛射';el('savedBuildLoad').click();
  assert.equal(select().value,'bow_spread');assert.equal(level().disabled,true);blocked(current());
  for(const box of el('compareBuilds').querySelectorAll('[data-compare-name]'))box.checked=box.dataset.compareName==='旧剛射';
  el('runCompare').click();
  blocked(lanes(w.eval('lastBuildComparisonRows[0].oneHitPipeline')));
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  save('旧剛射の再保存');
  assert.deepEqual(read('savedBuildMap()["旧剛射の再保存"].combo.moves'),[{techniqueId:'bow_spread'}]);
  const base='canonical:BOW_POWER_SHOT_3',expected=click(base);
  assert.deepEqual(click('bow_spread',base),expected);
  assert.equal(level().value,'3');assert.equal(level().parentElement.hidden,false);
  for(const n of [3,1,2]){
   change(level(),String(n));
   const id='canonical:BOW_POWER_SHOT_'+n,values=current();
   assert.equal(select().value,id);assert.ok(values.every(x=>x.value>0),JSON.stringify(values));
   const name='剛射'+n;save(name);
   assert.equal(read('savedBuildMap()')[name].combo.moves[0].techniqueId,id);
   el('savedBuildSelect').value=name;el('savedBuildLoad').click();
   assert.equal(level().value,String(n));assert.deepEqual(current(),values);
   for(const box of el('compareBuilds').querySelectorAll('[data-compare-name]'))box.checked=box.dataset.compareName===name;
   el('runCompare').click();assert.deepEqual(lanes(w.eval('lastBuildComparisonRows[0].oneHitPipeline')),values);
  }
  assert.deepEqual(read('savedBuildMap()["旧剛射"]'),JSON.parse(bytes)['旧剛射']);
  change(select(),'bow_spread');assert.equal(select().value,base);assert.equal(level().value,'3');
  assert.deepEqual(errors,[]);
 }finally{w.close();}
}
