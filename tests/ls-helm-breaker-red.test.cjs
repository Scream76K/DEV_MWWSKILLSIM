'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');

test('explicit red helm breaker applies spent yellow to seven contacts and isolates saved gauge',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://ls-helm.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id), read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')), id='ls_fade';
 const official=profiles.find(x=>x.kind==='long-sword').input;
 const snapshot={...official,weaponId:'841',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 const apply=s=>{w.__snap=JSON.stringify(s);w.eval('applyBuildSnapshot(JSON.parse(__snap))');};
 const run=()=>{let computed;const normal=w.calcUserComboDamage;w.calcUserComboDamage=(...args)=>(computed=normal.apply(w,args));try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=normal;}assert.equal(el('compareOut').dataset.resultMode,'current-custom');return computed;};
 const lanes=result=>['normal','maximum'].map(k=>w.consumerDamageMetric({oneHitPipeline:result.pipeline||{reason:result.blocked?.[0]?.reason}},k));
 const synthetic=structuredClone(data);
 const weapon=synthetic.weapons.find(x=>x.id===841);
 Object.assign(weapon,{damage:{raw:250,display:825},affinity:0,skills:[],sharpness:{red:100,orange:50,yellow:50,green:50,blue:40,white:50,purple:0}});
 w.__data=JSON.stringify(synthetic);
 w.eval('const source=JSON.parse(__data);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 apply(snapshot);const standardBefore=read('calcState.realOneHit');assert.equal(read('String(selectedWeapon().id)'),'841');
 const helm='LS_HELM_BREAKER_RED',move='ls_helm';
 const change=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new w.Event('change',{bubbles:true}));};
 const pick=value=>{change('comboMovePicker',value);el('addCombo').click();};
 pick(id);const plain=run().pipeline.channels;el('combo').querySelector('.del').click();
 change('comboMovePicker',move);assert.equal(el('comboMovePicker').selectedOptions[0]?.text,'兜割（赤）');pick(move);
 const blocked=()=>assert.ok(lanes(run()).every(x=>x.value===null));
 for(const gauge of ['NONE','YELLOW']){change('comboLSSpiritGauge',gauge);blocked();}
 change('comboLSSpiritGauge','');
 const automatic=run();
 assert.equal(el('comboLSSpiritGauge').value,'');
 assert.match(el('compareOut').textContent,/自動設定：赤ゲージ/);
 change('comboLSSpiritGauge','RED');
 const red=run();assert.ok(red.damage>0,JSON.stringify(red.blocked));
 const verify=(pipeline,flight=1,elementScale=1)=>{
  assert.deepEqual(Array.from(pipeline.evaluationPlan.techniqueIds),[helm]);
  for(const lane of ['normal','maximum']){
   const parts=pipeline.channels[lane].components;
   const value=(list,key)=>list.find(c=>c.id===key).value;
   for(const [i,mv] of Array(7).fill(23).entries()){
    assert.ok(Math.abs(value(parts,helm+':physical:'+i)-65.274*flight)<1e-8,String(value(parts,helm+':physical:'+i)));
    assert.ok(Math.abs(value(parts,helm+':physical:'+i)-value(plain[lane].components,'LS_FORESIGHT_SLASH:physical:0')*mv/11*1.075*flight)<1e-8);
    assert.ok(Math.abs(value(parts,helm+':element:'+i)-value(plain[lane].components,'LS_FORESIGHT_SLASH:element:0')*(i<6?.2:1)*elementScale)<1e-8);
   }
   assert.equal(parts.length,14);
  }

 };
 verify(red.pipeline);
 assert.deepEqual(lanes(automatic),lanes(red));
 for(const lane of ['normal','maximum'])
  assert.deepEqual(automatic.pipeline.channels[lane].components,red.pipeline.channels[lane].components);
 const training=w.trainingRoomMonster;
 w.trainingRoomMonster=()=>{const target=training();target.parts[0].multipliers.thunder/=2;return target;};
 verify(run().pipeline,1,.5);w.trainingRoomMonster=training;
 change('customWeaponSpiritGauge','YELLOW');blocked();change('customWeaponSpiritGauge','');
 el('buildName').value='red helm';el('saveBuild').click();
 const bytes=w.eval('storageGet(BUILDS_KEY)');assert.equal(w.savedBuildMap()['red helm'].combo.moves[0].techniqueId,move);
 change('comboLSSpiritGauge','YELLOW');blocked();
 const check=el('compareBuilds').querySelector('[data-compare-name="red helm"]');check.click();el('runCompare').click();
 verify(read('lastBuildComparisonRows[0].oneHitPipeline'));
 assert.equal(el('comboLSSpiritGauge').value,'YELLOW');
 change('savedBuildSelect','red helm');el('savedBuildLoad').click();verify(run().pipeline);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 const conditions=read('compareStep5Snapshot()'),row={techniqueId:move};
 apply({...snapshot,combo:{moves:[{techniqueId:'canonical:'+helm}],longSwordState:{spiritGauge:'RED'}}});verify(run().pipeline);
 apply({...snapshot,combo:{moves:[row],longSwordState:{spiritGauge:'UNKNOWN'}}});blocked();
 for(const extra of [{counterSuccess:true},{gaugeTransition:'RED'},{jumpAttack:true},{previousAction:'LS_THRUST'},{longSwordState:{spiritGauge:'WHITE'}}]){
  assert.ok(lanes(w.evaluateP0DamageRoute([row],{currentCustom:true,evaluationConditions:{...conditions,...extra}})).every(x=>x.value===null));
 }
 for(const moves of [[row,row],[{...row,repeat:2}],[{...row,count:2}]]){
  apply({...snapshot,combo:{moves,longSwordState:{spiritGauge:'RED'}}});blocked();
 }
 apply({...snapshot,combo:{moves:[row],longSwordState:{spiritGauge:'RED'}},charmCustom:{...snapshot.charmCustom,skills:[{name:'飛燕',level:1,type:'weapon'}]}});
 assert.equal(read('calcState.total')['飛燕'],1);
 verify(run().pipeline,1.1);
 apply(snapshot);const standardAfter=read('calcState.realOneHit');
 assert.deepEqual(standardAfter.evaluationPlan,standardBefore.evaluationPlan);
 assert.deepEqual(lanes({pipeline:standardAfter}),lanes({pipeline:standardBefore}));
 t.diagnostic('RED '+JSON.stringify(lanes(red)));
});
