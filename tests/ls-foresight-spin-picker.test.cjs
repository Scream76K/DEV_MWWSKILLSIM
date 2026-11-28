'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');

test('explicit red foresight spin calculates two ground contacts and isolates the saved gauge',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://ls-foresight.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id), read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')), id='ls_fade';
 const official=profiles.find(x=>x.kind==='long-sword').input;
 const snapshot={...official,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 const apply=s=>{w.__snap=JSON.stringify(s);w.eval('applyBuildSnapshot(JSON.parse(__snap))');};
 const run=()=>{let computed;const normal=w.calcUserComboDamage;w.calcUserComboDamage=(...args)=>(computed=normal.apply(w,args));try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=normal;}assert.equal(el('compareOut').dataset.resultMode,'current-custom');return computed;};
 const lanes=result=>['normal','maximum'].map(k=>w.consumerDamageMetric({oneHitPipeline:result.pipeline||{reason:result.blocked?.[0]?.reason}},k));
 w.__data=JSON.stringify(data);
 w.eval('const source=JSON.parse(__data);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 apply(snapshot);const standardBefore=read('calcState.realOneHit');assert.equal(read('String(selectedWeapon().id)'),'1172');
 const spin='LS_FORESIGHT_SPIN_SLASH',move='canonical:'+spin;
 const change=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new w.Event('change',{bubbles:true}));};
 const pick=value=>{change('comboMovePicker',value);el('addCombo').click();};
 pick(id);const plain=run().pipeline.channels;el('combo').querySelector('.del').click();
 change('comboMovePicker',move);assert.equal(el('comboMovePicker').selectedOptions[0]?.text,'見切り斬り・旋');pick(move);
 const blocked=()=>assert.ok(lanes(run()).every(x=>x.value===null));
 for(const gauge of ['','NONE','YELLOW']){change('comboLSSpiritGauge',gauge);blocked();}
 change('comboLSSpiritGauge','RED');
 const red=run();assert.ok(red.damage>0,JSON.stringify(red.blocked));
 const verify=pipeline=>{
  assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds),[spin]);
  for(const lane of ['normal','maximum']){
   const parts=pipeline.channels[lane].components;
   const value=(list,key)=>list.find(c=>c.id===key).value;
   for(const [i,mv] of [22,13].entries()){
    assert.ok(Math.abs(value(parts,spin+':physical:'+i)-value(plain[lane].components,'LS_FORESIGHT_SLASH:physical:0')*mv/11*1.1)<1e-8);
    assert.equal(value(parts,spin+':element:'+i),value(plain[lane].components,'LS_FORESIGHT_SLASH:element:0'));
   }
   assert.equal(parts.length,4);
  }
  assert.match(el('compareOut').textContent,/当て身成功時の攻撃ボーナスは含めません/);
 };
 verify(red.pipeline);
 change('customWeaponSpiritGauge','YELLOW');blocked();change('customWeaponSpiritGauge','');
 el('buildName').value='red spin';el('saveBuild').click();
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 change('comboLSSpiritGauge','YELLOW');blocked();
 const check=el('compareBuilds').querySelector('[data-compare-name="red spin"]');check.click();el('runCompare').click();
 verify(read('lastBuildComparisonRows[0].oneHitPipeline'));
 assert.equal(el('comboLSSpiritGauge').value,'YELLOW');
 change('savedBuildSelect','red spin');el('savedBuildLoad').click();verify(run().pipeline);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 const conditions=read('compareStep5Snapshot()'),row={techniqueId:move};
 for(const extra of [{counterSuccess:true},{gaugeTransition:'RED'},{jumpAttack:true},{previousAction:'LS_THRUST'},{longSwordState:{spiritGauge:'WHITE'}}]){
  assert.ok(lanes(w.evaluateP0DamageRoute([row],{currentCustom:true,evaluationConditions:{...conditions,...extra}})).every(x=>x.value===null));
 }
 for(const moves of [[row,row],[{...row,repeat:2}],[{...row,count:2}]]){
  apply({...snapshot,combo:{moves,longSwordState:{spiritGauge:'RED'}}});blocked();
 }
 apply({...snapshot,combo:{moves:[row],longSwordState:{spiritGauge:'RED'}},charmCustom:{...snapshot.charmCustom,skills:[{name:'飛燕',level:1,type:'weapon'}]}});
 assert.equal(read('calcState.total')['飛燕'],1);
 verify(run().pipeline);
 apply(snapshot);const standardAfter=read('calcState.realOneHit');
 assert.deepEqual(standardAfter.evaluationPlan,standardBefore.evaluationPlan);
 assert.deepEqual(lanes({pipeline:standardAfter}),lanes({pipeline:standardBefore}));
 t.diagnostic('RED '+JSON.stringify(lanes(red)));
});
