'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');

test('plain long-sword foresight slash without a successful counter calculates one colorless cut while preserving saved identity and explicit condition gates',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://ls-foresight.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id), read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')), id='ls_fade',tag='canonical:LS_SPIRIT_THRUST';
 const official=profiles.find(x=>x.kind==='long-sword').input;
 const snapshot={...official,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 const apply=s=>{w.__snap=JSON.stringify(s);w.eval('applyBuildSnapshot(JSON.parse(__snap))');};
 const run=()=>{let computed;const normal=w.calcUserComboDamage;w.calcUserComboDamage=(...args)=>(computed=normal.apply(w,args));try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=normal;}assert.equal(el('compareOut').dataset.resultMode,'current-custom');return computed;};
 const lanes=result=>['normal','maximum'].map(k=>w.consumerDamageMetric({oneHitPipeline:result.pipeline||{reason:result.blocked?.[0]?.reason}},k));
 w.__data=JSON.stringify(data);
 w.eval('const source=JSON.parse(__data);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 apply(snapshot);const standardBefore=read('calcState.realOneHit');assert.equal(read('String(selectedWeapon().id)'),'1172');
 assert.equal(el('comboLSSpiritGauge').value,'');
 el('comboMovePicker').value=id;assert.equal(el('comboMovePicker').selectedOptions[0].text,'見切り斬り');el('addCombo').click();
 assert.deepEqual(read('App.state.combo.moves'),[{techniqueId:id}]);
 const defaultGauge=read('compareStep5Snapshot().longSwordState'),calc=run();
 t.diagnostic('default ordinary foresight slash '+JSON.stringify(lanes(calc)));
 assert.ok(lanes(calc).every(x=>Math.abs(x.value-34.70004)<1e-8));
 assert.ok(lanes(calc).every(x=>x.value>0),JSON.stringify(lanes(calc)));
 assert.deepEqual(Array.from(calc.pipeline.evaluationPlan.techniqueIds),['LS_FORESIGHT_SLASH']);
 assert.deepEqual(read('compareStep5Snapshot().longSwordState'),defaultGauge);
 assert.equal(calc.stages.length,1);assert.equal(calc.stages[0].result.total,lanes(calc)[0].value);
 assert.ok(calc.pipeline.channels.normal.components.every(x=>x.techniqueId==='LS_FORESIGHT_SLASH'&&x.eventId==='0:0'));
 assert.ok(calc.pipeline.channels.normal.components.some(x=>x.id==='LS_FORESIGHT_SLASH:physical:0'&&x.value>0));
 assert.ok(calc.pipeline.channels.normal.components.some(x=>x.id==='LS_FORESIGHT_SLASH:element:0'&&x.value>0));
 assert.match(el('compareOut').querySelector('[data-used-combo]').textContent,/通常：見切り斬り最大：見切り斬り/);
 assert.match(el('compareOut').querySelector('[data-ls-foresight-provisional]').textContent,/練気色なし.*当て身成功なし.*派生前の技は含めない.*資料暫定・実機未確認/);
 
 for(const lane of ['normal','maximum']){
  const p=calc.pipeline.channels[lane], src=p.diagnostics.lsGroundForesightSlash;
  assert.equal(src.sourceBlob,'1e28405b6098b31ca08929bd28f2a0a1e444ac9f');
  assert.equal(src.sourceRowId,24);assert.equal(src.sourceTable,'Wp03_Attack');
  assert.equal(src.precedingAction,'NOT_INCLUDED');assert.equal(src.followUp,'NOT_INCLUDED');assert.equal(src.counterSuccess,false);
  assert.equal(p.components.filter(x=>x.id==='LS_FORESIGHT_SLASH:physical:0').length,1);
  assert.deepEqual(Array.from(p.execution.executed),['0:0']);
 }
 el('buildName').value='plain ls';el('saveBuild').click();
 const saved=read('savedBuildMap()');assert.deepEqual(saved['plain ls'].combo.moves,[{techniqueId:id}]);
 const change=value=>{el('comboLSSpiritGauge').value=value;el('comboLSSpiritGauge').dispatchEvent(new w.Event('change',{bubbles:true}));};
 change('RED');assert.ok(lanes(run()).every(x=>x.value===null&&x.reason.includes('LS_FORESIGHT_SLASH:GAUGE')));
 const matchSaved=()=>{const check=el('compareBuilds').querySelector('[data-compare-name="plain ls"]');check.checked=true;check.dispatchEvent(new w.Event('change',{bubbles:true}));el('runCompare').click();return read('lastBuildComparisonRows[0]');};
 const compared=matchSaved();assert.deepEqual(lanes({pipeline:compared.oneHitPipeline}),lanes(calc));
 assert.equal(compared.referenceCombo.damage,calc.damage);
 assert.equal(el('comboLSSpiritGauge').value,'RED');assert.deepEqual(read('savedBuildMap()'),saved);
 const gaugeReason='LS_FORESIGHT_SLASH:GAUGE_NOT_ADOPTED';
 const gaugeText='通常の見切り斬りは練気色なしの場合のみ算出します。';
 for(const gauge of ['YELLOW','RED','NONE']){
  change(gauge);
  const result=lanes(run());
  if(gauge==='NONE')assert.deepEqual(result,lanes(calc));
  else{
   assert.ok(result.every(x=>x.value===null&&x.reason===gaugeReason));
   const notes=el('compareOut').querySelector('details[data-comparison-notes]');
   assert.ok(notes&&!notes.open);
   const why=[...notes.querySelectorAll('[data-comparison-note]')].find(x=>x.textContent.includes(gaugeText));
   assert.equal(why.querySelector('strong').textContent,'（通常・最大）');
   assert.equal(why.querySelector('p').textContent,gaugeText);
  }
  el('buildName').value=gauge;el('saveBuild').click();
  assert.deepEqual(read('savedBuildMap()')[gauge].combo.longSwordState,{spiritGauge:gauge});
 }
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 for(const [colored,colorless] of [['RED','plain ls'],['YELLOW','NONE']]){
  for(const check of el('compareBuilds').querySelectorAll('[data-compare-name]')){
   check.checked=[colored,colorless].includes(check.dataset.compareName);
   check.dispatchEvent(new w.Event('change',{bubbles:true}));
  }
  el('runCompare').click();
  const rows=read('lastBuildComparisonRows');
  assert.deepEqual(rows.map(row=>row.name).sort(),[colored,colorless].sort());
  for(const row of rows){
   const values=lanes({pipeline:row.oneHitPipeline});
   if(row.name===colored){
    assert.ok(values.every(x=>x.value===null&&x.reason===gaugeReason));
    const details=el('compareOut').querySelector('[data-comparison-pending]');
    const why=[...details.querySelectorAll('[data-comparison-note]')].find(x=>x.textContent.includes(gaugeText));
    assert.equal(why.querySelector('strong').textContent,row.name+'（通常・最大）');
    assert.equal(why.querySelector('p').textContent,gaugeText);
   }else assert.deepEqual(values,lanes(calc));
  }
 }
 assert.equal(el('comboLSSpiritGauge').value,'NONE');
 const redPicker=el('savedBuildSelect');redPicker.value='RED';redPicker.dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
 assert.equal(el('comboLSSpiritGauge').value,'RED');
 assert.ok(lanes(run()).every(x=>x.value===null&&x.reason===gaugeReason));
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 change('NONE');
 const rejectedSaved=JSON.parse(JSON.stringify(saved));
 rejectedSaved['plain ls'].combo.longSwordState={spiritGauge:'NONE'};
 rejectedSaved['plain ls'].combo.explicitAffinityState={criticalDrawHits:{maximum:{LS_FORESIGHT_SLASH:[true]}}};
 w.__changed=JSON.stringify(rejectedSaved);w.eval('storageSet(BUILDS_KEY,__changed);renderSavedBuilds()');
 assert.ok(lanes({pipeline:matchSaved().oneHitPipeline}).every(x=>x.value===null&&x.reason?.includes('LS_FORESIGHT_SLASH:INPUT_STATE')));
 assert.deepEqual(read('savedBuildMap()'),rejectedSaved);
 assert.deepEqual(lanes(run()),lanes(calc));
 const blocks=(moves,conditions,reason)=>{
  const r=w.evaluateP0DamageRoute(moves,{currentCustom:true,evaluationConditions:conditions});
  assert.ok(lanes(r).every(x=>x.value===null&&x.reason?.includes(reason)),JSON.stringify(lanes(r)));
 };
 const c=read('compareStep5Snapshot()'), moves=[{techniqueId:id}];
 blocks(moves,{...c,longSwordState:{spiritGauge:'UNKNOWN'}},'LS_FORESIGHT_SLASH:GAUGE');
 blocks(moves,{...c,spiritGauge:'RED'},'LS_FORESIGHT_SLASH:GAUGE');
 blocks(moves,{...c,mounted:true},'LS_FORESIGHT_SLASH:SINGLE_GROUND');
 blocks(moves,{...c,previousAction:'SPIRIT_THRUST'},'LS_FORESIGHT_SLASH:INPUT_STATE');
 blocks(moves,{...c,criticalDrawHits:{maximum:{LS_FORESIGHT_SLASH:[true]}}},'LS_FORESIGHT_SLASH:INPUT_STATE');
 blocks([...moves,...moves],c,'LS_FORESIGHT_SLASH:SINGLE_GROUND');
 blocks([{techniqueId:'ls_base2'},...moves],c,'SINGLE_GROUND');
 blocks(moves,{...c,mantleState:'CORRUPTED'},'LS_FORESIGHT_SLASH:INPUT_STATE');
 blocks(moves,{...c,drawAttack:true},'LS_FORESIGHT_SLASH:INPUT_STATE');
 for (const flags of [{counterSuccess:true},{parrySuccess:true},{foresightCounterSuccess:true},{spiritGaugeAmount:40}])
  blocks(moves,{...c,...flags},'LS_FORESIGHT_SLASH:INPUT_STATE');
 blocks(moves,{...c,longSwordState:{spiritGauge:'NONE',counterSuccess:true}},'LS_FORESIGHT_SLASH:INPUT_STATE');
 const redSpin=w.evaluateP0DamageRoute([{techniqueId:'canonical:LS_RED_SPIN_SLASH'}],{currentCustom:true,evaluationConditions:c});
 assert.ok(lanes(redSpin).every(x=>x.value===null));
 assert.notEqual(redSpin.pipeline.evaluationPlan?.techniqueIds?.[0],'LS_FORESIGHT_SLASH');
 const thrust=w.evaluateP0DamageRoute([{techniqueId:'ls_base2'}],{currentCustom:true,evaluationConditions:c});
 assert.ok(lanes(thrust).every((x,i)=>x.value>lanes(calc)[i].value));assert.deepEqual(Array.from(thrust.pipeline.evaluationPlan.techniqueIds),['LS_THRUST']);
 assert.ok(thrust.pipeline.channels.normal.diagnostics.lsGroundThrust);
 assert.equal(thrust.pipeline.channels.normal.diagnostics.lsGroundForesightSlash,undefined);
 blocks([{techniqueId:id,repeat:2}],c,'LS_FORESIGHT_SLASH:SINGLE_GROUND');
 const spirit=w.evaluateP0DamageRoute([{techniqueId:tag}],{currentCustom:true,evaluationConditions:c});
 assert.deepEqual(Array.from(spirit.pipeline.evaluationPlan.techniqueIds),['LS_SPIRIT_THRUST']);
 assert.ok(lanes(spirit).every(x=>x.value===null));
 const future=JSON.parse(JSON.stringify(saved));
 future['plain ls'].combo.longSwordState={spiritGauge:'WHITE'};
 w.__changed=JSON.stringify(future);w.eval('storageSet(BUILDS_KEY,__changed);renderSavedBuilds()');
 assert.ok(lanes({pipeline:matchSaved().oneHitPipeline}).every(x=>x.value===null&&x.reason?.includes('LS_FORESIGHT_SLASH:GAUGE')));
 for(const b of el('combo').querySelectorAll('.del'))b.click();
 assert.deepEqual(read('App.state.combo.moves'),[]);
 const savedPicker=el('savedBuildSelect');savedPicker.value='plain ls';savedPicker.dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
 const immediate=lanes({pipeline:read('calcState.realOneHit')});
 assert.ok(immediate.every(x=>x.value===null&&x.reason?.includes('LS_FORESIGHT_SLASH:GAUGE')),JSON.stringify(immediate));
 assert.deepEqual(lanes({pipeline:read('currentConsumerCalculation()')}),immediate);
 assert.ok(lanes(run()).every(x=>x.value===null&&x.reason?.includes('LS_FORESIGHT_SLASH:GAUGE')));
 assert.deepEqual(read('buildSnapshot().combo.longSwordState'),{spiritGauge:'WHITE'});
 assert.deepEqual(read('savedBuildMap()'),future);
 change('NONE');assert.deepEqual(lanes(run()),lanes(calc));
 assert.deepEqual(read('savedBuildMap()'),future);

 for(const malformed of [{count:2},{repeat:0},{repeat:'1'}]){
  const old={...saved['plain ls'],combo:{...saved['plain ls'].combo,moves:[{techniqueId:id,...malformed}]}};
  w.__bad=JSON.stringify(old);w.eval("storageSet(BUILDS_KEY,JSON.stringify({...savedBuildMap(),broken:JSON.parse(__bad)}));renderSavedBuilds()");
  const picker=el('savedBuildSelect');picker.value='broken';picker.dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
  assert.deepEqual(read('App.state.combo.moves'),old.combo.moves);
  assert.ok(lanes({pipeline:read('calcState.realOneHit')}).every(x=>x.value===null));
  assert.ok(lanes(run()).every(x=>x.value===null));
 }
 apply(snapshot);
 const standardAfter=read('calcState.realOneHit');
 assert.deepEqual(standardAfter.evaluationPlan.techniqueIds,standardBefore.evaluationPlan.techniqueIds);
 assert.deepEqual(lanes({pipeline:standardAfter}),lanes({pipeline:standardBefore}));
 const exact=w.TechniqueDBEngine;
 try{
  w.TechniqueDBEngine={...exact,get(kind,key){
   const raw=exact.get(kind,key);
   return kind==='long-sword'&&key==='LS_FORESIGHT_SLASH'?{...raw,hits:[{...raw.hits[0],mv:12}]}:raw;
  }};
  blocks(moves,c,'LS_FORESIGHT_SLASH:SOURCE');
 }finally{w.TechniqueDBEngine=exact;}
});
