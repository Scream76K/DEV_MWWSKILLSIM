'use strict';
const config={"key":"sa-axe","kind":"switch-axe","techniqueId":"SA_AXE_MORPH_SLASH","mvs":[33],"elements":[1],"verification":"VERIFIED","cases":[{"name":"sa-axe A","id":914,"raw":90,"hits":[21.83],"hitUI":["21.83"],"total":21.83,"ui2":"21.83","comparison1":"21.8"},{"name":"sa-axe B","id":915,"raw":100,"hits":[24.26],"hitUI":["24.26"],"total":24.26,"ui2":"24.26","comparison1":"24.3"}]};
const {test}=require('node:test'),a=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs');
const {installLocalModules}=require('./browser-test-setup.cjs');
const technique='canonical:'+config.techniqueId,lbg=config.kind==='light-bowgun',ig=config.kind==='insect-glaive';
// Independent expectations were fixed using decimal arithmetic before product execution.
// Melee: round each physical hit to cents; element/special zero. No aggregate rounding.
// LBG: raw * .17 * .65 * .8 * .9625 per contact, three contacts, unrounded sum.
// Integer arithmetic avoids deriving boundary expectations from binary product results.
const expectedHit=(c,mv)=>lbg?c.raw*17*65*8*9625/1000000000:Math.floor((c.raw*mv*735+500)/1000)/100;
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-9,`${v} != ${e}`);
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function open(p,s){const ds=p.locator(s).first().locator('xpath=ancestor::details');for(let i=await ds.count()-1;i>=0;i--)if(!await ds.nth(i).evaluate(d=>d.open))await ds.nth(i).locator(':scope > summary').click();}
async function click(p,s){await open(p,s);await p.locator(s).click();}
async function select(p,s,v){await open(p,s);await p.locator(s).selectOption(v);}
function pending(v){a.equal(v.time,null);a.equal(v.dps,null);a.equal(v.dpsStatus,'TIMING_PENDING');a.equal(v.dpsReason,'COMBO_TIMING_PENDING');}
const totalSkills=c=>lbg?{'ＫＯ術':c.id===780?2:3}:c===config.cases[0]?{}:{'砥石使用高速化':1};
test('KAN72 '+config.key+' real equipment independent hits, saved A/B and individual offline reload',async t=>{
 const out=fs.mkdtempSync(path.resolve(__dirname,'../../'+config.key+'-evidence-')),records=[],errors=[],apiRequests=[];let offline=false;
 const write=(name,v)=>fs.writeFileSync(path.join(out,name),JSON.stringify(v,null,2));
 const archive=path.resolve(__dirname,'../docs/reports/beta-mhdb-crosscheck/evidence/public-mhdb-20261013.tar.gz');
 const savedMHDBArchiveSHA=hash(fs.readFileSync(archive));a.equal(savedMHDBArchiveSHA,'8db9204727236ed093a90246bbe50ff53c88e38b3d4f2f9347194349c0f239dc');
 const direct=Object.fromEntries(['weapons','armor','charms','decorations','skills','sets','monsters'].map(k=>[k,JSON.parse(cp.execFileSync('tar',['-xOzf',archive,k+'.json'],{encoding:'utf8',maxBuffer:30e6}))]));a.deepEqual(db,direct);
 const monster=direct.monsters.find(x=>x.id===13),part=monster.parts.find(x=>x.id===2700);a.equal(part.multipliers[lbg?'pierce':'slash'],lbg?.65:.70);
 for(const c of config.cases){
  const weapon=direct.weapons.find(x=>x.id===c.id);a.equal(weapon.kind,config.kind);a.equal(weapon.damage.raw,c.raw);a.equal(weapon.affinity,lbg?-15:0);a.deepEqual(weapon.specials,[]);
  a.deepEqual(Object.fromEntries(weapon.skills.map(x=>[x.skill.name,x.level])),totalSkills(c));
  for(const rank of weapon.skills){const skill=direct.skills.find(x=>x.id===rank.skill.id);a.equal(skill.name,rank.skill.name);a.equal(skill.ranks.find(x=>x.id===rank.id).level,rank.level);}
  if(lbg){const ammo=weapon.ammo.find(x=>x.kind==='normal'&&x.level===1);a.equal(ammo.capacity,5);a.equal(ammo.rapid,false);}
  else{a.ok(weapon.sharpness.green>0);for(const color of ['blue','white','purple'])a.equal(weapon.sharpness[color],0);}
  if(config.kind==='switch-axe')a.equal(weapon.phial.kind,'power');
  config.mvs.forEach((mv,i)=>close(expectedHit(c,mv),c.hits[i]));close(c.hits.reduce((x,y)=>x+y,0),c.total);
 }
 const provenance={savedMHDBArchiveSHA,fixtureEqualsDirectArchive:true,recordHashes:Object.fromEntries(config.cases.map(c=>['weapon'+c.id,hash(JSON.stringify(direct.weapons.find(w=>w.id===c.id)))])),monster13:hash(JSON.stringify(monster)),part2700:hash(JSON.stringify(part))};write('SOURCE.json',provenance);
 const browser=await chromium.launch({headless:true}),p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(10000);p.on('dialog',d=>d.accept());p.on('pageerror',e=>errors.push(e.message));
 t.after(async()=>{try{write('PROGRESS.json',{config,provenance,records,errors,apiRequests});await p.screenshot({path:path.join(out,'LAST.png'),fullPage:true});console.log(config.key+' evidence:',out);}finally{await browser.close();}});
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
 await select(p,'#weaponKind',config.kind);await select(p,'#weapon',String(config.cases[0].id));
 for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');
 await select(p,'#monster','13');await select(p,'#monsterPart','2700');
 async function selected(c,label){
  if(ig){a.equal(await p.locator('#comboIGExtract').inputValue(),'NO_EXTRACT');a.equal(await p.locator('#comboIGKinsect').inputValue(),'STOWED');}
  if(lbg)a.equal(await p.locator('#comboLBGMode').inputValue(),'NORMAL');
  await select(p,'#comboMovePicker',technique);await click(p,'#calcSelectedTechniqueDamage');
  const singleUI=await p.locator('#singleTechniqueDamageOut').innerText();records.push({label,phase:'single UI first',singleUI});a.ok(singleUI.startsWith('選択技 合計ダメージ：'+c.ui2),singleUI);
  await click(p,'#calcUserComboDamage');await click(p,'#calcDps');
  const comboUI=await p.locator('#userComboDamageOut').innerText(),dpsUI=await p.locator('#dpsOut').innerText();records.push({label,phase:'combo UI first',comboUI,dpsUI});
  a.ok(comboUI.startsWith('指定コンボ 合計ダメージ：'+c.ui2),comboUI);a.match(dpsUI,/所要時間が未確認のためDPSは算出できません/);
  await open(p,'#dpsOut .combo-hit-detail tbody');const hitRows=p.locator('#dpsOut .combo-hit-detail tbody tr'),uiHits=[];a.equal(await hitRows.count(),c.hits.length);
  for(let i=0;i<await hitRows.count();i++){
   const row=hitRows.nth(i),labelText=await row.locator('th').innerText(),values=await row.locator('td').allTextContents();a.equal(labelText.replace(/\s+/g,''),String(i+1)+'本体');
   a.deepEqual(values,[c.hitUI[i],'0.00','0.00',c.hitUI[i]]);uiHits.push({labelText,values});
  }
  records.push({label,phase:'hit components UI first',uiHits});
  // Reports are recalculated only after independent assertions against visible UI.
  const v=await p.evaluate(()=>({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stats:calcState.stats,total:calcState.total,single:calcSelectedTechniqueDamage(),report:createComboVerificationReport()}));records.push({label,phase:'internal after UI',v});
  a.equal(String(v.snapshot.weaponId),String(c.id));close(v.stats.attackTrue,c.raw);close(v.stats.affinity,lbg?-15:0);close(v.stats.maxAffinity,lbg?-15:0);close(v.stats.element,0);a.deepEqual(v.total,totalSkills(c));
  a.deepEqual(v.snapshot.combo.moves,[{techniqueId:technique}]);a.deepEqual(v.report.target,{monster:'13',part:'2700'});close(v.report.context.hz,lbg?65:70);if(!lbg)close(v.report.context.sharp,1.05);
  if(ig)a.deepEqual(v.snapshot.combo.insectGlaiveState,{extractState:'NO_EXTRACT',kinsectState:'STOWED'});
  if(lbg)a.deepEqual(v.snapshot.combo.lightBowgunState,{shotMode:'NORMAL'});
  if(config.kind==='switch-axe')close(v.stats.rapidMorphLevel,0);
  close(v.single.damage,c.total);pending(v.single);pending(v.report.summary);close(v.report.summary.damage,c.total);a.equal(v.report.summary.status,'TIMING_PENDING');
  a.equal(v.report.stages.length,1);const s=v.report.stages[0];a.equal(s.canonicalTechniqueId,config.techniqueId);a.equal(s.handler,lbg?'RangedReferenceHandler':ig?'InsectGlaiveBodyHandler':'OrdinaryHit');a.equal(s.verificationStatus,config.verification);a.equal(s.timingStatus,'PENDING');a.equal(s.time,null);a.equal(s.hits.length,c.hits.length);
  for(const [i,h]of s.hits.entries()){a.equal(h.component,'BODY');if(!lbg){a.equal(h.mv,config.mvs[i]);a.equal(h.elementModifier,config.elements[i]);}close(h.physical,c.hits[i]);close(h.total,c.hits[i]);close(h.element,0);close(h.special,0);a.equal(h.partModifierAppliedToHp,false);}
  a.equal(v.report.rounding,lbg?'UNROUNDED_REFERENCE':'PER_HIT_PHYSICAL_ELEMENT_2_DECIMAL_REFERENCE_NOT_GAME_DISPLAY');
  if(lbg){const result=v.single.stages[0].result;a.equal(s.rounding,'UNROUNDED_REFERENCE');a.equal(result.weaponApplicability,'UNVERIFIED');a.equal(result.ammoCapacityVerified,false);a.equal(result.trace.length,3);
   for(const hit of result.trace){close(hit.mv,17);close(hit.weaponPhysicalModifier,.8);close(hit.criticalExpectation,.9625);a.equal(hit.sharpnessApplied,false);a.equal(hit.weaponElementApplied,false);}
  }
  return v;
 }
 const saved=[];
 for(const c of config.cases){
  await select(p,'#weapon',String(c.id));if(ig){await select(p,'#comboIGExtract','NO_EXTRACT');await select(p,'#comboIGKinsect','STOWED');}if(lbg)await select(p,'#comboLBGMode','NORMAL');
  await select(p,'#comboMovePicker',technique);await open(p,'#combo');while(await p.locator('#combo .del').count())await p.locator('#combo .del').first().click();await click(p,'#addCombo');
  saved.push(await selected(c,'save '+c.name));await open(p,'#buildName');await p.locator('#buildName').fill(c.name);await click(p,'#saveBuild');
 }
 async function comparison(label){
  // Explicit independent decimal display expectations, not production formatting.
  a.deepEqual(await p.locator('[data-comparison-metric="reference-combo-damage"] td').allTextContents(),config.cases.map(c=>c.comparison1));
  const cells=await p.locator('[data-comparison-metric="dps"] td').allTextContents();a.equal(cells.length,2);for(const text of cells)a.match(text,/未算出.*時間/);
  const rows=await p.evaluate(()=>createBuildComparisonReport().results);records.push({label,phase:'comparison after UI',rows});a.equal(rows.length,2);
  for(const c of config.cases){const row=rows.find(x=>x.name===c.name);a.ok(row);close(row.attackTrue,c.raw);close(row.referenceCombo.damage,c.total);close(row.comboVerification.damage,c.total);pending(row.comboVerification);a.equal(row.dps,null);a.equal(row.dpsReason,'COMBO_TIMING_PENDING');
   const receipt=JSON.parse(row.comboVerification.inputReceipt.signature);a.deepEqual(receipt.weapon,direct.weapons.find(x=>x.id===c.id));a.deepEqual(receipt.target.monster,monster);a.deepEqual(receipt.target.part,part);a.equal(receipt.target.hitzones.hz,lbg?65:70);a.deepEqual(receipt.total,totalSkills(c));
  }return rows;
 }
 await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('initial');const savedBefore=await p.evaluate(()=>JSON.stringify(savedBuildMap()));offline=true;
 for(const [i,c]of config.cases.entries()){
  await click(p,`[data-build-load="${c.name}"]`);const restored=await selected(c,'restore '+c.name);a.deepEqual(restored.snapshot,saved[i].snapshot);
  await p.reload();await p.evaluate(()=>window.simulatorReady);a.equal(await p.evaluate(()=>JSON.stringify(DB)),loadedDB);a.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),savedBefore);a.deepEqual(await p.evaluate(()=>compareStep5Snapshot()),restored.conditions);
  await comparison('automatic reload '+c.name);const reloaded=await selected(c,'reload '+c.name);a.deepEqual(reloaded.snapshot,saved[i].snapshot);a.deepEqual(apiRequests,[]);
  await click(p,'#selectAllCompare');await click(p,'#runCompare');await comparison('rerun '+c.name);await open(p,'#compareOut');await p.locator('#compareOut').screenshot({path:path.join(out,c.id+'-COMPARISON.png')});await p.screenshot({path:path.join(out,c.id+'-RELOAD.png'),fullPage:true});
 }
 a.deepEqual(errors,[]);a.deepEqual(apiRequests,[]);write('COMPLETE.json',{status:'PASS',scope:config.key+'_LIMITED_ADOPTED_ROUTE_ONLY',config,provenance,records,apiRequests,errors,timing:'PENDING; no measured time or DPS adoption',limits:'No full STANDARD, all-state, phial, element or live-game certification'});
});
