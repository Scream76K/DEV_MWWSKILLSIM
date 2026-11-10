'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const {installLocalModules}=require('./browser-test-setup.cjs');
const sourceSkills=require('./synthetic-combat-source-skills.cjs').skills;
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const close=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);
async function setup(t,width){
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']});t.after(()=>browser.close());
  const p=await browser.newPage({viewport:{width,height:900},isMobile:width<500});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());await installLocalModules(p);await p.goto('https://simulator.test/');
  await p.evaluate(skills=>{
    clearWeaponBuckets();DB.skills=skills;DB.weapons=[200,220].map((raw,i)=>({id:987+i,gameId:987+i,sharpness:{white:1},kind:'great-sword',name:'Synthetic '+(i?'B':'A'),damage:{raw,display:raw*4.8},affinity:0,specials:[],slots:[],skills:[]}));
    weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML=DB.weapons.map(w=>'<option value="'+w.id+'">'+w.name+'</option>').join('');weapon.value='987';App.build.setWeapon(DB.weapons[0]);build.armor={};build.charmCustom={skills:[],slots:[0,0],weaponSlots:[]};build.decos={};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';calcBuild();renderComboForWeapon();
    for(const id of ['saveBuild','compareOut','aiPrepare','comboMovePicker'])for(let e=document.getElementById(id);e;e=e.parentElement)if(e.tagName==='DETAILS')e.open=true;
  },sourceSkills);
  return {p,errors};
}
for(const width of [390,1440])test(`public AI preparation matches visible saved normal/max values offline at ${width}px`,async t=>{
  const {p,errors}=await setup(t,width);
  await p.locator('#comboMovePicker').selectOption('gs_charge3');await p.locator('#addCombo').click();await p.locator('#calcBuild').click();
  await p.locator('#buildName').fill('A');await p.locator('#saveBuild').click();
  await p.locator('#weapon').selectOption('988');await p.locator('#comboMovePicker').selectOption('gs_charge3');await p.locator('#addCombo').click();await p.locator('#calcBuild').click();await p.locator('#buildName').fill('B');await p.locator('#saveBuild').click();
  const before=await p.evaluate(()=>JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stored:savedBuildMap()}));
  await p.locator('#selectAllCompare').click();await p.locator('#runCompare').click();
  assert.deepEqual(await p.locator('[data-comparison-metric="power-index"] td').allTextContents(),['371.7','408.9']);
  await p.locator('#aiPrompt').fill('通常と最大を比較');await p.locator('#aiPrepare').click();
  const payload=JSON.parse(await p.locator('#aiPayload').textContent()),r=payload.currentBuild.buildComparison;
  assert.equal(r.schemaVersion,3);close(r.results[0].powerIndex,371.712);close(r.results[1].powerIndex,408.8832);close(r.results[1].maxPowerIndex,408.8832);
  assert.equal(r.results[0].legacyReference.power.normal.comparisonPower,1049.664);
  assert.equal(await p.evaluate(()=>JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stored:savedBuildMap()})),before);
  await p.locator('#comparisonBaseline').selectOption('1');assert.equal(await p.locator('#aiPayload').textContent(),'');await p.locator('#aiPrepare').click();
  const changed=JSON.parse(await p.locator('#aiPayload').textContent()).currentBuild;close(changed.buildComparison.baseline.damage,408.8832);close(changed.buildComparison.results[0].powerIndex,371.712);
  await p.locator('#combo .cmove').selectOption('gs_strong3');await p.locator('#aiPrepare').click();
  const stale=JSON.parse(await p.locator('#aiPayload').textContent()).currentBuild;assert.equal(stale.buildComparison,null);assert.equal(stale.currentCalculation.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');
  await p.locator('#calcBuild').click();await p.locator('#aiPrepare').click();const fresh=JSON.parse(await p.locator('#aiPayload').textContent()).currentBuild;close(fresh.currentCalculation.channels.normal.metrics.comboTotalDamage.value,434.4384);
  assert.equal(await p.locator('#legacyComboCard').isVisible(),false);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
});
