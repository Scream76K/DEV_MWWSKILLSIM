'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]),fixtures=path.resolve(process.argv[3]);
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases;
const files=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'],hash=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
const report={scope:'STANDARD_BOWGUN_OWNER_SEQUENCE_UI_SAVE_COMPARISON',hashes:Object.fromEntries(files.map(n=>[n,hash(n)])),rows:[],failures:[]};
for(const [kind,weaponId,level] of [['light-bowgun',783,1],['light-bowgun',763,2],['light-bowgun',771,3],['heavy-bowgun',469,1],['heavy-bowgun',464,2],['heavy-bowgun',517,3],['light-bowgun',773,1],['light-bowgun',817,1],['light-bowgun',1171,2]]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://normal-ten-shot.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click(),row={kind,weaponId,level};report.rows.push(row);
 try{
  const nonrapid=[773,817,1171].includes(weaponId);
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  assert.equal(typeof w.MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot,'function');
  const c=cases.find(c=>c.kind===kind),snapshot=structuredClone(c.inputSnapshots[0]);
  Object.assign(snapshot,{weaponId:String(weaponId===1171?1169:weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[{name:'ファーストショット',level:3,type:'weapon'},{name:'フォースショット',level:3,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}});
  if(weaponId===1171)snapshot.artia={...snapshot.artia,production:'element'};
  const state={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:'NONE',specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
  snapshot.combo.moves=[];
  snapshot.combo[kind==='light-bowgun'?'lightBowgunState':'hbgReferenceState']=state;
  const apply=s=>{w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');};
  const evaluate=()=>read('evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan})');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");
  apply(snapshot);prepare();
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})');
  const result=evaluate();row.result=result;
  assert.equal(result.status,'OK');assert.equal(result.evaluationPlan.selection,'STANDARD');assert.equal(result.evaluationPlan.standardAmmo.level,level);
  const values=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);row.totals=values(result);
  for(const ch of ['normal','maximum']){const r=result.channels[ch];assert.equal(r.execution.status,'complete');const trace=r.components.flatMap(c=>c.details?.trace||[]);assert.equal(trace.length,kind==='light-bowgun'?(nonrapid?15:25):30);if(kind==='light-bowgun'&&!nonrapid){assert.equal(r.metrics.comboTotalDamage.completeness,'PARTIAL_REFERENCE');const t=trace[0],expected=25*t.attack*({1:17,2:23.8,3:30.6}[level]/100)*.65*(1+t.affinity/100*.25)*.7*t.normalUp*t.rapidUp;assert.ok(Math.abs(expected-r.metrics.comboTotalDamage.value)<1e-8);}}
  if(nonrapid){
   assert.equal(result.evaluationPlan.standardAmmo.shotMode,'NORMAL');assert.equal(result.evaluationPlan.standardAmmo.shotCount,5);
   const stats=read('__stats');let total=0;for(let i=1;i<=5;i++){const add=i===1?15:i===4?10:0,aff=Math.min(100,stats.affinity+(i>=4?12:0)),crit=1+aff/100*.25;total+=(stats.attackTrue+add)*(level===1?.17:.238)*.65*crit*.8*3;}
   for(const ch of ['normal','maximum']){const r=result.channels[ch],trace=r.components.flatMap(c=>c.details?.trace||[]);assert.ok(Math.abs(r.metrics.comboTotalDamage.value-total)<1e-8);assert.deepEqual(trace.map(t=>t.shotOrdinal),Array.from({length:15},(_,i)=>Math.floor(i/3)+1));assert.deepEqual(trace.map(t=>t.shotAttackAdd),Array.from({length:15},(_,i)=>i<3?15:i>=9&&i<12?10:0));assert.ok(!(r.diagnostics.unappliedEffects||[]).some(e=>[137,140].includes(e.skillId)));}
   w.__expected=result;for(const capacity of [1,2,5,99]){w.__capacity=capacity;const changed=read("(()=>{const input={...__input,normalAmmoSequence:'LBG_NORMAL_FIVE_SHOT_NO_RELOAD',weapon:{...__input.weapon,ammo:__input.weapon.ammo.map(a=>a.kind==='normal'?{...a,capacity:__capacity}:a)},lightBowgunState:{...__input.lightBowgunState,magazineCapacity:__capacity,loadedRounds:0,shotOrdinal:99,fullMagazine:false}};return continueConsumerSkillEffects(input,MHWRealOneHitBrowserAdapter.evaluateCurrent(input));})()");assert.deepEqual(values(changed),row.totals);assert.equal(changed.conditionKey,result.conditionKey);}
   for(const bad of [null,{},[],[{kind:'normal',level,rapid:true,capacity:3}],[{kind:'normal',level:level===1?2:1,rapid:false,capacity:3}]]){w.__bad=bad;const v=read("MHWRealOneHitBrowserAdapter.evaluateNormalFiveShot({...__input,weapon:{...__input.weapon,ammo:__bad}})");assert.equal(v.status,'UNAVAILABLE');}
   assert.equal(read("MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)").status,'UNAVAILABLE');
  }
  assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input:__input})'),before);
  if(kind==='light-bowgun'&&!nonrapid)assert.ok(w.document.getElementById('buildSummary').textContent.includes('一部スキル未反映'));
  w.document.getElementById('buildName').value='standard-A';click('saveBuild');apply({...snapshot,target:{monsterId:'training-room',partId:'training-back'}});w.document.querySelector('[data-build-load="standard-A"]').click();click('calcBuild');prepare();assert.deepEqual(values(evaluate()),row.totals);
  if(weaponId===783||weaponId===469||weaponId===773){
   const ids=weaponId===773?[783,773,1171]:kind==='light-bowgun'?[783,763,771]:[469,464,517];
   for(let i=0;i<ids.length;i++){apply({...snapshot,weaponId:String(ids[i]===1171?1169:ids[i]),artia:{...snapshot.artia,production:ids[i]===1171?'element':'attack'}});w.document.getElementById('buildName').value=i===0?'standard-A':'standard-'+i;click('saveBuild');}
   const protectedState=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');
   const rows=read('lastBuildComparisonRows');assert.equal(rows.length,3);w.__rows=rows;
   assert.deepEqual(read('__rows.map(r=>consumerRelativeReason(r,__rows[0]))'),[null,null,null]);
   for(let b=0;b<3;b++){const selector=w.document.getElementById('comparisonBaseline');selector.value=String(b);selector.dispatchEvent(new w.Event('change',{bubbles:true}));const table=w.document.querySelector('[data-comparison-metric="consumer-relative-normal"]');assert.ok(table);for(const r of rows){const expected=(r.oneHitPipeline.channels.normal.metrics.comboTotalDamage.value/rows[b].oneHitPipeline.channels.normal.metrics.comboTotalDamage.value*100).toFixed(1);assert.ok(table.textContent.includes(expected),expected);}}
   assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),protectedState);
   const neg=read("(()=>{const a=__rows[0],b=structuredClone(__rows[1]);const results=[];b.kind='other';results.push(consumerRelativeReason(b,a));b.kind=a.kind;b.oneHitPipeline.evaluationPlan.target={monster:'training-room',part:'training-back'};results.push(consumerRelativeReason(b,a));b.oneHitPipeline.evaluationPlan.target=a.oneHitPipeline.evaluationPlan.target;b.oneHitPipeline.evaluationPlan.selection='EXPLICIT';b.oneHitPipeline.evaluationPlan.standardAmmo=null;results.push(consumerRelativeReason(b,a));const c=structuredClone(a);c.oneHitPipeline.evaluationPlan.selection='EXPLICIT';c.oneHitPipeline.evaluationPlan.standardAmmo=null;results.push(consumerRelativeReason(b,c));return results;})()");assert.ok(neg.every(Boolean));row.multiLevelComparison='PASS';if(weaponId===773){const table=w.document.getElementById('compareOut')||w.document.body;assert.ok(table.textContent.includes('RAPID'));assert.ok(table.textContent.includes('NORMAL'));row.mixedModeComparison='PASS';}
  }
  if(weaponId===1171){
   assert.equal(read('__input.weapon.artiaCalculationEvidence.normalAmmoVariantSourceId'),1171);assert.equal(read("__input.weapon.ammo.find(a=>a.kind==='normal').rapid"),false);
   const protectedSaved=read('savedBuildMap()');
   for(const [first,force] of [[0,0],[3,0],[0,3],[3,3]]){const skills=snapshot.charmCustom.skills.filter((_,i)=>i===0?first:force).map(x=>({...x,level:3}));apply({...snapshot,charmCustom:{...snapshot.charmCustom,skills}});prepare();const r=evaluate(),stats=read('__stats');let expected=0;for(let i=1;i<=5;i++){const a=Math.min(100,stats.affinity+(force&&i>=4?12:0)),add=(first&&i===1?15:0)+(force&&i===4?10:0);expected+=(stats.attackTrue+add)*.238*.65*(1+a/100*.25)*.8*3;}for(const ch of ['normal','maximum'])assert.ok(Math.abs(r.channels[ch].metrics.comboTotalDamage.value-expected)<1e-8);}
   apply(snapshot);prepare();assert.deepEqual(values(evaluate()),row.totals);assert.deepEqual(read('savedBuildMap()'),protectedSaved);
   const missing=read("(()=>{const weapon=structuredClone(selectedWeapon());delete weapon.artiaFixedVariants.element.normalAmmo;try{realPipelineWeapon(weapon,{ammoType:'NORMAL'});return null;}catch(e){return e.message;}})()");assert.match(missing,/ARTIA_VARIANT_NORMAL_AMMO_SOURCE_UNRESOLVED/);
  }
  const stable=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),stable);assert.deepEqual(errors,[]);row.status='PASS';
 }catch(e){row.error=e.stack;report.failures.push({weaponId,error:e.message});}finally{w.close();}
}
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
