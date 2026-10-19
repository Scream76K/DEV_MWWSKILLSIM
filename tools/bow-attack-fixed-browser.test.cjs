'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright'),{db}=require('./kan108-fixture.cjs'),{installLocalModules}=require('./browser-test-setup.cjs');
const close=(v,e)=>a.ok(Number.isFinite(v)&&Math.abs(v-e)<1e-8,`${v} != ${e}`);
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


// Independent literal coefficients: MV12*3/12*5/15*6, elemental1*3/.8*5/1*6;
// MHDB attackLv2 +5, Lv4 *1.02+8, Lv5 *1.04+9. No production calculator calls.
function oracle(level,max=false,charge=1.15){const m=level===5?1.04:level===4?1.02:1,f=[0,3,5,7,8,9][level],atk=232*m*1.05+f+6+(max?41:0),aff=max?100:level>=4?10:22,effective=260*(max?1.44:1.2)*charge+(max?80:60)+40;return [[3,12,1,0,aff],[5,12,.8,3,Math.min(100,aff+8)],[6,15,1,0,Math.min(100,aff+8)]].reduce((sum,[n,mv,em,add,a])=>sum+n*((atk+add)*mv/100*.65*(1+a/100*.25)*1.1*1.35+effective/10*.30*em),0);}
async function check(p,level,charge=1.15){const v=await p.evaluate(()=>({stats:calcState.stats,total:calcState.total,report:createComboVerificationReport()}));a.equal(v.total['攻撃']??0,level);close(v.stats.attackComponents.normalMultiplier,level===5?1.04:level===4?1.02:1);close(v.stats.attackComponents.normalFlat,[0,3,5,7,8,9][level]);for(const [k,max]of [['NORMAL',false],['MAXIMUM',true]]){close(v.report.channels[k].damage,oracle(level,max,charge));a.equal(v.report.channels[k].dps,null);}return v;}
async function compare(p){const rows=await p.evaluate(()=>createBuildComparisonReport().results);a.equal(rows.length,2);for(const row of rows){const lv=row.name==='Attack 0'?0:2;close(row.powerIndex,oracle(lv));close(row.maxPowerIndex,oracle(lv,true));close(row.comboVerification.channels.NORMAL.damage,oracle(lv));close(row.comboVerification.channels.MAXIMUM.damage,oracle(lv,true));a.equal(row.dps,null);}await table(p,'power-index',rows.map(r=>oracle(r.name==='Attack 0'?0:2).toFixed(1)));await table(p,'max-power-index',rows.map(r=>oracle(r.name==='Attack 0'?0:2,true).toFixed(1)));return rows;}
test('official attack0/2, attack4/5 order, saved A/B and offline reload',async t=>{
 const b=await chromium.launch({headless:true});t.after(()=>b.close());const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());p.setDefaultTimeout(7000);await mount(p);await click(p,'#load');await p.waitForFunction(()=>document.getElementById('status').textContent.includes('データ取得完了'));await select(p,'#buildTemplateWeaponKind','bow');await select(p,'#buildTemplateSelect','SALADA_BOW_03');await click(p,'#loadBuildTemplate');await select(p,'#monster','13');await select(p,'#monsterPart','2700');await select(p,'#powerBowCoating','POWER');await select(p,'#powerBowRange','CRITICAL');await select(p,'#powerBowStartShot','3');await select(p,'[data-slot="w1"]','');await select(p,'#comboPreset','adopted:bow_reference');await click(p,'#calcDps');const A=await check(p,0);await save(p,'Attack 0');await select(p,'[data-slot="w1"]','15');await click(p,'#calcDps');const B=await check(p,2);await save(p,'Attack 2');await click(p,'#selectAllCompare');await click(p,'#runCompare');const rows=await compare(p);await offlineReload(p,await read(p),'BOW-ATTACK-FIX');await compare(p);await check(p,2);await click(p,'[data-build-load="Attack 0"]');await click(p,'#calcDps');await check(p,0);await click(p,'[data-build-load="Attack 2"]');await click(p,'#calcDps');await check(p,2);
 // Real weapon slot2 is Critical Eye3 (+12 affinity): replace with Attack2/3.
 // Lv4/5 independent normal affinity is therefore10; maximum remains capped100.
 await select(p,'[data-slot="w2"]','15');await click(p,'#calcDps');const L4=await check(p,4);a.equal(L4.stats.affinity,10);await select(p,'[data-slot="w2"]','263');await click(p,'#calcDps');const L5=await check(p,5);a.equal(L5.stats.affinity,10);await select(p,'#buildTemplateWeaponKind','bow');await select(p,'#buildTemplateSelect','SALADA_BOW_03');await click(p,'#loadBuildTemplate');const baseline={};for(const [coating,n,m]of [['POWER','672.32','916.17'],['CLOSE_RANGE','690.59','942.15'],['PIERCE','760.45','1042.04']]){await select(p,'#powerBowCoating',coating);const power=await p.evaluate(()=>standardPowerForStats('bow',calcState.stats,compareStep5Snapshot(),calcState.total));a.equal(power.normal.comparisonPower.toFixed(2),n);a.equal(power.maximum.comparisonPower.toFixed(2),m);baseline[coating]=[n,m];}a.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'../../BOW-ATTACK-FIX-E2E.json'),JSON.stringify({A,B,L4,L5,rows,baseline,oracle:{none:[oracle(0),oracle(0,true)],lv2:[oracle(2),oracle(2,true)],lv4:[oracle(4),oracle(4,true)],lv5:[oracle(5),oracle(5,true)]}},null,2));
});
