'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');
test('saved LBG compares native rapid at one target with empty editor and preserved saves',()=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://native.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 const base=profiles.find(p=>p.kind==='light-bowgun').input;
 try{
  w.__dbText=JSON.stringify(data);
  w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const saved=Object.fromEntries([763,773,780].map(id=>['native '+id,{...base,weaponId:String(id),armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},target:{monsterId:'training-room',partId:'training-back'},combo:{...base.combo,moves:[{techniqueId:'canonical:LBG_NORMAL_RAPID_1'}],lightBowgunState:{normalPowder:'LEVEL_PLUS_ONE',specialMagazine:'EQUIPPED'}}}]));
  w.__saved=JSON.stringify(saved); w.eval('storageSet(BUILDS_KEY,__saved);renderSavedBuilds();');
  el('monster').value='training-room';w.eval('renderMonsterParts()');el('monsterPart').value='training-front';w.eval('renderMonsterInfo();calcBuild();');
  assert.equal(read('buildSnapshot().weaponId'),'');
  for(const box of w.document.querySelectorAll('#compareBuilds input[data-compare-name]'))box.checked=true;
  el('runCompare').click();
  assert.equal(read('buildSnapshot().weaponId'),'');
  assert.deepEqual(read('savedBuildMap()'),saved);
  const rows=read('lastBuildComparisonRows');
  assert.equal(rows?.length,3,el('compareOut').textContent);
  const expectations=[[763,'NORMAL',2,25],[773,'PIERCE',3,15],[780,'SPREAD',2,60]];
  for(const [id,type,level,contactCount] of expectations){
   const row=rows.find(r=>r.name==='native '+id),p=row.oneHitPipeline;
   assert.equal(p.evaluationPlan.selection,'STANDARD');
   assert.deepEqual(p.evaluationPlan.target,{monster:'training-room',part:'training-front'});
   assert.equal(p.evaluationPlan.standardAmmo.ammoType,type);
   assert.equal(p.evaluationPlan.standardAmmo.level,level);
   assert.equal(p.evaluationPlan.standardAmmo.shotCount,5);
   assert.equal(p.evaluationPlan.standardAmmo.contactCount,contactCount);
   for(const ch of ['normal','maximum'])assert.equal(p.channels[ch].metrics.comboTotalDamage.status,'available');
  }
  w.__rows=rows;assert.equal(w.eval("consumerRelativeReason(__rows[1],__rows[0])"),'REAL_SLICE:COMPARISON_NATIVE_AMMO_MISMATCH');
  assert.deepEqual(errors,[]);
  // Exercise the same persisted, consolidated data shape as an older cache.
  w.eval("for(const v of Object.values(DB.weapons.find(x=>x.id===1169).artiaFixedVariants))delete v.nativeBallisticAmmo;");
  const variants=Object.fromEntries(['attack','affinity','element'].map(production=>['variant '+production,{...saved['native 763'],weaponId:'1169',artia:{...base.artia,production,restores:['capacity:EX','none','none','none','none']}}]));
  w.__saved=JSON.stringify(variants);w.eval('storageSet(BUILDS_KEY,__saved);renderSavedBuilds();');
  for(const box of w.document.querySelectorAll('#compareBuilds input[data-compare-name]'))box.checked=true;
  el('runCompare').click();
  const variantRows=read('lastBuildComparisonRows');
  assert.equal(variantRows?.length,3,el('compareOut').textContent);
  const expectedVariant={attack:['NORMAL',698.4705],affinity:['NORMAL',674.10525],element:['PIERCE',191.88]};
  for(const row of variantRows){
   const [type,damage]=expectedVariant[row.name.split(' ')[1]],result=row.oneHitPipeline;
   assert.equal(result.evaluationPlan.standardAmmo.ammoType,type);
   assert.ok(Math.abs(result.channels.normal.metrics.comboTotalDamage.value-damage)<1e-8,JSON.stringify({type,damage,real:result.channels.normal.metrics.comboTotalDamage}));
  }
  assert.deepEqual(read('savedBuildMap()'),variants);
  assert.equal(read('buildSnapshot().weaponId'),'');
 }finally{w.close();}
});

test('all public native LBG rows and precedence use strictly rapid capability',()=>{
 const {select}=require('../lbg-standard-ballistic');
 const weapons=data.weapons.filter(w=>w.kind==='light-bowgun');
 assert.equal(weapons.length,80);
 const priority=['NORMAL','PIERCE','SPREAD'], source={};
 for(const weapon of weapons){
  const expected=weapon.ammo.filter(a=>a.rapid===true&&priority.includes(a.kind.toUpperCase())).sort((a,b)=>b.level-a.level||priority.indexOf(a.kind.toUpperCase())-priority.indexOf(b.kind.toUpperCase()))[0];
  const choice=select(weapon);assert.equal(choice.ammoType,expected.kind.toUpperCase(),weapon.name);assert.equal(choice.ammoLevel,expected.level,weapon.name);
  source[weapon.id]=choice.ammoType+choice.ammoLevel;
 }
 assert.deepEqual([1169,1170,1171].map(id=>source[id]),['NORMAL2','NORMAL2','PIERCE2']);
 const choose=(...ammo)=>select({kind:'light-bowgun',ammo:ammo.map(([kind,level,rapid])=>({kind,level,rapid}))});
 assert.equal(choose(['normal',2,true],['pierce',3,true],['spread',3,true]).ammoType,'PIERCE');
 assert.equal(choose(['normal',3,false],['pierce',3,false],['spread',1,true]).ammoType,'SPREAD');
 assert.equal(choose(['normal',3,false]).reason,'LBG_STANDARD:NO_NATIVE_RAPID_AMMO');
 assert.match(choose(['normal',2,true],['normal',2,true]).reason,/AMBIGUOUS/);
});
