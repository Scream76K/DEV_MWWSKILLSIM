'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const checks=JSON.parse(fs.readFileSync('/harness/expected-inputs.json'));
function verifyInputs(){for(const e of checks)assert.equal(hash(fs.readFileSync('/input/'+e.path)),e.sha256,e.path);}
verifyInputs();
const databaseBytes=fs.readFileSync('/input/normalized-data.json'),database=JSON.parse(databaseBytes);
const kinds=['great-sword','long-sword','sword-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'];
const selected=kinds.map(kind=>{
 const rows=database.weapons.filter(w=>w.kind===kind).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);
 assert.ok(rows.length,kind);const weapon=rows[0];
 return {kind,uiKind:kind==='sword-shield'?'sword-and-shield':kind,id:weapon.id,name:weapon.name,rarity:weapon.rarity,selectionRule:'Minimum rarity, then numeric id, from the unmodified fixed database. No search for a passing result.'};
});
if(process.argv[2]!=='case'){
 const report={runId:crypto.randomUUID(),scope:'FOURTEEN_WEAPON_STANDARD_PUBLIC_CONSUMER_SMOKE_CLOUD_LINUX_ONLY',sourceCommit:require('./current-evidence.cjs').currentProvenance().sourceCommit,databaseSha256:hash(databaseBytes),selection:selected,independentNumericExpectations:'NOT_ESTABLISHED_FOR_THIS_STANDARD_14_CASE_SET; separate GS oracle suite remains available',tenShotGunnerCoverage:{status:'NOT_IMPLEMENTED_IN_FIXED_PRODUCT_NOT_TESTED',note:'Current standard elemental-ammo/reference route is tested as implemented. No invented ten-shot magazine/shot transition.'},cases:[]};
 for(const c of selected){
  const run=spawnSync(process.execPath,[__filename,'case',String(c.id),report.runId],{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
  const file='/output/weapon-'+c.kind+'.json';
  const candidate=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;
  const result=candidate?.runId===report.runId&&!run.error&&run.status===(candidate.status==='NUMERIC_RESULT_AVAILABLE_ACCURACY_UNVERIFIED'?0:2)?{...candidate,processExitCode:run.status}:null;
  report.cases.push(result||{...c,status:'HARNESS_FAILURE',error:run.error?.message||run.stderr||'Case produced no output',processExitCode:run.status});
  console.log(JSON.stringify({kind:c.kind,id:c.id,status:result?.status||'HARNESS_FAILURE',reason:result?.reason||result?.failure||run.error?.message||null}));
 }
 report.counts={attempted:report.cases.length,numericAvailable:report.cases.filter(x=>x.status==='NUMERIC_RESULT_AVAILABLE_ACCURACY_UNVERIFIED').length,blocked:report.cases.filter(x=>x.status==='PRODUCT_UNAVAILABLE_OR_INCOMPLETE').length,harnessFailures:report.cases.filter(x=>x.status==='HARNESS_FAILURE').length};
 verifyInputs();report.inputFilesUnchanged=true;
 report.status=report.counts.numericAvailable===14?'ALL_FOURTEEN_EXECUTED_NUMERIC_ACCURACY_UNVERIFIED':'FOURTEEN_ATTEMPTED_WITH_BLOCKED_OR_FAILED_CASES';
 fs.writeFileSync('/output/representative-14.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,counts:report.counts,tenShotGunnerCoverage:report.tenShotGunnerCoverage}));
 process.exitCode=report.counts.numericAvailable===14?0:2;
}else{
 const c=selected.find(x=>x.id===Number(process.argv[3]));assert.ok(c,'selected case id required');
 const {JSDOM,VirtualConsole}=require('jsdom');
 const report={...c,runId:process.argv[4],status:'PENDING',inputScope:'Weapon only; no armor, decorations or charm skills. Not a complete legal build.',independentExpectedDamage:null,numericAccuracyVerified:false,productCodeModified:false,jsdomErrors:[],consoleErrors:[],blockedFetches:[],testInitialization:'Fresh memory DOM per case. Two calcBuild calls synchronize displayed inputs before observation; this is not equivalent to all ordinary user interactions.'};
 const vc=new VirtualConsole();vc.on('jsdomError',e=>report.jsdomErrors.push(e.message));vc.on('error',(...args)=>report.consoleErrors.push(args.map(x=>String(x?.message||x)).join(' ')));
 let dom;
 (async()=>{
  try{
   const html=require('/input/tools/dom-test-setup.cjs').readSimulatorHtml();
   dom=new JSDOM(html,{url:'https://isolated-14.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=url=>{report.blockedFetches.push(String(url));return Promise.reject(Error('TEST_NETWORK_DISABLED'));};w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
   const w=dom.window,read=source=>JSON.parse(w.eval('JSON.stringify('+source+')'));
   if(w.__localDBReady)await w.__localDBReady;
   assert.equal(typeof w.MHWRealOneHitBrowserAdapter?.evaluateCurrent,'function');
   assert.equal(typeof w.HimmelRealOneHitPipeline,'function');
   w.__testData=database;
   w.eval("DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();");
   w.eval(`build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();weaponKind.value=${JSON.stringify(c.uiKind)};renderWeapon();weapon.value=${JSON.stringify(String(c.id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';calcBuild();calcBuild();`);
   const actual=read('({weapon:selectedWeapon(),skills:calcState.total,stats:calcState.stats,conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
   assert.equal(actual.weapon.id,c.id);assert.equal(actual.weapon.kind,c.kind);
   Object.assign(report,actual);
   assert.equal(actual.result.evaluationPlan?.selection,'STANDARD','must retain the actual standard consumer path');
   report.numericSummary=Object.fromEntries(['normal','maximum'].map(channel=>[channel,{status:actual.result.channels?.[channel]?.metrics?.comboTotalDamage?.status??'unavailable',value:actual.result.channels?.[channel]?.metrics?.comboTotalDamage?.value??null,executionStatus:actual.result.channels?.[channel]?.execution?.status??null}]));
   const complete=actual.result.status==='OK'&&Object.values(report.numericSummary).every(m=>m.status==='available'&&Number.isFinite(m.value)&&m.executionStatus==='complete');
   report.status=complete?'NUMERIC_RESULT_AVAILABLE_ACCURACY_UNVERIFIED':'PRODUCT_UNAVAILABLE_OR_INCOMPLETE';
   report.reason=actual.result.reason||(!complete?'See returned channel execution, diagnostics and missing values':null);
   if(['light-bowgun','heavy-bowgun'].includes(c.kind))report.gunnerScope={tenShotTested:false,tenShotStatus:'NOT_IMPLEMENTED_IN_FIXED_PRODUCT_NOT_TESTED',actualProfile:actual.result.evaluationPlan?.profileId,actualTechniqueIds:actual.result.evaluationPlan?.techniqueIds};
   assert.deepEqual(report.jsdomErrors,[]);
   verifyInputs();report.inputFilesUnchanged=true;
  }catch(error){report.status='HARNESS_FAILURE';report.failure=error.stack;}
  finally{if(dom)dom.window.close();verifyInputs();fs.writeFileSync('/output/weapon-'+c.kind+'.json',JSON.stringify(report,null,2)+'\n');process.exitCode=report.status==='NUMERIC_RESULT_AVAILABLE_ACCURACY_UNVERIFIED'?0:2;}
 })().catch(error=>{console.error(error);process.exitCode=2;});
}
