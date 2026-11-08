'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'work/input');
const baselineFile=path.join(__dirname,'sa-cb-baseline-adapter.js');
const reportFile=process.env.REPORT_FILE||path.join(__dirname,'full-preservation-summary.json');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const report={runId:process.env.SA_CB_RUN_ID||crypto.randomUUID(),root,status:'RUNNING',adapterSha256:null,baselineAdapterSha256:null,cases:[],numericGameAccuracyVerified:false};
fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
function harnessFailure(error){report.status='FAIL';report.failureType='HARNESS_FAILURE';report.error=error?.stack||String(error);fs.writeFileSync(reportFile,JSON.stringify(report,null,2));console.error(error);process.exitCode=process.exitCode||2;}
process.on('exit',code=>{if(report.status==='RUNNING')harnessFailure(Error('Harness exited before completion; exit code '+code));});
async function main(){
require('./verify-combined.cjs').verifyCombined();
const {JSDOM,VirtualConsole}=require('jsdom');
const {weapons}=require('./sa-cb-plan.cjs').makeChargeSelections();
const originalCases=require('./sa-cb-plan.cjs').makeChargeSelections().cases;
const bytes=fs.readFileSync(root+'/normalized-data.json');
report.adapterSha256=hash(fs.readFileSync(root+'/hope-hammer-browser-adapter.js'));report.baselineAdapterSha256=hash(fs.readFileSync(baselineFile));
const clone=x=>structuredClone(x),clean=x=>JSON.parse(JSON.stringify(x));
function copyInput(a){const out={...a};for(const k of ['weapon','stats','target','skills','conditions','techniqueIds','trainingRoom','switchAxeState','longSwordState','lanceState','dualBladesState'])if(a[k]!==undefined)out[k]=clone(a[k]);return out;}
const metrics=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{total:r.channels?.[ch]?.metrics?.comboTotalDamage,execution:r.channels?.[ch]?.execution,components:r.channels?.[ch]?.components}]));
function available(r){for(const ch of ['normal','maximum']){assert.equal(r.channels?.[ch]?.metrics?.comboTotalDamage?.status,'available',r.reason||r.channels?.[ch]?.execution?.reason);assert.equal(r.channels[ch].execution.status,'complete');}}
function equalDamage(a,b){available(a);available(b);assert.deepEqual(metrics(a),metrics(b));}
function record(key,fn){try{const detail=fn();report.cases.push({key,status:'PASS',detail});console.log('PASS '+key);}catch(e){report.cases.push({key,status:'FAIL',error:e.stack});console.log('FAIL '+key+': '+e.message);}}
async function setup(kind){const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://airborne-body.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});const w=dom.window;if(w.__localDBReady)await w.__localDBReady;const candidate=w.MHWRealOneHitBrowserAdapter;w.eval(fs.readFileSync(baselineFile,'utf8'));const frozen=w.MHWRealOneHitBrowserAdapter;let lastInput,adapterCalls=0,pipelineCalls=0;w.MHWRealOneHitBrowserAdapter={...candidate,evaluateCurrent(a){lastInput=a;adapterCalls++;return candidate.evaluateCurrent(a);}};const factory=w.HimmelRealOneHitPipeline;w.HimmelRealOneHitPipeline=function(...args){const p=factory(...args);return {...p,evaluate(...xs){pipelineCalls++;return p.evaluate(...xs);}};};w.__testData=JSON.parse(bytes);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');const weapon=weapons[kind];w.eval(`weaponKind.value=${JSON.stringify(weapon.uiKind)};renderWeapon();weapon.value=${JSON.stringify(String(weapon.id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);const get=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));const saved=get('savedBuildMap()');
 function calc(grants=[],armorIds=[]){w.__grants=grants;w.__armorIds=armorIds;w.eval('build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:window.__grants,slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();for(const id of window.__armorIds){const a=DB.armor.find(a=>a.id===id);if(!a)throw Error("MISSING_ARMOR");build.armor[a.kind]=a;}');w.calcBuild();w.calcBuild();return get('({skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,conditions:compareStep5Snapshot()})');}
 return {w,candidate,frozen,calc,input:()=>copyInput(lastInput),close(){assert.deepEqual(errors,[]);assert.deepEqual(get('savedBuildMap()'),saved);assert.deepEqual(clean(w.__testData),JSON.parse(bytes));assert.ok(adapterCalls&&pipelineCalls);dom.window.close();}};
}
function mutateRecord(a,id,fn){const old=a.techniqueDb;a.techniqueDb={...old,get(...args){const t=old.get(...args);if(!t||args[1]!==id)return t;const r=clone(t);fn(r);return r;}};}
await (async()=>{
 for(const kind of Object.keys(weapons)){
  const jobs=originalCases.filter(x=>x.kind===kind);if(!jobs.length)continue;
  const c=await setup(kind);c.calc();
  for(const job of jobs)record('scan:'+job.key,()=>{const a=job.armor?c.calc([],job.armor.map(x=>x.id)):c.calc([{name:job.name,level:job.level,type:job.skillKind==='weapon'?'weapon':'armor'}]);const b=clean(c.frozen.evaluateCurrent(c.input()));assert.deepEqual(a.result.channels,b.channels);if(!job.armor)assert.equal(a.skills[job.name],job.level);return {status:a.result.status,reason:a.result.reason||a.result.channels?.maximum?.execution?.reason};});c.close();
 }
 assert.equal(report.cases.length,2357);require('./verify-combined.cjs').verifyCombined();
 report.counts={passed:report.cases.filter(c=>c.status==='PASS').length,failed:report.cases.filter(c=>c.status==='FAIL').length};report.status=report.counts.failed?'FAIL':'PASS';fs.writeFileSync(reportFile,JSON.stringify(report,null,2));process.exitCode=report.counts.failed?1:0;
})();
}
main().catch(harnessFailure);
