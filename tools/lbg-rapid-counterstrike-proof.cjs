'use strict';
// Offline source-reference proof only. Never installs getters or changes prototypes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const dbFile=path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'),snapshotFile=path.join(root,'tests/fixtures/comparison-session-inputs.json');
const pack=JSON.parse(fs.readFileSync(dbFile)),cases=JSON.parse(fs.readFileSync(snapshotFile)).cases;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const boundFiles=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-counterstrike-proof.cjs','tests/lbg-rapid-counterstrike.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const report={scope:'LBG_STANDARD_RAPID_25_HIT_81_ONLY',hashes:Object.fromEntries(boundFiles.map(f=>[f,hash(path.join(root,f))])),liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'))).digest('hex'),rows:[],failures:[]};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const [weaponId,level] of [[783,1],[763,2],[771,3]]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://lbg-common-proof.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const check=(name,fn)=>{const row={weaponId,level,name};report.rows.push(row);try{Object.assign(row,fn()||{});row.status='PASS';}catch(e){row.status='FAIL';row.error=e.message;report.failures.push(row);}};
 try{
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const snapshot=structuredClone(cases.find(c=>c.kind==='light-bowgun').inputSnapshots[0]);
 Object.assign(snapshot,{weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}});
 snapshot.combo.moves=[];snapshot.combo.lightBowgunState={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:'NONE',specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
 const apply=(skills=[],id=weaponId)=>{w.__snapshot={...snapshot,weaponId:String(id),charmCustom:{...snapshot.charmCustom,skills:skills.map(([name,level])=>({name,level,type:'armor'}))}};w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();};
 const evaluate=()=>read('evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan})');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");

 const traces=r=>r.components.flatMap(c=>c.details?.trace||[]),totals=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);
 apply();const baseline=evaluate();assert.equal(baseline.status,'OK');const base=Object.fromEntries(['normal','maximum'].map(ch=>[ch,traces(baseline.channels[ch])[0]]));
 function verify(r,rank,extra=0){
  assert.equal(r.status,'OK',r.reason);assert.equal(r.evaluationPlan.selection,'STANDARD');
  const add=[0,10,15,25][rank]+extra;
  for(const ch of ['normal','maximum']){
   const ts=traces(r.channels[ch]),active=ch==='maximum',attack=base[ch].attack+(active?add:0),aff=base[ch].affinity;
   const coefficient=({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*(1+aff/100*.25),hit=attack*coefficient;
   assert.equal(ts.length,25);near(r.channels[ch].metrics.comboTotalDamage.value,hit*25);
   near(r.channels[ch].metrics.comboTotalDamage.value-baseline.channels[ch].metrics.comboTotalDamage.value,(active?add:0)*coefficient*25);
   for(const t of ts){near(t.attack,attack);near(t.affinity,aff);near(t.physical,hit);}
   assert.equal(r.channels[ch].diagnostics.rapidAmmoSequence.liveGameVerification,'PENDING');
   assert.ok(!(r.channels[ch].diagnostics.unappliedEffects||[]).some(x=>x.skillId===81));
   for(const e of r.channels[ch].diagnostics.unappliedEffects||[])assert.equal(e.status,'NOT_APPLIED');
   if(weaponId===783)assert.ok(r.channels[ch].diagnostics.unappliedEffects.some(x=>x.skillId===137&&x.status==='NOT_APPLIED'));
  }
 }
 for(let rank=1;rank<=3;rank++)for(const [label,extras,flat] of [
  ['alone',[],0],['peak',[['フルチャージ',5]],20],['evade',[['巧撃',5]],30],['three flats',[['フルチャージ',5],['巧撃',5]],50]
 ])check(`Counterstrike rank ${rank} ${label}`,()=>{
  apply([['逆襲',rank],...extras]);const before=read('({input:__input,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})');
  const r=evaluate();verify(r,rank,flat);assert.deepEqual(read('({input:__input,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'),before);
  const plan=read('__stats.conditionalConditionPlan'),applied=plan.applied.filter(x=>x.skill==='逆襲'&&x.level===rank);assert.equal(applied.length,1);assert.equal(applied[0].condition,'KNOCKBACK_BUFF');assert.equal(applied[0].attackAdd,[0,10,15,25][rank]);near(plan.attackComponents.conditionalFlat,[0,10,15,25][rank]+flat);
  return {totals:totals(r),maximumAttackAdd:[0,10,15,25][rank]+flat};
 });
 check('first shot 140 remains not applied',()=>{apply([['逆襲',3],['ファーストショット',3]]);const r=evaluate();verify(r,3);for(const ch of ['normal','maximum'])assert.ok(r.channels[ch].diagnostics.unappliedEffects.some(x=>x.skillId===140&&x.status==='NOT_APPLIED'));});
 check('three flats save load comparison preserves inputs',()=>{
  apply([['逆襲',3],['フルチャージ',5],['巧撃',5]]);const r=evaluate();verify(r,3,50);
  w.document.getElementById('buildName').value='counter-A';click('saveBuild');apply();w.document.getElementById('buildName').value='counter-B';click('saveBuild');
  w.document.querySelector('[data-build-load="counter-A"]').click();click('calcBuild');prepare();assert.deepEqual(totals(evaluate()),totals(r));
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');
  const rows=read('lastBuildComparisonRows');assert.equal(rows.length,2);assert.ok(rows.every(x=>x.oneHitPipeline.status==='OK'));
  assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),before);
 });
 apply([['逆襲',3]]);
 for(const [label,patch] of [
  ['unfinished plan',"input.stats.conditionalConditionPlan.pending.push('PROOF_UNFINISHED')"],
  ['missing plan',"delete input.stats.conditionalConditionPlan"],
  ['wrong id',"input.weapon.skills.push({skill:{id:154,name:'逆襲'},level:3})"],
  ['wrong name',"input.weapon.skills.push({skill:{id:81,name:'フルチャージ'},level:3})"],
  ['rank 4',"input.skills=input.skills.map(([n,l])=>[n,n==='逆襲'?4:l])"],
  ['fractional rank',"input.skills=input.skills.map(([n,l])=>[n,n==='逆襲'?1.5:l])"],
  ['duplicate skill',"input.skills.push(['逆襲',3])"],
  ['missing applied row',"input.stats.conditionalConditionPlan.applied=input.stats.conditionalConditionPlan.applied.filter(x=>x.skill!=='逆襲')"],
  ['duplicate applied row',"input.stats.conditionalConditionPlan.applied.push(input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='逆襲'))"],
  ['wrong applied rank',"input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='逆襲').level=2"]
 ])check('Counterstrike negative '+label,()=>{
  const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);
  assert.notEqual(r.status,'OK');return {reason:r.reason};
 });
 check('Counterstrike explicit single trigger stays pending',()=>{const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.notEqual(r.status,'OK');return {reason:r.reason};});
 check('legacy explicit baseline still five Hits',()=>{apply([],763);const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.equal(r.status,'OK',r.reason);for(const ch of ['normal','maximum'])assert.equal(traces(r.channels[ch]).length,5);});
 check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=boundFiles.every(f=>hash(path.join(root,f))===report.hashes[f]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
