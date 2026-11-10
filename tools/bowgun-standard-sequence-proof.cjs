'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]),fixtures=path.resolve(process.argv[3]);
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases;
const files=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'],hash=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
const report={scope:'STANDARD_BOWGUN_OWNER_SEQUENCE_UI_SAVE_COMPARISON',hashes:Object.fromEntries(files.map(n=>[n,hash(n)])),rows:[],failures:[]};
for(const [kind,weaponId,level] of [['light-bowgun',783,1],['light-bowgun',763,2],['light-bowgun',771,3],['heavy-bowgun',469,1],['heavy-bowgun',464,2],['heavy-bowgun',517,3],['light-bowgun',773,1]]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://normal-ten-shot.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click(),row={kind,weaponId,level};report.rows.push(row);
 try{
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  assert.equal(typeof w.MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot,'function');
  const c=cases.find(c=>c.kind===kind),snapshot=structuredClone(c.inputSnapshots[0]);
  Object.assign(snapshot,{weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[{name:'ファーストショット',level:3,type:'weapon'},{name:'フォースショット',level:3,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}});
  const state={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:'NONE',specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
  snapshot.combo.moves=[];
  snapshot.combo[kind==='light-bowgun'?'lightBowgunState':'hbgReferenceState']=state;
  const apply=s=>{w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');};
  const evaluate=()=>read('evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan})');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");
  apply(snapshot);prepare();
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})');
  const result=evaluate();row.result=result;
  if(weaponId===773){assert.equal(result.status,'UNAVAILABLE');assert.match(result.reason,/WEAPON_NORMAL_RAPID_UNSUPPORTED/);row.status='EXPECTED_UNAVAILABLE';continue;}
  assert.equal(result.status,'OK');assert.equal(result.evaluationPlan.selection,'STANDARD');assert.equal(result.evaluationPlan.standardAmmo.level,level);
  const values=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);row.totals=values(result);
  for(const ch of ['normal','maximum']){const r=result.channels[ch];assert.equal(r.execution.status,'complete');const trace=r.components.flatMap(c=>c.details?.trace||[]);assert.equal(trace.length,kind==='light-bowgun'?25:30);if(kind==='light-bowgun'){assert.equal(r.metrics.comboTotalDamage.completeness,'PARTIAL_REFERENCE');const t=trace[0],expected=25*t.attack*({1:17,2:23.8,3:30.6}[level]/100)*.65*(1+t.affinity/100*.25)*.7*t.normalUp*t.rapidUp;assert.ok(Math.abs(expected-r.metrics.comboTotalDamage.value)<1e-8);}}
  assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})'),before);
  if(kind==='light-bowgun')assert.ok(w.document.getElementById('buildSummary').textContent.includes('一部スキル未反映'));
  w.document.getElementById('buildName').value='standard-A';click('saveBuild');apply({...snapshot,target:{monsterId:'training-room',partId:'training-back'}});w.document.querySelector('[data-build-load="standard-A"]').click();click('calcBuild');prepare();assert.deepEqual(values(evaluate()),row.totals);
  if(weaponId===783||weaponId===469){
   const ids=kind==='light-bowgun'?[783,763,771]:[469,464,517];
   for(let i=0;i<ids.length;i++){apply({...snapshot,weaponId:String(ids[i])});w.document.getElementById('buildName').value=i===0?'standard-A':'standard-'+i;click('saveBuild');}
   const protectedState=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');
   const rows=read('lastBuildComparisonRows');assert.equal(rows.length,3);w.__rows=rows;
   assert.deepEqual(read('__rows.map(r=>consumerRelativeReason(r,__rows[0]))'),[null,null,null]);
   for(let b=0;b<3;b++){const selector=w.document.getElementById('comparisonBaseline');selector.value=String(b);selector.dispatchEvent(new w.Event('change',{bubbles:true}));const table=w.document.querySelector('[data-comparison-metric="consumer-relative-normal"]');assert.ok(table);for(const r of rows){const expected=(r.oneHitPipeline.channels.normal.metrics.comboTotalDamage.value/rows[b].oneHitPipeline.channels.normal.metrics.comboTotalDamage.value*100).toFixed(1);assert.ok(table.textContent.includes(expected),expected);}}
   assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),protectedState);
   const neg=read("(()=>{const a=__rows[0],b=structuredClone(__rows[1]);const results=[];b.kind='other';results.push(consumerRelativeReason(b,a));b.kind=a.kind;b.oneHitPipeline.evaluationPlan.target={monster:'training-room',part:'training-back'};results.push(consumerRelativeReason(b,a));b.oneHitPipeline.evaluationPlan.target=a.oneHitPipeline.evaluationPlan.target;b.oneHitPipeline.evaluationPlan.selection='EXPLICIT';b.oneHitPipeline.evaluationPlan.standardAmmo=null;results.push(consumerRelativeReason(b,a));const c=structuredClone(a);c.oneHitPipeline.evaluationPlan.selection='EXPLICIT';c.oneHitPipeline.evaluationPlan.standardAmmo=null;results.push(consumerRelativeReason(b,c));return results;})()");assert.ok(neg.every(Boolean));row.multiLevelComparison='PASS';
  }
  const stable=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),stable);assert.deepEqual(errors,[]);row.status='PASS';
 }catch(e){row.error=e.stack;report.failures.push({weaponId,error:e.message});}finally{w.close();}
}
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
