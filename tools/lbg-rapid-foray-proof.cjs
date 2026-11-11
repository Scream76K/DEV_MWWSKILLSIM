'use strict';
// Offline source-reference proof only. Never installs getters or changes prototypes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const dbFile=path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'),snapshotFile=path.join(root,'tests/fixtures/comparison-session-inputs.json');
const pack=JSON.parse(fs.readFileSync(dbFile)),cases=JSON.parse(fs.readFileSync(snapshotFile)).cases;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const boundFiles=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-foray-proof.cjs','tests/lbg-rapid-foray.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const report={scope:'LBG_STANDARD_RAPID_25_HIT_75_ONLY',hashes:Object.fromEntries(boundFiles.map(f=>[f,hash(path.join(root,f))])),liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'))).digest('hex'),rows:[],failures:[]};
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
 apply();const baseline=evaluate();assert.equal(baseline.status,'OK');const base=read('__stats'),force=weaponId===783?1:0;
 function verify(r,rank,{flat=0,affinity=0,critBonus=.25,first=0}={}){
  assert.equal(r.status,'OK',r.reason);assert.equal(r.evaluationPlan.selection,'STANDARD');
  const add=[0,6,8,10,12,15][rank]+flat,affAdd=[0,0,5,10,15,20][rank]+affinity;
  for(const ch of ['normal','maximum']){
   const ts=traces(r.channels[ch]),active=ch==='maximum';assert.equal(ts.length,25);let total=0;
   for(let i=0;i<25;i++){
    const t=ts[i],ordinal=Math.floor(i/5)+1,shotAttackAdd=(ordinal===1?[0,5,10,15][first]:0)+(ordinal===4?[0,3,6,10][force]:0),shotAffinityAdd=ordinal>=4?[0,8,10,12][force]:0;
    const attack=base.attackTrue+(active?add:0)+shotAttackAdd,aff=Math.min(100,base.affinity+(active?affAdd:0)+shotAffinityAdd),coefficient=({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*(1+aff/100*(aff<0?.25:critBonus)),hit=attack*coefficient;
    assert.equal(t.shotOrdinal,ordinal);assert.equal(t.roundOrdinal,ordinal);assert.equal(t.triggerOrdinal,ordinal);near(t.shotAttackAdd,shotAttackAdd);near(t.shotAffinityAdd,shotAffinityAdd);near(t.attack,attack);near(t.affinity,aff);near(t.effectiveAffinity,aff);near(t.physical,hit);total+=hit;
   }
   near(r.channels[ch].metrics.comboTotalDamage.value,total);assert.equal(r.channels[ch].diagnostics.rapidAmmoSequence.liveGameVerification,'PENDING');
   const d=r.channels[ch].diagnostics;for(const e of d.unappliedEffects||[])assert.equal(e.status,'NOT_APPLIED');
   assert.ok(![...(d.unappliedEffects||[]),...(d.ignoredSkillEffects||[])].some(x=>[75,137,140].includes(Number(x.skillId))));
   if(weaponId===771)assert.ok((d.ignoredSkillEffects||[]).some(x=>Number(x.skillId)===82&&x.status==='IGNORED_UNSUPPORTED_EFFECT'&&x.liveGameVerification==='NOT_VERIFIED'));
  }
 }
 verify(baseline,0);
 for(let rank=1;rank<=5;rank++)for(const [label,extras,opts] of [
  ['alone',[],{}],['peak',[['フルチャージ',5]],{flat:20}],['evade',[['巧撃',5]],{flat:30}],['counterstrike',[['逆襲',3]],{flat:25}],
  ['latent',[['力の解放',5]],{affinity:50}],['might',[['渾身',3]],{affinity:30}],['critical boost',[['超会心',5]],{critBonus:.4}],
  ['combined attack and affinity',[['フルチャージ',5],['力の解放',5]],{flat:20,affinity:50}]
 ])check(`Foray rank ${rank} ${label}`,()=>{
  apply([['攻勢',rank],...extras]);const before=read('({input:__input,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})');
  const actual=read('calcState.total');for(const [name,wanted] of [['攻勢',rank],...extras])assert.equal(Number(actual[name]),wanted,'requested rank applied: '+name);const source=pack.data.skills.find(x=>x.id===75),sourceRank=source.ranks.find(x=>x.level===rank);assert.equal(sourceRank.id,181+rank);assert.equal(sourceRank.skill.id,75);assert.match(sourceRank.description,/毒、麻痺状態の大型モンスター/);const r=evaluate();verify(r,rank,opts);assert.deepEqual(read('({input:__input,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'),before);
  const plan=read('__stats.conditionalConditionPlan'),applied=plan.applied.filter(x=>x.skill==='攻勢'&&x.level===rank);assert.equal(applied.length,1);assert.equal(applied[0].condition,'MONSTER_POISON_OR_PARALYSIS');assert.equal(applied[0].attackAdd,[0,6,8,10,12,15][rank]);near(plan.attackComponents.conditionalFlat,[0,6,8,10,12,15][rank]+(opts.flat||0));
  return {totals:totals(r),actualSkills:actual,foraySourceRankId:sourceRank.id,forayPlan:applied[0],conditionalFlat:plan.attackComponents.conditionalFlat,omissions:Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels[ch].diagnostics.unappliedEffects||[]])),ignoredEffects:Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels[ch].diagnostics.ignoredSkillEffects||[]])),maximumAttackAdd:[0,6,8,10,12,15][rank]+(opts.flat||0),maximumAffinityAdd:[0,0,5,10,15,20][rank]+(opts.affinity||0)};
 });
 check('first shot 140 applies only to the first five hits with Foray',()=>{apply([['攻勢',5],['ファーストショット',3]]);verify(evaluate(),5,{first:3});});
 check('three flats save load comparison preserves inputs',()=>{
  apply([['攻勢',5],['フルチャージ',5],['巧撃',5]]);const r=evaluate();verify(r,5,{flat:50});
  w.document.getElementById('buildName').value='counter-A';click('saveBuild');apply();w.document.getElementById('buildName').value='counter-B';click('saveBuild');
  w.document.querySelector('[data-build-load="counter-A"]').click();click('calcBuild');prepare();assert.deepEqual(totals(evaluate()),totals(r));
  const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');
  const rows=read('lastBuildComparisonRows');assert.equal(rows.length,2);assert.ok(rows.every(x=>x.oneHitPipeline.status==='OK'));
  assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),before);
 });
 apply([['攻勢',5]]);
 for(const [label,patch] of [
  ['unfinished plan',"input.stats.conditionalConditionPlan.pending.push('PROOF_UNFINISHED')"],
  ['missing plan',"delete input.stats.conditionalConditionPlan"],
  ['wrong id',"input.weapon.skills.push({skill:{id:154,name:'攻勢'},level:3})"],
  ['wrong name',"input.weapon.skills.push({skill:{id:75,name:'フルチャージ'},level:3})"],
  ['rank 6',"input.skills=input.skills.map(([n,l])=>[n,n==='攻勢'?6:l])"],
  ['fractional rank',"input.skills=input.skills.map(([n,l])=>[n,n==='攻勢'?1.5:l])"],
  ['duplicate skill',"input.skills.push(['攻勢',5])"],
  ['missing applied row',"input.stats.conditionalConditionPlan.applied=input.stats.conditionalConditionPlan.applied.filter(x=>x.skill!=='攻勢')"],
  ['duplicate applied row',"input.stats.conditionalConditionPlan.applied.push(input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='攻勢'))"],
  ['wrong applied rank',"input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='攻勢').level=2"]
 ])check('Foray negative '+label,()=>{
  const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);
  assert.notEqual(r.status,'OK');return {reason:r.reason};
 });
 check('Foray explicit single trigger stays pending',()=>{const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.notEqual(r.status,'OK');return {reason:r.reason};});
 check('legacy explicit baseline still five Hits',()=>{apply([],763);const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.equal(r.status,'OK',r.reason);for(const ch of ['normal','maximum'])assert.equal(traces(r.channels[ch]).length,5);});
 check('nonrapid contrast uses both existing bonuses once',()=>{apply([],773);const b=evaluate();assert.equal(b.status,'OK');apply([['攻勢',5]],773);const r=evaluate();assert.equal(r.status,'OK');for(const ch of ['normal','maximum']){const old=traces(b.channels[ch]),now=traces(r.channels[ch]);assert.equal(now.length,15);let sum=0;for(let i=0;i<15;i++){const aff=Math.min(100,old[i].effectiveAffinity+(ch==='maximum'?20:0)),attack=read('__stats.attackTrue')+(ch==='maximum'?15:0)+old[i].shotAttackAdd;near(now[i].effectiveAffinity,aff);const hit=attack*.17*.65*.8*(1+aff/100*.25)*old[i].normalUpModifier;near(now[i].physical,hit);sum+=hit;}near(r.channels[ch].metrics.comboTotalDamage.value,sum);}});
 if(weaponId===763)check('adapter supplied affinity crosses zero and caps without duplication',()=>{apply([['攻勢',5]]);for(const affinity of [-60,-10,0,95]){w.__aff=affinity;const r=read(`(()=>{const stats=structuredClone(__stats);stats.affinity=__aff;stats.maxAffinity=Math.min(100,__aff+20);for(const ch of ['normal','maximum']){stats.conditionalConditionPlan[ch].affinity=__aff;stats.conditionalConditionPlan[ch].maxAffinity=stats.maxAffinity;}return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,affinity:__aff},stats});})()`);assert.equal(r.status,'OK',r.reason);for(const ch of ['normal','maximum']){const aff=Math.min(100,affinity+(ch==='maximum'?20:0)),attack=base.attackTrue+(ch==='maximum'?15:0),hit=attack*({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*(1+aff/100*.25);for(const t of traces(r.channels[ch])){near(t.attack,attack);near(t.affinity,aff);near(t.physical,hit);}near(r.channels[ch].metrics.comboTotalDamage.value,hit*25);}}});
 check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=boundFiles.every(f=>hash(path.join(root,f))===report.hashes[f]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
