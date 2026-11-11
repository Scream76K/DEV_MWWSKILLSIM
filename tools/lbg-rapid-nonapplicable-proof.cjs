'use strict';
// Offline source-reference proof only. Never installs getters or changes prototypes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const dbFile=path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'),snapshotFile=path.join(root,'tests/fixtures/comparison-session-inputs.json');
const pack=JSON.parse(fs.readFileSync(dbFile)),cases=JSON.parse(fs.readFileSync(snapshotFile)).cases;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const boundFiles=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-nonapplicable-proof.cjs','tests/lbg-rapid-nonapplicable.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const report={scope:'LBG_STANDARD_RAPID_NON_APPLICABLE_13_66_82_133',hashes:Object.fromEntries(boundFiles.map(f=>[f,hash(path.join(root,f))])),liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'))).digest('hex'),rows:[],failures:[]};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const [weaponId,level,powder='NONE'] of [[783,1],[763,2],[771,3],[763,3,'LEVEL_PLUS_ONE']]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://lbg-common-proof.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const check=(name,fn)=>{const row={weaponId,level,name};report.rows.push(row);try{Object.assign(row,fn()||{});row.status='PASS';}catch(e){row.status='FAIL';row.error=e.message;report.failures.push(row);}};
 try{
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const snapshot=structuredClone(cases.find(c=>c.kind==='light-bowgun').inputSnapshots[0]);
 Object.assign(snapshot,{weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}});
 snapshot.combo.moves=[];snapshot.combo.lightBowgunState={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:powder,specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
 const apply=(skills=[],id=weaponId)=>{w.__snapshot={...snapshot,weaponId:String(id),charmCustom:{...snapshot.charmCustom,skills:skills.map(([name,level])=>({name,level,type:pack.data.skills.find(x=>x.name===name)?.kind==='weapon'?'weapon':'armor'}))}};w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();};
 const evaluate=()=>read('evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan})');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");

 const traces=r=>r.components.flatMap(c=>c.details?.trace||[]),totals=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);

 const ids=[13,66,82,133],omitted=r=>['normal','maximum'].flatMap(ch=>[...(r.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[]),...(r.channels?.[ch]?.diagnostics?.unappliedEffects||[])]);
 const rows=ids.map(id=>pack.data.skills.find(x=>x.id===id));
 const numeric=r=>['normal','maximum'].map(ch=>({value:r.channels[ch].metrics.comboTotalDamage.value,trace:traces(r.channels[ch])}));
 const snapshots=[];
 for(const skill of rows)for(let rank=1;rank<=3;rank++)check(`${skill.id} rank ${rank}`,()=>{
  apply();const b=evaluate(),inherent=read('calcState.total')[''+skill.name]||0;if(inherent>rank)return {coverage:'INTRINSIC_RANK_UNREACHABLE',inherent,requestedRank:rank};apply(inherent===rank?[]:[[skill.name,rank-inherent]]);assert.equal(read('calcState.total')[skill.name],rank,'exact requested rank applied');const before=read('buildSnapshot()'),input=read('__input'),r=evaluate();
  assert.equal(r.status,'OK',r.reason);const observed=omitted(r).map(x=>({id:x.skillId,reason:x.reason}));
  report.audit=report.audit||[];report.audit.push({weaponId,skillId:skill.id,rank,totals:totals(r),omissions:observed,context:read('({weapon:__input.weapon,stats:__stats,conditions:__cond,source:TechniqueDBEngine.get("light-bowgun",__plan.techniqueIds[0])})')});
  assert.deepEqual(numeric(r),numeric(b));assert.deepEqual(read('(()=>{const x=buildSnapshot();delete x.savedAt;return x})()'),((x)=>{const y={...x};delete y.savedAt;return y})(before));assert.deepEqual(read('__input'),input);
  for(const ch of ['normal','maximum']){const ts=traces(r.channels[ch]);assert.equal(ts.length,25);assert.ok(ts.every(t=>t.element===0));}
  assert.ok(!omitted(r).some(x=>ids.includes(Number(x.skillId))),'non-applicable effect marked unsupported');
  snapshots.push({skillId:skill.id,snapshot:before});
 });
 for(const pair of [[13,133],[66,82],[13,82],[66,133]])check('mixed '+pair.join('+'),()=>{
  apply([['ファーストショット',3],['フォースショット',3]]);const b=evaluate();
  apply(pair.map(id=>[rows.find(x=>x.id===id).name,3]).concat([['ファーストショット',3]]));const first=evaluate();
  apply([['ファーストショット',3]]);const firstBase=evaluate();assert.deepEqual(numeric(first),numeric(firstBase));assert.ok(!omitted(first).some(x=>ids.includes(Number(x.skillId))));
 });
 check('other unsupported effects remain disclosed',()=>{apply([['暗黒',1],['会心撃【属性】',3]]);const r=evaluate();assert.equal(r.status,'OK');assert.ok(omitted(r).some(x=>Number(x.skillId)===168));assert.ok(!omitted(r).some(x=>Number(x.skillId)===82));});
 for(const skill of rows)for(const [label,patch] of [
  ['id name conflict',`input.weapon.skills.push({skill:{id:82,name:${JSON.stringify(skill.id===82?'災禍転福':skill.name)}},level:1})`],
  ['duplicate build row',`input.skills.push(input.skills.find(x=>x[0]===${JSON.stringify(skill.name)}))`],
  ['missing plan',"delete input.stats.conditionalConditionPlan"],
  ['normal element',"input.stats.conditionalConditionPlan.normal.element=1"],
  ['maximum multiplier Infinity',"input.stats.conditionalConditionPlan.maximumElementComponents.normalMultiplier=Infinity"],
  ['maximum multiplier NaN',"input.stats.conditionalConditionPlan.maximumElementComponents.normalMultiplier=NaN"],
  ['maximum multiplier zero',"input.stats.conditionalConditionPlan.maximumElementComponents.normalMultiplier=0"],
  ['maximum element',"input.stats.conditionalConditionPlan.maximum.element=1"],
  ['mounted',"input.conditions={...input.conditions,mounted:true}"],
  ['unexpected source component',"const engine=input.techniqueDb;input.techniqueDb={get:(kind,id)=>{const t=engine.get(kind,id);return id===input.techniqueIds[0]?{...t,specialComponents:['AMMO_PHYSICAL','AMMO_ELEMENT']}:t}}"],
  ['wrong rank',`input.skills=input.skills.map(x=>x[0]===${JSON.stringify(skill.name)}?[x[0],4]:x)`],
  ['pending plan',"input.stats.conditionalConditionPlan.pending.push('UNKNOWN_TEST_EFFECT')"],
  ['wrong state',"input.lightBowgunState.ammoType='FIRE'"],
  ['positive weapon element',"input.stats.element=10;input.stats.conditionalConditionPlan.normal.element=10;input.stats.conditionalConditionPlan.maximum.element=10"],
 ])check(`${skill.id} negative ${label}`,()=>{apply([[skill.name,3]]);const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills),equipmentSkillsResolved:structuredClone(__input.equipmentSkillsResolved),lightBowgunState:structuredClone(__input.lightBowgunState)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);assert.notEqual(r.status,'OK');return {reason:r.reason};});
 for(const skill of rows.filter(x=>[13,133].includes(x.id)))for(const [label,patch] of [
  ['missing applied row',`input.stats.conditionalConditionPlan.applied=input.stats.conditionalConditionPlan.applied.filter(x=>x.skill!==${JSON.stringify(skill.name)})`],
  ['duplicate applied row',`input.stats.conditionalConditionPlan.applied.push(input.stats.conditionalConditionPlan.applied.find(x=>x.skill===${JSON.stringify(skill.name)}))`],
  ['wrong level',`input.stats.conditionalConditionPlan.applied.find(x=>x.skill===${JSON.stringify(skill.name)}).level=1`],
  ['wrong condition',`input.stats.conditionalConditionPlan.applied.find(x=>x.skill===${JSON.stringify(skill.name)}).condition='UNADOPTED'`],
  ['injected physical multiplier',`input.stats.conditionalConditionPlan.applied.find(x=>x.skill===${JSON.stringify(skill.name)}).attackMultiplier=2`],
 ])check(`${skill.id} plan negative ${label}`,()=>{apply([[skill.name,3]]);const r=read(`(()=>{const input={...__input,stats:structuredClone(__input.stats)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input)})()`);assert.notEqual(r.status,'OK');return {reason:r.reason};});
 for(const skill of rows)check(`${skill.id} legacy scope stays pending`,()=>{apply([[skill.name,3]],763);const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.notEqual(r.status,'OK');});
 check('snapshot reload keeps calculations',()=>{for(const id of ids){const s=snapshots.find(x=>x.skillId===id)?.snapshot;if(!s)continue;w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();const b=evaluate(),stored=read('buildSnapshot()');w.__snapshot=stored;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();assert.deepEqual(numeric(evaluate()),numeric(b));}});
 check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=boundFiles.every(f=>hash(path.join(root,f))===report.hashes[f]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
