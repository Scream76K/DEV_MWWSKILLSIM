'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs'),{installLocalModules}=require('./browser-test-setup.cjs');
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-8,`${v} != ${e}`);
// Fixed public-mhdb-20261013.tar.gz: verify the formal gauge, not a replacement fixture.
const sharpnessColors=['red','orange','yellow','green','blue','white','purple'];
for(const id of [236, 237]){const weapon=db.weapons.find(w=>w.id===id);a.ok(weapon);a.equal(sharpnessColors.filter(c=>weapon.sharpness[c]>0).at(-1),'green');}
const equipmentSharp=1.05,equipmentESharp=1;

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

const r2=x=>Math.round((x+Number.EPSILON)*100)/100;
const attackFor=id=>id==='236'?90:100;
const stagesFor=id=>[176,187].map(mv=>r2(attackFor(id)*mv/100*.70*equipmentSharp));
const totalFor=id=>r2(stagesFor(id).reduce((a,b)=>a+b,0));
const duration=2.4+2.9; // LEGACY_COMBO_TEMPLATES same-ID times, retained adoption; not live verified.
async function verifyCombo(p,id){const r=await read(p),v=r.report;close(r.stats.attack,attackFor(id));a.equal(v.stages.length,2);a.deepEqual(v.stages.map(s=>s.techniqueId),['gs_charge3','gs_strong3']);for(let i=0;i<2;i++){close(v.stages[i].damage,stagesFor(id)[i]);a.equal(v.stages[i].timingStatus,'LEGACY_REFERENCE_ONLY');}close(v.summary.damage,totalFor(id));close(v.summary.time,duration);close(v.summary.dps,totalFor(id)/duration);a.notEqual(v.summary.dpsStatus,'VERIFIED');const text=await p.locator('#dpsOut').innerText();a.ok(text.includes(totalFor(id).toFixed(2)),text);fs.writeFileSync(path.join(__dirname,'../../SAME-COMBO-'+id+'-UI.txt'),text);return r;}
async function verifyComparison(p){const rows=await p.evaluate(()=>createBuildComparisonReport().results);a.equal(rows.length,2);for(const row of rows){const id=row.name==='Combo A'?'236':'237';close(row.referenceCombo.damage,totalFor(id));close(row.comboVerification.damage,totalFor(id));close(row.comboVerification.time,duration);close(row.dps,totalFor(id)/duration);a.deepEqual(row.comboVerification.stages.map(s=>s.techniqueId),['gs_charge3','gs_strong3']);close(row.powerIndex,attackFor(id)*4.97*.70*equipmentSharp);close(row.maxPowerIndex,row.powerIndex);}await table(p,'dps',rows.map(r=>(totalFor(r.name==='Combo A'?'236':'237')/duration).toFixed(1)));return rows;}
test('same selected two-stage combo equipment performance damage time DPS A/B restore offline reload',async t=>{const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(7000);await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','236');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');for(const id of ['gs_charge3','gs_strong3']){await select(p,'#comboMovePicker',id);await click(p,'#addCombo');}await click(p,'#calcDps');const A=await verifyCombo(p,'236');await save(p,'Combo A');await select(p,'#weapon','237');if(await p.locator('.comboRow').count()===0)for(const id of ['gs_charge3','gs_strong3']){await select(p,'#comboMovePicker',id);await click(p,'#addCombo');}a.equal(await p.locator('.comboRow').count(),2);await click(p,'#calcDps');const B=await verifyCombo(p,'237');await save(p,'Combo B');await click(p,'#selectAllCompare');await click(p,'#runCompare');const rows=await verifyComparison(p);await offlineReload(p,B,'SAME-COMBO');await verifyComparison(p);await click(p,'#calcDps');await verifyCombo(p,'237');await click(p,'[data-build-load="Combo A"]');await click(p,'#calcDps');await verifyCombo(p,'236');await click(p,'#runCompare');await verifyComparison(p);a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../SAME-COMBO-E2E.json'),JSON.stringify({A,B,rows,oracle:{A:totalFor('236'),B:totalFor('237'),duration,dpsA:totalFor('236')/duration,dpsB:totalFor('237')/duration},timingEvidence:'index LEGACY_COMBO_TEMPLATES gs_charge3=2.4 gs_strong3=2.9, same IDs only, LEGACY_REFERENCE_ONLY, no VERIFIED promotion'},null,2));});
