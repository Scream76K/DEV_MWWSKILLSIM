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
// Independent oracle: real Hope I raw90, no element/affinity, HZ70%, formal green1.05/1.
// Adopted GS MV176+187+134. Burst2/3 adds12/14; series115 rankI adds8
// only in maximum. Owner-excluded Fortify adds nothing.
const standard=raw=>raw*((176+187+134)/100)*.70*equipmentSharp;
const show=value=>(Math.round((value+Number.EPSILON)*10)/10).toFixed(1);
test('series and group reload comparison table matches independent adopted formulas',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','great-sword');await select(p,'#weapon','236');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');
 await select(p,'[data-armor="head"]','1');await select(p,'[data-armor="chest"]','2');a.equal(await p.evaluate(()=>calcState.stats.activeBonusEffects.some(e=>e.bonusSkillId===150)),false);await select(p,'[data-armor="arms"]','3');await save(p,'Group excluded');await click(p,'#selectAllCompare');await click(p,'#runCompare');await offlineReload(p,await read(p),'GROUP-ORACLE');await table(p,'power-index',[show(standard(90))]);await table(p,'max-power-index',[show(standard(90+10))]);let rows=await p.evaluate(()=>createBuildComparisonReport().results);close(rows[0].powerIndex,standard(90));close(rows[0].maxPowerIndex,standard(100));a.equal(rows[0].power.conditionPlan.applied.some(x=>x.skill==='不屈'),false);
 await select(p,'[data-armor="head"]','349');await select(p,'[data-armor="chest"]','');await select(p,'[data-armor="arms"]','');a.equal(await p.evaluate(()=>calcState.stats.activeBonusEffects.some(e=>e.bonusSkillId===115)),false);
 await select(p,'[data-armor="chest"]','350');const first=await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===115));a.equal(first.count,2);a.equal(first.rankId,292);await save(p,'Series two');
 await select(p,'[data-armor="arms"]','351');await save(p,'Series three');const active=await p.evaluate(()=>calcState.stats.activeBonusEffects.find(e=>e.bonusSkillId===115));a.equal(active.count,3);a.equal(active.rankId,292);
 await click(p,'#clearAllCompare');for(const name of ['Series two','Series three'])await p.locator(`[data-compare-name="${name}"]`).check();await click(p,'#runCompare');const before=await read(p);await offlineReload(p,before,'SERIES-ORACLE');
 // Compare columns follow Japanese numeric saved-name order: Series three, Series two.
 rows=await p.evaluate(()=>createBuildComparisonReport().results);const expected={ 'Series two':{normal:standard(90),maximum:standard(90+12+8)},'Series three':{normal:standard(90),maximum:standard(90+14+8)}};
 for(const row of rows){close(row.powerIndex,expected[row.name].normal);close(row.maxPowerIndex,expected[row.name].maximum);a.equal(row.power.conditionPlan.groupPlan.maximumFlat,8);}
 await table(p,'power-index',rows.map(row=>show(expected[row.name].normal)));await table(p,'max-power-index',rows.map(row=>show(expected[row.name].maximum)));await table(p,'relative-power-100',['100.0','100.0']);const maximumChanges=await p.locator('[data-comparison-metric=max-power-index-change] td').allTextContents();for(let i=0;i<rows.length;i++)a.ok(maximumChanges[i].startsWith('+'+show((expected[rows[i].name].maximum/standard(90)-1)*100)+'%'));
 a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../SERIES-GROUP-INDEPENDENT-EXPECTATIONS.json'),JSON.stringify({formula:'raw * (176+187+134)/100 * .70 * 1.05',inputs:{raw:90,burst2:12,burst3:14,seriesRankI:8,excludedFortify:0},group:{normal:standard(90),maximum:standard(100)},expected,rows,first,active,maximumChanges},null,2));
});
