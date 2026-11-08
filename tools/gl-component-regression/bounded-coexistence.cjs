'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
require('./verify-combined.cjs').verifyCombined();
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'work/input');
const baselineFile=path.join(__dirname,'bounded-baseline-adapter.js');
const {cases:originalCases,weapons,elementalSwordShield}=require('./bounded-plan.cjs').makeBoundedPlan(require('./work/input/normalized-data.json'),require('./work/harness/skill-sources/classification.candidate.json'),require('./work/harness/skill-sources/raw-skills.json'));
const bytes=fs.readFileSync(root+'/normalized-data.json'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const report={runId:process.env.BOUNDED_RUN_ID||crypto.randomUUID(),root,adapterSha256:hash(fs.readFileSync(root+'/hope-hammer-browser-adapter.js')),baselineAdapterSha256:hash(fs.readFileSync(baselineFile)),cases:[],numericGameAccuracyVerified:false};
const reportFile=process.env.REPORT_FILE||path.join(__dirname,'regression-summary.json');
const clone=x=>structuredClone(x),clean=x=>JSON.parse(JSON.stringify(x));
function copyInput(a){const out={...a};for(const k of ['weapon','stats','target','skills','conditions','techniqueIds','trainingRoom','switchAxeState','longSwordState','lanceState','dualBladesState','bowState','hbgState','lightBowgunState'])if(a[k]!==undefined)out[k]=clone(a[k]);return out;}
const metrics=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{total:r.channels?.[ch]?.metrics?.comboTotalDamage,execution:r.channels?.[ch]?.execution,components:r.channels?.[ch]?.components}]));
function available(r){for(const ch of ['normal','maximum']){assert.equal(r.channels?.[ch]?.metrics?.comboTotalDamage?.status,'available',r.reason||r.channels?.[ch]?.execution?.reason);assert.equal(r.channels[ch].execution.status,'complete');}}
function equalDamage(a,b){available(a);available(b);assert.deepEqual(metrics(a),metrics(b));}
function record(key,fn){try{const detail=fn();report.cases.push({key,status:'PASS',detail});console.log('PASS '+key);}catch(e){report.cases.push({key,status:'FAIL',error:e.stack});console.log('FAIL '+key+': '+e.message);}}
async function setup(kind){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://partbreaker-body.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});const w=dom.window;if(w.__localDBReady)await w.__localDBReady;const candidate=w.MHWRealOneHitBrowserAdapter;w.eval(fs.readFileSync(baselineFile,'utf8'));const frozen=w.MHWRealOneHitBrowserAdapter;let lastInput,adapterCalls=0,pipelineCalls=0;w.MHWRealOneHitBrowserAdapter={...candidate,evaluateCurrent(a){lastInput=a;adapterCalls++;return candidate.evaluateCurrent(a);}};const factory=w.HimmelRealOneHitPipeline;w.HimmelRealOneHitPipeline=function(...args){const p=factory(...args);return {...p,evaluate(...xs){pipelineCalls++;return p.evaluate(...xs);}};};w.__testData=JSON.parse(bytes);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');const weapon=weapons[kind];w.eval(`weaponKind.value=${JSON.stringify(weapon.uiKind)};renderWeapon();weapon.value=${JSON.stringify(String(weapon.id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);const get=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));const saved=get('savedBuildMap()');
 function calc(grants=[],armorIds=[]){w.__grants=grants;w.__armorIds=armorIds;w.eval('build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:window.__grants,slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();for(const id of window.__armorIds){const a=DB.armor.find(a=>a.id===id);if(!a)throw Error("MISSING_ARMOR");build.armor[a.kind]=a;}');w.calcBuild();w.calcBuild();return get('({skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,conditions:compareStep5Snapshot()})');}
 return {w,candidate,frozen,calc,input:()=>copyInput(lastInput),close(){assert.deepEqual(errors,[]);assert.deepEqual(get('savedBuildMap()'),saved);assert.deepEqual(clean(w.__testData),JSON.parse(bytes));assert.ok(adapterCalls&&pipelineCalls);dom.window.close();}};
}
function mutateRecord(a,id,fn){const old=a.techniqueDb;a.techniqueDb={...old,get(...args){const t=old.get(...args);if(!t||args[1]!==id)return t;const r=clone(t);fn(r);return r;}};}
// A test-only control disables the other nonapplication predicate in memory.
// It never changes the production file or the candidate under test.
function loadSingleScopeControl(c,kind){
 const wrapper=c.w.MHWRealOneHitBrowserAdapter,source=fs.readFileSync(root+'/hope-hammer-browser-adapter.js','utf8');
 const marker=kind==='sword-shield'?'const pierceNonTargetResolved=':'const airborneBodyResolved=';
 assert.equal(source.split(marker).length,2);c.w.eval(source.replace(marker,marker+'false&&'));
 const adapter=c.w.MHWRealOneHitBrowserAdapter;c.w.MHWRealOneHitBrowserAdapter=wrapper;return adapter;
}
const grant=(name,level=1,type='weapon')=>({name,level,type});
const isAvailable=r=>r.channels?.maximum?.metrics?.comboTotalDamage?.status==='available';
(async()=>{
 for(const kind of ['sword-shield','bow','light-bowgun','heavy-bowgun']){
  const c=await setup(kind),primary=kind==='sword-shield'?'飛燕':'貫通弾・竜の矢強化';
  const single=loadSingleScopeControl(c,kind);
  const none=c.calc(),solo=c.calc([grant(primary)]);equalDamage(solo.result,none.result);
  for(const co of [grant(kind==='sword-shield'?'貫通弾・竜の矢強化':'飛燕'),grant('耐性変換【雷】'),grant('耐性変換【水】'),grant('チャージマスター'),...[1,2,3].map(n=>grant('破壊王',n,'armor'))])record('guard:'+kind+':'+co.name+':'+co.level,()=>{
   const r=c.calc([grant(primary),co]).result,a=c.input(),old=clean(single.evaluateCurrent(copyInput(a)));assert.deepEqual(r.channels,old.channels,'Combined result must equal the same adapter with the other nonapplication predicate disabled');
   assert.ok(a.skills.some(([name,n])=>name===primary&&n===1));assert.ok(a.skills.some(([name,n])=>name===co.name&&n===co.level));if(['耐性変換【雷】','耐性変換【水】'].includes(co.name)){assert.ok(!JSON.stringify(r).includes('ISOLATED_EMPTY_EQUIPMENT_ZERO_ADD'));if(kind==='sword-shield'||kind==='bow')assert.equal(isAvailable(r),false);}
   return {normal:r.channels?.normal?.metrics?.comboTotalDamage?.status,maximum:r.channels?.maximum?.metrics?.comboTotalDamage?.status,reason:r.reason||r.channels?.maximum?.execution?.reason};
  });
  for(const co of [grant('攻撃'),grant('見切り'),grant('弱点特効',1,'armor')])record('common-skill:'+kind+':'+co.name,()=>{
   const withPrimary=c.calc([grant(primary),co]),without=c.calc([co]);equalDamage(withPrimary.result,without.result);
   return {normal:withPrimary.result.channels.normal.metrics.comboTotalDamage.value,maximum:withPrimary.result.channels.maximum.metrics.comboTotalDamage.value};
  });
  c.calc([grant(primary)]);const valid=c.input();
  for(const ch of ['normal','maximum'])record('channel-pending:'+kind+':'+ch,()=>{
   const a=copyInput(valid);a.stats.conditionalConditionPlan[ch]??={};a.stats.conditionalConditionPlan[ch].pending=['COMBINED_SCOPE_PENDING_'+ch];
   const r=clean(c.candidate.evaluateCurrent(a)),old=clean(single.evaluateCurrent(copyInput(a)));assert.deepEqual(r.channels,old.channels);return {status:r.channels?.[ch]?.metrics?.comboTotalDamage?.status,note:'Comparison with the test-only single-scope control, without assuming unsupported plan fields have an effect.'};
  });
  record('unrelated-pending:'+kind,()=>{const a=copyInput(valid);a.stats.conditionalConditionPlan.pending.push('COMBINED_UNRELATED_PENDING');const r=clean(c.candidate.evaluateCurrent(a));assert.equal(isAvailable(r),false);assert.ok(JSON.stringify(r).includes('COMBINED_UNRELATED_PENDING'));assert.deepEqual(r.channels,clean(single.evaluateCurrent(copyInput(a))).channels);});
  if(kind==='bow')for(const id of ['BOW_DRAGON_PIERCER','UNKNOWN_BOW_ID'])record('unsupported-bow:'+id,()=>{c.calc([grant(primary),grant('飛燕')]);const a=c.input();a.techniqueIds=[id];const r=clean(c.candidate.evaluateCurrent(a));assert.equal(isAvailable(r),false);assert.deepEqual(r.channels,clean(single.evaluateCurrent(copyInput(a))).channels);});
  equalDamage(c.calc([grant(primary)]).result,solo.result);equalDamage(c.calc().result,none.result);c.close();
 }
 for(const kind of Object.keys(weapons)){
  const c=await setup(kind);c.calc();
  const single=loadSingleScopeControl(c,kind);
  record('both-skills:'+kind,()=>{const r=c.calc([grant('飛燕'),grant('貫通弾・竜の矢強化')]).result;const a=c.input();assert.ok(a.skills.some(([name,n])=>name==='飛燕'&&n===1));assert.ok(a.skills.some(([name,n])=>name==='貫通弾・竜の矢強化'&&n===1));assert.deepEqual(r.channels,clean(single.evaluateCurrent(a)).channels);return {normal:r.channels?.normal?.metrics?.comboTotalDamage?.status,maximum:r.channels?.maximum?.metrics?.comboTotalDamage?.status,reason:r.reason||r.channels?.maximum?.execution?.reason};});c.close();
 }
 assert.equal(report.cases.length,68);report.counts={passed:report.cases.filter(c=>c.status==='PASS').length,failed:report.cases.filter(c=>c.status==='FAIL').length};report.status=report.counts.failed?'FAIL':'PASS';fs.writeFileSync(reportFile,JSON.stringify(report,null,2));process.exitCode=report.counts.failed?1:0;
})().catch(e=>{report.status='HARNESS_FAILURE';report.error=e.stack;fs.writeFileSync(reportFile,JSON.stringify(report,null,2));console.error(e);process.exitCode=2;});
