'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('Great Sword Offset Rising Slash III enters via picker and renders its one body hit',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://cb-round-slash.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='great-sword').input;
 const apply=(id=1148,state={},charmSkills=[])=>{
  w.__build=JSON.stringify({...base,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:charmSkills,slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],...state}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(id));
 };
 const click=(id='gs_offset3')=>{
  for(const b of el('combo').querySelectorAll('.del'))b.click();
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),[id]);
  const original=w.calcUserComboDamage;let result;
  w.calcUserComboDamage=function(...args){result=original.apply(this,args);return result;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  return result;
 };
 const save=name=>{el('buildName').value=name;el('saveBuild').click();assert.match(el('buildSaveStatus').textContent,/保存しました/);};
 const load=name=>{el('savedBuildSelect').value=name;el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();};
 const pick=name=>{for(const input of el('compareBuilds').querySelectorAll('input[data-compare-name]')){
  input.checked=input.dataset.compareName===name;input.dispatchEvent(new w.Event('change',{bubbles:true}));
 }};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,actual+' != '+expected);

 apply();
 const standard=read('calcState.realOneHit');
 const result=click(),p=result.pipeline;
 const lanes=(p)=>['normal','maximum'].map(ch=>w.consumerDamageMetric({oneHitPipeline:p},ch));
 assert.ok(lanes(p).every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(lanes(p)));
 assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),['GS_OFFSET_RISING_SLASH_3']);
 assert.match(el('compareOut').textContent,/相殺成立・追撃は含めない.*資料暫定・実機未確認/);
 for(const c of Object.values(p.channels)){
  assert.equal(c.execution.status,'complete');
  assert.deepEqual([c.diagnostics.gsOffsetRisingSlash3.mv,c.diagnostics.gsOffsetRisingSlash3.elementModifier,
     c.diagnostics.gsOffsetRisingSlash3.partModifier,c.diagnostics.gsOffsetRisingSlash3.offsetSuccess], [154,1.3,1.2,'NOT_ASSUMED']);
  assert.equal(c.diagnostics.gsOffsetRisingSlash3.sourceBlob,'f8e63e11ad1b78a5011e28d11362896215c5abc1');
  assert.deepEqual(Array.from(c.execution.executed),['0:0']);
  assert.deepEqual(Array.from(c.components,x=>[x.id,x.status]),[['GS_OFFSET_RISING_SLASH_3:physical:0','available'],['GS_OFFSET_RISING_SLASH_3:element:0','available']]);
 }
 save('ordinary');
 pick('ordinary');el('runCompare').click();
 assert.deepEqual(clone(lanes(read('lastBuildComparisonRows[0].oneHitPipeline'))),clone(lanes(p)));
 const knownSave=read('savedBuildMap().ordinary');
 w.__saved=JSON.stringify({stop:{...knownSave,combo:{...knownSave.combo,greatSwordDrawOpening:'SHEATHED'}},
   count:{...knownSave,combo:{...knownSave.combo,moves:[{techniqueId:'gs_offset3',count:2}]}},
   ...Object.fromEntries([0,'1',1.2].map((repeat,i)=>['repeat'+i,{...knownSave,combo:{...knownSave.combo,moves:[{techniqueId:'gs_offset3',repeat}]}}]))});
 w.eval('localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),...JSON.parse(__saved)})); renderSavedBuilds()');
 const saved=read('savedBuildMap()');
 for(const name of ['repeat0','repeat1','repeat2','count','stop']){
  pick(name);el('runCompare').click();
  assert.ok(lanes(read('lastBuildComparisonRows[0].oneHitPipeline')).every(x=>x.value==null),name);
  load(name);
  const auto=lanes(read('calcState.realOneHit'));
  assert.ok(auto.every(x=>x.value==null),name+': automatic calculation must reject imported conditions');
  assert.deepEqual(lanes(read('currentConsumerCalculation()')),auto);
  const original=w.calcUserComboDamage;let payload;
  w.calcUserComboDamage=function(...args){payload=original.apply(this,args);return payload;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  assert.equal(payload.damage,null,name);
  if(name.startsWith('repeat')){
    const originalValue=saved[name].combo.moves[0].repeat;
    assert.equal(read('App.state.combo.moves[0].repeat'),originalValue);
    pick('ordinary');el('runCompare').click();
    assert.equal(read('App.state.combo.moves[0].repeat'),originalValue);
  }
  el('comboMovePicker').value='gs_offset3';
  const single=w.calcSelectedTechniqueDamage();
  if(name==='stop')assert.equal(single.damage,null,'fresh single must not ignore active SHEATHED opening');
  else assert.ok(single.damage>0,'fresh single must not borrow stored count/repeat: '+name);
 }
 // Both rendered result layers must use saved, not active, opening conditions.
 const savedSubtotal=()=>el('compareOut').querySelector('[data-comparison-metric="reference-combo-damage"] td')?.textContent;
 load('stop');pick('ordinary');el('runCompare').click();
 const ordinaryFromShelved=read('lastBuildComparisonRows[0]');
 assert.deepEqual(clone(lanes(ordinaryFromShelved.oneHitPipeline)),clone(lanes(p)));
 near(ordinaryFromShelved.referenceCombo.damage,result.damage);
 assert.equal(savedSubtotal(),result.damage.toFixed(1));
 assert.equal(w.calcUserComboDamage().damage,null,'keep active SHEATHED state after saved replay');
 load('ordinary');pick('stop');el('runCompare').click();
 const stoppedFromDrawn=read('lastBuildComparisonRows[0]');
 assert.ok(lanes(stoppedFromDrawn.oneHitPipeline).every(x=>x.value===null));
 assert.equal(stoppedFromDrawn.referenceCombo.damage,null);
 assert.equal(savedSubtotal(),'未算出');
 assert.ok(w.calcUserComboDamage().damage>0,'keep active ordinary state after saved replay');
 assert.deepEqual(read('savedBuildMap()'),saved);
 apply(1148,{greatSwordDrawOpening:'SHEATHED'});
 assert.ok(lanes(click().pipeline).every(x=>x.reason==='GS_OFFSET_3:STATE_UNSUPPORTED'));
 apply();
 assert.deepEqual(clone(lanes(read('calcState.realOneHit'))),clone(lanes(standard)));
 apply(1148,{},[{id:103,name:'抜刀術【技】',level:1}]);
 assert.ok(lanes(click().pipeline).every(x=>x.reason==='GS_OFFSET_3:DRAW_SKILL_UNRESOLVED'));
 apply();

 const only=[{techniqueId:'gs_offset3'}];
 const evalRows=(extras={},rows=only)=>w.evaluateP0DamageRoute(rows,{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),...extras}});
 for(const [extras,reason] of [
  [{offsetSuccess:true},'GS_OFFSET_3:STATE_UNSUPPORTED'],
  [{mantleState:'CORRUPTED'},'GS_OFFSET_3:STATE_UNSUPPORTED'],
  [{greatSwordDrawOpening:'SHEATHED'},'GS_OFFSET_3:STATE_UNSUPPORTED'],
  [{criticalDrawHits:{maximum:{GS_OFFSET_RISING_SLASH_3:[true]}}},'GS_OFFSET_3:STATE_UNSUPPORTED'],
  [{mounted:true},'GS_OFFSET_3:SINGLE_GROUNDED_BODY_REQUIRED']]){
   assert.ok(lanes(evalRows(extras).pipeline).every(x=>x.reason===reason));
 }
 for(const move of [{...only[0],count:2},{...only[0],repeat:2},{techniqueId:'canonical:GS_OFFSET_RISING_SLASH_2'},{techniqueId:'canonical:GS_FOLLOWUP_CROSS_SLASH_3'}]){
  assert.equal(evalRows({},[move]).damage,null);
 }
 assert.equal(evalRows({},[...only,{techniqueId:'gs_charge3'}]).damage,null);
 apply(244);
 const cm=click();
 assert.ok(lanes(cm.pipeline).every(x=>x.value>0),JSON.stringify(lanes(cm.pipeline)));
 for(const c of Object.values(cm.pipeline.channels)){
   const effects=c.components.flatMap(x=>Array.from(x.effectsApplied||[],e=>[x.id,e.id]));
   assert.deepEqual(clone(effects.filter(x=>x[1]?.startsWith('gs-charge-master:'))),[['GS_OFFSET_RISING_SLASH_3:element:0','gs-charge-master:GS_OFFSET_RISING_SLASH_3']]);
   assert.equal(c.diagnostics.chargeMasterAdoption.status,'SOURCE_BACKED_PROVISIONAL');
 }
 apply(1148,{},[{id:81,name:'逆襲',level:1}]);
 const counter=click();
 assert.equal(counter.damage,result.damage);
 assert.ok(counter.maximumDamage>counter.damage,JSON.stringify(lanes(counter.pipeline)));
 assert.match(el('compareOut').textContent,/最大側の逆襲は事前発動の想定/);
 const off=evalRows({maximumSkillConditions:{counterstrike:false}});
 assert.equal(off.damage,off.maximumDamage);
 assert.equal(off.maximumDamage,result.maximumDamage);
 save('counter');pick('counter');el('runCompare').click();
 assert.ok(lanes(read('lastBuildComparisonRows[0].oneHitPipeline'))[1].value>counter.damage);
 const counterOff=el('powerCompareDetails')?.querySelector('[data-maximum-skill="counterstrike"]')||w.document.querySelector('[data-maximum-skill="counterstrike"]');
 assert.ok(counterOff);counterOff.checked=false;counterOff.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(counterOff.closest('label').hidden,false);
 el('runCompare').click();
 assert.ok(lanes(read('lastBuildComparisonRows[0].oneHitPipeline')).every(x=>x.value===result.damage));
});
