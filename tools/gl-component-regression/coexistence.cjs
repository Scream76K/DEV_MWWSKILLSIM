'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
require('./verify-combined.cjs').verifyCombined();
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'work/input');
const snapshot=__dirname;
const adapterFile=path.join(root,'hope-hammer-browser-adapter.js');
const report={runId:process.env.SCOPE_RUN_ID||crypto.randomUUID(),root,adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(adapterFile)).digest('hex'),cases:[],status:'RUNNING',numericGameAccuracyVerified:false};
const out=process.env.REPORT_FILE||path.join(__dirname,'regression-summary.json');
fs.writeFileSync(out,JSON.stringify(report,null,2));
const raw=JSON.parse(fs.readFileSync(snapshot+'/work/harness/skill-sources/raw-skills.json'));
const dbBytes=fs.readFileSync(root+'/normalized-data.json');
const clone=x=>structuredClone(x), clean=x=>JSON.parse(JSON.stringify(x));
function compareChannels(a,b){for(const ch of ['normal','maximum']){assert.equal(a.channels[ch].metrics.comboTotalDamage.status,'available',ch+': '+a.channels[ch].metrics.comboTotalDamage.reason);assert.equal(a.channels[ch].execution.status,'complete');assert.deepEqual(a.channels[ch].components.map(x=>[x.id,x.status,x.value]),b.channels[ch].components.map(x=>[x.id,x.status,x.value]));assert.equal(a.channels[ch].metrics.comboTotalDamage.value,b.channels[ch].metrics.comboTotalDamage.value);}}
function hasPending(r){return JSON.stringify(r).includes('チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING')||JSON.stringify(r).includes('Charge Master:CONDITIONAL_DAMAGE_FORMULA_PENDING');}
async function setup(kind,id){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://conversion-zero.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
 const w=dom.window;if(w.__localDBReady)await w.__localDBReady;
 let lastInput=null,adapterCalls=0,pipelineCalls=0;const original=w.MHWRealOneHitBrowserAdapter,factory=w.HimmelRealOneHitPipeline;w.eval(fs.readFileSync(snapshot+'/scope-baseline-adapter.js','utf8'));const frozenAdapter=w.MHWRealOneHitBrowserAdapter;
 w.MHWRealOneHitBrowserAdapter={...original,evaluateCurrent(a){lastInput=a;adapterCalls++;return original.evaluateCurrent(a);}};
 w.HimmelRealOneHitPipeline=function(...args){const p=factory(...args);return {...p,evaluate(...args){pipelineCalls++;return p.evaluate(...args);}};};
 w.__testData=JSON.parse(dbBytes);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 w.eval(`build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();weaponKind.value=${JSON.stringify(kind==='sword-shield'?'sword-and-shield':kind)};renderWeapon();weapon.value=${JSON.stringify(String(id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
 const get=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));const saved=get('savedBuildMap()');
 function calc(grants=[]){w.__grants=grants;w.eval('build.charmCustom.skills=window.__grants;normalizeCharm();');w.calcBuild();w.calcBuild();return get('calcState.realOneHit');}
 function input(){const a=lastInput;return {...a,weapon:clone(a.weapon),stats:clone(a.stats),skills:clone(a.skills),conditions:clone(a.conditions),techniqueIds:clone(a.techniqueIds)};}
 return {w,original,frozenAdapter,calc,input,errors,close(){assert.deepEqual(errors,[]);assert.deepEqual(get('savedBuildMap()'),saved);assert.deepEqual(clean(w.__testData),JSON.parse(dbBytes));assert.ok(adapterCalls>0&&pipelineCalls>0);dom.window.close();}};
}
function record(key,fn){try{const detail=fn();report.cases.push({key,status:'PASS',detail});console.log('PASS '+key);}catch(e){report.cases.push({key,status:'FAIL',error:e.stack});console.log('FAIL '+key+': '+e.message);}}

const targetName=element=>element==='water'?'耐性変換【水】':'耐性変換【雷】';
const grant=element=>({name:targetName(element),level:1,type:'weapon'});
const available=r=>r.channels?.maximum?.metrics?.comboTotalDamage?.status==='available';
function copyInput(a){return {...a,weapon:clone(a.weapon),stats:clone(a.stats),skills:clone(a.skills),conditions:clone(a.conditions),techniqueIds:clone(a.techniqueIds),bowState:clone(a.bowState),longSwordState:clone(a.longSwordState)};}
(async()=>{
 const db=JSON.parse(dbBytes),targets=[...['great-sword','long-sword','sword-shield','dual-blades','hammer','lance','bow'].map(kind=>({kind,element:'thunder'})),...['long-sword','bow'].map(kind=>({kind,element:'water'}))];
 for(const {kind,element} of targets){
  const weapon=db.weapons.filter(x=>x.kind===kind).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];
  const c=await setup(kind,weapon.id),baseline=c.calc(),solo=c.calc([grant(element)]);compareChannels(solo,baseline);
  const wrapper=c.w.MHWRealOneHitBrowserAdapter;const candidateSource=fs.readFileSync(adapterFile,'utf8'),marker='const isolatedZeroConversion=(skillId,names,field)=>{';assert.equal(candidateSource.split(marker).length,2);c.w.eval(candidateSource.replace(marker,marker+'return false;'));const partbreakerOnly=c.w.MHWRealOneHitBrowserAdapter;c.w.MHWRealOneHitBrowserAdapter=wrapper;
  for(const level of [1,2,3])record('coexistence:'+element+':'+kind+':partbreaker'+level,()=>{
   const r=c.calc([grant(element),{name:'破壊王',level,type:'armor'}]),a=c.input(),old=clean(c.frozenAdapter.evaluateCurrent(a));
   assert.ok(a.skills.some(([name,n])=>name==='破壊王'&&n===level));
   assert.ok(a.skills.some(([name,n])=>name===targetName(element)&&n===1));
   assert.equal(available(r),false,'Co-skill must not inherit isolated zero conversion');assert.deepEqual(r.channels,clean(partbreakerOnly.evaluateCurrent(a)).channels,'Zero-conversion branch must not change behavior when its predicate is disabled');
   assert.ok(JSON.stringify(r.channels?.maximum).includes(element==='thunder'?'THUNDER_CONVERSION_BODY_SCOPE_UNSUPPORTED':'WATER_CONVERSION_SCOPE_UNSUPPORTED'));
   assert.ok(!JSON.stringify(r).includes('ISOLATED_EMPTY_EQUIPMENT_ZERO_ADD'));
   return {skillId:element==='thunder'?165:181,coSkillId:129,coSkillLevel:level,weaponId:weapon.id,reason:r.reason||r.channels?.maximum?.execution?.reason};
  });
  compareChannels(c.calc([grant(element)]),solo);compareChannels(c.calc(),baseline);c.close();
 }
 assert.equal(report.cases.length,27);report.status=report.cases.every(x=>x.status==='PASS')?'PASS':'FAIL';report.counts={passed:report.cases.filter(x=>x.status==='PASS').length,failed:report.cases.filter(x=>x.status==='FAIL').length};fs.writeFileSync(out,JSON.stringify(report,null,2));process.exitCode=report.status==='PASS'?0:1;
})().catch(e=>{report.status='HARNESS_FAILURE';report.error=e.stack;fs.writeFileSync(out,JSON.stringify(report,null,2));console.error(e);process.exitCode=2;});
