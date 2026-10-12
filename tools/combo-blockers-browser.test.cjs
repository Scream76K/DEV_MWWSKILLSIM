const {installLocalModules}=require('./browser-test-setup.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
test('mobile blocker list shows every pending stage and recovers after UI deletion',async t=>{
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox']}: {})});t.after(()=>browser.close());
  const p=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());await installLocalModules(p);await p.goto('https://simulator.test/');
  await p.evaluate(()=>{clearWeaponBuckets();build.armor={};const fixture={id:987,kind:'charge-blade',name:'Fixture',affinity:0,damage:{raw:200,display:200},specials:[],slots:[],skills:[]};DB.weapons=[fixture];weaponIndexByKind['charge-blade']=[fixture];document.getElementById('weaponKind').value='charge-blade';document.getElementById('weapon').innerHTML='<option value="987">Fixture</option>';document.getElementById('weapon').value='987';calcBuild();renderComboForWeapon();});
  await p.locator('summary.card-summary').filter({hasText:'⑦ コンボDPS'}).click();
  await p.locator('#comboCBShield').selectOption('1');await p.locator('#comboCBAxe').selectOption('1');
  for(const id of ['canonical:CB_SWORD_TO_AXE_MORPH','canonical:CB_AED','canonical:CB_SHIELD_THRUST']){await p.locator('#comboMovePicker').selectOption(id);await p.locator('#addCombo').click();}
  await p.locator('#calcDps').click();assert.equal(await p.locator('.combo-blocked-item').count(),2);assert.equal(await p.locator('.combo-hit-detail').count(),0);
  assert.match(await p.locator('.combo-blocked-item').nth(0).innerText(),/^2\./);assert.match(await p.locator('.combo-blocked-item').nth(1).innerText(),/^3\./);
  for(const width of [320,390,430]){await p.setViewportSize({width,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);}
  await p.locator('.comboRow .del').last().click();await p.locator('.comboRow .del').last().click();await p.locator('#calcDps').click();
  assert.equal(await p.locator('.combo-blocked-item').count(),0);assert.equal(await p.locator('.combo-hit-detail tbody tr').count(),5);assert.match(await p.locator('#dpsOut').innerText(),/1コンボ .* ダメージ/);assert.deepEqual(errors,[]);
});
