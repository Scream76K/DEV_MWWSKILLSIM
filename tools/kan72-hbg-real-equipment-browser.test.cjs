'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const {db}=require('./kan108-fixture.cjs');
const {installLocalModules}=require('./browser-test-setup.cjs');
const technique='canonical:HBG_NORMAL_AMMO_1';
const cases=[{name:'HBG A',id:469,raw:110,fs:1,add:5},{name:'HBG B',id:470,raw:150,fs:2,add:10}];
// RELEASE_r119/r120 source references: MV17, three contacts, First Shot +5/+10.
// Independent arithmetic; no production evaluator supplies expected values.
const oracle=c=>({hit:(c.raw+c.add)*17/100*65/100,total:(c.raw+c.add)*17/100*65/100*3});
const close=(v,e)=>assert.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-9,`${v} != ${e}`);
async function open(p,s){const ds=p.locator(s).first().locator('xpath=ancestor::details');for(let i=0;i<await ds.count();i++)if(!await ds.nth(i).evaluate(d=>d.open))await ds.nth(i).locator(':scope > summary').click();}
async function click(p,s){await open(p,s);await p.locator(s).click();}
async function select(p,s,v){await open(p,s);await p.locator(s).selectOption(v);}
async function fill(p,s,v){await open(p,s);await p.locator(s).fill(v);}
test('KAN72 real HBG A/B unrounded normal damage and adopted cycle DPS survive individual offline reloads',async t=>{
 const out=fs.mkdtempSync(path.resolve(__dirname,'../../HBG-evidence-'));
 const records=[],errors=[],apiRequests=[];let offline=false;
 const write=(name,v)=>fs.writeFileSync(path.join(out,name),JSON.stringify(v,null,2));
 const archive=path.resolve(__dirname,'../docs/reports/beta-mhdb-crosscheck/evidence/public-mhdb-20261013.tar.gz');
 const sha=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
 assert.equal(sha,'8db9204727236ed093a90246bbe50ff53c88e38b3d4f2f9347194349c0f239dc');
 for(const c of cases){const w=db.weapons.find(w=>w.id===c.id);assert.equal(w.damage.raw,c.raw);assert.equal(w.affinity,0);assert.deepEqual(w.specials,[]);assert.equal(w.skills.length,1);assert.equal(w.skills[0].skill.id,140);assert.equal(w.skills[0].level,c.fs);assert.ok(w.ammo.some(a=>a.kind==='normal'&&a.level===1&&a.capacity===5));}
 const browser=await chromium.launch({headless:true});
 const p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(10000);
 p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push(e.message));
 t.after(async()=>{try{write('PROGRESS.json',{sha,cases:cases.map(c=>({...c,expected:oracle(c)})),records,errors,apiRequests});await p.screenshot({path:path.join(out,'LAST.png'),fullPage:true});console.log('HBG evidence:',out);}finally{await browser.close();}});
 await p.route('**/*',r=>{
  const u=new URL(r.request().url());
  if(u.href==='https://simulator.test/')return r.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8')});
  if(u.origin==='https://wilds.mhdb.io'){
   if(offline){apiRequests.push(u.href);return r.abort();}
   const key={'/ja/skills':'skills','/ja/armor':'armor','/ja/decorations':'decorations','/ja/charms':'charms','/ja/armor/sets':'sets','/ja/weapons':'weapons','/ja/monsters':'monsters'}[u.pathname];
   assert.ok(key,'Unexpected API '+u.href);const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||db[key].length);
   return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(db[key].slice(offset,offset+limit))});
  }return r.abort();
 });
 await installLocalModules(p);await p.goto('https://simulator.test/');await p.evaluate(()=>window.simulatorReady);
 await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'),{},{timeout:60000});
 const loadedDB=await p.evaluate(()=>JSON.stringify(DB));
 await select(p,'#weaponKind','heavy-bowgun');await select(p,'#weapon','469');
 for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');
 await select(p,'#monster','13');await select(p,'#monsterPart','2700');
 for(const [s,v]of [['#powerHbgAmmoLevel','1'],['#powerHbgRange','CRITICAL'],['#powerHbgNormalMode','0'],['#powerHbgFullMagazine','YES']])await select(p,s,v);
 await fill(p,'#powerHbgCapacity','5');await fill(p,'#powerHbgShotOrdinal','1');
 async function selected(c,label,seconds=87/60){
  await select(p,'#comboMovePicker',technique);await click(p,'#calcSelectedTechniqueDamage');
  const ui=await p.locator('#singleTechniqueDamageOut').innerText();records.push({label,phase:'single UI first',ui});
  assert.ok(ui.startsWith('選択技 合計ダメージ：'+oracle(c).total.toFixed(2)),ui);
  await click(p,'#calcUserComboDamage');await click(p,'#calcDps');
  const comboUI=await p.locator('#userComboDamageOut').innerText(),dpsUI=await p.locator('#dpsOut').innerText();
  records.push({label,phase:'combo UI first',comboUI,dpsUI});
  assert.ok(comboUI.startsWith('指定コンボ 合計ダメージ：'+oracle(c).total.toFixed(2)),comboUI);
  assert.ok(dpsUI.includes('DPS：'+(oracle(c).total/seconds).toFixed(2)),dpsUI);assert.doesNotMatch(dpsUI,/OWNER_ADOPTED|PROVISIONAL/);
  // UI independent assertions precede any direct internal calculation/report call.
  const v=await p.evaluate(()=>({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stats:calcState.stats,total:calcState.total,single:calcSelectedTechniqueDamage(),report:createComboVerificationReport()}));
  records.push({label,phase:'internal after UI',v});
  assert.equal(String(v.snapshot.weaponId),String(c.id));close(v.stats.attackTrue,c.raw);close(v.stats.affinity,0);close(v.stats.maxAffinity,0);
  assert.equal(v.total['ファーストショット'],c.fs);assert.equal(v.total['フォースショット']||0,0);assert.equal(v.total['通常弾・通常矢強化']||0,0);
  assert.equal(Number(v.conditions.hz),65);
  assert.deepEqual(v.conditions.hbgState,{ammoType:'NORMAL',ammoLevel:1,range:'CRITICAL',normalModeLevel:0,magazineCapacity:5,shotOrdinal:1,fullMagazine:true});
  close(v.single.damage,oracle(c).total);assert.equal(v.single.time,seconds);close(v.single.dps,oracle(c).total/seconds);assert.equal(v.single.dpsStatus,'CALCULATED');assert.equal(v.single.dpsReason,null);assert.equal(v.report.summary.time,seconds);close(v.report.summary.dps,oracle(c).total/seconds);assert.equal(v.report.summary.dpsStatus,'CALCULATED');close(v.report.summary.damage,oracle(c).total);
  assert.equal(v.report.stages.length,1);const s=v.report.stages[0];assert.equal(s.canonicalTechniqueId,'HBG_NORMAL_AMMO_1');assert.equal(s.timingStatus,seconds===87/60?'OWNER_ADOPTED_REFERENCE':'USER_MEASURED_REFERENCE');assert.equal(s.time,seconds);if(seconds===87/60){assert.equal(s.timingEvidence.adoptionId,'KAN17-66-HBG-NORMAL-LV1-CYCLE');assert.equal(s.timingEvidence.measurement,null);assert.equal(s.timingEvidence.cycleModel.nonMountedAdoptionAssumption,true);assert.equal(s.timingEvidence.cycleModel.reloadIncluded,false);assert.equal(v.report.summary.calculationReceipt.techniques[0].timingAdoption.id,'KAN17-66-HBG-NORMAL-LV1-CYCLE');}else assert.equal(v.report.summary.calculationReceipt.techniques[0].timingAdoption,undefined);assert.equal(s.hits.length,3);
  for(const h of s.hits){close(h.physical,oracle(c).hit);close(h.total,oracle(c).hit);assert.equal(h.element,0);}
  assert.equal(s.rounding,'UNROUNDED_REFERENCE');
  assert.equal(v.report.rounding,'UNROUNDED_REFERENCE');
  return v;
 }
 const saved=[];
 for(const c of cases){
  await select(p,'#weapon',String(c.id));await select(p,'#comboMovePicker',technique);
  await open(p,'#combo');while(await p.locator('#combo .del').count())await p.locator('#combo .del').first().click();await click(p,'#addCombo');
  const v=await selected(c,'save '+c.name);await fill(p,'#buildName',c.name);await click(p,'#saveBuild');saved.push(v);
 }
 async function comparison(label,seconds=87/60){
  for(const metric of ['power-index','max-power-index','reference-combo-damage'])assert.deepEqual(await p.locator(`[data-comparison-metric="${metric}"] td`).allTextContents(),cases.map(c=>oracle(c).total.toFixed(1)),label+' '+metric);
  const dps=await p.locator('[data-comparison-metric="dps"] td').allTextContents();assert.deepEqual(dps,cases.map(c=>(oracle(c).total/seconds).toFixed(1)));
  const rows=await p.evaluate(()=>createBuildComparisonReport().results);records.push({label,phase:'comparison after UI',rows});assert.equal(rows.length,2);
  for(const c of cases){const r=rows.find(r=>r.name===c.name);assert.ok(r);close(r.attackTrue,c.raw);close(r.dps,oracle(c).total/seconds);assert.equal(r.dpsReason,null);assert.equal(r.comboVerification.time,seconds);close(r.comboVerification.dps,oracle(c).total/seconds);close(r.comboVerification.damage,oracle(c).total);
   for(const channel of ['normal','maximum']){const v=r.power[channel];close(v.comparisonPower,oracle(c).total);assert.equal(v.element,0);assert.equal(v.rounding,'UNROUNDED_REFERENCE');assert.equal(v.ammoCapacityVerified,false);assert.equal(v.weaponApplicability,'UNVERIFIED');assert.equal(v.liveGameVerification,'PENDING');assert.equal(v.trace.length,3);for(const h of v.trace){close(h.physical,oracle(c).hit);assert.equal(h.shotAttackAdd,c.add);assert.equal(h.shotOrdinal,1);}}
  }return rows;
 }
 await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('initial');
 const savedBefore=await p.evaluate(()=>JSON.stringify(savedBuildMap()));
 offline=true;
 for(const [i,c]of cases.entries()){
  await click(p,`[data-build-load="${c.name}"]`);const restored=await selected(c,'restore '+c.name);assert.deepEqual(restored.snapshot,saved[i].snapshot);
  await p.reload();await p.evaluate(()=>window.simulatorReady);
  assert.equal(await p.evaluate(()=>JSON.stringify(DB)),loadedDB);assert.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),savedBefore);assert.deepEqual(await p.evaluate(()=>compareStep5Snapshot()),restored.conditions);
  await comparison('automatic reload '+c.name);
  const reloaded=await selected(c,'reload '+c.name);assert.deepEqual(reloaded.snapshot,saved[i].snapshot);assert.deepEqual(apiRequests,[]);
  await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('rerun '+c.name);
  await open(p,'#compareOut');await p.locator('#compareOut').screenshot({path:path.join(out,c.id+'-COMPARISON.png')});await p.screenshot({path:path.join(out,c.id+'-RELOAD.png'),fullPage:true});
 }
 // Measurement replaces only the reference cycle and invalidates cached comparison before resize.
 await select(p,'#canonicalTimingTechnique',technique);await fill(p,'#canonicalTimingSeconds','2');await fill(p,'#canonicalTimingVersion','1.042.00.02');await fill(p,'#canonicalTimingNote','Synthetic browser fixture, not live-game evidence');await click(p,'#canonicalTimingSave');
 assert.equal(await p.locator('#compareOut table').count(),0);await p.setViewportSize({width:1000,height:900});assert.equal(await p.locator('#compareOut table').count(),0);
 await selected(cases[1],'measured replacement',2);await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('measured comparison',2);
 await click(p,'#canonicalTimingRemove');assert.equal(await p.locator('#compareOut table').count(),0);await selected(cases[1],'reference restored');await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('reference restored comparison');
 assert.deepEqual(errors,[]);assert.deepEqual(apiRequests,[]);
 write('COMPLETE.json',{status:'PASS',scope:'REAL_EQUIPMENT_DAMAGE_AND_OWNER_REFERENCE_CYCLE_NOT_LIVE_VERIFIED',sha,cases:cases.map(c=>({...c,expected:oracle(c)})),records,apiRequests,errors,metadataScope:'Explicit UNROUNDED_REFERENCE reaches HBG report stages and top level, including individual restores/reloads. Unchanged legacy labels for unknown/mixed handlers are not certified by this test.'});
});
