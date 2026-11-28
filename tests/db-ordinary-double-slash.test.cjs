'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('ordinary DB Double Slash enters via actual picker and evaluates left and right weapon contacts',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://db-double-slash.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='dual-blades').input;
 const apply=(id=1145,state={},artia={},charmSkills=[])=>{
  w.__build=JSON.stringify({...base,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:charmSkills,slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],dualBladesState:state},artia:{...base.artia,...artia}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(id));
 };
 const click=(id='db_double')=>{
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
 const pick=name=>{for(const x of el('compareBuilds').querySelectorAll('input[data-compare-name]')){x.checked=x.dataset.compareName===name;x.dispatchEvent(new w.Event('change',{bubbles:true}));}};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' != '+b);
 apply();
 const std=read('calcState.realOneHit');
 assert.deepEqual(std.evaluationPlan.techniqueIds,['DB_DEMON_DANCE_I','DB_DEMON_DANCE_II','DB_DEMON_DANCE_III']);
 assert.equal(std.channels.normal.execution.executed.length,27);
 const result=click(),p=result.pipeline;
 const lanes=p=>['normal','maximum'].map(ch=>w.consumerDamageMetric({oneHitPipeline:p},ch));
 assert.ok(lanes(p).every(x=>Number.isFinite(x.value)&&x.value>0),JSON.stringify(lanes(p)));
 assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),['DB_DOUBLE_SLASH']);
 assert.equal(result.stages.length,1);assert.equal(result.stages[0].result.total,result.damage);
 assert.match(el('compareOut').textContent,/左→右の2ヒット.*鬼人身躱し・装衣なし.*資料暫定/);
 assert.equal(el('comboDBDoubleSlashReset').hidden,true);
 assert.deepEqual(read('compareStep5Snapshot().dualBladesState'),{demonMode:null,requiresDemonGauge:null});
 const source=read("TechniqueDBEngine.get('dual-blades','DB_DOUBLE_SLASH')");
 assert.equal(source.calculationStatus,'EVIDENCE_GATED');
 assert.deepEqual(source.hits.map(h=>h.mv),[8,10]);
 for(const c of Object.values(p.channels)){
  assert.equal(c.execution.status,'complete');
  const proof=c.diagnostics.dbPlainDoubleSlash;
  assert.equal(proof.sourceBlob,'aa9d68e51568895659c5da0836861afea925ce56');
  assert.equal(proof.elementPolicy,'SINGLE_NATIVE_EQUIPMENT_ATTRIBUTE_PER_CONTACT');
  assert.deepEqual(Array.from(proof.contacts,h=>[h.hand,h.mv,h.elementModifier,h.partModifier,h.eventId]),
   [['LEFT',8,.6,1,'0:0'],['RIGHT',11,.6,1,'0:1']]);
  for(const h of proof.contacts)for(const key of ['physical','element'])assert.equal(c.components.find(x=>x.id===h[key+'ComponentId']).eventId,h.eventId);
  const [left,le,right,re]=c.components.map(x=>x.value);
  near(right,left*11/8);near(le,re);assert.ok(le>0);
  near(c.metrics.comboTotalDamage.value,left+le+right+re);
  assert.deepEqual(Array.from(c.execution.executed),['0:0','0:1']);
  assert.deepEqual(Array.from(c.components,x=>[x.id,x.status]),[['DB_DOUBLE_SLASH:physical:0','available'],['DB_DOUBLE_SLASH:element:0','available'],['DB_DOUBLE_SLASH:physical:1','available'],['DB_DOUBLE_SLASH:element:1','available']]);
 }
 const only=[{techniqueId:'db_double'}];
 const outcome=(extra={},rows=only)=>w.evaluateP0DamageRoute(rows,{currentCustom:true,evaluationConditions:{...w.compareStep5Snapshot(),...extra}});
 const reasons=r=>lanes(r.pipeline).map(x=>x.reason);
 for(const dualBladesState of [{demonMode:true},{requiresDemonGauge:true},{demonBoost:true},{archdemonMode:true},{demonMode:'FUTURE'},{demonForm:'ARCHDEMON'},{futureState:''},false]){
  assert.ok(reasons(outcome({dualBladesState})).every(x=>x==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'),JSON.stringify(dualBladesState));
 }
 for(const flags of [{mounted:true},{jumpAttack:true},{drawAttack:true},{mantleState:'CORRUPTED'},{weaponDrawState:'SHEATHED'},
    {criticalDrawHits:{maximum:{DB_DOUBLE_SLASH:[true,false]}}}]){
   assert.ok(reasons(outcome(flags)).every(x=>x==='DB_DOUBLE_SLASH:CONTEXT_UNSUPPORTED'));
 }
 assert.ok(reasons(outcome({demonBoost:true})).every(x=>x==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'));
 assert.ok(reasons(outcome({handElements:{LEFT:{element:'fire'},RIGHT:{element:'ice'}}})).every(x=>x==='DB_DOUBLE_SLASH:HAND_ELEMENT_UNSUPPORTED'));
 assert.equal(outcome({},[...only,...only]).damage,null);
 assert.equal(outcome({},[{...only[0],repeat:2}]).damage,null);
 assert.equal(outcome({},[{...only[0],count:2}]).damage,null);
 for(const move of ['canonical:DB_DEMON_DOUBLE_SLASH','canonical:DB_DOUBLE_RETURN_SLASH','canonical:DB_JUMP_DOUBLE_SLASH']){
  assert.equal(outcome({},[{techniqueId:move}]).damage,null,move);
 }
 const native=w.MHWRealOneHitBrowserAdapter;
 try{
  w.MHWRealOneHitBrowserAdapter={...native,evaluateCurrent(i){return native.evaluateCurrent({...i,weapon:{...i.weapon,handElements:{LEFT:'fire',RIGHT:'ice'}}});}};
  assert.ok(reasons(click()).every(x=>x==='DB_DOUBLE_SLASH:HAND_ELEMENT_UNSUPPORTED'));
 }finally{w.MHWRealOneHitBrowserAdapter=native;}
 // Artia completion must not erase contradictory source per-hand metadata
 // and turn it into a single scalar attribute before the exact-route gate.
 const declared=w.eval('selectedWeapon()'),originalSpecials=declared.specials;
 try{
  declared.specials=[{kind:'element',element:'fire',hand:'LEFT',damage:{raw:25,display:250}},
    {kind:'element',element:'ice',hand:'RIGHT',damage:{raw:25,display:250}}];
  assert.ok(reasons(click()).every(x=>x==='DB_DOUBLE_SLASH:HAND_ELEMENT_UNSUPPORTED'));
 }finally{declared.specials=originalSpecials;}
 const engine=w.TechniqueDBEngine;
 try{
  for(const mutate of [x=>({...x,mv:10}),x=>({...x,hand:'LEFT'}),x=>({...x,partModifier:1.2}),x=>({...x,elementModifier:.7})]){
   w.TechniqueDBEngine={...engine,get(kind,id){const r=engine.get(kind,id);if(kind!=='dual-blades'||id!=='DB_DOUBLE_SLASH')return r;
    const q=r.plainDoubleSlashReference;return {...r,plainDoubleSlashReference:{...q,contacts:[q.contacts[0],mutate(q.contacts[1])]}};
   }};
   assert.ok(reasons(click()).every(x=>x==='DB_DOUBLE_SLASH:SOURCE_PENDING'));
  }
 }finally{w.TechniqueDBEngine=engine;}
 save('ordinary');
 el('comboDBDemonMode').value='1';
 assert.ok(reasons(click()).every(x=>x==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'));
 save('demon');
 const future={demonMode:false,requiresDemonGauge:false,demonBoost:true,sourceForm:'FUTURE'};
 w.__future=JSON.stringify({...read('savedBuildMap().ordinary'),combo:{...read('savedBuildMap().ordinary.combo'),dualBladesState:future}});
 w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),future:JSON.parse(__future)}));renderSavedBuilds()");
 const prior=read('savedBuildMap()');
 pick('ordinary');el('runCompare').click();
 let row=read('lastBuildComparisonRows[0]');
 assert.deepEqual(clone(lanes(row.oneHitPipeline)),clone(lanes(p)));near(row.referenceCombo.stages[0].damage,result.damage);
 assert.equal(el('comboDBDemonMode').value,'1');
 assert.deepEqual(read('savedBuildMap()'),prior);
 el('comboDBDemonMode').value='0';
 for(const name of ['demon','future']){
  pick(name);el('runCompare').click();row=read('lastBuildComparisonRows[0]');
  assert.ok(lanes(row.oneHitPipeline).every(x=>x.reason==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'));
  assert.equal(row.referenceCombo.damage,null);
 }
 for(const b of el('combo').querySelectorAll('.del'))b.click();
 assert.deepEqual(read('App.state.combo.moves'),[]);
 load('future');
 const immediate=reasons({pipeline:read('calcState.realOneHit')});
 assert.ok(immediate.every(x=>x==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'),JSON.stringify(immediate));
 assert.deepEqual(reasons({pipeline:read('currentConsumerCalculation()')}),immediate);
 assert.ok(reasons(click()).every(x=>x==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'));
 assert.deepEqual(read('buildSnapshot().combo.dualBladesState'),future);
 assert.equal(el('comboDBDoubleSlashReset').hidden,false);el('comboDBDoubleSlashReset').click();
 near(click().damage,result.damage);assert.equal(el('comboDBDoubleSlashReset').hidden,true);
 assert.deepEqual(read('savedBuildMap()'),prior);
 apply(1145,future);
 assert.equal(el('comboDBDoubleSlashReset').hidden,true);
 pick('ordinary');el('runCompare').click();
 el('comboMovePicker').value='db_double';assert.equal(w.calcSelectedTechniqueDamage().damage,null);
 assert.ok(reasons(click()).every(x=>x==='DB_DOUBLE_SLASH:STATE_UNSUPPORTED'));
 assert.equal(el('comboDBDoubleSlashReset').hidden,false);
 apply();
 const after=read('calcState.realOneHit');
 assert.deepEqual(clone(lanes(after)),clone(lanes(std)));
 assert.deepEqual(after.evaluationPlan.techniqueIds,std.evaluationPlan.techniqueIds);
 assert.ok(Object.values(after.channels).every(x=>!x.diagnostics.dbPlainDoubleSlash));
 const cases=[];
 for(const [production,element,sourceId] of [['attack','dragon',1145],['affinity','fire',1146],['element','ice',1147]]){
  apply(1145,{}, {production,element});
  const weapon=read('realPipelineWeapon(selectedWeapon())'),stats=read('calcState.stats'),target=read('selectedPart().multipliers');
  assert.equal(weapon.artiaCalculationEvidence.sourceId,sourceId);
  assert.deepEqual(weapon.specials.map(x=>[x.kind,x.element]),[['element',element]]);
  const current=click().pipeline;
  assert.ok(lanes(current).every(x=>x.value>0),JSON.stringify(lanes(current)));
  const [left,le,right,re]=current.channels.normal.components.map(x=>x.value);
  near(right,left*11/8);
  const eSharp=weapon.sharpness.purple>0?1.25:1.15;
  near(le,stats.element/10*target[element]*.6*eSharp);near(re,le);
  assert.ok(le>0);
  cases.push(sourceId+' '+element+': '+[left,le,right,re].map(x=>Number(x.toFixed(8))).join('/'));
 }
 apply(1145,{}, {production:'attack',element:'poison'});
 const status=click().pipeline;
 assert.ok(lanes(status).every(x=>x.value>0));
 assert.ok(status.channels.normal.components.filter(c=>c.id.includes(':element:')).every(c=>c.value===0));
 apply(1145,{}, {production:'attack',element:'dragon'},[{name:'逆襲',level:3,type:'armor'}]);
 const [normal,max]=lanes(click().pipeline);
 assert.ok(max.value>normal.value&&normal.value>0,JSON.stringify([normal,max]));
 t.diagnostic(cases.join('; ')+'; Attack Dragon Counterstrike Lv3 '+normal.value+' / '+max.value);
});
