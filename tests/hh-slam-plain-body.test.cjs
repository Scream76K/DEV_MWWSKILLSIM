'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('HH Slam exact legacy UI and saved route use only the two ordinary blunt contacts',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://hh-slam.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id),clone=x=>JSON.parse(JSON.stringify(x));
 const lanes=p=>['normal','maximum'].map(ch=>w.consumerDamageMetric({oneHitPipeline:p},ch));
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9, a+' != '+b);
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='hunting-horn').input;
 const apply=(id=552,state={},charmSkills=[])=>{
  w.__build=JSON.stringify({...base,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:charmSkills,slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],huntingHornState:state}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(id));
 };
 const click=(id='hh_slam')=>{
  for(const b of el('combo').querySelectorAll('.del'))b.click();
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),[id]);
  const prev=read('compareStep5Snapshot()'),original=w.calcUserComboDamage;
  let result;
  w.calcUserComboDamage=function(...args){result=original.apply(this,args);return result;};
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  assert.deepEqual(read('compareStep5Snapshot()'),prev);
  return result;
 };
 const save=name=>{el('buildName').value=name;el('saveBuild').click();assert.match(el('buildSaveStatus').textContent,/保存しました/);};
 const choose=name=>{ for(const b of el('compareBuilds').querySelectorAll('input[data-compare-name]')){b.checked=b.dataset.compareName===name;b.dispatchEvent(new w.Event('change',{bubbles:true}));} };
 apply();
 const standardBefore=read('calcState.realOneHit');
 assert.deepEqual(standardBefore.evaluationPlan.techniqueIds,['HH_LEFT_SWING','HH_FORWARD_ATTACK','HH_SELF_IMPROVEMENT_PERFORMANCE','HH_ENCORE_JUST']);
 const result=click(),p=result.pipeline;
 assert.ok(lanes(p).every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(lanes(p)));
 assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),['HH_SLAM']);
 assert.equal(read("TechniqueDBEngine.get('hunting-horn','HH_SLAM').calculationStatus"),'EVIDENCE_GATED');
 assert.match(el('combo').querySelector('.comboMeta').textContent,/本体2ヒット/);
 assert.doesNotMatch(el('combo').querySelector('.comboMeta').textContent,/MV 30/);
 assert.match(el('compareOut').textContent,/響玉・旋律効果なし.*実機未確認/);
 for(const [ch,c] of Object.entries(p.channels)){
  assert.equal(c.execution.status,'complete');
  assert.equal(c.diagnostics.hhPlainSlam.status,'SOURCE_BACKED_PROVISIONAL');
  assert.deepEqual(Array.from(c.execution.executed),['0:0','0:1']);
  const data=c.components;
  assert.deepEqual(data.map(x=>x.id).join(','),'HH_SLAM:physical:0,HH_SLAM:element:0,HH_SLAM:physical:1,HH_SLAM:element:1');
  near(data[2].value,data[0].value*3);near(data[3].value,data[1].value);assert.ok(data[1].value>0);
  assert.ok(data.every(x=>x.status==='available'));
  near(c.metrics.comboTotalDamage.value,data.reduce((a,x)=>a+x.value,0));
 }
 near(result.stages[0].result.total,lanes(p)[0].value);
 t.diagnostic('weapon 552 per hit physical/element: '+p.channels.normal.components.map(x=>x.value).join(' / '));
 save('ordinary');
 el('comboHHEcho').value='ACTIVE';el('comboHHMelody').value='ACTIVE';
 const blocked=click();assert.ok(lanes(blocked.pipeline).every(x=>x.value===null&&x.reason.includes('HH_SLAM:BODY_STATE_UNSUPPORTED')),JSON.stringify(lanes(blocked.pipeline)));
 save('active');
 choose('ordinary');let prior=read('savedBuildMap()');el('runCompare').click();
 assert.deepEqual(read('savedBuildMap()'),prior);
 assert.equal(el('comboHHEcho').value,'ACTIVE');assert.equal(el('comboHHMelody').value,'ACTIVE');
 let row=read('lastBuildComparisonRows[0]');assert.deepEqual(clone(lanes(row.oneHitPipeline)),clone(lanes(p)));
 assert.equal(row.referenceCombo.stages.length,1);near(row.referenceCombo.stages[0].damage,lanes(p)[0].value);
 assert.equal(prior.ordinary.combo.moves[0].techniqueId,'hh_slam');
 el('comboHHEcho').value='NONE';el('comboHHMelody').value='NONE';
 choose('active');el('runCompare').click();row=read('lastBuildComparisonRows[0]');
 assert.ok(lanes(row.oneHitPipeline).every(x=>x.value===null&&x.reason.includes('HH_SLAM:BODY_STATE_UNSUPPORTED')));
 assert.equal(row.referenceCombo.damage,null);assert.deepEqual(read('savedBuildMap()'),prior);
 // Source status alone cannot authorize altered, still-finite contact coefficients.
 const engine=w.TechniqueDBEngine;
 try{
  for(const [field,value] of [['mv',43],['elementModifier',1.1],['partModifier',1.1],['damageType','slash']]){
   w.TechniqueDBEngine={...engine,get(kind,id){const record=engine.get(kind,id);
    return id==='HH_SLAM'&&kind==='hunting-horn'?{...record,hits:[record.hits[0],{...record.hits[1],[field]:value}]}:record;
   }};
   const mutated=lanes(click().pipeline);
   assert.ok(mutated.every(x=>x.value===null&&x.reason.includes('HH_SLAM:BODY_SOURCE_PENDING')),field+': '+JSON.stringify(mutated));
  }
 }finally{w.TechniqueDBEngine=engine;}
 // Imported/future state cannot turn into a plain hit after the public Load.
 const future=clone(prior.ordinary), futureState={echoState:'NONE',melodyState:'NONE',model:'UNKNOWN_MODEL'};
 future.combo.huntingHornState=futureState;
 w.__future=JSON.stringify(future);
 w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),future:JSON.parse(__future)}));renderSavedBuilds()");
 const load=name=>{el('savedBuildSelect').value=name;el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();};
 const beforeFuture=read('savedBuildMap()');choose('future');el('runCompare').click();
 row=read('lastBuildComparisonRows[0]');assert.ok(lanes(row.oneHitPipeline).every(x=>x.value===null));
 for(const b of el('combo').querySelectorAll('.del'))b.click();
 assert.deepEqual(read('App.state.combo.moves'),[]);
 load('future');
 const immediate=lanes(read('calcState.realOneHit'));
 assert.ok(immediate.every(x=>x.value===null&&x.reason?.includes('HH_SLAM:BODY_STATE_UNSUPPORTED')),JSON.stringify(immediate));
 const liveFuture=lanes(click().pipeline);
 assert.ok(liveFuture.every(x=>x.value===null&&x.reason.includes('HH_SLAM:BODY_STATE_UNSUPPORTED')),JSON.stringify(liveFuture));
 assert.deepEqual(read('compareStep5Snapshot().huntingHornState'),futureState);
 assert.equal(el('comboHHResetUnsupported').hidden,false);el('comboHHResetUnsupported').click();
 assert.equal(el('comboHHResetUnsupported').hidden,true);
 near(lanes(click().pipeline)[0].value,lanes(p)[0].value);
 assert.deepEqual(read('compareStep5Snapshot().huntingHornState'),{echoState:'NONE',melodyState:'NONE'});
 assert.deepEqual(read('savedBuildMap()'),beforeFuture);
 load('active');assert.deepEqual(read('compareStep5Snapshot().huntingHornState'),{echoState:'ACTIVE',melodyState:'ACTIVE'});
 assert.equal(el('comboHHResetUnsupported').hidden,true);
 for(const state of [{echoState:'FUTURE',melodyState:'NONE'},{echoState:'NONE',melodyState:'NONE',futureSetting:''},false]){
   apply(552,state);
   assert.deepEqual(read('compareStep5Snapshot().huntingHornState'),state);
   assert.ok(lanes(click().pipeline).every(x=>x.reason.includes('HH_SLAM:BODY_STATE_UNSUPPORTED')));
   assert.equal(el('comboHHResetUnsupported').hidden,false);
 }
 const known={model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['SELF_IMPROVEMENT'],echoBubbles:1,selfImprovementLevel:0,attackMelody:null,attackMelodyLevel:0};
 apply(552,known);
 assert.equal(el('comboHHResetUnsupported').hidden,true);
 assert.equal(el('comboHHEcho').disabled,false);assert.equal(el('comboHHModel').checked,true);
 const knownAfter=read('compareStep5Snapshot().huntingHornState');
 for(const field of ['model','melodies','echoBubbles','selfImprovementLevel'])assert.deepEqual(knownAfter[field],known[field]);
 assert.ok(lanes(click().pipeline).every(x=>x.reason.includes('HH_SLAM:BODY_STATE_UNSUPPORTED')));
 load('ordinary');assert.equal(el('comboHHResetUnsupported').hidden,true);
 const only=[{techniqueId:'hh_slam'}];
 const evaluate=(rows,extras={})=>w.evaluateP0DamageRoute(rows,{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),...extras}});
 for(const extra of [{mounted:true},{dismountAttack:true},{sneakAttack:true},{airborne:true},{mantleState:'CORRUPTED'}]){
   assert.match(evaluate(only,extra).blocked[0].reason,/HH_SLAM:BODY_CONTEXT_UNSUPPORTED/);
 }
 for(const rows of [[...only,...only],[{...only[0],repeat:2}],[{...only[0],count:2}]]){
   assert.equal(evaluate(rows).damage,null);
 }
 assert.equal(evaluate([{techniqueId:'canonical:HH_SLAM_FOLLOWUP'}]).damage,null);
 assert.equal(evaluate([{techniqueId:'hh_melody'}]).damage,null);
 for(const state of [{echoState:'ACTIVE',melodyState:'NONE'},{echoState:'NONE',melodyState:'ACTIVE'},
   {model:'HH_NORMAL_MELODY_PROVISIONAL',echoBubbles:1,selfImprovementLevel:1},{echoState:false}]){
  assert.match(evaluate(only,{huntingHornState:state}).blocked[0].reason,/HH_SLAM:BODY_STATE_UNSUPPORTED/);
 }
 const verifiedOff=evaluate(only,{huntingHornState:{echoState:'NONE',melodyState:'NONE'}});
 near(verifiedOff.damage,lanes(p)[0].value);
 assert.match(evaluate(only,{criticalDrawHits:{maximum:{HH_SLAM:[true,true]}}}).blocked[0].reason,/HH_SLAM:BODY_CONTEXT_UNSUPPORTED/);
 apply();
 const standardAfter=read('calcState.realOneHit');
 assert.deepEqual(clone(lanes(standardAfter)),clone(lanes(standardBefore)));
 assert.deepEqual(standardAfter.evaluationPlan.techniqueIds,standardBefore.evaluationPlan.techniqueIds);
 for(const c of Object.values(standardAfter.channels))assert.equal(c.diagnostics.hhPlainSlam,undefined);
 apply(531,{},[{name:'逆襲',level:3,type:'armor'}]);
 const plainZero=click().pipeline, [n,m]=lanes(plainZero);
 assert.ok(n.value>0&&m.value>n.value,JSON.stringify([n,m]));
 assert.ok(plainZero.channels.normal.components.filter(c=>c.id.includes(':element:')).every(c=>c.value===0));
 t.diagnostic('weapon 531 Counterstrike Lv3 normal/max: '+n.value+' / '+m.value);
 apply(1160);
 const artia=click().pipeline;
 assert.ok(lanes(artia).every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(lanes(artia)));
 assert.ok(artia.channels.normal.components.filter(c=>c.id.includes(':element:')).every(c=>c.value>0));
 t.diagnostic('weapon 1160 Gogma dragon normal/max: '+lanes(artia).map(x=>x.value).join(' / '));
});
