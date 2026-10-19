'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs');
const {installLocalModules}=require('./browser-test-setup.cjs');
const technique='canonical:GL_SWEEP',cases=[{name:'GL A',id:315,raw:90},{name:'GL B',id:316,raw:100}];
// Adopted BODY MV40; official maximum green1.05; Rathian head slash70; affinity0.
// Physical and elemental components round per hit. No production math in the oracle.
const oracle=c=>Math.round((c.raw*.40*1.05*.70+Number.EPSILON)*100)/100;
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-9,`${v} != ${e}`);
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function open(p,s){const ds=p.locator(s).first().locator('xpath=ancestor::details');for(let i=await ds.count()-1;i>=0;i--)if(!await ds.nth(i).evaluate(d=>d.open))await ds.nth(i).locator(':scope > summary').click();}
async function click(p,s){await open(p,s);await p.locator(s).click();}
async function select(p,s,v){await open(p,s);await p.locator(s).selectOption(v);}
function pending(v){a.equal(v.time,null);a.equal(v.dps,null);a.equal(v.dpsStatus,'TIMING_PENDING');a.equal(v.dpsReason,'COMBO_TIMING_PENDING');}
test('KAN72 real GL melee independent A/B damage, source receipts and individual offline reloads',async t=>{
 const out=fs.mkdtempSync(path.resolve(__dirname,'../../GL-evidence-')),records=[],errors=[],apiRequests=[];let offline=false;
 const write=(name,v)=>fs.writeFileSync(path.join(out,name),JSON.stringify(v,null,2));
 const archive=path.resolve(__dirname,'../docs/reports/beta-mhdb-crosscheck/evidence/public-mhdb-20261013.tar.gz');
 const archiveSHA=hash(fs.readFileSync(archive));a.equal(archiveSHA,'8db9204727236ed093a90246bbe50ff53c88e38b3d4f2f9347194349c0f239dc');
 // Independent direct extraction binds imported fixture to the hashed archive.
 const direct=Object.fromEntries(['weapons','armor','charms','decorations','skills','sets','monsters'].map(k=>[k,JSON.parse(cp.execFileSync('tar',['-xOzf',archive,k+'.json'],{encoding:'utf8',maxBuffer:30e6}))]));
 a.deepEqual(db,direct);
 const monster=direct.monsters.find(x=>x.id===13),part=monster.parts.find(x=>x.id===2700),skill=direct.skills.find(x=>x.id===126);
 a.equal(part.multipliers.slash,.70);
 for(const c of cases){const w=direct.weapons.find(x=>x.id===c.id);a.equal(w.damage.raw,c.raw);a.equal(w.affinity,0);a.deepEqual(w.specials,[]);a.deepEqual(w.slots,[]);a.ok(w.sharpness.green>0);for(const color of ['blue','white','purple'])a.equal(w.sharpness[color],0);
  if(c.id===315)a.deepEqual(w.skills,[]);else{a.equal(w.skills.length,1);a.equal(w.skills[0].skill.id,126);a.equal(w.skills[0].id,330);a.equal(w.skills[0].level,1);a.equal(skill.ranks.find(x=>x.id===330).level,1);}
 }
 a.equal(oracle(cases[0]),26.46);a.equal(oracle(cases[1]),29.40);
 const provenance={archiveSHA,fixtureEqualsDirectArchive:true,recordHashes:Object.fromEntries(cases.map(c=>['weapon'+c.id,hash(JSON.stringify(direct.weapons.find(w=>w.id===c.id)))])),skill126:hash(JSON.stringify(skill)),monster13:hash(JSON.stringify(monster)),part2700:hash(JSON.stringify(part))};write('SOURCE.json',provenance);
 const browser=await chromium.launch({headless:true}),p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(10000);
 p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push(e.message));
 t.after(async()=>{try{write('PROGRESS.json',{provenance,records,errors,apiRequests});await p.screenshot({path:path.join(out,'LAST.png'),fullPage:true});console.log('GL evidence:',out);}finally{await browser.close();}});
 await p.route('**/*',r=>{
  const u=new URL(r.request().url());if(u.href==='https://simulator.test/')return r.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8')});
  if(u.origin==='https://wilds.mhdb.io'){
   if(offline){apiRequests.push(u.href);return r.abort();}
   const key={'/ja/skills':'skills','/ja/armor':'armor','/ja/decorations':'decorations','/ja/charms':'charms','/ja/armor/sets':'sets','/ja/weapons':'weapons','/ja/monsters':'monsters'}[u.pathname];a.ok(key,u.href);
   const offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||db[key].length);
   return r.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(db[key].slice(offset,offset+limit))});
  }return r.abort();
 });
 await installLocalModules(p);await p.goto('https://simulator.test/');await p.evaluate(()=>window.simulatorReady);
 await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'),{},{timeout:60000});const loadedDB=await p.evaluate(()=>JSON.stringify(DB));
 await select(p,'#weaponKind','gunlance');await select(p,'#weapon','315');
 for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');
 await select(p,'#monster','13');await select(p,'#monsterPart','2700');
 async function selected(c,label){
  await select(p,'#comboMovePicker',technique);await click(p,'#calcSelectedTechniqueDamage');
  const singleUI=await p.locator('#singleTechniqueDamageOut').innerText();records.push({label,phase:'single UI first',singleUI});a.ok(singleUI.startsWith('選択技 合計ダメージ：'+oracle(c).toFixed(2)),singleUI);
  await click(p,'#calcUserComboDamage');await click(p,'#calcDps');
  const comboUI=await p.locator('#userComboDamageOut').innerText(),dpsUI=await p.locator('#dpsOut').innerText();records.push({label,phase:'combo UI first',comboUI,dpsUI});
  a.ok(comboUI.startsWith('指定コンボ 合計ダメージ：'+oracle(c).toFixed(2)),comboUI);a.match(dpsUI,/所要時間が未確認のためDPSは算出できません/);
  // Direct internal calculations occur only after the independent UI assertions.
  const v=await p.evaluate(()=>({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stats:calcState.stats,total:calcState.total,single:calcSelectedTechniqueDamage(),report:createComboVerificationReport()}));records.push({label,phase:'internal after UI',v});
  a.equal(String(v.snapshot.weaponId),String(c.id));close(v.stats.attackTrue,c.raw);close(v.stats.affinity,0);close(v.stats.maxAffinity,0);close(v.stats.element,0);a.deepEqual(v.total,c.id===315?{}:{'砥石使用高速化':1});
  a.deepEqual(v.snapshot.combo.moves,[{techniqueId:technique}]);a.deepEqual(v.report.target,{monster:'13',part:'2700'});close(v.report.context.hz,70);close(v.report.context.sharp,1.05);
  close(v.single.damage,oracle(c));pending(v.single);pending(v.report.summary);close(v.report.summary.damage,oracle(c));a.equal(v.report.summary.status,'TIMING_PENDING');
  a.equal(v.report.stages.length,1);const s=v.report.stages[0];a.equal(s.canonicalTechniqueId,'GL_SWEEP');a.equal(s.handler,'OrdinaryHit');a.equal(s.verificationStatus,'PARTIALLY_VERIFIED');a.equal(s.timingStatus,'PENDING');a.equal(s.time,null);a.equal(s.hits.length,1);a.equal(s.hits[0].mv,40);close(s.hits[0].physical,oracle(c));close(s.hits[0].total,oracle(c));a.equal(s.hits[0].element,0);
  a.equal(v.report.rounding,'PER_HIT_PHYSICAL_ELEMENT_2_DECIMAL_REFERENCE_NOT_GAME_DISPLAY');return v;
 }
 const saved=[];
 for(const c of cases){await select(p,'#weapon',String(c.id));await select(p,'#comboMovePicker',technique);await open(p,'#combo');while(await p.locator('#combo .del').count())await p.locator('#combo .del').first().click();await click(p,'#addCombo');saved.push(await selected(c,'save '+c.name));await open(p,'#buildName');await p.locator('#buildName').fill(c.name);await click(p,'#saveBuild');}
 async function comparison(label){
  a.deepEqual(await p.locator('[data-comparison-metric="reference-combo-damage"] td').allTextContents(),cases.map(c=>oracle(c).toFixed(1)));
  const cells=await p.locator('[data-comparison-metric="dps"] td').allTextContents();a.equal(cells.length,2);for(const text of cells)a.match(text,/未算出.*時間/);
  const rows=await p.evaluate(()=>createBuildComparisonReport().results);records.push({label,phase:'comparison after UI',rows});a.equal(rows.length,2);
  for(const c of cases){const row=rows.find(x=>x.name===c.name);a.ok(row);close(row.attackTrue,c.raw);close(row.referenceCombo.damage,oracle(c));close(row.comboVerification.damage,oracle(c));pending(row.comboVerification);a.equal(row.dps,null);a.equal(row.dpsReason,'COMBO_TIMING_PENDING');
   // Actual calculation receipt, not only the fixture import, must retain archive identities.
   const receipt=JSON.parse(row.comboVerification.inputReceipt.signature);a.deepEqual(receipt.weapon,direct.weapons.find(x=>x.id===c.id));a.deepEqual(receipt.target.monster,monster);a.deepEqual(receipt.target.part,part);a.equal(receipt.target.hitzones.hz,70);a.deepEqual(receipt.total,c.id===315?{}:{'砥石使用高速化':1});
  }return rows;
 }
 await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('initial');const savedBefore=await p.evaluate(()=>JSON.stringify(savedBuildMap()));offline=true;
 for(const [i,c]of cases.entries()){
  await click(p,`[data-build-load="${c.name}"]`);const restored=await selected(c,'restore '+c.name);a.deepEqual(restored.snapshot,saved[i].snapshot);
  await p.reload();await p.evaluate(()=>window.simulatorReady);a.equal(await p.evaluate(()=>JSON.stringify(DB)),loadedDB);a.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),savedBefore);a.deepEqual(await p.evaluate(()=>compareStep5Snapshot()),restored.conditions);
  await comparison('automatic reload '+c.name);const reloaded=await selected(c,'reload '+c.name);a.deepEqual(reloaded.snapshot,saved[i].snapshot);a.deepEqual(apiRequests,[]);
  await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('rerun '+c.name);await open(p,'#compareOut');await p.locator('#compareOut').screenshot({path:path.join(out,c.id+'-COMPARISON.png')});await p.screenshot({path:path.join(out,c.id+'-RELOAD.png'),fullPage:true});
 }
 a.deepEqual(errors,[]);a.deepEqual(apiRequests,[]);
 write('COMPLETE.json',{status:'PASS',scope:'GL_SWEEP_BODY_ONLY_NO_SHELL_WYRMSTAKE_ELEMENT_OR_FULL_STANDARD_CERTIFICATION',provenance,cases:cases.map(c=>({...c,expected:oracle(c)})),records,apiRequests,errors,timing:'PENDING: no timing supplied or DPS adoption promoted'});
});
