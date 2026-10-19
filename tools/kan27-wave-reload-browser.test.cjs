'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs'),{installLocalModules}=require('./browser-test-setup.cjs');
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-8,`${v} != ${e}`);
// Fixed public-mhdb-20261013.tar.gz: verify the formal gauge, not a replacement fixture.
const sharpnessColors=['red','orange','yellow','green','blue','white','purple'];
for(const id of [236]){const weapon=db.weapons.find(w=>w.id===id);a.ok(weapon);a.equal(sharpnessColors.filter(c=>weapon.sharpness[c]>0).at(-1),'green');}
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

// Independent oracle, raw Hope I90, formal green1.05/1; armor ordinary skills change MAX only.
const body=(raw,aff)=>raw*4.97*.70*equipmentSharp*(1+aff/100*.25);
const wave=(raw,aff)=>raw*.30*.70*equipmentSharp*(1+aff/100*.25)+60*equipmentESharp*.20;
const hit=mv=>Math.round((90*mv/100*.70*equipmentSharp*1.05+Number.EPSILON)*100)/100;
const expected={A:{normal:body(90,0),maximum:body(90,20)},B:{normal:body(90,0)+2*wave(90,0),maximum:body(95,20)+2*wave(95,20)},C:{normal:body(90,0)+2*wave(90,0),maximum:body(110,60)+2*wave(110,60)}};
async function checkRows(p){const rows=await p.evaluate(()=>createBuildComparisonReport().results);fs.writeFileSync(path.join(__dirname,'../../WAVE-ROWS-DIAGNOSTIC.json'),JSON.stringify(rows,null,2));for(const row of rows){close(row.powerIndex,expected[row.name].normal);close(row.maxPowerIndex,expected[row.name].maximum);a.equal(row.power.darkArtsWave,undefined);if(row.name!=='A'){a.equal(row.power.normal.darkArtsWave.count,2);a.equal(row.power.maximum.darkArtsWave.count,2);a.equal(row.power.normal.darkArtsWave.liveGameVerification,'PENDING');a.ok(row.power.effectPolicy.excludedEffects.some(x=>x.identity.parentId===172));a.equal(row.comboVerification.stages.filter(s=>s.darkArtsWave?.verificationStatus==='UNVERIFIED').length,2);a.ok(row.comboVerification.stages.filter(s=>s.darkArtsWave).every(s=>s.time===null&&s.timingStatus==='PENDING'));a.equal(row.comboVerification.time,null);a.equal(row.comboVerification.dps,null);}}await table(p,'power-index',rows.map(r=>expected[r.name].normal.toFixed(1)));await table(p,'max-power-index',rows.map(r=>expected[r.name].maximum.toFixed(1)));return rows;}
test('real veil armor threshold 1/2/4 pieces shares wave-only calculation, saves and offline reloads',async t=>{const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(7000);await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','236');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');await open(p,'#powerDragonHz');await p.locator('#powerDragonHz').fill('20');await select(p,'[data-armor="chest"]','654');await save(p,'A');await select(p,'[data-armor="waist"]','656');const identity2=await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===172));a.equal(identity2.rankId,431);a.equal(identity2.count,2);
 await select(p,'#comboMovePicker','gs_charge3');await click(p,'#calcSelectedTechniqueDamage');const single=await p.evaluate(()=>calcSelectedTechniqueDamage());a.equal(single.blocked.length,0,JSON.stringify(single.blocked));a.equal(single.stages[0].result.darkArtsWave.count,1);close(single.stages[0].result.darkArtsWave.total,wave(90,20));close(single.damage,hit(176)+wave(90,20));await select(p,'#comboPreset','adopted:gs_standard');await click(p,'#calcTemplateComboDamage');const fixed=await p.evaluate(()=>calcTemplateComboDamage());a.equal(fixed.stages.filter(s=>s.result?.darkArtsWave).length,2);close(fixed.damage,hit(176)+hit(187)+hit(134)+2*wave(90,20));
 await open(p,'#combo');while(await p.locator('#combo .del').count())await p.locator('#combo .del').first().click();for(const id of ['gs_charge3','gs_charge3','canonical:GS_STRONG_WIDE_SLASH_3']){await select(p,'#comboMovePicker',id);await click(p,'#addCombo');}await click(p,'#calcUserComboDamage');const free=await p.evaluate(()=>calcUserComboDamage());a.equal(free.blocked.length,0,JSON.stringify(free.blocked));close(free.damage,2*hit(176)+hit(134)+2*wave(90,20));a.equal(free.stages.filter(s=>s.result?.darkArtsWave).length,2);a.equal(free.time,null);a.equal(free.dps,null);const report=await p.evaluate(()=>createComboVerificationReport());a.equal(report.stages.filter(s=>s.darkArtsWave?.verificationStatus==='UNVERIFIED').length,2);a.equal(report.stages.flatMap(s=>s.hits).filter(h=>h.component==='DARK_ARTS_WAVE'&&h.techniqueId==='GS_DARK_ARTS_WAVE'&&h.afterHit===1).length,2);await save(p,'B');await select(p,'[data-armor="head"]','653');await select(p,'[data-armor="arms"]','655');const identity4=await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===172));a.equal(identity4.rankId,432);a.equal(identity4.count,4);await save(p,'C');await click(p,'#selectAllCompare');await click(p,'#runCompare');const before=await checkRows(p);await offlineReload(p,await read(p),'DARK-ARTS-WAVE');const after=await checkRows(p);await click(p,'[data-build-load="B"]');const restored=await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===172));a.equal(restored.rankId,431);a.equal(restored.count,2);await click(p,'#calcUserComboDamage');const again=await p.evaluate(()=>calcUserComboDamage());close(again.damage,free.damage);a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../WAVE-E2E.json'),JSON.stringify({expected,identity2,identity4,single,fixed,free,before,after,restored},null,2));});
