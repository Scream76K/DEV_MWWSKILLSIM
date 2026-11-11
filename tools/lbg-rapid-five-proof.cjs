'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]),fixtures=path.resolve(process.argv[3]);
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases;
const files=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'],hash=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
const report={scope:'EXPLICIT_RAPID_FIVE_ROUNDS_25_HITS_OWNER_ADOPTED_SHOT_SKILLS',hashes:Object.fromEntries(files.map(n=>[n,hash(n)])),rows:[],failures:[]};
for(const [kind,weaponId,level] of [['light-bowgun',783,1],['light-bowgun',786,1],['light-bowgun',1169,3]]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://normal-ten-shot.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click(),row={kind,weaponId,level};report.rows.push(row);
 try{
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  assert.equal(typeof w.MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot,'function');
  const c=cases.find(c=>c.kind===kind),snapshot=structuredClone(c.inputSnapshots[0]);
  Object.assign(snapshot,{weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[{name:'ファーストショット',level:3,type:'weapon'},{name:'フォースショット',level:3,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}});
  const state={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:level===3?'LEVEL_PLUS_ONE':'NONE',specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
  snapshot.combo.moves=[{techniqueId:'LBG_NORMAL_RAPID_'+level,repeat:1}];
  snapshot.combo[kind==='light-bowgun'?'lightBowgunState':'hbgReferenceState']=state;
  const apply=s=>{w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');};
  const evaluate=()=>read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");
  apply(snapshot);prepare();row.actualSkills=read('calcState.total');assert.equal(Number(row.actualSkills['ファーストショット']),3);assert.equal(Number(row.actualSkills['フォースショット']),3);
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})');
  const result=evaluate(); row.result=result;
  assert.equal(result.status,'OK');
  const oracle=read('({attack:__input.stats.attackTrue,affinity:__input.stats.affinity})');
  const verify=(actual,first,force)=>{
   assert.equal(actual.status,'OK',actual.reason);
   for(const ch of ['normal','maximum']){
    const r=actual.channels[ch],ts=r.components.flatMap(c=>c.details?.trace||[]);assert.equal(r.execution.status,'complete');assert.equal(r.components.length,25);assert.equal(ts.length,25);assert.equal(r.metrics.comboTotalDamage.completeness,'SOURCE_REFERENCE');assert.deepEqual(r.metrics.comboTotalDamage.unappliedEffects,[]);assert.equal(r.finalState.lightBowgun.loadedRounds,0);let total=0;
    for(let i=0;i<25;i++){
     const t=ts[i],ordinal=Math.floor(i/5)+1,shotAttackAdd=(ordinal===1?[0,5,10,15][first]:0)+(ordinal===4?[0,3,6,10][force]:0),shotAffinityAdd=ordinal>=4?[0,8,10,12][force]:0,attack=oracle.attack+shotAttackAdd,affinity=Math.min(100,oracle.affinity+shotAffinityAdd),hit=attack*(level===3?.306:.17)*.65*(1+affinity/100*.25)*.7;
     assert.equal(t.shotOrdinal,ordinal);assert.equal(t.roundOrdinal,ordinal);assert.equal(t.triggerOrdinal,ordinal);assert.equal(t.shotAttackAdd,shotAttackAdd);assert.equal(t.shotAffinityAdd,shotAffinityAdd);assert.equal(t.attack,attack);assert.equal(t.affinity,affinity);assert.equal(t.effectiveAffinity,affinity);assert.ok(Math.abs(t.physical-hit)<1e-8);total+=hit;
    }
    assert.ok(Math.abs(r.metrics.comboTotalDamage.value-total)<1e-8);
    assert.ok(![...(r.diagnostics.unappliedEffects||[]),...(r.diagnostics.ignoredSkillEffects||[])].some(x=>[137,140].includes(Number(x.skillId))));assert.equal(r.diagnostics.rapidAmmoSequence.liveGameVerification,'PENDING');
   }
  };
  verify(result,3,3);
  for(const ch of ['normal','maximum']){
   const component=result.channels[ch].components[0];w.__sourceOptions={techniqueId:component.techniqueId,state:component.details.state,attack:oracle.attack,affinity:oracle.affinity,criticalMultiplier:1.25,physicalHitzone:65,normalUp:0,rapidUp:0,firstShot:3,forceShot:3};
   const pure=read('BowgunNormalReference.rapidFiveShot(__sourceOptions,TechniqueDBEngine)');assert.ok(Math.abs(pure.physical-result.channels[ch].metrics.comboTotalDamage.value)<1e-8);
  }
  const legacy=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,weapon:{...__input.weapon,skills:__input.weapon.skills.filter(x=>![137,140].includes(Number(x.skill?.id)))},skills:__input.skills.filter(x=>!['ファーストショット','フォースショット'].includes(x[0])),lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");
  assert.equal(legacy.status,'OK',legacy.reason);
  const legacyHit=oracle.attack*(level===3?.306:.17)*.65*(1+oracle.affinity/100*.25)*.7;
  for(const ch of ['normal','maximum']){assert.equal(legacy.channels[ch].components.length,5);assert.ok(Math.abs(legacy.channels[ch].metrics.comboTotalDamage.value-5*legacyHit)<1e-8);}
  for(const [first,force] of [[0,0],[3,0],[0,3],[3,3]]){w.__first=first;w.__force=force;const variant=read("MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,skills:__input.weapon.skills.filter(x=>![137,140].includes(Number(x.skill?.id)))},skills:__input.skills.filter(x=>!['ファーストショット','フォースショット'].includes(x[0])).concat(__first?[['ファーストショット',__first]]:[],__force?[['フォースショット',__force]]:[])})");verify(variant,first,force);if(first===0&&force===0)for(const ch of ['normal','maximum'])assert.ok(Math.abs(legacy.channels[ch].metrics.comboTotalDamage.value*5-variant.channels[ch].metrics.comboTotalDamage.value)<1e-8);}
  const values=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);row.totals=values(result);
  for(const capacity of [1,2,6,99]){w.__capacity=capacity;const changed=read("MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,ammo:__input.weapon.ammo.map(a=>a.kind==='normal'?{...a,capacity:__capacity}:a)},lightBowgunState:{...__input.lightBowgunState,loadedRounds:0,shotOrdinal:99,fullMagazine:false,magazineCapacity:__capacity}})");assert.deepEqual(values(changed),row.totals);assert.equal(changed.conditionKey,result.conditionKey);}
  for(const ammo of [null,{},'normal',4,[]]){w.__ammo=ammo;const bad=read("MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,ammo:__ammo}})");assert.equal(bad.status,'UNAVAILABLE');}
  assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})'),before);
  w.document.getElementById('buildName').value='rapid-five-A';click('saveBuild');apply({...snapshot,target:{monsterId:'training-room',partId:'training-back'}});w.document.querySelector('[data-build-load="rapid-five-A"]').click();click('calcBuild');prepare();assert.deepEqual(values(evaluate()),row.totals);
  const stable=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),stable);assert.deepEqual(errors,[]);row.status='PASS';
 }catch(e){row.error=e.stack;report.failures.push(row.error);}finally{w.close();}
}
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
