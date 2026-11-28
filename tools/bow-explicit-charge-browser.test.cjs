'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {installLocalModules}=require('./browser-test-setup.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const {data}=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json');
const bow=data.weapons.find(x=>x.id===1&&x.kind==='bow');
test('mobile selects and restores charge levels for each Bow row',async t=>{
 const launch={headless:true};
 if(process.env.CHROMIUM_EXECUTABLE){launch.executablePath=process.env.CHROMIUM_EXECUTABLE;launch.args=JSON.parse(process.env.CHROMIUM_ARGS||'["--no-sandbox"]');}
 const browser=await chromium.launch(launch);t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
 const dialogs=[];
 page.on('dialog',d=>{dialogs.push(d.message());return d.accept();});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
 await installLocalModules(page);
 await page.goto('https://simulator.test/');
 await page.evaluate(bow=>{
  clearWeaponBuckets();DB.weapons=[bow];weaponIndexByKind.bow=DB.weapons;weaponKind.value='bow';
  weapon.innerHTML='<option value="1">ホープボウⅠ</option>';weapon.value='1';App.build.setWeapon(bow);
  build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};
  renderComboForWeapon();renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';calcBuild();
  document.dispatchEvent(new Event('change'));
 },bow);
 const click=s=>page.locator(s).first().tap({timeout:6500});
 const q=s=>page.locator(s);
 const section='summary.card-summary:has-text("⑥")';
 if(!(await q(section).first().evaluate(e=>e.parentElement.open)))await click(section);
 await click('#consumerCustomCombo > summary');
 for(const id of ['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3']){
  await q('#comboMovePicker').selectOption('canonical:'+id);await click('#addCombo');
 }
 const levels=q('#combo [data-bow-charge-level]');
 assert.deepEqual(await levels.evaluateAll(es=>es.map(e=>e.value)),['3','3','3']);
 await levels.nth(0).selectOption('1');await levels.nth(1).selectOption('2');
 await click('#calcUserComboDamage');
 assert.deepEqual((await q('[data-custom-damage="total"] td').allTextContents()).slice(0,2),['114.0','114.0']);
 assert.match(await q('[data-used-combo]').innerText(),/通常：射撃（溜め1） → 剛射（溜め2） → 剛連射3\s+最大：射撃（溜め1） → 剛射（溜め2） → 剛連射3/);
 await page.evaluate(()=>{document.getElementById('buildName').value='弓の溜め';document.getElementById('saveBuild').click();});
 assert.match(await q('#buildSaveStatus').textContent(),/保存しました/);
 await levels.nth(0).selectOption('3');
 await page.evaluate(()=>{const s=document.getElementById('savedBuildSelect');s.value='弓の溜め';s.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('savedBuildLoad').click();});
 assert.deepEqual(await levels.evaluateAll(es=>es.map(e=>e.value)),['1','2','3']);
 t.diagnostic(JSON.stringify(dialogs));
 assert.deepEqual(errors,[]);
});
