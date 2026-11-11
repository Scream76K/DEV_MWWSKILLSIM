'use strict';
// Offline source-reference proof only. Never installs getters or changes prototypes.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.env.PRODUCT_ROOT||process.argv[2]||path.join(__dirname,'..'));
const dbFile=path.join(root,'docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json'),snapshotFile=path.join(root,'tests/fixtures/comparison-session-inputs.json');
const pack=JSON.parse(fs.readFileSync(dbFile)),cases=JSON.parse(fs.readFileSync(snapshotFile)).cases;
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const boundFiles=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs','tools/lbg-rapid-heroics-proof.cjs','tests/lbg-rapid-heroics.test.cjs','docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json','tests/fixtures/comparison-session-inputs.json'];
const report={scope:'LBG_STANDARD_RAPID_HEROICS_HEALTH_BRANCH',hashes:Object.fromEntries(boundFiles.map(f=>[f,hash(path.join(root,f))])),liveGameVerification:'PENDING',sourceVersion:'UNVERIFIED',adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'))).digest('hex'),rows:[],failures:[]};
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


 const omitted=r=>['normal','maximum'].flatMap(ch=>[...(r.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[]),...(r.channels?.[ch]?.diagnostics?.unappliedEffects||[])]);
 apply();const baseline=evaluate(),base=read('__stats');assert.equal(baseline.status,'OK');

 const peakAdds=[0,3,6,10,15,20],resentAdds=[0,5,10,15,20,25],heroics=[1,1,1.05,1.05,1.1,1.3];
 const snapshotBefore=()=>read('buildSnapshotComparable(buildSnapshot())');
 function verify(r,h,p,q,{ambush=1,staticAttack=false,first=0,force=weaponId===783?1:0}={}){
  assert.equal(r.status,'OK',r.reason);assert.equal(r.evaluationPlan.selection,'STANDARD');
  assert.ok(!omitted(r).some(x=>[67,87,123,154].includes(Number(x.skillId))),'adopted health effect omitted');
  const b=base.attackComponents.weaponBase*(staticAttack?1.04:base.attackComponents.normalMultiplier),flat=staticAttack?9:base.attackComponents.normalFlat;
  const full=b*ambush+flat+peakAdds[p],low=b*ambush*heroics[h]+flat+resentAdds[q];
  const branch=h>1&&p>0,maximum=branch?Math.max(full,low):b*ambush*heroics[h]+flat+Math.max(peakAdds[p],resentAdds[q]);
  for(const ch of ['normal','maximum']){
   const ts=traces(r.channels[ch]);assert.equal(ts.length,25);let sum=0;
   for(let i=0;i<25;i++){
    const shot=Math.floor(i/5)+1,shotAttack=(shot===1?[0,5,10,15][first]:0)+(shot===4?[0,3,6,10][force]:0),shotAffinity=shot>=4?[0,8,10,12][force]:0;
    const attack=(ch==='normal'?b+flat:maximum)+shotAttack,affinity=Math.min(100,base.affinity+shotAffinity),physical=attack*({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*(1+affinity/100*.25);
    near(ts[i].attack,attack);near(ts[i].physical,physical);near(ts[i].affinity,affinity);assert.equal(ts[i].element,0);sum+=physical;
   }
   near(r.channels[ch].metrics.comboTotalDamage.value,sum);
  }
  const comparison=r.channels.maximum.diagnostics.healthBranchComparison;
  if(branch){assert.equal(comparison.status,'RESOLVED');assert.equal(comparison.policy,'WHOLE_ROUTE_TOTAL_NOT_COMPONENT_MAXIMA');assert.equal(comparison.selectedState,low>full?'LOW_HEALTH_WITH_RECOVERABLE_DAMAGE':'FULL_HEALTH');assert.equal(comparison.branches.length,2);for(const [i,raw]of [full,low].entries()){
   let sum=0;for(let shot=1;shot<=5;shot++){const add=(shot===1?[0,5,10,15][first]:0)+(shot===4?[0,3,6,10][force]:0),affinity=Math.min(100,base.affinity+(shot>=4?[0,8,10,12][force]:0));sum+=5*(raw+add)*({1:17,2:23.8,3:30.6}[level]/100)*.7*.65*(1+affinity/100*.25);}near(comparison.branches[i].value,sum);
  }}else assert.equal(comparison,undefined);
 }
 for(let h=1;h<=5;h++)for(let p=0;p<=5;p++)for(let q=0;q<=5;q++)check(`heroics${h}-peak${p}-resent${q}`,()=>{
  const skills=[['火事場力',h],['フルチャージ',p],['逆恨み',q]].filter(x=>x[1]>0);apply(skills);const actual=read('calcState.total');for(const [name,rank]of skills)assert.equal(actual[name],rank);
  const before=snapshotBefore(),input=read('__input'),r=evaluate();verify(r,h,p,q);assert.deepEqual(snapshotBefore(),before);assert.deepEqual(read('__input'),input);return {normal:totals(r)[0],maximum:totals(r)[1],selected:r.channels.maximum.diagnostics.healthBranchComparison?.selectedState};
 });
 for(const h of [2,5])for(const [label,skills,p,options]of [
  ['static flat',[['攻撃',5],['火事場力',h],['フルチャージ',5]],5,{staticAttack:true}],
  ['Ambush',[['急襲',3],['火事場力',h],['フルチャージ',5]],5,{ambush:1}],
  ['First and Force',[['火事場力',h],['ファーストショット',3],['フォースショット',3]],0,{first:3,force:3}],
 ])check(label+' order with Heroics '+h,()=>{apply(skills);const actual=read('calcState.total');for(const [name,rank]of skills)assert.equal(actual[name],rank,name);verify(evaluate(),h,p,0,options);});
 for(const [label,patch]of [
 ['missing plan','delete input.stats.conditionalConditionPlan'],
 ['extra pending',"input.stats.conditionalConditionPlan.pending.push('UNADOPTED')"],
 ['removed pending',"input.stats.conditionalConditionPlan.pending=[]"],
 ['duplicate pending',"input.stats.conditionalConditionPlan.pending.push(input.stats.conditionalConditionPlan.pending[0])"],
 ['wrong branch pending',"input.stats.conditionalConditionPlan.pending=['暗黒:DARK_STANDARD_SEQUENCE_REQUIRED']"],
 ['missing Heroics row',"input.stats.conditionalConditionPlan.applied=input.stats.conditionalConditionPlan.applied.filter(x=>x.skill!=='火事場力')"],
 ['wrong multiplier',"input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='火事場力').attackMultiplier=2"],
 ['wrong health threshold',"input.stats.conditionalConditionPlan.applied.find(x=>x.skill==='火事場力').healthThresholdPercent=100"],
 ['wrong maximum',"input.stats.conditionalConditionPlan.maximum.attackTrue+=1"],
 ['wrong rank',"input.skills=input.skills.map(x=>x[0]==='火事場力'?[x[0],6]:x)"],
 ['duplicate skill',"input.skills.push(['火事場力',5])"],
 ['identity collision',"input.weapon.skills.push({skill:{id:87,name:'急襲'},level:1})"],
 ['nonphysical source',"const engine=input.techniqueDb;input.techniqueDb={get:(kind,id)=>{const t=engine.get(kind,id);return id===input.techniqueIds[0]?{...t,specialComponents:['AMMO_PHYSICAL','AMMO_ELEMENT']}:t}}"],
 ['positive element',"input.stats.element=1;input.stats.conditionalConditionPlan.normal.element=1;input.stats.conditionalConditionPlan.maximum.element=1"],
 ])check('negative '+label,()=>{apply([['火事場力',5],['フルチャージ',5],['逆恨み',5]]);const r=read(`(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills)};${patch};return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input);})()`);assert.notEqual(r.status,'OK');return {reason:r.reason};});
 check('old single trigger remains gated',()=>{apply([['火事場力',5]]);const r=read("MHWRealOneHitBrowserAdapter.evaluateCurrent({...__input,lightBowgunState:{...__input.lightBowgunState,loadedRounds:1}})");assert.notEqual(r.status,'OK');});
 check('Dark remains disclosed without erasing Heroics',()=>{apply([['火事場力',5],['暗黒',1]]);const r=evaluate();verify(r,5,0,0);assert.ok(omitted(r).some(x=>Number(x.skillId)===168));});
 check('snapshot A and B keep opposite health winners',()=>{const saved=[];for(const [h,p,q]of [[2,5,0],[5,1,5]]){apply([['火事場力',h],['フルチャージ',p],['逆恨み',q]].filter(x=>x[1]));const r=evaluate();verify(r,h,p,q);saved.push({snapshot:read('buildSnapshot()'),totals:totals(r)});}for(const s of saved){w.__snapshot=s.snapshot;w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');prepare();assert.deepEqual(totals(evaluate()),s.totals);}});
 check('no browser script errors',()=>assert.deepEqual(errors,[]));
 }catch(e){report.failures.push({weaponId,error:e.stack});}finally{w.close();}
}
report.runtimeUnchanged=boundFiles.every(f=>hash(path.join(root,f))===report.hashes[f]);if(!report.runtimeUnchanged)report.failures.push({error:'BOUND_FILES_CHANGED_DURING_PROOF'});
console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
