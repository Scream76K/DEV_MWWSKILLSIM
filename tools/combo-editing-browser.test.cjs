const routeMvs=[18,18,6,6,10,10,4,4,20,20,11,11,16,16,6,25,22,8,5,22,5,14,18,8,18,36,36];
// Independent fixed hits: raw200, white1.32, explicit training-front slash80, no element.
const routeDps=routeMvs.reduce((s,mv)=>s+Math.round((200*mv/100*.8*1.32+Number.EPSILON)*100)/100,0)/5.39;
const {installLocalModules}=require('./browser-test-setup.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('mobile row controls reorder preserve saved builds and clear comparison after resize',async t=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});t.after(()=>browser.close());
  const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.setDefaultTimeout(10000);
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());await installLocalModules(p);await p.goto('https://simulator.test/');
  await p.evaluate(()=>{clearWeaponBuckets();build.armor={};const fixture={id:987,kind:'dual-blades',name:'Fixture',affinity:0,damage:{raw:200,display:200},specials:[],slots:[],skills:[]};DB.weapons=[fixture];weaponIndexByKind['dual-blades']=[fixture];document.getElementById('weaponKind').value='dual-blades';document.getElementById('weapon').innerHTML='<option value="987">Fixture</option>';document.getElementById('weapon').value='987';renderMonsters();document.getElementById('monster').value='training-room';renderMonsterParts();document.getElementById('monsterPart').value='training-front';calcBuild();renderComboForWeapon();});assert.deepEqual(await p.evaluate(()=>({monster:document.getElementById('monster').value,part:document.getElementById('monsterPart').value,hz:monsterHZ().hz})),{monster:'training-room',part:'training-front',hz:80});
  await p.locator('summary.card-summary').filter({hasText:'⑦ コンボDPS'}).click();
  for(const id of ['canonical:DB_DEMON_DANCE_III','canonical:DB_DEMON_DANCE_I','canonical:DB_DEMON_DANCE_II']){await p.locator('#comboMovePicker').selectOption(id);await p.locator('#addCombo').click();}
  assert.equal(await p.evaluate(()=>calcDps().time),null);
  await p.locator('.combo-down').first().click();await p.locator('.combo-down').nth(1).click();
  assert.deepEqual(await p.locator('#combo .cmove').evaluateAll(a=>a.map(x=>x.value)),['canonical:DB_DEMON_DANCE_I','canonical:DB_DEMON_DANCE_II','canonical:DB_DEMON_DANCE_III']);
  assert.equal(await p.locator('.combo-up').first().isDisabled(),true);assert.equal(await p.locator('.combo-down').last().isDisabled(),true);
  await p.locator('#calcDps').click();assert.match(await p.locator('#dpsOut').innerText(),/5\.39/);const adopted=await p.evaluate(()=>createComboVerificationReport());assert.equal(adopted.summary.time,5.39);assert.ok(Math.abs(adopted.summary.theoreticalDps-routeDps)<1e-8);assert.ok(adopted.stages.every(x=>x.time===null&&x.timingStatus==='PENDING'));
  await p.locator('#buildName').fill('Ordered');await p.locator('#saveBuild').click();await p.locator('#selectAllCompare').click();await p.locator('#runCompare').click();
  assert.equal(await p.locator('#compareOut table').count(),1);
  await p.locator('.combo-up').nth(1).click();await p.setViewportSize({width:430,height:844});assert.equal(await p.locator('#compareOut table').count(),0);assert.equal(await p.evaluate(()=>calcDps().time),null);
  p.once('dialog',dialog=>dialog.accept());await p.locator('[data-build-load="Ordered"]').click();assert.deepEqual(await p.locator('#combo .cmove').evaluateAll(a=>a.map(x=>x.value)),['canonical:DB_DEMON_DANCE_I','canonical:DB_DEMON_DANCE_II','canonical:DB_DEMON_DANCE_III']);
  const restored=await p.evaluate(()=>createComboVerificationReport());assert.equal(restored.summary.time,5.39);assert.equal(restored.summary.routeTimingEvidence.adoptionId,'KAN17-66-DB-DEMON-DANCE-I-II-III');
  for(const width of [320,390,430]){await p.setViewportSize({width,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);const boxes=await p.locator('.comboRow button').evaluateAll(a=>a.map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})));assert.ok(boxes.every(x=>x.width>=44&&x.height>=44));}
  assert.deepEqual(errors,[]);
});
