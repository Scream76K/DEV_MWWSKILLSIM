'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');
test('current explicit normal ammo uses one magazine and counts one shot per three contacts',()=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://normal-two.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 const base=profiles.find(p=>p.kind==='light-bowgun').input;
 try{
  w.__dbText=JSON.stringify(data);
  w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  function calc({id=763,rounds=4,ordinal=1,full='YES',skills=[],lv=2,count=2,mode='NORMAL'}={}){
   w.applyBuildSnapshot({...structuredClone(base),weaponId:String(id),armor:{},decos:{},charmCustom:{skills:skills.map(name=>({name,level:1,type:'weapon'})),slots:[0,0,0],weaponSlots:[]},target:{monsterId:'training-room',partId:'training-front'},combo:{...base.combo,moves:[]}});
   const set=(key,value)=>{el(key).value=String(value);el(key).dispatchEvent(new w.Event('change',{bubbles:true}));};
   set('comboLBGMode',mode);if(mode==='RAPID')set('comboLBGRapidReady','YES');set('comboLBGAmmoType','NORMAL');set('comboLBGAmmoLevel',lv);set('comboLBGRange','CRITICAL');set('comboLBGNormalMode',0);set('comboLBGContactPolicy',mode==='RAPID'?'ALL_FIVE':'ALL_THREE');set('comboLBGShotOrdinal',ordinal);set('comboLBGFullMagazine',full);set('comboLBGLoadedRounds',rounds);
   if(mode==='RAPID')return JSON.parse(w.eval(`JSON.stringify(evaluateP0DamageRoute([{techniqueId:'LBG_NORMAL_RAPID_${lv}'}]).pipeline)`));
   const p=el('comboMovePicker');
   for(let j=0;j<count;j++){const id='canonical:LBG_NORMAL_'+(mode==='RAPID'?'RAPID_':'AMMO_')+lv;if(![...p.options].some(o=>o.value===id))p.add(new w.Option(id,id));p.value=id;el('addCombo').click();}
   el('calcUserComboDamage').click();
   const evaluated=w.calcP0Damage('user');assert.ok(evaluated.pipeline,JSON.stringify(evaluated));return JSON.parse(JSON.stringify(evaluated.pipeline));
  }
  const no=calc(), marked=calc({skills:['ファーストショット']});
  for(const c of ['normal','maximum']){
   const baseline=no.channels[c], actual=marked.channels[c];
   assert.ok(Math.abs(baseline.metrics.comboTotalDamage.value-82.2528)<1e-8);
   assert.ok(Math.abs(actual.metrics.comboTotalDamage.value-84.5376)<1e-8,JSON.stringify({c,actual}));
   const hits=actual.components.flatMap(x=>x.details.trace);
   assert.deepEqual(hits.map(h=>h.shotOrdinal),[1,1,1,2,2,2]);
   assert.deepEqual(hits.map(h=>h.shotAttackAdd),[5,5,5,0,0,0]);
   assert.ok(hits.every(h=>h.element===0));
  }
  function check(args,ord,atk,aff,total){
   const result=calc(args);
   for(const c of ['normal','maximum']){
    const lane=result.channels[c];
    assert.equal(lane.metrics.comboTotalDamage.status,'available',JSON.stringify({c,args,diagnostics:lane.diagnostics,reason:lane.execution.reason}));
    assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-total)<1e-8,JSON.stringify({c,args,actual:lane.metrics.comboTotalDamage.value,total}));
    const hits=lane.components.flatMap(x=>x.details.trace);
    assert.deepEqual(hits.map(h=>h.shotOrdinal),ord.flatMap(n=>Array(3).fill(n)));
    assert.deepEqual(hits.map(h=>h.shotAttackAdd),atk.flatMap(n=>Array(3).fill(n)));
    assert.deepEqual(hits.map(h=>h.shotAffinityAdd),aff.flatMap(n=>Array(3).fill(n)));
    assert.ok(hits.every(h=>h.element===0));
    assert.ok(!JSON.stringify(lane.diagnostics).includes('IGNORED_UNSUPPORTED_EFFECT'));
   }
  }
  check({skills:['ファーストショット'],count:1},[1],[5],[0],43.4112);
  check({skills:['ファーストショット'],rounds:2,full:'NO'},[1,2],[0,0],[0,0],82.2528);
  check({skills:['ファーストショット'],rounds:2,full:''},[1,2],[0,0],[0,0],82.2528);
  check({skills:['フォースショット'],rounds:2,ordinal:3},[3,4],[0,3],[0,8],84.4736256);
  const mc=(attack,aff=0)=>attack*.17*.8*.8*(1+aff/100*.25)*3;
  check({id:773,lv:1,rounds:2,ordinal:4,skills:['フォースショット']},[4,5],[3,0],[8,8],mc(143,8)+mc(140,8));
  for(const skills of [[],['フォースショット']]){
   const invalid=calc({rounds:2,ordinal:4,skills});
   assert.ok(JSON.stringify(invalid).includes('LBG_NORMAL_PAIR:MAGAZINE_INSUFFICIENT_OR_CONFLICTING'));
   assert.ok(Object.values(invalid.channels||{}).every(r=>r.metrics.comboTotalDamage.status!=='available'));
  }
  const rapid=calc({mode:'RAPID',count:1});
  for(const lane of Object.values(rapid.channels||{})){
   assert.equal(lane.metrics.comboTotalDamage.status,'available',JSON.stringify(lane));
   assert.equal(lane.components.length,5);
   assert.equal(lane.finalState.lightBowgun.loadedRounds,3);
  }
  w.applyBuildSnapshot({...structuredClone(base),weaponId:'771',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
  const picker=el('comboMovePicker');picker.value='lbg_normal3';assert.equal(picker.value,'lbg_normal3');el('addCombo').click();el('calcUserComboDamage').click();
  const single=w.calcP0Damage('user').pipeline;
  assert.ok(single.channels,JSON.stringify(single));
  for(const channel of Object.values(single.channels)){
   assert.equal(channel.metrics.comboTotalDamage.status,'available',JSON.stringify(channel.execution));
   const hits=channel.components.flatMap(c=>c.details.trace);
   assert.deepEqual([...hits].map(h=>h.mv),[30.6,30.6,30.6]);
   assert.ok(hits.every(h=>h.element===0&&h.weaponPhysicalModifier===.8));
  }
  const named=read('buildSnapshot()');assert.equal(named.combo.moves[0].techniqueId,'lbg_normal3');
  const expected=180*.306*.8*.8*(1+.20*.25)*3;
  assert.ok(Math.abs(single.channels.normal.metrics.comboTotalDamage.value-expected)<1e-8,String(single.channels.normal.metrics.comboTotalDamage.value));
  function unavailable(snapshot){
   w.applyBuildSnapshot(snapshot);el('calcUserComboDamage').click();
   const result=w.calcP0Damage('user').pipeline;
   assert.ok(!Object.values(result?.channels||{}).some(c=>c.metrics.comboTotalDamage.status==='available'));
  }
  unavailable({...named,weaponId:'763'});
  unavailable({...named,combo:{...named.combo,moves:[...named.combo.moves,...named.combo.moves]}});
  unavailable({...named,combo:{...named.combo,lightBowgunState:{...named.combo.lightBowgunState,normalPowder:'LEVEL_PLUS_ONE'}}});
  unavailable({...named,combo:{...named.combo,lightBowgunState:{...named.combo.lightBowgunState,shotMode:'RAPID'}}});
  w.__named=JSON.stringify({native:named});w.eval('storageSet(BUILDS_KEY,__named);renderSavedBuilds()');
  w.document.querySelector('#compareBuilds input[data-compare-name]').checked=true;el('runCompare').click();
  assert.deepEqual(read('lastBuildComparisonRows[0].nativeNormalThree'),[single.channels.normal.metrics.comboTotalDamage.value,single.channels.maximum.metrics.comboTotalDamage.value]);
  assert.equal(single.channels.maximum.metrics.comboTotalDamage.value,single.channels.normal.metrics.comboTotalDamage.value);
  assert.match(el('compareOut').textContent,/指定の通常弾Lv3・1射3命中（資料暫定） 通常 111\.0 ／ 最大 111\.0/);
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),w.__named);
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
