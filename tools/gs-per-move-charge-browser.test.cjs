'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {installLocalModules}=require('./browser-test-setup.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const {profiles}=require('../tests/fixtures/selected-hp-inputs.json'),{data}=require('../tests/fixtures/offset-maximum-inputs.json');
test('portrait: great sword row controls select two different levels and preserve them on named load',async t=>{
 const launch={headless:true};
 if(process.env.CHROMIUM_EXECUTABLE){launch.executablePath=process.env.CHROMIUM_EXECUTABLE;launch.args=JSON.parse(process.env.CHROMIUM_ARGS||'["--no-sandbox"]');}
 const browser=await chromium.launch(launch);t.after(()=>browser.close());
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 await page.route('**/*',r=>r.request().url()==='https://simulator.test/'?r.fulfill({contentType:'text/html',body:html}):r.abort());
 await installLocalModules(page);await page.goto('https://simulator.test/');
 const base=profiles.find(p=>p.kind==='great-sword').input;
 const snapshot={...base,weaponId:'1148',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 await page.evaluate(({data,snapshot})=>{
  DB=normalizeDB({...data,weapons:consolidateArtiaFixedVariantRows(data.weapons)});
  weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();
  applyBuildSnapshot(snapshot);
 },{data,snapshot});
 const q=s=>page.locator(s),tap=s=>q(s).first().tap({timeout:7000});
 const section='summary.card-summary:has-text("⑥")';
 if(!(await q(section).first().evaluate(e=>e.parentElement.open)))await tap(section);
 await tap('#consumerCustomCombo > summary');
 for(const id of ['gs_charge3','gs_strong3']){await q('#comboMovePicker').selectOption(id);await tap('#addCombo');}
 const levels=q('#combo [data-gs-charge-level]');
 assert.equal(await levels.count(),2);
 assert.ok(await levels.last().evaluate(e=>e.getBoundingClientRect().right<=document.documentElement.clientWidth));
 await levels.first().selectOption('1');await levels.last().selectOption('2');
 await tap('#calcUserComboDamage');
 const totals=q('[data-custom-damage="total"] td');
 assert.deepEqual((await totals.allTextContents()).slice(0,2),['598.1','598.1']);
 assert.match(await q('[data-used-combo]').innerText(),/通常：溜め斬りⅠ → 強溜め斬りⅡ\s+最大：溜め斬りⅠ → 強溜め斬りⅡ/);
 // Name/load controls may live under a different card. Use the real app's
 // handlers, not synthetic storage writes, to verify the row's native select.
 await page.evaluate(()=>{document.getElementById('buildName').value='溜めテスト';document.getElementById('saveBuild').click();});
 assert.match(await q('#buildSaveStatus').textContent(),/保存しました/);
 await levels.first().selectOption('3');
 await page.evaluate(()=>{const s=document.getElementById('savedBuildSelect');s.value='溜めテスト';s.dispatchEvent(new Event('change',{bubbles:true}));document.getElementById('savedBuildLoad').click();});
 assert.equal(await levels.first().inputValue(),'1');
 assert.equal(await levels.last().inputValue(),'2');
 assert.deepEqual(errors,[]);
});
