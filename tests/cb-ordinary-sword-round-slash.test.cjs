'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
for(const [name,pickerId,canon,reason,diagnostic,reference,mv] of [
 ['回転斬り','cb_spin','CB_SWORD_ROUND_SLASH','CB_ROUND_SLASH','cbPlainSwordRoundSlash','plainSwordRoundSlashReference',.30],
 ['牽制斬り','cb_check','CB_SWORD_WEAK_SLASH','CB_WEAK_SLASH','cbPlainSwordWeakSlash','plainSwordWeakSlashReference',.15]
])test('ordinary CB '+name+' enters via picker and renders its one body hit',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://cb-round-slash.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='charge-blade').input;
 const apply=(id=1142,state={},charmSkills=[])=>{
  w.__build=JSON.stringify({...base,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:charmSkills,slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],chargeBladeState:state}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(id));
 };
 const click=(id=pickerId)=>{
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
 assert.equal(standard.scope,'CB_INDEPENDENT_R_H_SUM');
 assert.ok(standard.routes.R&&standard.routes.H);
 const formBefore=read('compareStep5Snapshot().chargeBladeState');
 const result=click(),p=result.pipeline;
 const lanes=p=>['normal','maximum'].map(ch=>w.consumerDamageMetric({oneHitPipeline:p},ch));
 assert.ok(lanes(p).every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(lanes(p)));
 assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),[canon]);
 assert.equal(result.stages.length,1);
 assert.equal(result.stages[0].result.total,result.damage);
 assert.match(el('compareOut').textContent,/本体1ヒット.*派生前の動作.*資料暫定/);
 assert.equal(el('comboCBRoundSlashReset').hidden,true);
 assert.deepEqual(read('compareStep5Snapshot().chargeBladeState'),formBefore);
 assert.equal(read("TechniqueDBEngine.get('charge-blade',"+JSON.stringify(canon)+").calculationStatus"),'EVIDENCE_GATED');
 for(const c of Object.values(p.channels)){
  assert.equal(c.execution.status,'complete');
  assert.equal(c.diagnostics[diagnostic].sourceBlob,'4be361d994c1c517b2ac209808047ddbe76a4c85');
  assert.equal(c.diagnostics[diagnostic].phialHitCount,0);
  assert.equal(c.diagnostics[diagnostic].partModifier,1);
  near(c.metrics.comboTotalDamage.value,c.components.reduce((a,x)=>a+x.value,0));
  assert.deepEqual(Array.from(c.execution.executed),['0:0']);
  assert.deepEqual(Array.from(c.components,x=>[x.id,x.status]),[[canon+':physical:0','available'],[canon+':element:0','available']]);
 }
 const only=[{techniqueId:pickerId}];
 const outcome=(extras={},rows=only)=>w.evaluateP0DamageRoute(rows,{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),...extras}});
 const reasons=(result)=>lanes(result.pipeline).map(x=>x.reason);
 for(const state of [{mode:'AXE'},{swordBoosted:true},{shieldBoosted:true},{axeBoosted:true},{enhancedPhial:true},{enhancedPhials:1},
     {previousAction:'CHARGE'},{previousAction:'GUARD'},{phialType:'POWER_ELEMENT'},{mixMode:'R_H_INDEPENDENT'},{mode:'FUTURE'},false]){
   assert.ok(reasons(outcome({chargeBladeState:state})).every(x=>x===reason+':STATE_UNSUPPORTED'),JSON.stringify([state,reasons(outcome({chargeBladeState:state}))]));
 }
 assert.ok(reasons(outcome({shieldBoosted:true})).every(x=>x===reason+':STATE_UNSUPPORTED'));
 for(const state of [{mounted:true},{mantleState:'CORRUPTED'},{drawAttack:true},{jumpAttack:true},{sneakAttack:true},
   {criticalDrawHits:{maximum:{[canon]:[true]}}}]){
  assert.ok(reasons(outcome(state)).every(x=>x===reason+':CONTEXT_UNSUPPORTED'),JSON.stringify(state));
 }
 assert.equal(outcome({},[...only,...only]).damage,null);
 assert.equal(outcome({},[{...only[0],repeat:2}]).damage,null);
 assert.equal(outcome({},[{...only[0],count:2}]).damage,null);
 assert.equal(outcome({},[{techniqueId:'canonical:CB_SHIELD_CHARGE_ROUND_SLASH'}]).damage,null);
 assert.equal(outcome({},[{techniqueId:'canonical:CB_WALL_SPIN_SLASH'}]).damage,null);

 near(outcome({chargeBladeState:{mode:'SWORD',phialType:'IMPACT',normalPhials:5,enhancedPhials:0}}).damage,result.damage);
 const engine=w.TechniqueDBEngine;
 try{
  for(const mutate of [
   r=>({...r,hits:[{...r.hits[0],mv:31}]}),
   r=>({...r,hits:[{...r.hits[0],elementModifier:1.1}]}),
   r=>({...r,[reference]:{...r[reference],partModifier:2}}),
   r=>({...r,phialReference:{status:'OBSERVED',hitCount:1}})]){
   w.TechniqueDBEngine={...engine,get(kind,id){const r=engine.get(kind,id);return kind==='charge-blade'&&id===canon?mutate(r):r;}};
   assert.ok(reasons(click()).every(x=>x===reason+':SOURCE_PENDING'));
  }
 }finally{w.TechniqueDBEngine=engine;}
 save('ordinary');
 assert.deepEqual(read('savedBuildMap().ordinary.combo.moves'),[{techniqueId:pickerId}]);
 el('comboCBSword').value='1';const boost=click();assert.ok(reasons(boost).every(x=>x===reason+':STATE_UNSUPPORTED'));
 save('boost');
 const futureState={mode:'FUTURE',swordBoosted:false,shieldBoosted:false,axeBoosted:false,enhancedPhial:false,futurePhialContext:''};
 w.__future=JSON.stringify({...read('savedBuildMap().ordinary'),combo:{...read('savedBuildMap().ordinary.combo'),chargeBladeState:futureState}});
 w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),future:JSON.parse(__future)}));renderSavedBuilds()");
 const saved=read('savedBuildMap()');
 pick('ordinary');el('runCompare').click();
 let row=read('lastBuildComparisonRows[0]');
 assert.deepEqual(clone(lanes(row.oneHitPipeline)),clone(lanes(p)));
 assert.equal(row.referenceCombo.stages.length,1);near(row.referenceCombo.stages[0].damage,result.damage);
 assert.equal(el('comboCBSword').value,'1');
 assert.deepEqual(read('savedBuildMap()'),saved);
 el('comboCBSword').value='0';
 for(const name of ['boost','future']){
  pick(name);el('runCompare').click();row=read('lastBuildComparisonRows[0]');
  assert.ok(lanes(row.oneHitPipeline).every(x=>x.reason===reason+':STATE_UNSUPPORTED'));assert.equal(row.referenceCombo.damage,null);
 }
 assert.deepEqual(read('savedBuildMap()'),saved);
 for(const b of el('combo').querySelectorAll('.del'))b.click();
 assert.deepEqual(read('App.state.combo.moves'),[]);
 load('future');
 const immediate=reasons({pipeline:read('calcState.realOneHit')});
 assert.ok(immediate.every(x=>x===reason+':STATE_UNSUPPORTED'),JSON.stringify(immediate));
 assert.deepEqual(reasons({pipeline:read('currentConsumerCalculation()')}),immediate);
 assert.ok(reasons(click()).every(x=>x===reason+':STATE_UNSUPPORTED'));
 assert.deepEqual(read('compareStep5Snapshot().chargeBladeState'),futureState);
 assert.equal(el('comboCBRoundSlashReset').hidden,false);el('comboCBRoundSlashReset').click();
 near(click().damage,result.damage);
 assert.equal(el('comboCBRoundSlashReset').hidden,true);
 assert.deepEqual(read('savedBuildMap()'),saved);
 apply();
 apply(1142,futureState);
 assert.equal(el('comboCBRoundSlashReset').hidden,true);
 pick('ordinary');el('runCompare').click();
 assert.ok(lanes(read('lastBuildComparisonRows[0].oneHitPipeline')).every(x=>x.value>0));
 assert.equal(el('comboCBRoundSlashReset').hidden,true);
 click('cb_saed');assert.equal(el('comboCBRoundSlashReset').hidden,true);
 el('comboMovePicker').value=pickerId;
 assert.equal(w.calcSelectedTechniqueDamage().damage,null);
 assert.ok(reasons(click()).every(x=>x===reason+':STATE_UNSUPPORTED'));
 assert.equal(el('comboCBRoundSlashReset').hidden,false);
 apply();
 if(pickerId==='cb_check'){
  for(const malformed of [{count:2},{repeat:0},{repeat:'1'}]){
   const snapshot={...saved.ordinary,combo:{...saved.ordinary.combo,moves:[{techniqueId:pickerId,...malformed}]}};
   w.__import=JSON.stringify(snapshot);
   w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),broken:JSON.parse(__import)}));renderSavedBuilds()");
   pick('broken');el('runCompare').click();
   assert.ok(lanes(read('lastBuildComparisonRows[0].oneHitPipeline')).every(x=>x.value===null));
   load('broken');assert.deepEqual(read('App.state.combo.moves'),snapshot.combo.moves);
   assert.ok(lanes(read('calcState.realOneHit')).every(x=>x.value===null));
   el('calcUserComboDamage').click();
   assert.match(el('compareOut').textContent,/未算出/);
  }
  apply();
 }
 const standardAfter=read('calcState.realOneHit');
 assert.deepEqual(standardAfter.evaluationPlan.techniqueIds,standard.evaluationPlan.techniqueIds);
 assert.deepEqual(clone(lanes(standardAfter)),clone(lanes(standard)));
 for(const c of Object.values(standardAfter.channels))assert.equal(c.diagnostics[diagnostic],undefined);
 apply(141);
 const fire=click().pipeline;
 assert.ok(lanes(fire).every(x=>x.value>0),JSON.stringify(lanes(fire)));
 const [physical,element]=fire.channels.normal.components.map(x=>x.value);
 assert.ok(physical>0&&element>0);
 const stats=read('calcState.stats');
 near(physical,stats.attackTrue*mv*.8*1.32*(1+stats.affinity/100*.34));
 near(element,stats.element/10*.3*1.15);
 apply(124);
 const rapid=click().pipeline,fastStats=read('calcState.stats');
 assert.ok(lanes(rapid).every(x=>x.value>0),JSON.stringify(lanes(rapid)));
 const fastRaw=rapid.channels.normal.components[0];
 const expectedRaw=fastStats.attackTrue*mv*.8*1.32*(1+fastStats.affinity/100*.25);
 near(fastRaw.value,expectedRaw);
 assert.equal(rapid.channels.maximum.diagnostics.rapidMorphAdoption,undefined);
 apply(141,{},[{name:'逆襲',level:3,type:'armor'}]);
 const [normal,max]=lanes(click().pipeline);
 assert.ok(max.value>normal.value&&normal.value>0,JSON.stringify([normal,max]));
 t.diagnostic('impact 1142 normal/max '+lanes(p).map(x=>x.value).join(' / ')+', elemental 141 phys/elem '+physical+' / '+element+'; 逆襲 Lv3 '+normal.value+' / '+max.value);
});
