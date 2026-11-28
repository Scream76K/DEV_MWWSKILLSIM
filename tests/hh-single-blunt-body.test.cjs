'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
for(const [id,mv] of [['HH_RIGHT_SWING',33],['HH_BACKWARD_ATTACK',46]])test(id+' provisional single blunt body',t=>{
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

 let blunt=0.8;
 const training=w.trainingRoomMonster;
 w.trainingRoomMonster=()=>{const m=training();Object.assign(m.parts[0].multipliers,{blunt,slash:0.65,pierce:0.25});return m;};
 apply(1160);
 const left=click('canonical:HH_LEFT_SWING').pipeline;
 const pick=()=>click('canonical:'+id).pipeline;
 const body=pick();
 assert.ok(lanes(body).every(x=>x.value>0),JSON.stringify(lanes(body)));
 blunt=0.4;
 const half=pick();
 for(const ch of ['normal','maximum']){
  const parts=p=>p.channels[ch].components.map(x=>x.value);
  const [physical,element]=parts(left);
  assert.ok(physical>0&&element>0);
  assert.deepEqual(Array.from(body.channels[ch].components,x=>x.id),[id+':physical:0',id+':element:0']);
  near(parts(body)[0],physical*mv/33);near(parts(body)[1],element);
  near(parts(half)[0],parts(body)[0]/2);near(parts(half)[1],element);
 }
 save('plain');
 el('comboHHEcho').value='ACTIVE';el('comboHHMelody').value='ACTIVE';
 assert.ok(lanes(pick()).every(x=>x.value===null));save('active');
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 choose('plain');el('runCompare').click();
 let row=read('lastBuildComparisonRows[0]');
 assert.deepEqual(row.oneHitPipeline.channels,clone(half.channels));
 near(row.referenceCombo.damage,lanes(half)[0].value);
 assert.equal(el('comboHHEcho').value,'ACTIVE');
 el('comboHHEcho').value='NONE';el('comboHHMelody').value='NONE';
 choose('active');el('runCompare').click();
 row=read('lastBuildComparisonRows[0]');assert.equal(row.referenceCombo.damage,null);
 assert.ok(lanes(row.oneHitPipeline).every(x=>x.value===null));assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 apply(1160,{futureCondition:true});assert.ok(lanes(pick()).every(x=>x.value===null));
 save('future');
 const imported=w.eval('storageGet(BUILDS_KEY)');
 apply(1160);choose('future');el('runCompare').click();
 row=read('lastBuildComparisonRows[0]');
 assert.ok(lanes(row.oneHitPipeline).every(x=>x.value===null));assert.equal(row.referenceCombo.damage,null);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),imported);
 assert.deepEqual(read("savedBuildMap().future.combo.huntingHornState"),{futureCondition:true});
 apply(1160);
 const engine=w.TechniqueDBEngine;
 for(const change of [{mv:mv+1},{partModifier:null},{damageType:'slash'},{elementModifier:0}]){
  w.TechniqueDBEngine={...engine,get(kind,key){const r=engine.get(kind,key);return key===id?{...r,hits:[{...r.hits[0],...change}]}:r;}};
  assert.ok(lanes(pick()).every(x=>x.value===null));
 }
 w.TechniqueDBEngine=engine;
 const moves=[{techniqueId:'canonical:'+id}];
 const evaluate=(rows,extra)=>w.evaluateP0DamageRoute(rows,{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),...extra}});
 for(const rows of [[...moves,...moves],[{...moves[0],count:2}],[{...moves[0],repeat:2}]]){
  assert.equal(evaluate(rows,{}).damage,null);
 }
 for(const extra of [{jumpAttack:true},{mounted:true},{criticalDrawHits:{maximum:{[id]:[true]}}}]){
  assert.match(evaluate(moves,extra).blocked[0].reason,/BODY_CONTEXT_UNSUPPORTED/);
 }
 apply(1160,{},[{name:'逆襲',level:3,type:'armor'}]);
 const [normal,maximum]=lanes(pick());
 assert.ok(maximum.value>normal.value&&normal.value>0);
});
