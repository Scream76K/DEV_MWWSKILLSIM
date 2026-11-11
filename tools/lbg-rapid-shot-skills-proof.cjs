'use strict';
// Numerical source-reference proof. No prototype/getter changes or game-version claims.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const pack=JSON.parse(fs.readFileSync(path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'))),cases=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/comparison-session-inputs.json'))).cases;
const files=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-shot-skills-proof.cjs','tests/lbg-rapid-shot-skills.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const hash=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
const report={scope:'LBG_STANDARD_RAPID_FIVE_ROUNDS_FIRST_FORCE',liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',hashes:Object.fromEntries(files.map(n=>[n,hash(n)])),rows:[],failures:[]};
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${a} != ${b}`);
const traces=r=>r.components.flatMap(c=>c.details?.trace||[]),totals=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);
for(const [weaponId,level,powder] of [[783,1,'NONE'],[763,2,'NONE'],[771,3,'NONE'],[763,3,'LEVEL_PLUS_ONE']]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://rapid-shot-skills.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const check=(name,fn)=>{const row={weaponId,level,powder,name};report.rows.push(row);try{Object.assign(row,fn()||{});row.status='PASS';}catch(e){row.status='FAIL';row.error=e.stack;report.failures.push(row);}};
 try{
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const snapshot=structuredClone(cases.find(c=>c.kind==='light-bowgun').inputSnapshots[0]);
  Object.assign(snapshot,{weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}});
  snapshot.combo.moves=[];snapshot.combo.lightBowgunState={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:powder,specialMagazine:'NONE',magazineCapacity:1,shotOrdinal:99,fullMagazine:false};
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");
  const apply=(skills=[])=>{w.__snapshot={...snapshot,charmCustom:{...snapshot.charmCustom,skills:skills.map(([name,level])=>({name,level,type:'weapon'}))}};w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();};
  const evaluate=()=>read('evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan})');
  apply();const baseline=evaluate();assert.equal(baseline.status,'OK',baseline.reason);
  const baselineStats=read('__stats'),base=Object.fromEntries(['normal','maximum'].map(ch=>[ch,{attack:baselineStats.attackTrue,affinity:baselineStats.affinity}]));
  const firstAttack=[0,5,10,15],forceAttack=[0,3,6,10],forceAffinity=[0,8,10,12];
  function verify(r,first,force,{normalUp=1,rapidUp=1,flat=0,affinity=0,critBonus=.25,baseAffinity=null}={}){
   assert.equal(r.status,'OK',r.reason);if(r.evaluationPlan)assert.equal(r.evaluationPlan.selection,'STANDARD');
   for(const ch of ['normal','maximum']){
    const ts=traces(r.channels[ch]);assert.equal(ts.length,25);let sum=0;
    for(let i=0;i<25;i++){
     const ordinal=Math.floor(i/5)+1,add=(ordinal===1?firstAttack[first]:0)+(ordinal===4?forceAttack[force]:0),affAdd=ordinal>=4?forceAffinity[force]:0;
     const attack=base[ch].attack+(ch==='maximum'?flat:0)+add,aff=Math.min(100,(baseAffinity??base[ch].affinity)+(ch==='maximum'?affinity:0)+affAdd);
     const hit=attack*({1:.17,2:.238,3:.306}[level])*.7*.65*normalUp*rapidUp*(1+aff/100*(aff<0?.25:critBonus));
     const t=ts[i];assert.equal(t.shotOrdinal,ordinal);assert.equal(t.roundOrdinal,ordinal);assert.equal(t.triggerOrdinal,ordinal);assert.equal(t.hit,i%5+1);
     near(t.shotAttackAdd,add);near(t.shotAffinityAdd,affAdd);near(t.attack,attack);near(t.affinity,aff);near(t.effectiveAffinity,aff);near(t.physical,hit);sum+=hit;
    }
    near(r.channels[ch].metrics.comboTotalDamage.value,sum);
    assert.equal(r.channels[ch].finalState.lightBowgun.loadedRounds,0);
    assert.equal(r.channels[ch].diagnostics.rapidAmmoSequence.magazinePolicy,'IGNORED_NO_RELOAD');
    assert.ok(![...(r.channels[ch].diagnostics.unappliedEffects||[]),...(r.channels[ch].diagnostics.ignoredSkillEffects||[])].some(x=>[137,140].includes(Number(x.skillId))));
    assert.equal(r.channels[ch].diagnostics.rapidAmmoSequence.liveGameVerification,'PENDING');
   }
  }
  for(let first=0;first<=3;first++)for(let force=0;force<=3;force++)check(`pure first ${first} force ${force}`,()=>{
   const t=traces(baseline.channels.normal)[5],component=baseline.channels.normal.components[5];
   w.__pure={techniqueId:component.techniqueId,state:component.details.state,attack:t.attack,affinity:-5,criticalMultiplier:1.4,physicalHitzone:65,normalUp:1,rapidUp:1,firstShot:first,forceShot:force};
   const before=read('__pure'),r=read('BowgunNormalReference.rapidFiveShot(__pure,TechniqueDBEngine)');assert.equal(r.trace.length,25);let sum=0;
   for(let i=0;i<25;i++){const ordinal=Math.floor(i/5)+1,add=(ordinal===1?firstAttack[first]:0)+(ordinal===4?forceAttack[force]:0),aff=-5+(ordinal>=4?forceAffinity[force]:0),hit=(t.attack+add)*({1:.17,2:.238,3:.306}[level])*.7*.65*1.05*1.05*(1+aff/100*(aff<0?.25:.4));const h=r.trace[i];assert.equal(h.shotOrdinal,ordinal);near(h.shotAttackAdd,add);near(h.shotAffinityAdd,ordinal>=4?forceAffinity[force]:0);near(h.physical,hit);sum+=hit;}
   near(r.physical,sum);assert.deepEqual(r.unappliedEffects,[]);assert.equal(r.status,'SOURCE_REFERENCE');assert.deepEqual(read('__pure'),before);return {total:r.physical};
  });
  for(let first=0;first<=3;first++)for(let force=0;force<=3;force++)check(`adapter first ${first} force ${force}`,()=>{
   apply([...(first?[['ファーストショット',first]]:[]),...(force?[['フォースショット',force]]:[])]);
   const actual=read('calcState.total'),actualFirst=actual['ファーストショット']||0,actualForce=actual['フォースショット']||0;
   const before=read('({input:__input,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'),r=evaluate();verify(r,actualFirst,actualForce);assert.deepEqual(read('({input:__input,snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot()})'),before);return {totals:totals(r),actualFirst,actualForce};
  });
  for(const [label,extras,options] of [
   ['normal up',[['通常弾・通常矢強化',1]],{normalUp:1.05}],
   ['rapid up',[['速射強化',1]],{rapidUp:1.05}],
   ['Foray',[['攻勢',5]],{flat:15,affinity:20}],
   ['Latent Power',[['力の解放',5]],{affinity:50}],
   ['Peak Performance',[['フルチャージ',5]],{flat:20}],
   ['Counterstrike',[['逆襲',3]],{flat:25}],
   ['critical boost',[['超会心',5]],{critBonus:.4}]
  ])check('coexisting '+label,()=>{apply([['ファーストショット',3],['フォースショット',weaponId===783?2:3],...extras]);const actual=read('calcState.total');for(const [name,rank] of [['ファーストショット',3],['フォースショット',3],...extras])assert.equal(actual[name],rank);const r=evaluate();verify(r,3,3,options);return {totals:totals(r)};});
  if(weaponId!==771)check('capacity and saved shot fields ignored without identity changes',()=>{apply([['ファーストショット',3],['フォースショット',weaponId===783?2:3]]);const original=read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)');verify(original,3,3);for(const capacity of [1,2,5,99]){w.__capacity=capacity;const r=read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,ammo:__input.weapon.ammo.map(a=>a.kind===\'normal\'?{...a,capacity:__capacity}:a)},lightBowgunState:{...__input.lightBowgunState,loadedRounds:0,magazineCapacity:__capacity,shotOrdinal:99,fullMagazine:false}})');verify(r,3,3);assert.equal(r.conditionKey,original.conditionKey);assert.deepEqual(totals(r),totals(original));}});
  if(weaponId===763&&powder==='NONE'){
   check('negative affinity crosses zero and caps once with Critical Boost',()=>{apply([['ファーストショット',3],['フォースショット',3],['超会心',5]]);for(const affinity of [-60,-5,0,95]){w.__aff=affinity;const r=read("(()=>{const stats=structuredClone(__stats);stats.affinity=__aff;stats.maxAffinity=__aff;for(const ch of ['normal','maximum']){stats.conditionalConditionPlan[ch].affinity=__aff;stats.conditionalConditionPlan[ch].maxAffinity=__aff;}return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot({...__input,weapon:{...__input.weapon,affinity:__aff},stats});})()");verify(r,3,3,{baseAffinity:affinity,critBonus:.4});}});
   check('save load compare keeps different builds and all saved inputs',()=>{apply([['ファーストショット',1],['フォースショット',2]]);const a=evaluate();w.document.getElementById('buildName').value='rapid-first-force-A';click('saveBuild');apply([['ファーストショット',3],['フォースショット',3],['攻勢',5]]);const b=evaluate();w.document.getElementById('buildName').value='rapid-first-force-B';click('saveBuild');w.document.querySelector('[data-build-load="rapid-first-force-A"]').click();click('calcBuild');prepare();assert.deepEqual(totals(evaluate()),totals(a));const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})');click('selectAllCompare');click('runCompare');const rows=read('lastBuildComparisonRows');assert.equal(rows.length,2);assert.ok(rows.every(r=>r.oneHitPipeline.status==='OK'));assert.deepEqual(rows.map(r=>totals(r.oneHitPipeline)),[totals(a),totals(b)]);assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})'),before);});
   apply([['ファーストショット',3],['フォースショット',3]]);
   for(const [label,patch] of [
    ['first rank 4',"input.skills=input.skills.map(([n,l])=>[n,n==='ファーストショット'?4:l])"],['force fractional',"input.skills=input.skills.map(([n,l])=>[n,n==='フォースショット'?1.5:l])"],
    ['duplicate first',"input.skills.push(['ファーストショット',3])"],['wrong identity',"input.weapon.skills.push({skill:{id:137,name:'ファーストショット'},level:3})"],['missing input',"delete input.lightBowgunState"],
    ['missing shot source',"input.techniqueDb={...TechniqueDBEngine,get:(kind,id)=>id==='HBG_NORMAL_REFERENCE_RULES'?null:TechniqueDBEngine.get(kind,id)}"],
    ['malformed source',"input.techniqueDb={...TechniqueDBEngine,get:(kind,id)=>{const r=TechniqueDBEngine.get(kind,id);return id==='HBG_NORMAL_REFERENCE_RULES'?{...r,specialSourceValues:{...r.specialSourceValues,shotSkills:{...r.specialSourceValues.shotSkills,forceAttackOrdinals:[4,5]}}}:r}}"]
   ])check('adapter rejects '+label,()=>{const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);assert.ok(r.status!=='OK'||Object.values(r.channels).every(ch=>ch.metrics.comboTotalDamage.status!=='available'));return {reason:r.reason,channels:r.channels?Object.fromEntries(Object.entries(r.channels).map(([ch,v])=>[ch,v.metrics.comboTotalDamage])):null};});
   for(const [label,patch] of [['invalid first',"o.firstShot=4"],['invalid force',"o.forceShot=1.5"],['missing state',"delete o.state"],['missing rules',"engine={get:(kind,id)=>id==='HBG_NORMAL_REFERENCE_RULES'?null:TechniqueDBEngine.get(kind,id)}"],['invalid rules',"engine={get:(kind,id)=>{const r=TechniqueDBEngine.get(kind,id);return id==='HBG_NORMAL_REFERENCE_RULES'?{...r,specialSourceValues:{...r.specialSourceValues,shotSkills:{...r.specialSourceValues.shotSkills,firstAttack:[0,5,10]}}}:r}}"]])check('pure rejects '+label,()=>{assert.equal(read(`(()=>{const o=structuredClone(__pure);let engine=TechniqueDBEngine;${patch};try{BowgunNormalReference.rapidFiveShot(o,engine);return false;}catch(e){return true;}})()`),true);});
   check('explicit one-trigger route keeps old unsupported boundary',()=>{const r=read('MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})');assert.notEqual(r.status,'OK');apply();const legacy=read('MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})');assert.equal(legacy.status,'OK',legacy.reason);for(const ch of ['normal','maximum'])assert.equal(traces(legacy.channels[ch]).length,5);});
   check('other unsupported skill remains annotated while calculation continues',()=>{apply([['ファーストショット',3],['フォースショット',3],['火事場力',3]]);const r=evaluate();verify(r,3,3);const annotations=Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels[ch].diagnostics.ignoredSkillEffects||[]]));for(const notes of Object.values(annotations))assert.ok(notes.some(x=>x.name==='火事場力'&&x.status==='IGNORED_UNSUPPORTED_EFFECT'&&x.liveGameVerification==='NOT_VERIFIED'));return {annotations};});
  }
  check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,level,powder,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=files.every(n=>hash(n)===report.hashes[n]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
