'use strict';
// Offline source-reference proof only. Never installs getters or changes prototypes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const dbFile=path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'),snapshotFile=path.join(root,'tests/fixtures/comparison-session-inputs.json');
const pack=JSON.parse(fs.readFileSync(dbFile)),cases=JSON.parse(fs.readFileSync(snapshotFile)).cases;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const boundFiles=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-common-skills-proof.cjs','tests/lbg-rapid-common-skills.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const report={scope:'LBG_STANDARD_RAPID_25_HIT_142_154_ONLY',hashes:Object.fromEntries(boundFiles.map(f=>[f,hash(path.join(root,f))])),liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'))).digest('hex'),rows:[],failures:[]};
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
 apply();const baseline=evaluate();assert.equal(baseline.status,'OK');const base=read('__stats');
 // Weapon 783 carries Force Shot 1. The baseline is not uniform after shot 3.
 const force=weaponId===783?1:0;
 function verify(r,latent,peak,{normalUp=1,rapidUp=1,critBonus=.25,might=0}={}){
  assert.equal(r.status,'OK',r.reason);assert.equal(r.evaluationPlan.selection,'STANDARD');
  for(const ch of ['normal','maximum']){
   const ts=traces(r.channels[ch]),active=ch==='maximum';assert.equal(ts.length,25);let total=0;
   for(let i=0;i<25;i++){
    const t=ts[i],ordinal=Math.floor(i/5)+1,shotAttackAdd=ordinal===4?[0,3,6,10][force]:0,shotAffinityAdd=ordinal>=4?[0,8,10,12][force]:0;
    const attack=base.attackTrue+(active?[0,3,6,10,15,20][peak]:0)+shotAttackAdd,aff=Math.min(100,base.affinity+(active?latent*10+might:0)+shotAffinityAdd);
    const crit=1+aff/100*(aff<0?.25:critBonus),hit=attack*({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*crit*normalUp*rapidUp;
    assert.equal(t.shotOrdinal,ordinal);assert.equal(t.roundOrdinal,ordinal);assert.equal(t.triggerOrdinal,ordinal);near(t.shotAttackAdd,shotAttackAdd);near(t.shotAffinityAdd,shotAffinityAdd);near(t.attack,attack);near(t.affinity,aff);near(t.effectiveAffinity,aff);near(t.physical,hit);total+=hit;
   }
   near(r.channels[ch].metrics.comboTotalDamage.value,total);assert.equal(r.channels[ch].diagnostics.rapidAmmoSequence.liveGameVerification,'PENDING');
   const d=r.channels[ch].diagnostics;for(const effect of d.unappliedEffects||[])assert.equal(effect.status,'NOT_APPLIED');
   assert.ok(![...(d.unappliedEffects||[]),...(d.ignoredSkillEffects||[])].some(x=>[137,140,142,154].includes(Number(x.skillId))));
   if(weaponId===771)assert.ok(!(d.ignoredSkillEffects||[]).some(x=>Number(x.skillId)===82));
  }
 }
 verify(baseline,0,0);
 for(const name of ['力の解放','フルチャージ'])for(let rank=1;rank<=5;rank++)check(`${name} rank ${rank}`,()=>{apply([[name,rank]]);const before=read('__input');const r=evaluate();verify(r,name==='力の解放'?rank:0,name==='フルチャージ'?rank:0);assert.deepEqual(read('__input'),before);return {totals:totals(r)};});
 for(const [extra,rank,opts] of [['通常弾・通常矢強化',1,{normalUp:1.05}],['速射強化',1,{rapidUp:1.05}],['超会心',5,{critBonus:.4}],['渾身',3,{might:30}]])check('combined with '+extra,()=>{apply([['力の解放',5],['フルチャージ',5],[extra,rank]]);verify(evaluate(),5,5,opts);});
 check('combined save load comparison preserves inputs',()=>{apply([['力の解放',5],['フルチャージ',5]]);const r=evaluate();verify(r,5,5);w.document.getElementById('buildName').value='common-A';click('saveBuild');apply();w.document.getElementById('buildName').value='common-B';click('saveBuild');w.document.querySelector('[data-build-load="common-A"]').click();click('calcBuild');prepare();assert.deepEqual(totals(evaluate()),totals(r));const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');const rows=read('lastBuildComparisonRows');assert.equal(rows.length,2);assert.ok(rows.every(x=>x.oneHitPipeline.status==='OK'));assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),before);});
 for(const name of ['力の解放','フルチャージ']){
  apply([[name,5]]);
  for(const [label,patch] of [
   ['unfinished plan',"input.stats.conditionalConditionPlan.pending.push('PROOF_UNFINISHED')"],
   ['missing plan',"delete input.stats.conditionalConditionPlan"],
   ['wrong identity',`input.weapon.skills.push({skill:{id:154,name:'力の解放'},level:5})`],
   ['rank out of source',`input.skills=input.skills.map(([n,l])=>[n,n===${JSON.stringify(name)}?6:l])`],
   ['duplicate',`input.skills.push([${JSON.stringify(name)},5])`],
   ...(name==='フルチャージ'?[
    ['missing applied row',"input.stats.conditionalConditionPlan.applied=input.stats.conditionalConditionPlan.applied.filter(x=>x.skill!=='フルチャージ')"],
    ['duplicate applied row',"input.stats.conditionalConditionPlan.applied.push(input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='フルチャージ'))"]]:[])
  ])check(`${name} negative ${label}`,()=>{const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);assert.notEqual(r.status,'OK');return {reason:r.reason};});
  check(`${name} explicit single trigger stays pending`,()=>{const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.notEqual(r.status,'OK');return {reason:r.reason};});
 }
 check('legacy explicit baseline still five Hits',()=>{apply([],763);const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.equal(r.status,'OK',r.reason);for(const ch of ['normal','maximum'])assert.equal(traces(r.channels[ch]).length,5);});
 for(const id of [123,87,168,172])check('health combination boundary '+id,()=>{const s=pack.data.skills.find(x=>x.id===id);assert.ok(s);apply([['フルチャージ',5],[s.name,1]]);const r=read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)');if(id===123)assert.equal(r.status,'OK',r.reason);else assert.notEqual(r.status,'OK');return {reason:r.reason};});
 check('nonrapid contrast applies common coefficients once',()=>{apply([],773);const b=evaluate(),stats=read('__stats');assert.equal(b.status,'OK',b.reason);apply([['力の解放',5],['フルチャージ',5]],773);const r=evaluate();assert.equal(r.status,'OK',r.reason);for(const ch of ['normal','maximum']){const old=traces(b.channels[ch]),now=traces(r.channels[ch]);assert.equal(now.length,15);let sum=0;for(let i=0;i<15;i++){const aff=Math.min(100,old[i].effectiveAffinity+(ch==='maximum'?50:0));near(now[i].effectiveAffinity,aff);const expected=(stats.attackTrue+(ch==='maximum'?20:0)+old[i].shotAttackAdd)*.17*.65*.8*(1+aff/100*.25)*old[i].normalUpModifier;near(now[i].physical,expected);sum+=expected;}near(r.channels[ch].metrics.comboTotalDamage.value,sum);}});
 if(weaponId===763)check('adapter-only synthetic affinity crosses zero and cap uses shared values once',()=>{apply([['力の解放',5],['フルチャージ',5]]);for(const affinity of [-60,-20,90]){w.__aff=affinity;const r=read(`(()=>{const stats=structuredClone(__stats);stats.affinity=__aff;stats.maxAffinity=Math.min(100,__aff+50);for(const ch of ['normal','maximum']){stats.conditionalConditionPlan[ch].affinity=__aff;stats.conditionalConditionPlan[ch].maxAffinity=stats.maxAffinity;}return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,affinity:__aff},stats});})()`);assert.equal(r.status,'OK',r.reason);for(const ch of ['normal','maximum']){const aff=Math.min(100,affinity+(ch==='maximum'?50:0)),attack=base.attackTrue+(ch==='maximum'?20:0),hit=attack*({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*(1+aff/100*.25);for(const t of traces(r.channels[ch])){near(t.affinity,aff);near(t.physical,hit);}near(r.channels[ch].metrics.comboTotalDamage.value,hit*25);}}});
 check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=boundFiles.every(f=>hash(path.join(root,f))===report.hashes[f]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
