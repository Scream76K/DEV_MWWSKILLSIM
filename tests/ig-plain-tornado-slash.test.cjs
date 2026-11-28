'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('IG Tornado Slash exact UI choice evaluates two personal grounded hits with already-held extracts and kinsect stowed',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://ig-tornado.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='insect-glaive').input;
 const apply=(state={},charmSkills=[])=>{
  w.__build=JSON.stringify({...base,armor:{},decos:{},charmCustom:{skills:charmSkills,slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],insectGlaiveState:state}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(base.weaponId));
 };
 const click=(id='ig_slash')=>{
  for(const b of el('combo').querySelectorAll('.del'))b.click();
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),[id]);
  const original=w.calcUserComboDamage;let result;
  w.calcUserComboDamage=function(...args){result=original.apply(this,args);return result;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  return result;
 };
 const lanes=p=>['normal','maximum'].map(ch=>w.consumerDamageMetric({oneHitPipeline:p},ch));
 const save=name=>{el('buildName').value=name;el('saveBuild').click();assert.match(el('buildSaveStatus').textContent,/保存しました/);};
 const load=name=>{el('savedBuildSelect').value=name;el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();};
 const pick=name=>{for(const x of el('compareBuilds').querySelectorAll('input[data-compare-name]')){x.checked=x.dataset.compareName===name;x.dispatchEvent(new w.Event('change',{bubbles:true}));}};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' != '+b);
 const form=()=>read('compareStep5Snapshot().insectGlaiveState');
 apply();
 const standard=read('calcState.realOneHit');
 const result=click(),p=result.pipeline;
 assert.ok(lanes(p).every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(lanes(p)));
 assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),['IG_TORNADO_SLASH']);
 assert.equal(result.stages.length,1);
 assert.equal(result.stages[0].result.total,result.damage);
 assert.match(el('compareOut').textContent,/本体2ヒットのみ.*三色エキス取得済み・猟虫収納.*派生前の技.*実機未確認/);
 assert.deepEqual(form(),{extractState:null,kinsectState:null});
 assert.equal(read("TechniqueDBEngine.get('insect-glaive','IG_TORNADO_SLASH').calculationStatus"),'EVIDENCE_GATED');
 for(const c of Object.values(p.channels)){
  assert.equal(c.execution.status,'complete');
  const v=c.diagnostics.igGroundTornado;
  assert.equal(v.sourceBlob,'724f6275209cdd5d6dddf1bf48ee687147fde4ce');
  assert.deepEqual(Array.from(v.contacts,x=>[x.sourceId,x.mv]),[[22,22],[23,48]]);
  assert.equal(v.precedingAction,'NOT_INCLUDED');assert.equal(v.extractMutation,'NONE');assert.equal(v.kinsectDamage,'EXCLUDED');
  const [first,e,second,f]=c.components.map(x=>x.value);
  near(second,first*48/22);near(f,e);assert.ok(e>0);
  near(c.metrics.comboTotalDamage.value,first+e+second+f);
  assert.deepEqual(Array.from(c.execution.executed),['0:0','0:1']);
  assert.deepEqual(Array.from(c.components,x=>[x.id,x.status]),[['IG_TORNADO_SLASH:physical:0','available'],['IG_TORNADO_SLASH:element:0','available'],['IG_TORNADO_SLASH:physical:1','available'],['IG_TORNADO_SLASH:element:1','available']]);
 }
 const only=[{techniqueId:'ig_slash'}];
 const outcome=(extra={},rows=only)=>w.evaluateP0DamageRoute(rows,{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),...extra}});
 const reasons=r=>lanes(r.pipeline).map(x=>x.reason);
 for(const insectGlaiveState of [{extractState:'NO_EXTRACT'},{extractState:'UNKNOWN'},{kinsectState:'DEPLOYED'},{kinsectState:'OTHER'},false,{kinsectBoost:true}]){
  assert.ok(reasons(outcome({insectGlaiveState})).every(x=>x==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'));
 }
 for(const flags of [{mounted:true},{jumpAttack:true},{drawAttack:true},{mantleState:'CORRUPTED'},{kinsectAssist:true},{extractPickup:true},{previousAction:'SWEEP'},{chargeLevel:0},
       {criticalDrawHits:{maximum:{IG_TORNADO_SLASH:[true,false]}}}]){
  assert.ok(reasons(outcome(flags)).every(x=>x==='IG_TORNADO_SLASH:CONTEXT_UNSUPPORTED'));
 }
 for(const rows of [[...only,...only],[{...only[0],repeat:2}],[{...only[0],count:2}],[...only,{techniqueId:'ig_combo'}]]){
  assert.equal(outcome({},rows).damage,null);
 }
 const engine=w.TechniqueDBEngine;
 try{
  for(const mutate of [r=>({...r,partModifier:.7}),r=>({...r,elementModifier:1.1}),r=>({...r,contacts:[r.contacts[0],{...r.contacts[1],mv:46}]})]){
   w.TechniqueDBEngine={...engine,get(kind,id){const x=engine.get(kind,id);return id==='IG_TORNADO_SLASH'?{...x,groundTornadoReference:mutate(x.groundTornadoReference)}:x;}};
   assert.ok(reasons(click()).every(x=>x==='IG_TORNADO_SLASH:SOURCE_PENDING'));
  }
 }finally{w.TechniqueDBEngine=engine;}
 save('ordinary');
 el('comboIGExtract').value='NO_EXTRACT';el('comboIGKinsect').value='DEPLOYED';
 assert.ok(reasons(click()).every(x=>x==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'));
 save('bad');
 const future={extractState:'TRIPLE_EXTRACT',kinsectState:'STOWED',kinsectAssist:true};
 w.__future=JSON.stringify({...read('savedBuildMap().ordinary'),combo:{...read('savedBuildMap().ordinary.combo'),insectGlaiveState:future}});
 w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),future:JSON.parse(__future)}));renderSavedBuilds()");
 const prior=read('savedBuildMap()');
 pick('ordinary');el('runCompare').click();
 let row=read('lastBuildComparisonRows[0]');
 assert.deepEqual(clone(lanes(row.oneHitPipeline)),clone(lanes(p)));
 near(row.referenceCombo.stages[0].damage,result.damage);
 assert.deepEqual(form(),{extractState:'NO_EXTRACT',kinsectState:'DEPLOYED'});
 for(const name of ['bad','future']){
  pick(name);el('runCompare').click();
  row=read('lastBuildComparisonRows[0]');
  assert.ok(lanes(row.oneHitPipeline).every(x=>x.reason==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'));
  assert.equal(row.referenceCombo.damage,null);
 }
 load('future');
 const loaded=lanes(read('calcState.realOneHit'));
 assert.ok(loaded.every(x=>x.reason==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'),JSON.stringify(loaded));
 assert.deepEqual(lanes(read('currentConsumerCalculation()')),loaded);
 assert.ok(reasons(click()).every(x=>x==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'));
 assert.deepEqual(read('buildSnapshot().combo.insectGlaiveState'),future);
 el('comboIGKinsect').dispatchEvent(new w.Event('change'));
 assert.ok(reasons(click()).every(x=>x==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'));
 assert.equal(el('comboIGTornadoReset').hidden,false);el('comboIGTornadoReset').click();
 near(click().damage,result.damage);
 assert.deepEqual(read('savedBuildMap()'),prior);
 apply({extractState:'FUTURE',kinsectState:'STOWED'});
 pick('ordinary');el('runCompare').click();
 el('comboMovePicker').value='ig_slash';assert.equal(w.calcSelectedTechniqueDamage().damage,null);
 assert.ok(reasons(click()).every(x=>x==='IG_TORNADO_SLASH:STATE_UNSUPPORTED'));
 apply();
 const last=read('calcState.realOneHit');
 assert.deepEqual(last.evaluationPlan.techniqueIds,standard.evaluationPlan.techniqueIds);
 assert.deepEqual(clone(lanes(last)),clone(lanes(standard)));
 assert.ok(Object.values(last.channels).every(x=>!x.diagnostics.igGroundTornado));
 const [baseP,baseE,,]=p.channels.normal.components.map(x=>x.value);
 const stats=read('calcState.stats'),wpr=read('realPipelineWeapon(selectedWeapon())'),hitzone=read('selectedPart().multipliers');
 const phys=wpr.sharpness.purple>0?1.39:1.32,eln=wpr.sharpness.purple>0?1.25:1.15;
 near(baseP,stats.attackComponents.weaponBase*1.15*.22*hitzone.slash*phys*(1+stats.affinity*.0025));
 near(baseE,stats.element/10*hitzone[stats.elementType]*eln);
 // A named restore may not turn an unsupported repeat alias into a
 // seemingly single valid motion, including the pre-DOM auto evaluation.
 for(const fields of [{count:2},{repeat:2},{count:'1'},{repeat:'1'},{count:1,repeat:2}]){
  const repeated={techniqueId:'ig_slash',...fields};
  w.__repeated=JSON.stringify({...prior.ordinary,combo:{...prior.ordinary.combo,moves:[repeated]}});
  w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),repeated:JSON.parse(__repeated)}));renderSavedBuilds()");
  const archive=read('savedBuildMap()');
  pick('repeated');el('runCompare').click();
  assert.ok(lanes(read('lastBuildComparisonRows[0].oneHitPipeline')).every(x=>x.value===null));
  load('repeated');
  const automatic=lanes(read('calcState.realOneHit'));
  assert.ok(automatic.every(x=>x.value===null&&x.reason==='IG_TORNADO_SLASH:SINGLE_GROUND_REQUIRED'),JSON.stringify(fields)+': '+JSON.stringify(automatic));
  assert.deepEqual(lanes(read('currentConsumerCalculation()')),automatic);
  el('calcUserComboDamage').click();
  assert.match(el('compareOut').textContent,/未算出/);
  assert.deepEqual(read('buildSnapshot().combo.moves'),[repeated]);
  assert.deepEqual(read('savedBuildMap()'),archive);
  assert.match(el('combo').querySelector('.comboMeta').textContent,/削除して追加し直し/);
  near(click().damage,result.damage); // explicit removal and fresh Add
  assert.deepEqual(read('savedBuildMap()'),archive);
 }
 apply({},[{name:'逆襲',level:3,type:'armor'}]);
 const [normal,max]=lanes(click().pipeline);
 assert.ok(max.value>normal.value&&normal.value>0,JSON.stringify([normal,max]));
 t.diagnostic('Gogma '+String(base.weaponId)+' Dragon '+p.channels.normal.components.map(x=>x.value).join(' / ')+' Counterstrike '+normal.value+' / '+max.value);
});
