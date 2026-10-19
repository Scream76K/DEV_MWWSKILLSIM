'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs'),{installLocalModules}=require('./browser-test-setup.cjs');
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-8,`${v} != ${e}`);
// Fixed public-mhdb-20261013.tar.gz: verify the formal gauge, not a replacement fixture.
const sharpnessColors=['red','orange','yellow','green','blue','white','purple'];
for(const id of [264]){const weapon=db.weapons.find(w=>w.id===id);a.ok(weapon);a.equal(sharpnessColors.filter(c=>weapon.sharpness[c]>0).at(-1),'blue');}
const equipmentSharp=1.2,equipmentESharp=1.0625;

// Recorded public MHDB responses, unchanged. Exercise production pagination,
// normalization, cache and equipment UI; never assign DB or seed calculated state.
async function mount(p){
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 await p.route('**/*',async r=>{
  const u=new URL(r.request().url());if(u.href==='https://simulator.test/')return r.fulfill({contentType:'text/html',body:html});
  if(u.origin==='https://wilds.mhdb.io'){
   const key={'/ja/skills':'skills','/ja/armor':'armor','/ja/decorations':'decorations','/ja/charms':'charms','/ja/armor/sets':'sets','/ja/weapons':'weapons','/ja/monsters':'monsters'}[u.pathname];
   if(!key)throw Error('UNEXPECTED_API:'+u.href);const from=Number(u.searchParams.get('offset')||0),limit=u.searchParams.has('limit')?Number(u.searchParams.get('limit')):Infinity;
   return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(db[key].slice(from,from+limit))});
  }return r.abort();
 });await installLocalModules(p);await p.goto('https://simulator.test/');
}
async function open(p,s){const d=p.locator(s).first().locator('xpath=ancestor::details');for(let i=await d.count()-1;i>=0;i--)if(!await d.nth(i).evaluate(x=>x.open))await d.nth(i).locator(':scope > summary').click();}
async function select(p,s,v){await open(p,s);await p.locator(s).selectOption(v);}
async function click(p,s){await open(p,s);await p.locator(s).click();}
async function save(p,n){await open(p,'#buildName');await p.locator('#buildName').fill(n);await click(p,'#saveBuild');}
async function read(p){return p.evaluate(()=>({stats:{attack:calcState.stats.attackTrue,affinity:calcState.stats.affinity,maxAffinity:calcState.stats.maxAffinity,element:calcState.stats.element},snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),report:createComboVerificationReport()}));}
async function offlineReload(p,expected,label){
 const saved=await p.evaluate(()=>JSON.stringify(savedBuildMap())),conditions=await p.evaluate(()=>compareStep5Snapshot()),requests=[];
 await p.route('https://wilds.mhdb.io/**',r=>{requests.push(r.request().url());return r.abort();});
 await p.reload();await p.evaluate(()=>window.simulatorReady);
 a.equal(await p.evaluate(()=>DB.skills.length),db.skills.length);
 a.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),saved);
 a.deepEqual(await p.evaluate(()=>compareStep5Snapshot()),conditions);
 const restored=await read(p);a.deepEqual(restored.snapshot,expected.snapshot);
 if(expected.report.summary?.damage!=null)close(restored.report.summary.damage,expected.report.summary.damage);
 a.deepEqual(requests,[],'reload must not request the API');
 const ui=await p.locator('#compareOut').innerText();a.ok(ui.length>0);
 await open(p,'#compareOut');await p.locator('#compareOut').screenshot({path:path.join(__dirname,'../../'+label+'-COMPARISON.png')});
 await p.screenshot({path:path.join(__dirname,'../../'+label+'-RELOAD.png'),fullPage:true});
 fs.writeFileSync(path.join(__dirname,'../../'+label+'-RELOAD-UI.txt'),ui);
 return restored;
}
async function table(p,metric,expected){const cells=await p.locator(`[data-comparison-metric="${metric}"] td`).allTextContents();a.deepEqual(cells,expected);}
// Independent MHDB/TechniqueDB oracle: real GS264 raw180/affinity10, CB3 or4,
// target13/2700 slash70/fire0, formal blue1.2/1.0625, MV176 or STANDARD176+187+134.
const r2=x=>Math.round((x+Number.EPSILON)*100)/100;
const single=level=>r2(180*1.76*.70*equipmentSharp*(1+.10*([1.25,1.28,1.31,1.34,1.37,1.40][level]-1)));
const standard=level=>180*4.97*.70*equipmentSharp*(1+.10*([1.25,1.28,1.31,1.34,1.37,1.40][level]-1));
const f1=x=>(Math.round((x+Number.EPSILON)*10)/10).toFixed(1);
async function selectedDamage(p){await select(p,'#comboMovePicker','gs_charge3');await click(p,'#calcSelectedTechniqueDamage');return Number((await p.locator('#singleTechniqueDamageOut').innerText()).match(/合計ダメージ：([0-9.]+)/)[1]);}
async function verifyRows(p,levels){const rows=await p.evaluate(()=>createBuildComparisonReport().results);a.equal(rows.length,2);for(const row of rows){const level=levels[row.name];close(row.powerIndex,standard(level));close(row.maxPowerIndex,standard(level));close(row.comboVerification.damage,single(level));close(row.dps,single(level)/2.4);a.notEqual(row.dpsStatus,'VERIFIED');}await table(p,'power-index',rows.map(row=>f1(standard(levels[row.name]))));await table(p,'max-power-index',rows.map(row=>f1(standard(levels[row.name]))));await table(p,'dps',rows.map(row=>f1(single(levels[row.name])/2.4)));return rows;}
test('critical boost inherits per-equipment level, explicit zero survives A/B and offline reload',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','264');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');await select(p,'#comboMovePicker','gs_charge3');await click(p,'#addCombo');a.equal(await p.locator('#dCB').inputValue(),'');a.equal(await selectedDamage(p),single(3));await click(p,'#calcDps');await save(p,'CB3');const A=await read(p);
 await select(p,'[data-slot="w1"]','312');a.equal(await p.evaluate(()=>skillLevel(calcState.total,['超会心'])),4);a.equal(await selectedDamage(p),single(4));await click(p,'#calcDps');await save(p,'CB4');const B=await read(p);a.notEqual(A.report.summary.damage,B.report.summary.damage);
 await click(p,'#selectAllCompare');await click(p,'#runCompare');const inherited=await verifyRows(p,{CB3:3,CB4:4});await offlineReload(p,B,'CRITICAL-AUTO');await verifyRows(p,{CB3:3,CB4:4});a.equal(await p.locator('#dCB').inputValue(),'');
 // Explicit0 is entered via the normal visible control, never via hidden-state mutation.
 await select(p,'#dCB','0');a.equal(await selectedDamage(p),single(0));await click(p,'#calcDps');await click(p,'#runCompare');const zero=await verifyRows(p,{CB3:0,CB4:0});const Z=await read(p);await offlineReload(p,Z,'CRITICAL-ZERO');await verifyRows(p,{CB3:0,CB4:0});a.equal(await p.locator('#dCB').inputValue(),'0');
 await click(p,'[data-build-load="CB3"]');a.equal(await p.locator('#dCB').inputValue(),'0');a.equal(await selectedDamage(p),single(0));await select(p,'#dCB','');a.equal(await selectedDamage(p),single(3));await click(p,'#calcDps');await click(p,'#runCompare');await verifyRows(p,{CB3:3,CB4:4});const restored=await read(p);await offlineReload(p,restored,'CRITICAL-RESTORED');await verifyRows(p,{CB3:3,CB4:4});a.equal(await selectedDamage(p),single(3));
 a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../CRITICAL-E2E.json'),JSON.stringify({oracle:{CB3:single(3),CB4:single(4),explicitZero:single(0),standard3:standard(3),standard4:standard(4)},A,B,inherited,zero,restored},null,2));
});
