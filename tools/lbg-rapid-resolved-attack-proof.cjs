'use strict';
// Offline source-reference proof only. Never installs getters or changes prototypes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const dbFile=path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'),snapshotFile=path.join(root,'tests/fixtures/comparison-session-inputs.json');
const pack=JSON.parse(fs.readFileSync(dbFile)),cases=JSON.parse(fs.readFileSync(snapshotFile)).cases;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const boundFiles=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-resolved-attack-proof.cjs','tests/lbg-rapid-resolved-attack.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const report={scope:'LBG_STANDARD_RAPID_RESOLVED_ATTACK_67_123_154',hashes:Object.fromEntries(boundFiles.map(f=>[f,hash(path.join(root,f))])),liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'))).digest('hex'),rows:[],failures:[]};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const selectedHp of ['FULL_HP','AT_OR_BELOW_30_PERCENT'])for(const [weaponId,level,powder='NONE'] of [[783,1],[763,2],[771,3],[763,3,'LEVEL_PLUS_ONE']]){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://lbg-common-proof.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const check=(name,fn)=>{const row={weaponId,level,selectedHp,name};report.rows.push(row);try{Object.assign(row,fn()||{});row.status='PASS';}catch(e){row.status='FAIL';row.error=e.message;report.failures.push(row);}};
 try{
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const snapshot=structuredClone(cases.find(c=>c.kind==='light-bowgun').inputSnapshots[0]);
 Object.assign(snapshot,{selectedHp,weaponId:String(weaponId),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}});
 snapshot.combo.moves=[];snapshot.combo.lightBowgunState={ammoType:'NORMAL',ammoLevel:level,shotMode:'RAPID',rapidReady:true,loadedRounds:0,contactPolicy:'ALL_FIVE',range:'CRITICAL',normalModeLevel:0,normalPowder:powder,specialMagazine:'NONE',magazineCapacity:4,shotOrdinal:1,fullMagazine:true};
 const apply=(skills=[],id=weaponId)=>{w.__snapshot={...snapshot,weaponId:String(id),charmCustom:{...snapshot.charmCustom,skills:skills.map(([name,level])=>({name,level,type:pack.data.skills.find(x=>x.name===name)?.kind==='weapon'?'weapon':'armor'}))}};w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();};
 const evaluate=()=>read('evaluateConsumerCombat({kind:__kind,moves:[],conditions:__cond,target:__target,plan:__plan})');
  const prepare=()=>w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,hbgState:__plan.conditions.hbgState,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};");

 const traces=r=>r.components.flatMap(c=>c.details?.trace||[]),totals=r=>['normal','maximum'].map(ch=>r.channels[ch].metrics.comboTotalDamage.value);


 const omitted=r=>['normal','maximum'].flatMap(ch=>[...(r.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[]),...(r.channels?.[ch]?.diagnostics?.unappliedEffects||[])]);
 apply();const baseline=evaluate(),base=read('__stats');assert.equal(baseline.status,'OK');
 const peakAdds=[0,3,6,10,15,20],resentAdds=[0,5,10,15,20,25],ambushMultipliers=[1,1,1,1] // Owner67 excluded; other attack modifiers retained
;
 function verify(r,a,p,q,{first=0,force=weaponId===783?1:0,staticAttack=false}={}){
  assert.equal(r.status,'OK',r.reason);assert.equal(r.evaluationPlan.selection,'STANDARD');
  assert.ok(!omitted(r).some(x=>[67,123,154].includes(Number(x.skillId))),'adopted or health-excluded effect was omitted');
  for(const ch of ['normal','maximum']){
   const ts=traces(r.channels[ch]);assert.equal(ts.length,25);let sum=0;
   for(let i=0;i<25;i++){
    const shot=Math.floor(i/5)+1,flat=selectedHp==='FULL_HP'?peakAdds[p]:(ch==='maximum'?resentAdds[q]:0),m=ch==='maximum'?ambushMultipliers[a]:1;
    const shotAttack=(shot===1?[0,5,10,15][first]:0)+(shot===4?[0,3,6,10][force]:0),shotAffinity=shot>=4?[0,8,10,12][force]:0;
    const attack=base.attackComponents.weaponBase*(staticAttack?1.04:base.attackComponents.normalMultiplier)*m+(staticAttack?9:base.attackComponents.normalFlat)+flat+shotAttack;
    const affinity=Math.min(100,base.affinity+shotAffinity),crit=1+affinity/100*.25,physical=attack*({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*crit;
    near(ts[i].attack,attack);near(ts[i].physical,physical);near(ts[i].affinity,affinity);assert.equal(ts[i].element,0);sum+=physical;
   }
   near(r.channels[ch].metrics.comboTotalDamage.value,sum);
   assert.equal(r.channels[ch].diagnostics.rapidAmmoSequence.liveGameVerification,'PENDING');
  }
 }
 const snapshotBefore=()=>read('buildSnapshotComparable(buildSnapshot())');
 for(let a=0;a<=3;a++)for(let p=0;p<=5;p++)for(let q=0;q<=5;q++)check(`ambush${a}-peak${p}-resent${q}`,()=>{
  const skills=[['急襲',a],['フルチャージ',p],['逆恨み',q]].filter(x=>x[1]>0);apply(skills);
  const actual=read('calcState.total');for(const [name,rank]of skills)assert.equal(actual[name],rank);
  const before=snapshotBefore(),input=read('__input'),r=evaluate();verify(r,a,p,q);
  assert.deepEqual(snapshotBefore(),before);assert.deepEqual(read('__input'),input);
  const plan=read('__stats.conditionalConditionPlan');
  if(p&&q){const loser=selectedHp==='FULL_HP'?'逆恨み':'フルチャージ',winner=loser==='逆恨み'?'フルチャージ':'逆恨み';assert.equal(plan.excluded.filter(x=>x.skill===loser).length,1);assert.equal(plan.applied.filter(x=>x.skill===winner).length,1);}
  return {normal:totals(r)[0],maximum:totals(r)[1],excluded:plan.excluded.map(x=>x.skill)};
 });
 for(const [name,a,p,q]of [['急襲',3,0,0],['逆恨み',0,0,5]])check('First and Force with '+name,()=>{apply([[name,name==='急襲'?3:5],['ファーストショット',3],['フォースショット',3]]);verify(evaluate(),a,p,q,{first:3,force:3});});
 check('static Attack Boost flat remains outside Ambush multiplier',()=>{apply([['\u653b\u6483',5],['\u6025\u8972',3],['\u9006\u6068\u307f',5]]);const actual=read('calcState.total');assert.equal(actual['\u653b\u6483'],5);const c=read('__stats.attackComponents');near(c.normalMultiplier,1.04);near(c.normalFlat,9);verify(evaluate(),3,0,5,{staticAttack:true});});
 for(const [label,patch]of [
  ['missing plan','delete input.stats.conditionalConditionPlan'],
  ['pending plan',"input.stats.conditionalConditionPlan.pending.push('UNADOPTED')"],
  ['missing excluded',"input.stats.conditionalConditionPlan.excluded=[]"],
  ['duplicate excluded',"input.stats.conditionalConditionPlan.excluded.push(input.stats.conditionalConditionPlan.excluded[0])"],
  ['wrong excluded condition',"input.stats.conditionalConditionPlan.excluded[0].condition='FAKE'"],
  ['injected excluded damage',"input.stats.conditionalConditionPlan.excluded[0].attackMultiplier=2"],
  ['altered adopted companion flat',"input.stats.conditionalConditionPlan.applied.find(x=>x.skill===(input.conditions.selectedHp==='FULL_HP'?'フルチャージ':'逆恨み')).attackAdd=999"],
  ['normal attack mismatch',"input.stats.conditionalConditionPlan.normal.attackTrue+=1"],
  ['maximum attack mismatch',"input.stats.conditionalConditionPlan.maximum.attackTrue+=1"],
  ['decomposition mismatch',"input.stats.conditionalConditionPlan.attackComponents.conditionalFlat+=1"],
  ['wrong rank',"input.skills=input.skills.map(x=>x[0]==='急襲'?[x[0],4]:x)"],
  ['duplicate input',"input.skills.push(['急襲',3])"],
  ['identity conflict',"input.weapon.skills.push({skill:{id:67,name:'逆恨み'},level:1})"],
  ['nonphysical component',"const engine=input.techniqueDb;input.techniqueDb={get:(kind,id)=>{const t=engine.get(kind,id);return id===input.techniqueIds[0]?{...t,specialComponents:['AMMO_PHYSICAL','AMMO_ELEMENT']}:t}}"],
  ['positive element',"input.stats.element=1;input.stats.conditionalConditionPlan.normal.element=1;input.stats.conditionalConditionPlan.maximum.element=1"],
 ])check('negative '+label,()=>{apply([['急襲',3],['逆恨み',5],['フルチャージ',5]]);const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);assert.notEqual(r.status,'OK');return {reason:r.reason};});
 for(const name of ['急襲','逆恨み'])check('single-trigger boundary '+name,()=>{apply();const baseline=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");apply([[name,1]]);const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");if(name==='急襲'){assert.equal(r.status,baseline.status);assert.equal(r.reason,baseline.reason);if(r.status==='OK')assert.deepEqual(totals(r),totals(baseline));}else assert.notEqual(r.status,'OK');return {status:r.status,reason:r.reason||null};});
 check('Dark remains disclosed and does not erase adopted skills',()=>{apply([['急襲',3],['逆恨み',5],['暗黒',1]]);const r=evaluate();verify(r,3,0,5);assert.ok(omitted(r).some(x=>Number(x.skillId)===168));});
 check('Dark full-health branch remains gated',()=>{apply([['暗黒',1],['フルチャージ',5]]);const r=read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)');assert.notEqual(r.status,'OK');});
 check('snapshot load preserves different A and B health plans',()=>{const saved=[];for(const skills of [[['急襲',3],['逆恨み',1],['フルチャージ',5]],[['急襲',1],['逆恨み',5],['フルチャージ',1]]]){apply(skills);saved.push({snapshot:read('buildSnapshot()'),totals:totals(evaluate())});}for(const s of saved){w.__snapshot=s.snapshot;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();assert.deepEqual(totals(evaluate()),s.totals);}});
 check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=boundFiles.every(f=>hash(path.join(root,f))===report.hashes[f]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
