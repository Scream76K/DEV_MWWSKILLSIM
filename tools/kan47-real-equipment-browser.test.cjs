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
test('real MHDB via production loader: actual bow equipment A/B compare restore reload without DB refetch',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(7000);await mount(p);
 await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));a.equal(await p.evaluate(()=>DB.skills.length),db.skills.length);
 await select(p,'#buildTemplateWeaponKind','bow');await select(p,'#buildTemplateSelect','SALADA_BOW_03');await click(p,'#loadBuildTemplate');a.doesNotMatch(await p.locator('#buildTemplateStatus').innerText(),/照合できなかった/);
 await select(p,'#monster','13');await select(p,'#monsterPart','2700');await select(p,'#powerBowCoating','POWER');await select(p,'#powerBowRange','CRITICAL');await select(p,'#powerBowStartShot','3');await select(p,'#comboPreset','adopted:bow_reference');await click(p,'#calcDps');await save(p,'Real Bow A');const A=await read(p);
 close(A.report.channels.NORMAL.damage,672.3191791992);close(A.report.channels.MAXIMUM.damage,916.16889546);a.deepEqual(A.stats,{attack:232,affinity:22,maxAffinity:100,element:372});
 await open(p,'.aR');await p.locator('.aR').nth(0).selectOption('atk:III');await click(p,'#calcDps');await save(p,'Real Bow B');const B=await read(p);a.equal(B.stats.attack,229);close(B.report.channels.NORMAL.damage,666.1167016179002);close(B.report.channels.MAXIMUM.damage,908.590659795);a.notDeepEqual(A.snapshot.artia,B.snapshot.artia);
 await click(p,'#selectAllCompare');await click(p,'#runCompare');let rows=await p.evaluate(()=>createBuildComparisonReport().results);for(const [r,v]of [[rows[0],A],[rows[1],B]]){close(r.comboVerification.channels.NORMAL.damage,v.report.channels.NORMAL.damage);close(r.comboVerification.channels.MAXIMUM.damage,v.report.channels.MAXIMUM.damage);a.equal(r.dps,null);}
 const download=p.waitForEvent('download');await click(p,'#comparisonReportDownload');const exported=JSON.parse(fs.readFileSync(await(await download).path(),'utf8'));close(exported.results[0].comboVerification.channels.NORMAL.damage,A.report.channels.NORMAL.damage);
 await click(p,'[data-build-load="Real Bow A"]');await click(p,'#calcDps');let restored=await read(p);a.deepEqual(restored.snapshot,A.snapshot);close(restored.report.channels.NORMAL.damage,A.report.channels.NORMAL.damage);
 const cache=await p.evaluate(()=>({bytes:JSON.stringify(DB).length}));await offlineReload(p,A,'BOW');await table(p,'power-index',['672.3','666.1']);await table(p,'max-power-index',['916.2','908.6']);await table(p,'relative-power-100',['100.0','99.1']);a.match((await p.locator('[data-comparison-metric=power-index-change] td').allTextContents())[1],/^−0\.9%/);a.match(await p.locator('#powerIndexSummary').innerText(),/672\.32.*916\.17/);await click(p,'[data-build-load="Real Bow B"]');await click(p,'#calcDps');restored=await read(p);a.deepEqual(restored.snapshot,B.snapshot);close(restored.report.channels.NORMAL.damage,B.report.channels.NORMAL.damage);a.equal(restored.report.channels.NORMAL.time,null);a.equal(restored.report.channels.NORMAL.dps,null);
 await click(p,'#selectAllCompare');await click(p,'#runCompare');rows=await p.evaluate(()=>createBuildComparisonReport().results);close(rows[0].comboVerification.channels.NORMAL.damage,A.report.channels.NORMAL.damage);close(rows[1].comboVerification.channels.NORMAL.damage,B.report.channels.NORMAL.damage);a.deepEqual(errors,[]);
 fs.writeFileSync(path.join(__dirname,'../../REAL-BOW-E2E.json'),JSON.stringify({source:'public-mhdb-20261013.tar.gz via production HTTP loader',cache,reloadRequiresCommonConditions:false,A,B,restored,rows},null,2));
});
module.exports={mount,open,select,click,save,read};
// Per-hit round2; MV176, raw90/100, HZ70, green1.05, affinity0. No production math reused.
const hopeHit=raw=>Math.round((raw*1.76*.70*equipmentSharp+Number.EPSILON)*100)/100;
const hopePower=raw=>raw*4.97*.70*equipmentSharp;
const show1=value=>(Math.round((value+Number.EPSILON)*10)/10).toFixed(1);
test('real Hope I/II equipment changes produce independent damage/DPS and survive restore reload',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(7000);await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','236');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');await click(p,'#useTargetDragonHz');a.equal(await p.evaluate(()=>dragonHitzoneSource().kind),'MHDB_PART');await select(p,'#comboMovePicker','gs_charge3');await click(p,'#addCombo');
 const conditions=async()=>a.equal(await p.evaluate(()=>Number(compareStep5Snapshot().sharp)),1.32);await conditions();await click(p,'#calcDps');await save(p,'Hope I');const A=await read(p);close(A.report.summary.damage,hopeHit(90));close(A.report.summary.dps,hopeHit(90)/2.4);
 await select(p,'#weapon','237');if(await p.locator('.comboRow').count()===0){await select(p,'#comboMovePicker','gs_charge3');await click(p,'#addCombo');}await conditions();await click(p,'#calcDps');await save(p,'Hope II');const B=await read(p);a.ok(B.report.summary.damage>0,JSON.stringify(B.report));close(B.report.summary.damage,hopeHit(100));close(B.report.summary.dps,hopeHit(100)/2.4);a.notEqual(A.snapshot.weaponId,B.snapshot.weaponId);await click(p,'#selectAllCompare');await click(p,'#runCompare');let rows=await p.evaluate(()=>createBuildComparisonReport().results);close(rows[0].dps,A.report.summary.dps);close(rows[1].dps,B.report.summary.dps);a.equal(rows[0].dpsIndex,100);close(rows[1].dpsIndex,hopeHit(100)/hopeHit(90)*100);
 await click(p,'[data-build-load="Hope I"]');await click(p,'#calcDps');a.deepEqual((await read(p)).snapshot,A.snapshot);await offlineReload(p,A,'GS');await table(p,'power-index',[show1(hopePower(90)),show1(hopePower(100))]);await table(p,'max-power-index',[show1(hopePower(90)),show1(hopePower(100))]);await table(p,'dps',[show1(hopeHit(90)/2.4),show1(hopeHit(100)/2.4)]);await table(p,'relative-power-100',['100.0','111.1']);await table(p,'dps-change',['0.0%','+11.1%']);a.match((await p.locator('[data-comparison-metric=power-index-change] td').allTextContents())[1],/^\+11\.1%/);await click(p,'[data-build-load="Hope II"]');await click(p,'#calcDps');const restored=await read(p);a.deepEqual(restored.snapshot,B.snapshot);close(restored.report.summary.dps,B.report.summary.dps);a.equal(restored.report.stages[0].timingStatus,'LEGACY_REFERENCE_ONLY');a.notEqual(restored.report.summary.dpsStatus,'VERIFIED');a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../REAL-GS-E2E.json'),JSON.stringify({A,B,rows,restored},null,2));
});
test('real series/group UI: excluded Fortify is nonblocking and Artia contributes one piece with exact identity',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(7000);await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','236');await select(p,'#monster','13');await select(p,'#monsterPart','2700');await select(p,'[data-armor="head"]','1');await select(p,'[data-armor="chest"]','2');a.equal(await p.evaluate(()=>calcState.stats.activeBonusEffects.some(e=>e.bonusSkillId===150)),false);await select(p,'[data-armor="arms"]','3');await save(p,'Excluded Fortify');await click(p,'#selectAllCompare');await click(p,'#runCompare');let rows=await p.evaluate(()=>createBuildComparisonReport().results);const r=rows[0];a.ok(r.power.normal);a.ok(r.power.maximum);a.equal(r.power.conditionPlan.applied.some(x=>x.skill==='不屈'),false);a.ok(r.power.effectPolicy.excludedEffects.some(x=>x.identity.parentId===150));
 // Use an actual completed Artia weapon and its existing UI choices.
 const artiaId=await p.locator('#weapon option').filter({hasText:'忘却のオストランツァ'}).first().getAttribute('value');a.ok(artiaId);await select(p,'#weapon',artiaId);await select(p,'#aSeries','115');await select(p,'[data-armor="head"]','349');await select(p,'[data-armor="chest"]','350');await select(p,'[data-armor="arms"]','351');await select(p,'#aGroup','150');const activation=await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===115));a.equal(activation.count,4);a.equal(activation.rankId,293);a.equal(activation.identity.parentId,115);await save(p,'Artia four pieces');const snap=await p.evaluate(()=>buildSnapshotComparable(buildSnapshot()));await click(p,'[data-build-load="Excluded Fortify"]');await click(p,'[data-build-load="Artia four pieces"]');a.deepEqual(await p.evaluate(()=>buildSnapshotComparable(buildSnapshot())),snap);
 await offlineReload(p,await read(p),'SERIES');await click(p,'[data-build-load="Artia four pieces"]');a.deepEqual(await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===115)),activation);a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../REAL-SERIES-E2E.json'),JSON.stringify({excluded:r,activation,snapshot:snap},null,2));
});
test('browser cache failure, legacy migration, rejected sessions and queued writes preserve saved builds',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage();p.on('dialog',d=>d.accept());await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','236');await save(p,'Legacy saved build');
 await p.evaluate(()=>{const map=savedBuildMap();delete map['Legacy saved build'].combo;localStorage.setItem(BUILDS_KEY,JSON.stringify(map));});await click(p,'#selectAllCompare');await click(p,'#runCompare');
 const original=await p.evaluate(()=>localStorage.getItem(BUILDS_KEY));
 // Inject a storage failure, never a successful numerical/dependency stub.
 const failed=await p.evaluate(async()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(){throw new DOMException('Test quota exhausted','QuotaExceededError');};try{return await loadData();}finally{IDBObjectStore.prototype.put=put;}});a.equal(failed,false);a.match(await p.locator('#status').innerText(),/保存は未完了/);a.equal(await p.evaluate(()=>localStorage.getItem(BUILDS_KEY)),original);
 await p.evaluate(()=>document.getElementById('calcBuild').click());await p.waitForTimeout(50);
 await p.reload();a.equal(await p.evaluate(()=>window.simulatorReady),true);a.equal(await p.evaluate(()=>localStorage.getItem(BUILDS_KEY)),original);a.equal(await p.evaluate(()=>lastBuildComparisonRows.length),1);
 const good=await p.evaluate(()=>localStorage.getItem('mhwilds-comparison-session-v1'));a.ok(good);
 await p.addInitScript(()=>{const value=localStorage.getItem('test-next-session');if(value){localStorage.removeItem('test-next-session');localStorage.setItem('mhwilds-comparison-session-v1',value);}});
 for(const invalid of ['schema','target','hbg','missing-build','combo']){
  await p.evaluate(({good,invalid})=>{const s=JSON.parse(good);if(invalid==='schema')s.schemaVersion=999;if(invalid==='target')s.target.part='missing';if(invalid==='hbg')s.conditions.hbgState.range='UNKNOWN';if(invalid==='missing-build'){s.selectedNames=['Missing'];s.comparisonRequested=true;}if(invalid==='combo')s.currentBuild.combo.moves=null;localStorage.setItem('test-next-session',JSON.stringify(s));},{good,invalid});
  // No user event after injection: failed restore must retain the invalid record.
  await p.reload();a.equal(await p.evaluate(()=>window.simulatorReady),false);a.match(await p.locator('#dataCacheStatus').innerText(),/復元できません/);a.equal(await p.evaluate(()=>localStorage.getItem(BUILDS_KEY)),original);a.equal(await p.evaluate(()=>selectedWeapon()?.id??null),null);
 }
 // Legacy cache shape is accepted unchanged and migrated to the actual new store.
 await p.evaluate(async()=>{localStorage.removeItem('mhwilds-comparison-session-v1');const kinds=new Set(),weapons=DB.weapons.filter(w=>{const k=canonicalWeaponKind(w);if(kinds.has(k))return false;kinds.add(k);return true;});const pack={savedAt:'2026-10-13T00:00:00Z',data:{...DB,weapons}};await browserDataCache.clear();localStorage.setItem(DATA_CACHE,JSON.stringify(pack));});
 await p.reload();a.equal(await p.evaluate(()=>window.simulatorReady),true);a.equal(await p.evaluate(()=>localStorage.getItem(BUILDS_KEY)),original);a.equal(await p.evaluate(async()=>!!await browserDataCache.read()),true);
 await p.evaluate(async()=>{const pack=await browserDataCache.read();await Promise.all([browserDataCache.write(pack),browserDataCache.clear(),browserDataCache.write(pack)]);if(!await browserDataCache.read())throw Error('QUEUE_LAST_WRITE_LOST');});
 fs.writeFileSync(path.join(__dirname,'../../STORAGE-EDGE-RESULT.json'),JSON.stringify({quotaFailureReturnsFalse:true,invalidSessionsRejected:5,legacyMigrated:true,savedBuildBytesPreserved:true,queuedLastWritePreserved:true},null,2));
});
