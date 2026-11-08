'use strict';
const path=require('node:path');
const work=path.resolve(__dirname,'..'),outputDir=path.resolve(process.argv[5]||'.');
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const dependencyContract=JSON.parse(fs.readFileSync(path.resolve(work,'../fixtures-contract.json')));
for(const e of dependencyContract.fixtureHarnessFiles)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(work,'harness',e.path))).digest('hex'),e.sha256,'Fixture harness mismatch: '+e.path);
for(const e of dependencyContract.runtimeFiles)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(work,'..',e.destination))).digest('hex'),e.sha256,'Runtime mismatch: '+e.destination);
require(path.resolve(work,'../verify-inputs.cjs')).verifyPreparedInputs(work,dependencyContract);
const {makeGlAffinityPlan}=require('./gl-affinity-plan.cjs');
const read=p=>JSON.parse(fs.readFileSync(p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex'),tolerance=1e-9;
function checkInputs(){for(const e of read(path.join(work,'harness/expected-inputs.json')))assert.equal(hash(fs.readFileSync(path.join(work,'input/')+e.path)),e.sha256,e.path);for(const e of read(path.join(work,'harness/skill-sources/manifest.json')))assert.equal(hash(fs.readFileSync(path.join(work,'harness/skill-sources/')+e.path)),e.sha256,e.path);}
checkInputs();const bytes=fs.readFileSync(path.join(work,'input/normalized-data.json')),db=JSON.parse(bytes),cl=read(path.join(work,'harness/skill-sources/classification.candidate.json')),raw=read(path.join(work,'harness/skill-sources/raw-skills.json'));
const smoke=process.argv.includes('--smoke'),prefix=smoke?'gl-affinity-smoke':'gl-affinity',plan=makeGlAffinityPlan(db,cl,raw,{smoke});
const mixedIds=['GL_SLAM','GL_SWEEP','GL_WYRMSTAKE_FULL_BURST','GL_MULTI_WYRMSTAKE_FULL_BURST'],bodyIds=['GL_SLAM','GL_SWEEP'];
assert.equal(process.argv[2],'case','CASE_MODE_REQUIRED');
assert.ok(process.argv[4],'RUN_ID_REQUIRED');
assert.ok(process.argv[5],'OUTPUT_DIRECTORY_REQUIRED');
{
 const job=plan.cases.find(c=>c.key===process.argv[3]);assert.ok(job);const report={...job,runId:process.argv[4],status:'PENDING',numericAccuracyVerified:false,jsdomErrors:[],consoleErrors:[],blockedFetches:[]};const {JSDOM,VirtualConsole}=require('jsdom'),vc=new VirtualConsole();vc.on('jsdomError',e=>report.jsdomErrors.push(e.message));vc.on('error',(...args)=>report.consoleErrors.push(args.map(x=>String(x?.message||x)).join(' ')));let dom;
 (async()=>{try{
  dom=new JSDOM(require(path.join(work,'input/tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://isolated-gl-affinity.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=url=>{report.blockedFetches.push(String(url));return Promise.reject(Error('TEST_NETWORK_DISABLED'));};w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
  const w=dom.window,get=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));if(w.__localDBReady)await w.__localDBReady;
  const counts={adapterCalls:0,pipelineEvaluateCalls:0},adapter=w.MHWRealOneHitBrowserAdapter,factory=w.HimmelRealOneHitPipeline;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(...args){counts.adapterCalls++;return adapter.evaluateCurrent(...args);}};w.HimmelRealOneHitPipeline=function(...args){const p=factory(...args);return {...p,evaluate(...args){counts.pipelineEvaluateCalls++;return p.evaluate(...args);}};};
  w.__testData=JSON.parse(bytes);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');const memoryHash=hash(Buffer.from(w.JSON.stringify(w.__testData))),savedBefore=get('savedBuildMap()');
  const empty=()=>w.eval('build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();');empty();
  w.eval(`weaponKind.value='gunlance';renderWeapon();weapon.value=${JSON.stringify(String(plan.weapon.id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=${JSON.stringify(job.route==='EXPLICIT_SLAM_SWEEP'?bodyIds.map(id=>({techniqueId:'canonical:'+id})):[])};restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
  const calc=()=>{const start={...counts};w.calcBuild();w.calcBuild();const x=get('({weapon:selectedWeapon(),skills:calcState.total,stats:calcState.stats,conditions:compareStep5Snapshot(),snapshot:buildSnapshotComparable(buildSnapshot()),result:calcState.realOneHit})');x.routeCalls=Object.fromEntries(Object.keys(counts).map(k=>[k,counts[k]-start[k]]));return x;};
  const baseline=calc();report.baseline=baseline;assert.ok(baseline.routeCalls.pipelineEvaluateCalls>0);assert.equal(baseline.weapon.id,315);
  w.__armorIds=job.armorIds;w.__grants=job.grants.map(({id,...grant})=>grant);w.eval('for(const id of window.__armorIds){const a=DB.armor.find(a=>a.id===id);if(!a)throw Error("Missing armor");build.armor[a.kind]=a;}build.charmCustom.skills=window.__grants;normalizeCharm();');
  const active=calc();report.active=active;assert.ok(active.routeCalls.pipelineEvaluateCalls>0);if(job.sourceType!=='DEFENSIVE_CONVERSION_NEGATIVE')assert.deepEqual(active.result.evaluationPlan?.techniqueIds,job.route==='STANDARD_MIXED'?mixedIds:bodyIds);assert.deepEqual(active.weapon,baseline.weapon);
  for(const grant of job.grants)assert.equal(active.skills[grant.name],grant.level);
  if(job.originalEvidence){assert.deepEqual(active.skills,job.originalEvidence.observedSkills);assert.deepEqual(active.stats.activeBonusEffects,job.originalEvidence.activeBonusEffects);assert.deepEqual(Object.fromEntries(Object.keys(job.originalEvidence.observedStats).map(k=>[k,active.stats[k]])),job.originalEvidence.observedStats);report.originalFixtureSkillsAndBonusesMatch=true;}
  const ctx=x=>{const conditions=JSON.parse(JSON.stringify(x.conditions));for(const k of ['attack','aff','elem','cb','eCrit'])delete conditions[k];const snapshot=JSON.parse(JSON.stringify(x.snapshot));snapshot.charmCustom.skills=snapshot.charmCustom.skills.filter(s=>s.name&&!job.grants.some(g=>g.name===s.name));return {conditions,snapshot};};
  if(job.matchedNoSkillControlPossible){assert.deepEqual(ctx(active),ctx(baseline));const others={...active.skills};for(const g of job.grants)delete others[g.name];assert.deepEqual(others,baseline.skills);report.matchedNoTargetControl=true;}else{report.matchedNoTargetControl=false;report.baselineMeaning='Unarmored diagnostic reference only. Armor, all co-skills and bonuses differ. Do not attribute its delta to the target series.';}
  const summarize=c=>{
   const all=c?.components||[],cut=all.filter(p=>p.coefficientUnit==='MV'),element=all.filter(p=>p.coefficientUnit==='ELEMENT_MODIFIER'),shell=all.filter(p=>p.coefficientUnit==='SHELLING');
   const details=parts=>({count:parts.length,available:parts.filter(p=>p.status==='available'&&Number.isFinite(p.value)).length,unavailable:parts.filter(p=>p.status!=='available'),sum:parts.length&&parts.every(p=>p.status==='available'&&Number.isFinite(p.value))?parts.reduce((n,p)=>n+p.value,0):null,components:parts.map(p=>({id:p.id,status:p.status,value:p.value??null,reason:p.reason??null,coefficientUnit:p.coefficientUnit,techniqueId:p.techniqueId,details:p.details??null}))});
   return {execution:c?.execution??null,total:c?.metrics?.comboTotalDamage??null,cutting:details(cut),element:details(element),shelling:details(shell),otherComponents:all.filter(p=>!['MV','ELEMENT_MODIFIER','SHELLING'].includes(p.coefficientUnit)),diagnostics:c?.diagnostics??null};
  };
  report.componentComparison={normal:{},maximum:{}};
  const extractBlockers=c=>[...new Set(c.shelling.unavailable.flatMap(p=>String(p.reason||'').startsWith('GL_TARGET:UNREVIEWED_MODIFIER:')?p.reason.slice('GL_TARGET:UNREVIEWED_MODIFIER:'.length).split('/'):[]))].sort();
  const wexGrant=job.grants.find(g=>g.id===57);
  let gate=true,cutNormalConditionObserved=true,cutMaximumIncrease=true,shellUnchanged=true,bodyOnly=true;
  for(const ch of ['normal','maximum']){
   const before=summarize(baseline.result.channels?.[ch]),after=summarize(active.result.channels?.[ch]);
   const aligned=before.cutting.count===after.cutting.count&&before.cutting.count>0&&before.cutting.components.every((p,i)=>p.id===after.cutting.components[i].id);
   const cuttingDelta=aligned&&before.cutting.sum!==null&&after.cutting.sum!==null?after.cutting.sum-before.cutting.sum:null;
   const shellAligned=before.shelling.count>0&&before.shelling.count===after.shelling.count&&before.shelling.components.every((p,i)=>p.id===after.shelling.components[i].id);
   const shellComparisonAvailable=shellAligned&&before.shelling.sum!==null&&after.shelling.sum!==null;
   const shellDelta=shellComparisonAvailable?after.shelling.sum-before.shelling.sum:null;
   const blocked=extractBlockers(after);
   report.componentComparison[ch]={before,after,cuttingAligned:aligned,cuttingDelta,shellComparisonAvailable,shellDelta,shellUnchanged:shellComparisonAvailable?Math.abs(shellDelta)<=tolerance:null,blockedModifiers:blocked};
   gate=gate&&after.shelling.count>0&&after.shelling.available===0&&JSON.stringify(blocked)===JSON.stringify([...job.blockedModifiers].sort())&&after.total?.status==='unavailable'&&after.cutting.count>0&&after.cutting.available===after.cutting.count;
   if(ch==='normal')cutNormalConditionObserved=cutNormalConditionObserved&&cuttingDelta!==null&&(wexGrant?cuttingDelta>tolerance:Math.abs(cuttingDelta)<=tolerance);
   if(ch==='maximum')cutMaximumIncrease=cutMaximumIncrease&&cuttingDelta!==null&&cuttingDelta>tolerance;
   shellUnchanged=shellUnchanged&&shellComparisonAvailable&&Math.abs(shellDelta)<=tolerance;
   bodyOnly=bodyOnly&&after.shelling.count===0&&after.total?.status==='available'&&after.execution?.status==='complete';
  }
  report.conditionEvidence={normalAffinity:active.stats.affinity,maximumAffinity:active.stats.maxAffinity,baselineNormalAffinity:baseline.stats.affinity,baselineMaximumAffinity:baseline.stats.maxAffinity,physicalHitzone:Number(active.conditions.hz),target:active.result.evaluationPlan?.target,techniqueIds:active.result.evaluationPlan?.techniqueIds,normal:'Weakness Exploit is evaluated per hit from original target hitzone and actual wound state. Latent Power is not active in the normal channel.',maximum:'Display maximum includes potential wound affinity, but damage removes that display contribution and reapplies actual per-hit Weakness Exploit. Latent Power maximum assumes activation; trigger timing is not observed.',source:'index.html:2591-2601,2607-2621; hope-hammer-browser-adapter.js:758-775',hitAffinityEffects:Object.fromEntries(['normal','maximum'].map(ch=>[ch,(active.result.channels?.[ch]?.effectPlan?.effects||[]).filter(e=>e.stage==='affinity').map(e=>({id:e.id,target:e.target,amount:e.amount,componentIds:e.componentIds??null,wounded:e.wounded??null,damageType:e.damageType??null,source:e.source}))])),explicitState:active.conditions,coactivatedSkills:active.skills,activeBonuses:active.stats.activeBonusEffects};
  report.reproducedOriginalGate=!!job.originalEvidence&&gate;
  if(job.sourceType==='ORIGINAL_COACTIVATED_ARMOR')report.status=gate?'ORIGINAL_ARMOR_COACTIVATED_GATE_REPRODUCED':'REVIEW_REQUIRED';
  else if(job.sourceType==='EXISTING_ID99_EXCEPTION_CONTROL')report.status=cutNormalConditionObserved&&cutMaximumIncrease&&shellUnchanged?'EXISTING_ID99_CUTTING_INCREASE_SHELL_UNCHANGED':'REVIEW_REQUIRED';
  else if(job.route==='EXPLICIT_SLAM_SWEEP')report.status=cutNormalConditionObserved&&cutMaximumIncrease&&bodyOnly?'EXPLICIT_BODY_ONLY_AFFINITY_INCREASE_OBSERVED':'REVIEW_REQUIRED';
  else report.status=gate&&cutNormalConditionObserved&&cutMaximumIncrease?(job.sourceType==='ISOLATED_COACTIVATED_AFFINITY_PAIR_NOT_ARMOR_EQUIVALENT'?'ISOLATED_AFFINITY_PAIR_GATE_REPRODUCED':'CUTTING_INCREASE_SHELL_UNAVAILABLE_REPRODUCED'):'REVIEW_REQUIRED';
  empty();assert.deepEqual(calc(),baseline,'Original empty baseline must restore');report.baselineRestored=true;assert.deepEqual(get('savedBuildMap()'),savedBefore);report.savedDataUnchanged=true;assert.equal(hash(Buffer.from(w.JSON.stringify(w.__testData))),memoryHash);report.memorySourceUnchanged=true;assert.deepEqual(report.jsdomErrors,[]);checkInputs();report.inputFilesUnchanged=true;report.diagnosticStatus=report.status;report.status='COLLECTED';
 }catch(error){report.status='HARNESS_FAILURE';report.reason=error.stack;}finally{if(dom)dom.window.close();fs.writeFileSync(path.join(outputDir,prefix+'-'+job.key.replaceAll(':','-')+'.json'),JSON.stringify(report,null,2)+'\n');process.exitCode=report.status==='COLLECTED'?0:2;}})().catch(error=>{console.error(error);process.exitCode=2;});
}
