'use strict';
// Integration checks: real page, local JS and Technique DB; equipment is synthetic.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const localScripts=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(x=>x[1]).filter(x=>!/^https?:/.test(x)).map(x=>x.replace(/^\.\//,''));
const kinds=['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow'];
const genericReady=new Set(['great-sword','long-sword','sword-and-shield','dual-blades','hammer','lance','switch-axe']);
test('r249 full local assets and real-engine saved comparison matrix',async t=>{
 const browser=await chromium.launch({headless:true});t.after(()=>browser.close());
 for(const scenario of [...kinds,'great-sword:legacy-two-slot'])await t.test(scenario,async()=>{
  const [kind,legacy]=scenario.split(':');
  const page=await browser.newPage({viewport:{width:390,height:844}});
  try{
   const errors=[],loaded=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>{
    const u=new URL(route.request().url());
    if(u.origin!=='https://integration.test')return route.abort();
    const rel=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname.slice(1));
    const p=path.resolve(root,rel);
    if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){missing.push(rel);return route.fulfill({status:404,body:'not found'});}
    loaded.push(rel);return route.fulfill({body:fs.readFileSync(p),contentType:rel.endsWith('.js')?'text/javascript':rel.endsWith('.html')?'text/html':rel.endsWith('.json')?'application/json':'application/octet-stream'});
   });
   await page.goto('https://integration.test/');
   const result=await page.evaluate(({kind,legacy})=>{
    localStorage.clear();clearWeaponBuckets();
    const officialKind=kind==='sword-and-shield'?'sword-shield':kind;
    DB.weapons=[200,220].map((raw,i)=>({id:90001+i,kind:officialKind,name:'Integration '+kind+' '+i,damage:{raw,display:raw},affinity:20,slots:[],skills:[],specials:[]}));
    weaponIndexByKind[officialKind]=DB.weapons;weaponKind.value=kind;
    weapon.innerHTML=DB.weapons.map(w=>'<option value="'+w.id+'">'+w.name+'</option>').join('');
    build.armor={head:null,chest:null,arms:null,waist:null,legs:null};
    if(!legacy)normalizeCharm();
    if(kind==='bow'){powerBowRange.value='CRITICAL';powerBowCoating.value='NONE';}
    for(const w of DB.weapons){weapon.value=String(w.id);App.build.setWeapon(w);calcBuild();buildName.value=w.name;saveNamedBuild();}
    selectAllCompare.click();calcBuild();
    const before=JSON.stringify(buildSnapshotComparable(buildSnapshot()));
    const beforeStats=JSON.stringify(calcState.stats);
    runBuildCompare();
    const report=createBuildComparisonReport();
    const after=JSON.stringify(buildSnapshotComparable(buildSnapshot()));
    const restored=before===after;
    const statsRestored=beforeStats===JSON.stringify(calcState.stats);
    const message=compareOut.textContent;
    const templates={count:buildTemplateSelect.options.length,kindCount:buildTemplateWeaponKind.options.length};
    // Exercise cross-weapon rejection with a stored snapshot, without changing engine functions.
    const map=savedBuildMap(),names=Object.keys(map);map[names[1]].weaponKind=kind==='bow'?'lance':'bow';storageSet(BUILDS_KEY,JSON.stringify(map));
    const guardBefore=JSON.stringify(buildSnapshotComparable(buildSnapshot()));runBuildCompare();
    const rejected=/異なる武器種/.test(compareOut.textContent);
    const guardRestored=guardBefore===JSON.stringify(buildSnapshotComparable(buildSnapshot()));
    return {report,restored,before,after,statsRestored,message,templates,rejected,guardRestored,ocrRoot:!!document.getElementById('ocrEmbeddedHost')?.shadowRoot};
   },{kind,legacy});
   console.log(JSON.stringify({kind,loadedJs:loaded.filter(x=>x.endsWith('.js')).length,missing,errors,report:!!result.report,restored:result.restored,statsRestored:result.statsRestored,normal:result.report?.results.map(r=>r.power?.normal?.comparisonPower??null),pending:result.report?.results.map(r=>r.power?.reason??null),message:result.report?undefined:result.message,templates:result.templates,ocrRoot:result.ocrRoot}));
   if(!result.restored)console.log(JSON.stringify({kind,before:JSON.parse(result.before),after:JSON.parse(result.after)}));
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
   for(const script of localScripts)assert.ok(loaded.includes(script),'local script not loaded: '+script);
   assert.ok(result.report,'report unavailable: '+result.message);
   assert.equal(result.report.release,'r249');assert.equal(result.report.results.length,2);
   assert.equal(result.restored,true);assert.equal(result.statsRestored,true);
   assert.equal(result.rejected,true);assert.equal(result.guardRestored,true);
   if(genericReady.has(kind)){assert.ok(result.report.results[0].power.normal);assert.ok(Math.abs(result.report.results[0].relativePowerIndex-100)<1e-10,'baseline index must be 100 within floating-point precision');assert.ok(result.report.results[1].relativePowerIndex>100);}
   assert.equal(result.ocrRoot,true);assert.ok(result.templates.kindCount>=14);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }finally{await page.close();}
 });
});
