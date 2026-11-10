'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {makePlan}=require('./skill-plan.cjs');
const {compareSkill}=require('./skill-contrast.cjs'),{isDeepStrictEqual}=require('node:util');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const expected=JSON.parse(fs.readFileSync('/harness/expected-inputs.json'));
function checkInputs(){for(const e of expected)assert.equal(hash(fs.readFileSync('/input/'+e.path)),e.sha256,e.path);for(const e of JSON.parse(fs.readFileSync('/harness/skill-sources/manifest.json')))assert.equal(hash(fs.readFileSync('/harness/skill-sources/'+e.path)),e.sha256,e.path);}
checkInputs();
const classification=JSON.parse(fs.readFileSync('/harness/skill-sources/classification.candidate.json')),raw=JSON.parse(fs.readFileSync('/harness/skill-sources/raw-skills.json')),dbBytes=fs.readFileSync('/input/normalized-data.json'),database=JSON.parse(dbBytes);
const plan=makePlan(classification,raw,database),smoke=process.argv.includes('--smoke'),prefix=smoke?'skill-smoke':'skill-scan';
const smokeKeys=['3:1:great-sword','72:5:great-sword','10:1:great-sword','50:1:great-sword','7:2:great-sword','7:2:switch-axe','140:1:light-bowgun','137:3:light-bowgun','25:2:great-sword','22:1:great-sword','99:1:great-sword','159:1:gunlance'];
const jobs=smoke?plan.jobs.filter(x=>smokeKeys.includes(x.key)):plan.jobs;
const count=cases=>({planned:cases.length,calculated:cases.filter(c=>c.status==='CALCULATED_ACCURACY_AND_APPLICABILITY_UNVERIFIED').length,uncalculated:cases.filter(c=>['PRODUCT_UNAVAILABLE_OR_INCOMPLETE','INPUT_SKILL_NOT_ESTABLISHED','EQUIPMENT_CONDITION_UNRESOLVED'].includes(c.status)).length,nonTargetWeapon:cases.filter(c=>c.status==='NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE').length,harnessFailures:cases.filter(c=>c.status==='HARNESS_FAILURE').length,independentlyVerified:0});
if(process.argv[2]!=='weapon'){
 const report={runId:crypto.randomUUID(),status:'RUNNING',scope:'CANDIDATE_EFFECTIVE_SKILL_RANKS_PUBLIC_CONSUMER_WITH_OBSERVED_ROUTE_CLOUD_LINUX',sourceCommit:require('./current-evidence.cjs').currentProvenance().sourceCommit,classificationSourceCommit:classification.sourceCommit,databaseSha256:hash(dbBytes),classificationApproved:false,smoke,skillCount:plan.skills.length,rawRankCount:plan.rankDispositions.length,targetSkillCount:plan.skills.filter(s=>s.category==='damage').length,targetEffectiveRankCount:plan.rankDispositions.filter(r=>r.disposition==='TARGET_CANDIDATE').length,rankDispositions:plan.rankDispositions,skills:plan.skills,weaponRuns:[],cases:[],boundaries:['Public adapter entry is not proof of Pipeline.evaluate execution. Per-case route counters distinguish pre-Pipeline returns.','Matched controls are isolated only for ordinary synthetic single-skill grants. Set/group armor comparisons remain confounded.','Candidate classification is used only to select tests, not promoted to approval.','Numeric output is not proof that the requested skill applied or that the formula is correct.','Ordinary skills use synthetic one-skill custom charms; availability of such a charm and a complete legal build are unverified.','Set/group ranks use unchanged database armor and original required piece counts. Other armor skills remain and confound isolated damage differences.','Default standard normal/maximum assumptions are preserved; conditional activation, element-appropriate weapons, all moves, synergies and game measurements are not established.','LBG/HBG standard elemental first-hit routes only. Normal-ammo ten-shot sequence is not implemented in the fixed product and is not tested.','Two calcBuild calls synchronize display fields; the separate saved-load and sharpness metadata failures remain.']};
 for(const weapon of plan.weapons.filter(w=>jobs.some(j=>j.kind===w.kind))){
  const args=[__filename,'weapon',weapon.kind,report.runId,...(smoke?['--smoke']:[])];const run=spawnSync(process.execPath,args,{encoding:'utf8',timeout:600000,maxBuffer:8*1024*1024});
  fs.writeFileSync('/output/'+prefix+'-'+weapon.kind+'.process.log',(run.stdout||'')+(run.stderr||''));
  const file='/output/'+prefix+'-'+weapon.kind+'.json';let result=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;
  if(result?.runId!==report.runId||run.error)result=null;
  if(result){report.cases.push(...result.cases);report.weaponRuns.push({kind:weapon.kind,exitCode:run.status,counts:result.counts,baselineRestored:result.baselineRestored,inputFilesUnchanged:result.inputFilesUnchanged,failure:result.failure||null});}
  else {const failure=run.error?.message||run.stderr||'No current output';report.weaponRuns.push({kind:weapon.kind,exitCode:run.status,failure});report.cases.push(...jobs.filter(j=>j.kind===weapon.kind).map(j=>({...j,status:'HARNESS_FAILURE',reason:failure})));}
  console.log(JSON.stringify(report.weaponRuns.at(-1)));
 }
 for(const c of report.cases){const diagnosis=require('./uncalculated-diagnostics.cjs').annotate(c);if(diagnosis)c.uncalculatedDiagnosis=diagnosis;}
 report.comparisonCounts=Object.fromEntries([...new Set(report.cases.map(c=>c.comparison?.decision||'NOT_COMPARED'))].map(k=>[k,report.cases.filter(c=>(c.comparison?.decision||'NOT_COMPARED')===k).length]));
 report.routeCounts=Object.fromEntries([...new Set(report.cases.map(c=>c.route?.status||'NOT_EVALUATED'))].map(k=>[k,report.cases.filter(c=>(c.route?.status||'NOT_EVALUATED')===k).length]));
 report.counts=count(report.cases);report.counts.notSelectedRawRanks=plan.rankDispositions.length-report.targetEffectiveRankCount;report.counts.unresolvedClassificationRanks=plan.rankDispositions.filter(r=>r.disposition==='UNVERIFIED_CLASSIFICATION').length;
 assert.equal(report.cases.length,jobs.length,'No planned case may silently disappear');checkInputs();report.inputFilesUnchanged=true;
 report.status=report.counts.harnessFailures||report.weaponRuns.some(r=>r.failure||!r.baselineRestored)?'SCAN_COMPLETED_WITH_HARNESS_FAILURES':report.counts.uncalculated?'SCAN_COMPLETED_WITH_UNCALCULATED_CASES':'SCAN_COMPLETED_NUMERIC_ACCURACY_UNVERIFIED';
 fs.writeFileSync('/output/'+prefix+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,counts:report.counts,comparisonCounts:report.comparisonCounts,routeCounts:report.routeCounts}));process.exitCode=report.counts.harnessFailures||report.weaponRuns.some(r=>r.failure||!r.baselineRestored)?2:0;
}else{
 const weapon=plan.weapons.find(w=>w.kind===process.argv[3]);assert.ok(weapon);const weaponJobs=jobs.filter(j=>j.kind===weapon.kind);
 const report={runId:process.argv[4],weapon,smoke,cases:[],jsdomErrors:[],consoleErrors:[],blockedFetches:[],baselineRestored:false,inputFilesUnchanged:false};
 const {JSDOM,VirtualConsole}=require('jsdom'),vc=new VirtualConsole();vc.on('jsdomError',e=>report.jsdomErrors.push(e.message));vc.on('error',(...args)=>report.consoleErrors.push(args.map(x=>String(x?.message||x)).join(' ')));let dom;
 (async()=>{
  try{
   dom=new JSDOM(require('/input/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://isolated-skill-scan.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=url=>{report.blockedFetches.push(String(url));return Promise.reject(Error('TEST_NETWORK_DISABLED'));};w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
   const w=dom.window,read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
   if(w.__localDBReady)await w.__localDBReady;
   assert.equal(typeof w.MHWRealOneHitBrowserAdapter?.evaluateCurrent,'function');assert.equal(typeof w.HimmelRealOneHitPipeline,'function');
   // Observation-only forwarding wrappers, following the independent v4 review.
   // Original source files, arguments and return values are not changed.
   const routeCounts={adapterCalls:0,pipelineConstructed:0,pipelineEvaluateCalls:0};
   const originalAdapter=w.MHWRealOneHitBrowserAdapter;
   w.MHWRealOneHitBrowserAdapter={...originalAdapter,evaluateCurrent(...args){routeCounts.adapterCalls++;return originalAdapter.evaluateCurrent(...args);}};
   const originalPipeline=w.HimmelRealOneHitPipeline;
   w.HimmelRealOneHitPipeline=function(...args){routeCounts.pipelineConstructed++;const instance=originalPipeline(...args);return {...instance,evaluate(...values){routeCounts.pipelineEvaluateCalls++;return instance.evaluate(...values);}};};

   w.__testData=JSON.parse(dbBytes);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
   w.eval(`weaponKind.value=${JSON.stringify(weapon.uiKind)};renderWeapon();weapon.value=${JSON.stringify(String(weapon.id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
   const empty=()=>w.eval("build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();");
   const evaluate=()=>{const before={...routeCounts};w.calcBuild();w.calcBuild();const actual=read('({skills:calcState.total,activeBonusEffects:calcState.stats.activeBonusEffects,stats:{attackTrue:calcState.stats.attackTrue,affinity:calcState.stats.affinity,maxAffinity:calcState.stats.maxAffinity,element:calcState.stats.element,elementType:calcState.stats.elementType},result:calcState.realOneHit,controlSnapshot:buildSnapshotComparable(buildSnapshot()),controlConditions:compareStep5Snapshot()})');actual.route=Object.fromEntries(Object.keys(before).map(k=>[k,routeCounts[k]-before[k]]));actual.route.status=actual.route.pipelineEvaluateCalls?'PIPELINE_EVALUATE_REACHED':actual.route.adapterCalls?'ADAPTER_ONLY_PRE_PIPELINE_RETURN':'NO_PUBLIC_ENTRY_OBSERVED';return actual;};
   const controlContext=(actual,job)=>{
    const snapshot=JSON.parse(JSON.stringify(actual.controlSnapshot));snapshot.charmCustom.skills=snapshot.charmCustom.skills.filter(x=>x.name&&x.name!==job.name);
    const skills={...actual.skills};delete skills[job.name];
    if(!actual.controlConditions)return null;
    const conditions=JSON.parse(JSON.stringify(actual.controlConditions));
    // Read actual common UI inputs directly. Serialized result keys have different
    // nested formats for bowguns/CB and are not the control-input contract.
    for(const k of ['attack','aff','elem','cb','eCrit'])delete conditions[k];
    return {snapshot,otherSkills:skills,activeBonusEffects:actual.activeBonusEffects,conditions,evaluationPlan:actual.result.evaluationPlan??null};
   };
   const summary=actual=>Object.fromEntries(['normal','maximum'].map(channel=>{const c=actual.result.channels?.[channel];return [channel,{status:c?.metrics?.comboTotalDamage?.status??'unavailable',value:c?.metrics?.comboTotalDamage?.value??null,executionStatus:c?.execution?.status??'unavailable',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??null,issues:c?.issues??[],unavailableComponents:(c?.components||[]).filter(x=>x.status!=='available'),diagnostics:c?.diagnostics??[],effectPlan:c?.effectPlan??null}];}));
   empty();const baseline=evaluate();report.baseline={...baseline,channels:summary(baseline)};delete report.baseline.result;
   const memoryDBHash=hash(Buffer.from(w.JSON.stringify(w.__testData)));const initialSaved=read('savedBuildMap()');
   // Selection relies on actual original skill-id membership, not guessed labels.
   const armorFor=job=>{
    const rows=database.armor.filter(a=>(a.skills||[]).some(g=>g.skill?.id===job.skillId)||database.sets.some(s=>s.id===a.armorSet?.id&&[s.setBonusSkill,s.groupBonusSkill].flat().filter(Boolean).some(sk=>sk.id===job.skillId))).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);
    const distinct=[];for(const a of rows)if(!distinct.some(b=>b.kind===a.kind))distinct.push(a);
    return distinct.slice(0,job.requiredPieces);
   };
   for(const job of weaponJobs){
    const rec={...job,status:'PENDING',numericAccuracyVerified:false,skillEffectValidated:false};report.cases.push(rec);
    if(job.applicability==='NON_TARGET_WEAPON_BY_EXPLICIT_SOURCE'){rec.status=job.applicability;rec.reason=job.applicabilityReason;continue;}
    try{
     empty();
     if(job.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES'){
      const armor=armorFor(job);rec.armor=armor.map(a=>({id:a.id,name:a.name,kind:a.kind}));
      if(!Number.isInteger(job.requiredPieces)||armor.length!==job.requiredPieces){rec.status='EQUIPMENT_CONDITION_UNRESOLVED';rec.reason='Original required piece count cannot be satisfied with distinct armor slots in the fixed DB';continue;}
      w.__testArmorIds=armor.map(a=>a.id);w.eval('for(const id of window.__testArmorIds){const a=DB.armor.find(a=>a.id===id);if(!a)throw Error("MISSING_TEST_ARMOR");build.armor[a.kind]=a;}');
      rec.damageDeltaMeaning='Not attributable to this skill alone: unchanged real armor carries other skills and resistance.';
     }else{
      w.__testGrant={name:job.name,level:job.level,type:job.skillKind==='weapon'?'weapon':'armor'};w.eval('build.charmCustom.skills=[window.__testGrant];normalizeCharm();');
     }
     const actual=evaluate();rec.route=actual.route;rec.skills=actual.skills;rec.activeBonusEffects=actual.activeBonusEffects;rec.stats=actual.stats;rec.channels=summary(actual);rec.productStatus=actual.result.status;rec.reason=actual.result.reason||null;rec.diagnostics=actual.result.diagnostics;rec.evaluationPlan=actual.result.evaluationPlan;rec.conditionKey=actual.result.conditionKey??null;
     rec.inputGrantObserved=job.equipmentRoute==='REAL_DATABASE_ARMOR_PIECES'?actual.activeBonusEffects.some(e=>e.bonusSkillId===job.skillId&&e.rankLevel===job.level&&e.count>=job.requiredPieces):Number(actual.skills[job.name])===job.level;
     const numeric=actual.result.status==='OK'&&Object.values(rec.channels).every(c=>c.status==='available'&&Number.isFinite(c.value)&&c.executionStatus==='complete');rec.numericOutputAvailable=numeric;
     rec.status=!rec.inputGrantObserved?'INPUT_SKILL_NOT_ESTABLISHED':numeric?'CALCULATED_ACCURACY_AND_APPLICABILITY_UNVERIFIED':'PRODUCT_UNAVAILABLE_OR_INCOMPLETE';
     if(!rec.inputGrantObserved)rec.reason='Requested skill/rank was not observed in aggregate skills or exact active bonus rank; returned damage cannot count as that skill test.';
     const baselineContext=controlContext(baseline,job),actualContext=controlContext(actual,job);
     rec.matchedControl={reference:'weapon baseline in this output file',targetSkillAbsent:Number(baseline.skills[job.name]||0)===0,sameContext:baselineContext!==null&&actualContext!==null&&isDeepStrictEqual(baselineContext,actualContext),controlWeaponId:weapon.id,heldInputs:'Same weapon, armor, other skills, target, action plan and conditions, excluding skill-derived display outputs attack/aff/elem/cb/eCrit',differentTopLevelContextKeys:baselineContext&&actualContext?Object.keys(baselineContext).filter(k=>!isDeepStrictEqual(baselineContext[k],actualContext[k])):null};
     rec.comparison=compareSkill(job,report.baseline,rec,{sameContext:rec.matchedControl.sameContext&&rec.matchedControl.targetSkillAbsent,inputGrantObserved:rec.inputGrantObserved});
     if(numeric&&job.equipmentRoute!=='REAL_DATABASE_ARMOR_PIECES')rec.observedDeltaFromNoSkill=Object.fromEntries(['normal','maximum'].map(c=>[c,rec.channels[c].value-report.baseline.channels[c].value]));
     if(!numeric&&!rec.reason)rec.reason=[...new Set(Object.values(rec.channels).flatMap(c=>[c.reason,...c.unavailableComponents.map(x=>x.reason)]).filter(Boolean))].join('; ')||'Product returned no complete numeric result; see diagnostics.';
    }catch(error){rec.status='HARNESS_FAILURE';rec.reason=error.stack;}
   }
   empty();const restored=evaluate();assert.deepEqual(restored,baseline,'Baseline numeric result and metadata must return after scan');report.baselineRestored=true;
   assert.deepEqual(read('savedBuildMap()'),initialSaved,'Scan must not modify even test-only saved builds');report.savedDataUnchanged=true;
   assert.equal(hash(Buffer.from(w.JSON.stringify(w.__testData))),memoryDBHash,'In-memory source DB must not change after initialization');report.memorySourceUnchanged=true;
   assert.deepEqual(report.jsdomErrors,[]);checkInputs();report.inputFilesUnchanged=true;
  }catch(error){report.failure=error.stack;}
  finally{
   if(dom)dom.window.close();
   const present=new Set(report.cases.map(x=>x.key));for(const job of weaponJobs)if(!present.has(job.key))report.cases.push({...job,status:'HARNESS_FAILURE',reason:report.failure||'Interrupted before case execution'});
   report.counts=count(report.cases);fs.writeFileSync('/output/'+prefix+'-'+weapon.kind+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({kind:weapon.kind,counts:report.counts,failure:report.failure||null}));process.exitCode=report.failure||report.counts.harnessFailures?2:0;
  }
 })().catch(error=>{console.error(error);process.exitCode=2;});
}
