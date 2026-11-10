'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]),fixtures=path.resolve(process.argv[3]);
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases;
const files=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js'],hash=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
const report={scope:'EXPLICIT_NORMAL_TEN_SHOT_NOT_STANDARD_ADOPTION_OR_GAME_ACCURACY',hashes:Object.fromEntries(files.map(n=>[n,hash(n)])),rows:[],failures:[]};
for(const [kind,weaponId,level] of [['heavy-bowgun',469,1],['heavy-bowgun',464,2],['heavy-bowgun',517,3],['light-bowgun',773,1],['light-bowgun',763,2]]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://normal-ten-shot.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click(),row={kind,weaponId,level};report.rows.push(row);
 try{
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  assert.equal(typeof w.MHWRealOneHitBrowserAdapter.evaluateNormalTenShot,'function');
  const c=cases.find(c=>c.kind===kind),snapshot=structuredClone(c.inputSnapshots[0]);
  Object.assign(snapshot,{weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[{name:'ファーストショット',level:3,type:'weapon'},{name:'フォースショット',level:3,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}});
  const state={ammoType:'NORMAL',ammoLevel:level,shotMode:'NORMAL',contactPolicy:'ALL_THREE',range:'CRITICAL',normalModeLevel:0,magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
  snapshot.combo.moves=[{techniqueId:(kind==='light-bowgun'?'LBG':'HBG')+'_NORMAL_AMMO_'+level,repeat:1}];
  snapshot.combo[kind==='light-bowgun'?'lightBowgunState':'hbgReferenceState']=state;
  const apply=s=>{w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');};
  const evaluate=()=>read('MHWRealOneHitBrowserAdapter.evaluateNormalTenShot(__input)');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");
  apply(snapshot);prepare();
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})');
  row.inputState=read("__input[__kind==='light-bowgun'?'lightBowgunState':'hbgState']");const old=read('MHWRealOneHitBrowserAdapter.evaluateCurrent(__input)'),result=evaluate();
  const oracleInput=read('({attack:__stats.attackTrue,affinity:__stats.affinity,mv:TechniqueDBEngine.get(__kind,__plan.techniqueIds[0]).specialSourceValues.mvPerHit})');
  for(const ch of ['normal','maximum']){
   const channel=result.channels?.[ch];assert.equal(channel?.execution?.status,'complete',JSON.stringify(result));assert.equal(channel.metrics.comboTotalDamage.status,'available');
   const trace=channel.components.flatMap(c=>c.details?.trace||[]);assert.equal(trace.length,30);
   let expected=0;
   for(let ordinal=1;ordinal<=10;ordinal++){const add=ordinal===1?15:[4,6].includes(ordinal)?10:0,aff=Math.min(100,oracleInput.affinity+(ordinal>=4?12:0)),crit=1+aff/100*.25,value=(oracleInput.attack+add)*oracleInput.mv/100*.65*crit*(kind==='light-bowgun'?.8:1)*3;const hits=trace.filter(x=>x.shotOrdinal===ordinal);assert.equal(hits.length,3);assert.ok(hits.every(x=>x.shotAttackAdd===add));assert.ok(Math.abs(hits.reduce((n,x)=>n+x.physical,0)-value)<1e-8);expected+=value;}
   assert.ok(Math.abs(channel.metrics.comboTotalDamage.value-expected)<1e-8);
  }
  assert.notEqual(result.conditionKey,old.conditionKey);
  assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})'),before,'dedicated evaluation must not mutate current or stored inputs');
  const values=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels[ch].metrics.comboTotalDamage.value]));
  row.totals=values(result);row.legacyTotals=values(old);
  const stateKey=kind==='light-bowgun'?'lightBowgunState':'hbgState';
  for(const capacity of [null,0,1,6,99]){
   w.__capacity=capacity;const changed=read("MHWRealOneHitBrowserAdapter.evaluateNormalTenShot({...__input,weapon:{...__input.weapon,ammo:__input.weapon.ammo.map(a=>a.kind==='normal'?{...a,capacity:__capacity}:a)},["+JSON.stringify(stateKey)+"]:{...__input["+JSON.stringify(stateKey)+"],magazineCapacity:__capacity,shotOrdinal:99,fullMagazine:false}})");assert.deepEqual(values(changed),row.totals);assert.equal(changed.conditionKey,result.conditionKey,'ignored magazine inputs must not change sequence comparison identity');
  }
  for(const change of [{ammoLevel:null},{ammoLevel:level===1?2:1},{shotMode:'RAPID'}]){w.__change=change;const bad=read("MHWRealOneHitBrowserAdapter.evaluateNormalTenShot({...__input,["+JSON.stringify(stateKey)+"]:{...__input["+JSON.stringify(stateKey)+"],...__change}})");assert.ok(!bad.channels||bad.channels.normal.metrics.comboTotalDamage.status!=='available','invalid or mismatched state must not calculate');}
  const wrong=read("MHWRealOneHitBrowserAdapter.evaluateNormalTenShot({...__input,weapon:{...__input.weapon,ammo:[]}})");assert.ok(!wrong.channels||wrong.channels.normal.metrics.comboTotalDamage.status!=='available');
  w.document.getElementById('buildName').value='ten-shot-A';click('saveBuild');
  apply({...snapshot,target:{monsterId:'training-room',partId:'training-back'}});w.document.querySelector('[data-build-load="ten-shot-A"]').click();click('calcBuild');prepare();assert.deepEqual(values(evaluate()),row.totals);
  const stable=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');
  click('selectAllCompare');click('runCompare');assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),stable);
  assert.deepEqual(errors,[]);row.status='PASS';
 }catch(e){row.status='FAIL';row.error=e.stack;report.failures.push({kind,error:e.message});}
 finally{w.close();}
}
report.runtimeUnchanged=files.every(n=>hash(n)===report.hashes[n]);report.status=report.failures.length?'FAIL':'PASS';console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='PASS'?0:1;
