const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {db}=require('./kan108-fixture.cjs');
const {installLocalModules}=require('./browser-test-setup.cjs');
const evidenceRoot=path.resolve(__dirname,'../docs/reports/kan72-hammer-e2e');
let evidence;
async function open(page,selector){
  const parents=page.locator(selector).first().locator('xpath=ancestor::details');
  for(let i=await parents.count()-1;i>=0;i--){const d=parents.nth(i);if(!await d.evaluate(x=>x.open))await d.locator(':scope > summary').click();}
}
async function select(page,selector,value){await open(page,selector);await page.locator(selector).selectOption(value);}
async function click(page,selector){await open(page,selector);await page.locator(selector).click();}
async function mount(page,{weaponRecord=w=>w}={}){
  const api={'/ja/skills':'skills','/ja/armor':'armor','/ja/decorations':'decorations','/ja/charms':'charms','/ja/armor/sets':'sets','/ja/weapons':'weapons','/ja/monsters':'monsters'};
  await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.href==='https://simulator.test/')return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve(__dirname,'../index.html'),'utf8')});
    if(u.origin==='https://wilds.mhdb.io'&&api[u.pathname]){
      const rows=api[u.pathname]==='weapons'?db.weapons.map(weaponRecord):db[api[u.pathname]],offset=Number(u.searchParams.get('offset')||0),limit=Number(u.searchParams.get('limit')||rows.length);
      return route.fulfill({contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(rows.slice(offset,offset+limit))});
    }
    return route.abort();
  });
  await installLocalModules(page);
  await page.goto('https://simulator.test/');
  await page.evaluate(()=>window.simulatorReady);
}
// Detects wrong canonical MV, timing, equipment sharpness or saved/reloaded combo propagation.
// Independent oracle: adopted HAM_SIDE_SWING MV23, green1.05, MHDB blunt75, affinity0.
// Per-hit physical rounding first, then sum two hits; never round the unrounded combo total.
// 0.45 seconds remains LEGACY_REFERENCE_ONLY, never measured/VERIFIED.
test('KAN-72 Hope Hammer side swing single, repeated combo, saved A/B and offline reload',async t=>{
 fs.mkdirSync(evidenceRoot,{recursive:true});
 evidence=fs.mkdtempSync(path.join(evidenceRoot,'run-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'));
 console.log('EVIDENCE_DIRECTORY='+evidence);
 const records=[];let stage='browser launch';
 const persist=(name,value)=>fs.writeFileSync(path.join(evidence,name),JSON.stringify(value,null,2));
 const close=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
 const oracle=raw=>{const single=Math.round((raw*.23*1.05*.75+Number.EPSILON)*100)/100;return {single,damage:2*single,time:.9,dps:2*single/.9};};
 const displayed=(text,pattern,expected)=>{const match=text.match(pattern);assert.ok(match,`Unexpected UI: ${text}`);assert.equal(Number(match[1]),Number(expected.toFixed(2)));};
 let page;
 try{
  const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
  page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  stage='load saved official MHDB fixture';await mount(page);await click(page,'#load');
  await page.waitForFunction(()=>document.body.innerText.includes('データ取得完了'),{},{timeout:60000});
  const loadedDB=await page.evaluate(()=>JSON.stringify(DB));
  await select(page,'#weaponKind','hammer');await select(page,'#weapon','387');
  for(const slot of ['head','chest','arms','waist','legs'])await select(page,`[data-armor="${slot}"]`,'');
  await select(page,'#monster','13');await select(page,'#monsterPart','2700');await select(page,'#comboMovePicker','hm_side');
  async function single(id,raw){
   stage=`single ${id}`;await click(page,'#calcSelectedTechniqueDamage');
   const ui=await page.locator('#singleTechniqueDamageOut > b').innerText();
   records.push({stage,expected:oracle(raw),ui});persist('PROGRESS.json',records);
   displayed(ui,/^選択技 合計ダメージ：([0-9]+\.[0-9]{2})$/,oracle(raw).single);
   const v=await page.evaluate(()=>({weapon:selectedWeapon(),stats:calcState.stats,context:comboDamageContext(),hz:monsterHZ(),result:calcSelectedTechniqueDamage(),snapshot:buildSnapshotComparable(buildSnapshot())}));
   records.push({stage,expected:oracle(raw),actual:v});persist('PROGRESS.json',records);
   assert.equal(v.weapon.id,id);close(v.stats.attackTrue,raw);close(v.context.affinity,0);close(v.context.element,0);close(v.hz.hz,75);close(v.context.sharp,1.05);
   close(v.result.damage,oracle(raw).single);close(v.result.time,.45);
   assert.equal(v.result.stages[0].move.canonicalTechniqueId,'HAM_SIDE_SWING');
   assert.ok(v.result.calculationReceipt.techniques.length>0);
   assert.equal(v.result.calculationReceipt.techniques[0].timingStatus,'LEGACY_REFERENCE_ONLY');
  }
  async function twoMoves(){await select(page,'#comboMovePicker','hm_side');await open(page,'#combo');while(await page.locator('#combo .del').count())await page.locator('#combo .del').first().click();for(let i=0;i<2;i++)await click(page,'#addCombo');}
  async function combo(raw){
   stage=`combo ${raw}`;const o=oracle(raw);
   await click(page,'#calcUserComboDamage');
   const damageUI=await page.locator('#userComboDamageOut > b').innerText();
   records.push({stage,expected:o,damageUI});persist('PROGRESS.json',records);
   displayed(damageUI,/^指定コンボ 合計ダメージ：([0-9]+\.[0-9]{2})$/,o.damage);
   await click(page,'#calcDps');
   const ui=await page.locator('#dpsOut').innerText();
   const headings=await page.locator('#dpsOut > b').allTextContents();
   records.push({stage:'DPS UI',expected:o,ui,headings});persist('PROGRESS.json',records);
   assert.equal(headings.length,2);
   displayed(headings[0],/^1コンボ ([0-9]+\.[0-9]{2}) ダメージ$/,o.damage);
   displayed(headings[1],/^DPS：([0-9]+\.[0-9]{2})$/,o.dps);
   assert.doesNotMatch(ui,/VERIFIED|実測確定|検証済み|暫定|PROVISIONAL/);
   // Auxiliary internal checks follow the button-triggered UI assertions.
   const v=await page.evaluate(()=>({combo:calcUserComboDamage(),snapshot:buildSnapshotComparable(buildSnapshot())}));
   records.push({stage,expected:o,actual:v});persist('PROGRESS.json',records);
   close(v.combo.damage,o.damage);close(v.combo.time,o.time);close(v.combo.dps,o.dps);assert.equal(v.combo.stages.length,2);
   for(const entry of v.combo.stages){assert.equal(entry.result.hits.length,1);close(entry.result.total,o.single);}
   assert.ok(v.combo.stages.every(s=>s.move.canonicalTechniqueId==='HAM_SIDE_SWING'));
   assert.ok(v.combo.calculationReceipt.techniques.length>0);
   assert.ok(v.combo.calculationReceipt.techniques.every(s=>s.timingStatus==='LEGACY_REFERENCE_ONLY'));assert.notEqual(v.combo.dpsStatus,'VERIFIED');
   return v;
  }
  async function save(name){await open(page,'#buildName');await page.locator('#buildName').fill(name);await click(page,'#saveBuild');}
  await single(387,90);await twoMoves();const A=await combo(90);await save('Hammer A');
  await select(page,'#weapon','388');await select(page,'#comboMovePicker','hm_side');await single(388,100);await twoMoves();const B=await combo(100);await save('Hammer B');
  await click(page,'#selectAllCompare');await click(page,'#runCompare');
  async function comparison(){
   stage='saved comparison';
   for(const [metric,values]of [['reference-combo-damage',[oracle(90).damage,oracle(100).damage]],['dps',[oracle(90).dps,oracle(100).dps]]]){
    const ui=await page.locator(`[data-comparison-metric="${metric}"] td`).allTextContents();
    const expected=values.map(v=>v.toFixed(1));
    records.push({stage,metric,expected,ui});persist('PROGRESS.json',records);
    assert.deepEqual(ui,expected);
   }
   const rows=await page.evaluate(()=>createBuildComparisonReport().results);persist('COMPARISON-LAST.json',rows);assert.equal(rows.length,2);
   for(const [name,raw]of [['Hammer A',90],['Hammer B',100]]){const r=rows.find(r=>r.name===name);assert.ok(r);close(r.attackTrue,raw);close(r.referenceCombo.damage,oracle(raw).damage);close(r.dps,oracle(raw).dps);close(r.referenceComboChange.index,oracle(raw).single/oracle(90).single*100);}
   return rows;
  }
  const before=await comparison();
  for(const [name,id,raw,snapshot]of [['Hammer A',387,90,A.snapshot],['Hammer B',388,100,B.snapshot]]){stage=`restore ${name}`;await click(page,`[data-build-load="${name}"]`);await single(id,raw);assert.deepEqual((await combo(raw)).snapshot,snapshot);}
  const saved=await page.evaluate(()=>JSON.stringify(savedBuildMap())),conditions=await page.evaluate(()=>compareStep5Snapshot());
  stage='offline reload';const requests=[];await page.route('https://wilds.mhdb.io/**',r=>{requests.push(r.request().url());return r.abort();});await page.reload();await page.evaluate(()=>window.simulatorReady);
  assert.equal(await page.evaluate(()=>JSON.stringify(DB)),loadedDB);assert.equal(await page.evaluate(()=>JSON.stringify(savedBuildMap())),saved);assert.deepEqual(await page.evaluate(()=>compareStep5Snapshot()),conditions);
  const after=await comparison();
  stage='automatic combo restore before picker selection';
  const restoredBeforeSelection=await combo(100);assert.deepEqual(restoredBeforeSelection.snapshot,B.snapshot);
  assert.deepEqual(restoredBeforeSelection.snapshot.combo.moves,[{techniqueId:'hm_side'},{techniqueId:'hm_side'}]);
  await select(page,'#comboMovePicker','hm_side');await single(388,100);assert.deepEqual((await combo(100)).snapshot,B.snapshot);assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(evidence,'OFFLINE-RELOAD.png'),fullPage:true});
  persist('RESULT.json',{status:'PASS',scope:'HAM_SIDE_SWING + equipment387/388 only',oracle:{A:oracle(90),B:oracle(100)},before,after,requests,errors,records});
 }catch(error){persist('FAILURE.json',{stage,message:error.message,stack:error.stack,records});throw error;}
});
