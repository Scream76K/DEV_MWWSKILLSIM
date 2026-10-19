const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {db}=require('./kan108-fixture.cjs');
const {installLocalModules}=require('./browser-test-setup.cjs');
const evidence=path.resolve(__dirname,'../..');
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
test('KAN-72 official Hope Sword UI single/2-hit, A/B restores and offline reload',async t=>{
  const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('dialog',d=>d.accept());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await mount(page);
  await click(page,'#load');
  await page.waitForFunction(()=>document.body.innerText.includes('データ取得完了'),{},{timeout:60000});
  const loadedDB=await page.evaluate(()=>JSON.stringify(DB));
  await select(page,'#weaponKind','sword-and-shield');
  await select(page,'#weapon','985');
  for(const slot of ['head','chest','arms','waist','legs'])await select(page,`[data-armor="${slot}"]`,'');
  await select(page,'#monster','13');
  await select(page,'#monsterPart','2700');
  await select(page,'#comboMovePicker','sns_slash');
  await click(page,'#calcSelectedTechniqueDamage');
  const actual=await page.evaluate(()=>({weapon:selectedWeapon(),stats:calcState.stats,total:calcState.total,context:comboDamageContext(),target:monsterHZ(),result:calcSelectedTechniqueDamage(),display:document.getElementById('singleTechniqueDamageOut').innerText,rawSharp:document.getElementById('dSharp').value}));
  const expected={weaponId:985,raw:90,mv:18,sharpness:'GREEN',sharpnessMultiplier:1.05,physicalHitzone:70,unrounded:90*.18*1.05*.70,damage:11.91,time:0.45,timeStatus:'LEGACY_REFERENCE_ONLY',followingStages:'two identical moves; weapon986; saved A/B comparison; individual restores; API-blocked reload'};
  fs.writeFileSync(path.join(evidence,'FIRST-CASE.json'),JSON.stringify({expected,actual,errors},null,2));
  await page.locator('#singleTechniqueDamageOut').screenshot({path:path.join(evidence,'FIRST-CASE.png')});
  assert.equal(actual.weapon.id,985);
  assert.equal(actual.target.hz,70);
  assert.equal(actual.result.damage,expected.damage,'Official maximum GREEN sharpness must determine damage; stop before subsequent cases on mismatch');
  const close=(v,e)=>assert.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-9,`${v} != ${e}`);
  const oracle=raw=>({single:Math.round((raw*.18*1.05*.70+Number.EPSILON)*100)/100,power:raw*.90*1.05*.70});
  const records=[];
  async function checkSelected(id,raw){
    await click(page,'#calcSelectedTechniqueDamage');
    const v=await page.evaluate(()=>({single:calcSelectedTechniqueDamage(),context:comboDamageContext(),weapon:selectedWeapon(),report:createComboVerificationReport(),stats:calcState.stats}));
    assert.equal(v.weapon.id,id);close(v.stats.attackTrue,raw);assert.equal(v.context.sharp,1.05);assert.equal(v.context.esharp,1);
    close(v.single.damage,oracle(raw).single);close(v.single.time,.45);
    assert.equal(v.single.calculationReceipt.techniques[0].timingStatus,'LEGACY_REFERENCE_ONLY');
    assert.equal(v.single.stages[0].move.canonicalTechniqueId,'SNS_DOWNWARD_SLASH');
    assert.match(await page.locator('#singleTechniqueDamageOut').innerText(),new RegExp(oracle(raw).single.toFixed(2).replace('.', '\\.')));
    return v;
  }
  await checkSelected(985,90);
  await open(page,'#combo');while(await page.locator('#combo .del').count())await page.locator('#combo .del').first().click();
  for(let i=0;i<2;i++)await click(page,'#addCombo');
  async function checkCombo(raw){
    await click(page,'#calcUserComboDamage');await click(page,'#calcDps');
    const v=await page.evaluate(()=>({combo:calcUserComboDamage(),verification:createComboVerificationReport(),snapshot:buildSnapshotComparable(buildSnapshot()),saved:savedBuildMap()}));
    fs.writeFileSync(path.join(evidence,'SNS-LAST-CASE.json'),JSON.stringify({raw,v},null,2));
    const expected=2*oracle(raw).single;close(v.combo.damage,expected);close(v.combo.time,.9);close(v.combo.dps,expected/.9);
    assert.equal(v.combo.stages.length,2);assert.ok(v.combo.calculationReceipt.techniques.every(t=>t.timingStatus==='LEGACY_REFERENCE_ONLY'));
    assert.ok(v.combo.stages.every(t=>t.result.hits.length===1));
    assert.match(await page.locator('#userComboDamageOut').innerText(),new RegExp(expected.toFixed(2).replace('.', '\\.')));
    records.push({raw,expected,v});return v;
  }
  const A=await checkCombo(90);
  async function save(name){await open(page,'#buildName');await page.locator('#buildName').fill(name);await click(page,'#saveBuild');}
  await save('SnS A');await select(page,'#weapon','986');await checkSelected(986,100);for(let i=0;i<2;i++)await click(page,'#addCombo');const B=await checkCombo(100);await save('SnS B');
  await click(page,'#selectAllCompare');await click(page,'#runCompare');
  async function checkComparison(){
    const rows=await page.evaluate(()=>createBuildComparisonReport().results);
    assert.equal(rows.length,2);
    for(const [i,raw]of [90,100].entries()){
      const r=rows.find(r=>r.name===['SnS A','SnS B'][i]);assert.ok(r);
      close(r.attackTrue,raw);close(r.powerIndex,oracle(raw).power);close(r.maxPowerIndex,oracle(raw).power);
      close(r.referenceCombo.damage,2*oracle(raw).single);close(r.dps,2*oracle(raw).single/.9);
      close(r.referenceCombo.context.sharp,1.05);close(r.referenceCombo.context.esharp,1);
      close(r.referenceComboChange.index,oracle(raw).single/oracle(90).single*100);
    }
    for(const [metric,values]of [['reference-combo-damage',[23.82,26.46]],['power-index',[59.535,66.15]],['max-power-index',[59.535,66.15]],['dps',[23.82/.9,26.46/.9]]]){
      const cells=await page.locator(`[data-comparison-metric="${metric}"] td`).allTextContents();
      assert.deepEqual(cells,values.map(v=>v.toFixed(1)));
    }
    return rows;
  }
  const before=await checkComparison();
  for(const [name,id,raw,snapshot]of [['SnS A',985,90,A.snapshot],['SnS B',986,100,B.snapshot]]){
    await click(page,`[data-build-load="${name}"]`);await checkSelected(id,raw);const restored=await checkCombo(raw);assert.deepEqual(restored.snapshot,snapshot);
  }
  const savedBefore=await page.evaluate(()=>JSON.stringify(savedBuildMap())),conditionsBefore=await page.evaluate(()=>compareStep5Snapshot());
  const requests=[];await page.route('https://wilds.mhdb.io/**',r=>{requests.push(r.request().url());return r.abort();});
  await page.reload();await page.evaluate(()=>window.simulatorReady);
  assert.equal(await page.evaluate(()=>JSON.stringify(DB)),loadedDB,'offline cache reproduces the production-normalized DB including consolidated Artia variants');
  assert.equal(await page.evaluate(()=>JSON.stringify(savedBuildMap())),savedBefore);
  assert.deepEqual(await page.evaluate(()=>compareStep5Snapshot()),conditionsBefore);
  const after=await checkComparison();await checkSelected(986,100);const reloaded=await checkCombo(100);assert.deepEqual(reloaded.snapshot,B.snapshot);assert.deepEqual(requests,[]);
  assert.equal(await page.locator('#dSharp').inputValue(),'1.32','legacy saved/UI raw value remains intact but cannot override equipment');
  await open(page,'#compareOut');await page.locator('#compareOut').screenshot({path:path.join(evidence,'SNS-COMPARISON.png')});
  await page.screenshot({path:path.join(evidence,'SNS-OFFLINE-RELOAD.png'),fullPage:true});
  fs.writeFileSync(path.join(evidence,'SNS-COMPLETE.json'),JSON.stringify({oracle:{A:oracle(90),B:oracle(100)},records,before,after,requests,conditionsBefore,errors},null,2));
  // Minimal real-equipment GS wave check: new weapon-derived factors reach both components.
  await select(page,'#weaponKind','great-sword');await select(page,'#weapon','236');
  await open(page,'#powerDragonHz');await page.locator('#powerDragonHz').fill('20');
  await select(page,'[data-armor="chest"]','654');await select(page,'[data-armor="waist"]','656');
  await select(page,'#comboMovePicker','gs_charge3');await click(page,'#calcSelectedTechniqueDamage');
  const gs=await page.evaluate(()=>({stats:calcState.stats,single:calcSelectedTechniqueDamage()}));
  fs.writeFileSync(path.join(evidence,'GS-SHARPNESS.json'),JSON.stringify(gs,null,2));
  close(gs.stats.attackTrue,90);close(gs.stats.maxAffinity,20);
  const expectedBody=Math.round(90*1.76*1.05*.70*(1+.20*.25)*100)/100;
  const expectedWavePhysical=90*.30*1.05*.70*1.05,expectedWaveElement=600/10*1*.20;
  const wave=gs.single.stages[0].result.darkArtsWave;
  close(wave.physical,expectedWavePhysical);close(wave.element,expectedWaveElement);assert.equal(wave.count,1);assert.equal(wave.verificationStatus,'UNVERIFIED');
  close(gs.single.damage,expectedBody+expectedWavePhysical+expectedWaveElement);
  for(let i=0;i<2;i++)await click(page,'#addCombo');await click(page,'#calcUserComboDamage');
  const repeated=await page.evaluate(()=>calcUserComboDamage());close(repeated.damage,2*gs.single.damage);assert.equal(repeated.time,null);assert.equal(repeated.dps,null);
  assert.equal(repeated.stages.filter(s=>s.result.darkArtsWave?.count===1).length,2);
  // Official GL melee and shell share a route, but shell output is never multiplied by sharpness.
  for(const slot of ['head','chest','arms','waist','legs'])await select(page,`[data-armor="${slot}"]`,'');
  await select(page,'#weaponKind','gunlance');await select(page,'#weapon','315');
  for(const [id,value]of Object.entries({comboGLType:'NORMAL',comboGLPower:'MEDIUM',comboGLLoaded:'6',comboGLCharged:'2',comboGLFireHz:'20'})){await open(page,'#'+id);const input=page.locator('#'+id);if(await input.evaluate(e=>e.tagName)==='SELECT')await input.selectOption(value);else await input.fill(value);}
  await select(page,'#comboMovePicker','canonical:GL_SLAM');await click(page,'#calcSelectedTechniqueDamage');
  const glBody=await page.evaluate(()=>calcSelectedTechniqueDamage());assert.ok(glBody.damage>0);
  await click(page,'#addCombo');await select(page,'#comboMovePicker','reference:gl_NORMAL');await click(page,'#calcSelectedTechniqueDamage');const glShell=await page.evaluate(()=>calcSelectedTechniqueDamage());assert.ok(glShell.damage>0);await click(page,'#addCombo');await click(page,'#calcUserComboDamage');
  const glMixed=await page.evaluate(()=>calcUserComboDamage());close(glMixed.damage,glBody.damage+glShell.damage);close(glMixed.stages[0].result.total,glBody.damage);close(glMixed.stages[1].result.total,glShell.damage);
  fs.writeFileSync(path.join(evidence,'RELATED-REAL-EQUIPMENT.json'),JSON.stringify({gs,repeated,glBody,glShell,glMixed},null,2));
  // Existing bow-three regression conditions, real UI template / actual DB equipment.
  await select(page,'#buildTemplateWeaponKind','bow');await select(page,'#buildTemplateSelect','SALADA_BOW_03');await click(page,'#loadBuildTemplate');
  assert.match(await page.locator('#buildTemplateStatus').innerText(),/全装備をMHDBへ照合/);
  const bow=await page.evaluate(()=>{
    const states={};for(const coating of ['POWER','CLOSE_RANGE','PIERCE']){
      const cond={...compareStep5Snapshot(),hz:65,ehz:30,bowState:{chargeLevel:3,coating,range:'CRITICAL',startShot:3}};
      const power=standardPowerForStats('bow',calcState.stats,cond,calcState.total);
      states[coating]={normal:power.normal?.comparisonPower,maximum:power.maximum?.comparisonPower,liveGameVerification:power.liveGameVerification};
    }
    return {stats:calcState.stats,states};
  });
  fs.writeFileSync(path.join(evidence,'BOW3-LAST-CASE.json'),JSON.stringify(bow,null,2));
  for(const [coating,normal,maximum]of [['POWER','672.32','916.17'],['CLOSE_RANGE','690.59','942.15'],['PIERCE','760.45','1042.04']]){assert.equal(bow.states[coating].normal.toFixed(2),normal);assert.equal(bow.states[coating].maximum.toFixed(2),maximum);assert.notEqual(bow.states[coating].liveGameVerification,'VERIFIED');}
  assert.equal(bow.stats.element,372);assert.equal(bow.stats.affinity,22);assert.equal(bow.stats.maxAffinity,100);
  fs.writeFileSync(path.join(evidence,'BOW3-REGRESSION.json'),JSON.stringify(bow,null,2));
  assert.deepEqual(errors,[]);
});

// Audit contracts and equipment resolver use real product modules, never success stubs.
test('KAN-47 equipment maximum separates colors, rejects unknown gauge/variants and preserves audit gates',()=>{
 const A=require('../weapon-sharpness-schema-adapter.js'),S=require('../weapon-max-sharpness.js');
 const w=db.weapons.find(w=>w.id===985);
 const r=S.resolveEquipment(w);assert.equal(r.options.maxSharpness,'green');assert.equal(r.options.sharpnessPhysicalMultiplier,1.05);assert.equal(r.options.sharpnessElementMultiplier,1);assert.equal(r.verified,false);
 assert.equal(w.maxSharpness,undefined);assert.match(r.options.sharpnessEvidenceRef,/985#\/sharpness$/);
 assert.equal(S.resolveEquipment({...w,sharpness:undefined}).options,null);
 assert.equal(S.resolveEquipment({...w,sharpness:Object.fromEntries(Object.keys(w.sharpness).map(k=>[k,0]))}).options,null);
 assert.equal(S.resolveEquipment({...w,sharpness:{...w.sharpness,green:-1}}).options,null);
 assert.equal(S.resolveEquipment(w,{handicraftLevel:1}).options,null);
 assert.equal(S.resolveEquipment(w,{artia:true}).options,null);
 assert.equal(S.resolveEquipment({...w,selectedUpgradeSharpness:'white'}).options,null);
 assert.equal(A.adapt({maxSharpness:'white'}).weapon,null);
 assert.equal(S.resolve(A.adapt(w).weapon,{rows:[{status:'ENGINE_CONTEXT_BLOCKED'}]}).options,null);
 assert.equal(S.resolve(A.adapt(w).weapon,null).options,null);
 const blueWeapon=db.weapons.find(x=>x.kind==='sword-shield'&&x.sharpness?.blue>0&&x.sharpness.white===0&&x.sharpness.purple===0);assert.ok(blueWeapon);const blue=S.resolveEquipment(blueWeapon);assert.equal(blue.options.sharpnessPhysicalMultiplier,1.2);assert.equal(blue.options.sharpnessElementMultiplier,1.0625);
});

// Integer and total-400 base-gauge contract: https://docs.wilds.mhdb.io/#sharpness
// These deliberately malformed copies exercise rejection; no product DB record is modified.
test('MHDB color gauge is integer-only and totals at most 400',()=>{
 const A=require('../weapon-sharpness-schema-adapter.js'),w=db.weapons.find(w=>w.id===985);
 const gauge={red:0,orange:0,yellow:0,green:0,blue:0,white:0,purple:0};
 for(const [label,sharpness]of [
   ['fraction',{...w.sharpness,red:50.5}],['NaN',{...w.sharpness,green:NaN}],
   ['Infinity',{...w.sharpness,green:Infinity}],['numeric string',{...w.sharpness,green:'60'}],
   ['negative',{...w.sharpness,green:-1}],['total401',{...gauge,red:200,green:201}]
 ])assert.equal(A.adapt({...w,sharpness}).weapon,null,label);
 const boundary=A.adapt({...w,sharpness:{...gauge,red:200,green:200}});assert.equal(boundary.weapon.maxSharpness,'green');
 // Full recorded MHDB inventory conforms without editing its values.
 for(const weapon of db.weapons.filter(w=>w.sharpness)){
   assert.ok(Object.values(weapon.sharpness).every(Number.isInteger),String(weapon.id));
   assert.ok(Object.values(weapon.sharpness).reduce((n,v)=>n+v,0)<=400,String(weapon.id));
 }
});

test('KAN-72 real green985/blue1010 A/B stays weapon-owned from either starting build and offline reload',async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 const p=await browser.newPage({viewport:{width:1440,height:1000}});p.setDefaultTimeout(7000);p.on('dialog',d=>d.accept());
 const errors=[];p.on('pageerror',e=>errors.push(e.message));await mount(p);await click(p,'#load');
 await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));
 const loadedDB=await p.evaluate(()=>JSON.stringify(DB));
 await select(p,'#weaponKind','sword-and-shield');
 for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');
 await select(p,'#monster','13');await select(p,'#monsterPart','2700');
 const specs=[{id:985,name:'A Green',raw:90,color:'green',physical:1.05,element:1,single:11.91,double:23.82,power:59.535},
              {id:1010,name:'B Blue',raw:190,color:'blue',physical:1.2,element:1.0625,single:28.73,double:57.46,power:143.64}];
 const close=(v,e)=>assert.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-9,`${v} != ${e}`),round=x=>Math.round(x*100)/100;
 const observations=[],snapshots={};
 function source(spec){return `https://wilds.mhdb.io/ja/weapons/${spec.id}#/sharpness`;}
 function assertContext(ctx,spec){assert.equal(ctx.maxSharpness,spec.color);close(ctx.sharp,spec.physical);close(ctx.esharp,spec.element);assert.equal(ctx.sharpnessEvidenceRef,source(spec));}
 async function checkSelected(spec){
   await click(p,'#calcSelectedTechniqueDamage');await click(p,'#calcUserComboDamage');await click(p,'#calcDps');
   const v=await p.evaluate(()=>({weapon:selectedWeapon(),stats:calcState.stats,single:calcSelectedTechniqueDamage(),combo:calcUserComboDamage(),report:createComboVerificationReport(),snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),singleText:singleTechniqueDamageOut.innerText,comboText:userComboDamageOut.innerText}));
   fs.writeFileSync(path.join(evidence,'COLOR-AB-LAST.json'),JSON.stringify({spec,v},null,2));
   assert.equal(v.weapon.id,spec.id);close(v.stats.attackTrue,spec.raw);assert.equal(v.stats.affinity,0);assert.equal(v.stats.maxAffinity,0);assert.equal(v.stats.element,0);
   close(round(spec.raw*.18*spec.physical*.70),spec.single);close(2*round(spec.raw*.18*spec.physical*.70),spec.double);close(spec.raw*.90*spec.physical*.70,spec.power);
   close(v.single.damage,spec.single);close(v.combo.damage,spec.double);close(v.single.time,.45);close(v.combo.time,.9);close(v.combo.dps,spec.double/.9);
   assertContext(v.single.context,spec);assertContext(v.combo.context,spec);assertContext(v.report.context,spec);
   assert.ok(v.singleText.includes(spec.single.toFixed(2)));assert.ok(v.comboText.includes(spec.double.toFixed(2)));
   const receipt=v.combo.calculationReceipt,input=JSON.parse(receipt.signature);assert.equal(receipt.weaponId,spec.id);assert.equal(input.weapon.id,spec.id);assertContext(input.context,spec);close(input.conditions.sharp,spec.physical);close(input.conditions.esharp,spec.element);
   assert.equal(receipt.techniques.length,2);assert.ok(receipt.techniques.every(t=>t.canonicalTechniqueId==='SNS_DOWNWARD_SLASH'&&t.timingStatus==='LEGACY_REFERENCE_ONLY'));
   assert.equal(v.conditions.sharp,'1.32');assert.equal(v.conditions.esharp,'1.15');return v;
 }
 for(const spec of specs){
   await select(p,'#weapon',String(spec.id));await select(p,'#comboMovePicker','sns_slash');
   for(let i=0;i<2;i++)await click(p,'#addCombo');const v=await checkSelected(spec);snapshots[spec.name]=v.snapshot;
   await open(p,'#buildName');await p.locator('#buildName').fill(spec.name);await click(p,'#saveBuild');
 }
 async function checkRows(label){
   const report=await p.evaluate(()=>createBuildComparisonReport());assert.equal(report.results.length,2);assert.equal(report.baseline.name,specs[0].name);
   for(const spec of specs){
     const row=report.results.find(r=>r.name===spec.name);assert.ok(row);close(row.attackTrue,spec.raw);close(row.powerIndex,spec.power);close(row.maxPowerIndex,spec.power);close(row.referenceCombo.damage,spec.double);close(row.dps,spec.double/.9);
     assertContext(row.referenceCombo.context,spec);const receipt=row.comboVerification.calculationReceipt,input=JSON.parse(receipt.signature);
     assert.equal(receipt.weaponId,spec.id);assert.equal(input.weapon.id,spec.id);assertContext(input.context,spec);close(input.conditions.sharp,spec.physical);close(input.conditions.esharp,spec.element);
     close(row.referenceComboChange.index,spec.double/specs[0].double*100);
   }
   for(const [metric,values]of [['reference-combo-damage',specs.map(s=>s.double)],['power-index',specs.map(s=>s.power)],['max-power-index',specs.map(s=>s.power)],['dps',specs.map(s=>s.double/.9)]])assert.deepEqual(await p.locator(`[data-comparison-metric="${metric}"] td`).allTextContents(),values.map(v=>v.toFixed(1)));
   observations.push({label,selected:await p.evaluate(()=>selectedWeapon().id),report});return report;
 }
 async function restore(spec){await click(p,`[data-build-load="${spec.name}"]`);const v=await checkSelected(spec);assert.deepEqual(v.snapshot,snapshots[spec.name]);}
 const apiRequests=[];let blocked=false;
 for(const start of specs){
   await restore(start);await click(p,'#selectAllCompare');await click(p,'#runCompare');await checkRows('start-'+start.id);
   assert.equal(await p.evaluate(()=>selectedWeapon().id),start.id);
   for(const spec of specs)await restore(spec);
   await restore(start);await click(p,'#runCompare');await checkRows('before-reload-'+start.id);
   const saved=await p.evaluate(()=>JSON.stringify(savedBuildMap())),cond=await p.evaluate(()=>compareStep5Snapshot());
   if(!blocked){await p.route('https://wilds.mhdb.io/**',r=>{apiRequests.push(r.request().url());return r.abort();});blocked=true;}
   await p.reload();await p.evaluate(()=>window.simulatorReady);
   assert.equal(await p.evaluate(()=>JSON.stringify(DB)),loadedDB);assert.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),saved);assert.deepEqual(await p.evaluate(()=>compareStep5Snapshot()),cond);
   assert.equal(await p.evaluate(()=>selectedWeapon().id),start.id);await checkRows('after-offline-reload-'+start.id);
   assert.deepEqual(apiRequests,[]);for(const spec of specs)await restore(spec);
   await open(p,'#compareOut');await p.locator('#compareOut').screenshot({path:path.join(evidence,`COLOR-AB-RELOAD-${start.id}.png`)});
 }
 fs.writeFileSync(path.join(evidence,'COLOR-AB-COMPLETE.json'),JSON.stringify({specs,snapshots,observations,apiRequests,errors},null,2));
 assert.deepEqual(apiRequests,[]);assert.deepEqual(errors,[]);
});

// Owner KAN-47:10735 / KAN-72:10736: missing-only provisional white, never a DB mutation.
test('owner missing-only white is traceable, replaceable and cannot hide invalid data',()=>{
 const S=require('../weapon-max-sharpness.js'),official=db.weapons.find(w=>w.id===985),{sharpness,...missing}=official,policy={allowOwnerProvisional:true};
 const before=JSON.stringify(missing),r=S.resolveEquipment(missing,policy);assert.ok(r.options);assert.equal(r.options.maxSharpness,'white');assert.equal(r.options.sharpnessPhysicalMultiplier,1.32);assert.equal(r.options.sharpnessElementMultiplier,1.15);assert.equal(r.verified,false);
 const provenance=r.options.sharpnessProvenance;assert.equal(provenance.weaponId,985);assert.equal(provenance.basis,'OWNER_PROVISIONAL_MISSING_WHITE');assert.equal(provenance.ownerProvisional,true);assert.equal(provenance.missingReason,'SHARPNESS_FIELDS_ABSENT');assert.equal(provenance.decisionRef,'KAN-47:10735;KAN-72:10736');assert.equal(provenance.verificationStatus,'UNVERIFIED');assert.equal(JSON.stringify(missing),before);
 assert.equal(S.resolveEquipment(missing).options,null,'strict audit opt-out remains available');
 for(const bad of [null,[],{}, {...sharpness,red:50.5},{...sharpness,red:1000},{...sharpness,green:-1},{...sharpness,green:NaN},{...sharpness,green:Infinity},Object.fromEntries(Object.keys(sharpness).map(k=>[k,0]))])assert.equal(S.resolveEquipment({...missing,sharpness:bad},policy).options,null,'invalid/empty gauge is not missing');
 for(const bad of [{...missing,maxSharpness:'green'},{...missing,maxSharpnessEvidenceRef:'source-without-color'},{...missing,id:null},{...missing,selectedUpgradeSharpness:'blue'},{...missing,selectedArtiaSharpness:'blue'},{...missing,upgrades:[{sharpness:{color:'blue'}}]},{...missing,artiaFixedVariants:[]}])assert.equal(S.resolveEquipment(bad,policy).options,null);
 for(const state of [{...policy,artia:true},{...policy,handicraftLevel:1},{...policy,handicraftLevel:NaN}])assert.equal(S.resolveEquipment(missing,state).options,null);
 const updated=S.resolveEquipment({...missing,sharpness},policy);assert.equal(updated.options.maxSharpness,'green');assert.equal(updated.options.sharpnessPhysicalMultiplier,1.05);assert.equal(updated.options.sharpnessProvenance.ownerProvisional,false);assert.equal(updated.options.sharpnessProvenance.weaponId,985);assert.equal(updated.verified,false);
});

test('owner missing white persists through A/B offline reload and yields to later formal green',async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());const p=await browser.newPage({viewport:{width:1440,height:1000}});p.on('dialog',d=>d.accept());const errors=[];p.on('pageerror',e=>errors.push(e.message));
 // Explicit missing-information HTTP scenario: omit only 985's sharpness field from the recorded response.
 // The real archived record, production DB files and calculation modules are unchanged.
 let omit=true;await mount(p,{weaponRecord:w=>{if(omit&&w.id===985){const {sharpness,...rest}=w;return rest;}return w;}});
 await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));
 await select(p,'#weaponKind','sword-and-shield');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');
 const close=(v,e)=>assert.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-9,`${v} != ${e}`),specs=[{id:985,name:'A missing',single:14.97,double:29.94,sharp:1.32,esharp:1.15,power:74.844,provisional:true},{id:1010,name:'B formal',single:28.73,double:57.46,sharp:1.2,esharp:1.0625,power:143.64,provisional:false}],observations=[];
 function audit(ctx,spec){close(ctx.sharp,spec.sharp);close(ctx.esharp,spec.esharp);const a=ctx.sharpnessProvenance;assert.equal(a.weaponId,spec.id);assert.equal(a.ownerProvisional,spec.provisional);assert.equal(a.verificationStatus,'UNVERIFIED');if(spec.provisional){assert.equal(a.basis,'OWNER_PROVISIONAL_MISSING_WHITE');assert.equal(a.missingReason,'SHARPNESS_FIELDS_ABSENT');assert.equal(a.decisionRef,'KAN-47:10735;KAN-72:10736');}else assert.equal(ctx.sharpnessEvidenceRef,`https://wilds.mhdb.io/ja/weapons/${spec.id}#/sharpness`);}
 async function check(spec){await click(p,'#calcSelectedTechniqueDamage');await click(p,'#calcUserComboDamage');const v=await p.evaluate(()=>({weapon:selectedWeapon(),single:calcSelectedTechniqueDamage(),combo:calcUserComboDamage(),snapshot:buildSnapshotComparable(buildSnapshot()),report:createComboVerificationReport()}));fs.writeFileSync(path.join(evidence,'OWNER-WHITE-LAST.json'),JSON.stringify({spec,v},null,2));assert.equal(v.weapon.id,spec.id);close(v.single.damage,spec.single);close(v.combo.damage,spec.double);audit(v.single.context,spec);audit(v.combo.context,spec);audit(v.report.context,spec);assert.notEqual(v.combo.dpsStatus,'VERIFIED');const receipt=v.combo.calculationReceipt,captured=JSON.parse(receipt.signature);assert.equal(receipt.weaponId,spec.id);audit(captured.context,spec);assert.ok(receipt.techniques.every(t=>t.timingStatus==='LEGACY_REFERENCE_ONLY'));assert.equal(v.snapshot.weaponId,String(spec.id));assert.equal(Object.hasOwn(v.weapon,'maxSharpness'),false);assert.doesNotMatch(await p.locator('#userComboDamageOut').innerText(),/オーナー暫定|OWNER_PROVISIONAL/);return v;}
 const snapshots={};for(const spec of specs){await select(p,'#weapon',String(spec.id));await select(p,'#comboMovePicker','sns_slash');for(let i=0;i<2;i++)await click(p,'#addCombo');snapshots[spec.name]=(await check(spec)).snapshot;await open(p,'#buildName');await p.locator('#buildName').fill(spec.name);await click(p,'#saveBuild');}
 async function rows(label){const report=await p.evaluate(()=>createBuildComparisonReport());for(const spec of specs){const row=report.results.find(r=>r.name===spec.name);assert.ok(row);close(row.referenceCombo.damage,spec.double);close(row.powerIndex,spec.power);close(row.maxPowerIndex,spec.power);audit(row.referenceCombo.context,spec);audit(JSON.parse(row.comboVerification.calculationReceipt.signature).context,spec);assert.notEqual(row.dpsStatus,'VERIFIED');}observations.push({label,report});return report;}
 await click(p,'#selectAllCompare');await click(p,'#runCompare');await rows('before');for(const spec of specs){await click(p,`[data-build-load="${spec.name}"]`);assert.deepEqual((await check(spec)).snapshot,snapshots[spec.name]);}
 const saved=await p.evaluate(()=>JSON.stringify(savedBuildMap())),data=await p.evaluate(()=>JSON.stringify(DB)),conditions=await p.evaluate(()=>compareStep5Snapshot()),api=[];
 const block=r=>{api.push(r.request().url());return r.abort();};await p.route('https://wilds.mhdb.io/**',block);await p.reload();await p.evaluate(()=>window.simulatorReady);assert.equal(await p.evaluate(()=>JSON.stringify(DB)),data);assert.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),saved);assert.deepEqual(await p.evaluate(()=>compareStep5Snapshot()),conditions);await rows('after-offline');for(const spec of specs){await click(p,`[data-build-load="${spec.name}"]`);assert.deepEqual((await check(spec)).snapshot,snapshots[spec.name]);}assert.deepEqual(api,[]);
 await open(p,'#compareOut');await p.locator('#compareOut').screenshot({path:path.join(evidence,'OWNER-WHITE-OFFLINE.png')});
 // Only after missing-state offline success, restore the genuine response and use normal DB refresh UI.
 omit=false;await p.unroute('https://wilds.mhdb.io/**',block);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await click(p,'[data-build-load="A missing"]');
 const formal={id:985,single:11.91,double:23.82,sharp:1.05,esharp:1,provisional:false};const upgraded=await check(formal);await click(p,'#runCompare');const afterUpdate=await p.evaluate(()=>createBuildComparisonReport());const replaced=afterUpdate.results.find(r=>r.name==='A missing');close(replaced.referenceCombo.damage,23.82);close(replaced.powerIndex,59.535);audit(replaced.referenceCombo.context,formal);assert.equal(await p.evaluate(()=>JSON.stringify(savedBuildMap())),saved,'formal DB update must not rewrite saved builds');assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(evidence,'OWNER-WHITE-COMPLETE.json'),JSON.stringify({specs,observations,snapshots,api,errors,upgraded,afterUpdate},null,2));
});
