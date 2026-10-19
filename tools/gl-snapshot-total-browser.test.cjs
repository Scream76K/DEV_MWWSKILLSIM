'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs'),{installLocalModules}=require('./browser-test-setup.cjs');
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-8,`${v} != ${e}`);
// Fixed public-mhdb-20261013.tar.gz: verify the formal gauge, not a replacement fixture.
const sharpnessColors=['red','orange','yellow','green','blue','white','purple'];
for(const id of [368]){const weapon=db.weapons.find(w=>w.id===id);a.ok(weapon);a.equal(sharpnessColors.filter(c=>weapon.sharpness[c]>0).at(-1),'blue');}
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

test('GL official UI snapshot CB3/4 keeps identical delta0 and full formula gate',async t=>{const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage();p.on('dialog',d=>d.accept());await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#weaponKind','gunlance');await select(p,'#weapon','368');for(const slot of ['head','chest','arms','waist','legs'])await select(p,`[data-armor="${slot}"]`,'');await select(p,'#monster','13');await select(p,'#monsterPart','2700');await save(p,'GL3');await select(p,'[data-slot="w0"]','312');a.equal(await p.evaluate(()=>calcState.total['超会心']),4);await save(p,'GL4');
 const results=await p.evaluate(()=>{const A=savedBuildMap()['GL3'],B=savedBuildMap()['GL4'],cond={hz:70,ehz:0,sharp:1.32,esharp:1,cb:''};function run(a,b,cb=''){try{gunlanceStandardComparisonAdapter(a,b,{...cond,cb});return {unexpectedReady:true};}catch(e){return {reason:e.message,...e.partial};}}return {same:run(A,A),different:run(A,B),reverse:run(B,A),zero:run(A,B,'0')};});const phys=lv=>180*.97*equipmentSharp*.70*(1+.10*([1.25,1.28,1.31,1.34,1.37,1.4][lv]-1));a.equal(results.same.bodyDiagnostic.physicalDelta,0);close(results.different.verifiedBody.physical,phys(3));close(results.different.verifiedBodyB.physical,phys(4));close(results.reverse.bodyDiagnostic.physicalDelta,phys(3)-phys(4));a.equal(results.zero.bodyDiagnostic.physicalDelta,0);close(results.zero.verifiedBodyB.physical,phys(0));for(const r of Object.values(results)){a.match(r.reason,/SHELLING_OR_WYRMSTAKE_EVIDENCE_PENDING/);a.equal(r.bodyDiagnostic.scope,'BODY_ONLY_NOT_STANDARD');}fs.writeFileSync(path.join(__dirname,'../../GL-UI-E2E.json'),JSON.stringify(results,null,2));await p.screenshot({path:path.join(__dirname,'../../GL-UI-E2E.png'),fullPage:true});});
