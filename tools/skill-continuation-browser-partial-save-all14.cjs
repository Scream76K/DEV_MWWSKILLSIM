'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]),fixtures=path.resolve(process.argv[4]||path.join(__dirname,'fixtures'));
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),source=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json')));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const report={scope:'DISPOSABLE_CHROMIUM_ALL14_PARTIAL_REAL_ARMOR_AB_SAVE_LOAD_COMPARE;NOT_GAME_ACCURACY',root,productHashes:{index:hash('index.html'),adapter:hash('hope-hammer-browser-adapter.js'),continuation:hash('skill-effect-continuation.js'),policy:hash('skill-calculation-policy.js')},cases:[],failures:[]};fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const p=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(error,bytes)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.json')?'application/json':p.endsWith('.png')?'image/png':p.endsWith('.svg')?'image/svg+xml':'text/html');res.end(bytes);});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{for(const c of source.cases){
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const row={kind:c.kind,status:'RUNNING'};report.cases.push(row);
  try{
   await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/index.html');await page.evaluate(()=>window.__localDBReady);
   await page.evaluate(data=>{window.__data=data;window.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');},pack.data);
   const buildBase={...structuredClone(c.inputSnapshots[0]),armor:{head:653,chest:654,arms:655,waist:656},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}},snapshots=[buildBase,{...buildBase,armor:{...buildBase.armor,legs:709}}],names=['partial-A','partial-B'],saved=[];
   const apply=async snapshot=>{await page.evaluate(s=>{window.__snapshot=s;window.eval('applyBuildSnapshot(__snapshot)');},snapshot);await page.click('#calcBuild');return page.evaluate(()=>({real:calcState.realOneHit,skills:calcState.total,snapshot:buildSnapshot()}));};
   const values=result=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,result.channels?.[ch]?.metrics]));
   const ignored=result=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,result.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[]]));
   const available=result=>{for(const ch of ['normal','maximum']){const m=result.channels?.[ch]?.metrics?.comboTotalDamage;assert.equal(m?.status,'available');assert.ok(Number.isFinite(m.value));assert.ok(ignored(result)[ch].some(x=>x.skillId===172&&x.rankLevel===2),'Black Knight must be visibly omitted in '+ch);}};
   row.inputs=[];for(const[i,snapshot]of snapshots.entries()){const result=await apply(snapshot);available(result.real);saved.push(result);row.inputs.push({name:names[i],armor:result.snapshot.armor,metrics:values(result.real),ignored:ignored(result.real)});const text=await page.locator('#buildSummary').innerText();assert.ok(text.includes('一部スキル未反映'));assert.ok(text.includes('ブラックナイト'));await page.fill('#buildName',names[i]);await page.click('#saveBuild');}
   assert.notDeepEqual(saved[0].snapshot.armor,saved[1].snapshot.armor);
   for(const[i,name]of names.entries()){await page.click('[data-build-load="'+name+'"]');await page.click('#calcBuild');const result=await page.evaluate(()=>calcState.realOneHit);available(result);assert.deepEqual(result.channels,saved[i].real.channels);}
   await page.click('[data-build-load="partial-A"]');await page.click('#calcBuild');
   const state=()=>page.evaluate(()=>JSON.parse(JSON.stringify({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),channels:calcState.realOneHit.channels})));
   const before=await state();await page.click('#selectAllCompare');await page.click('#runCompare');const rows=await page.evaluate(()=>lastBuildComparisonRows.map(r=>({name:r.name,real:r.oneHitPipeline})));assert.equal(rows.length,2);
   row.comparison=[];for(const[i,name]of names.entries()){const r=rows.find(x=>x.name===name);available(r.real);assert.deepEqual(values(r.real),values(saved[i].real));assert.deepEqual(ignored(r.real),ignored(saved[i].real));row.comparison.push({name,metrics:values(r.real),ignored:ignored(r.real)});}
   const text=await page.locator('#compareOut').innerText();assert.ok(text.includes('一部スキル未反映'));assert.ok(text.includes('ブラックナイト'));assert.deepEqual(await state(),before);row.savedCompared=2;
   if(['gunlance','switch-axe','charge-blade'].includes(c.kind)){for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#buildSummary').screenshot({path:path.join(out,c.kind+'-'+width+'.png')});}}
   assert.deepEqual(errors,[]);row.status='PASS';row.errors=errors;
  }catch(e){row.status='FAIL';row.error=e.stack;row.errors=errors;report.failures.push({kind:c.kind,error:e.message});}finally{await page.close();}
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(row.kind,row.status);
 }}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 assert.equal(hash('index.html'),report.productHashes.index);assert.equal(hash('hope-hammer-browser-adapter.js'),report.productHashes.adapter);assert.equal(hash('skill-effect-continuation.js'),report.productHashes.continuation);assert.equal(hash('skill-calculation-policy.js'),report.productHashes.policy);report.status=report.failures.length?'FAIL':'PASS';report.counts={weapons:report.cases.length,distinctBuilds:report.cases.length*2,channels:report.cases.length*4,saveLoadCompare:report.cases.length,failures:report.failures.length};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.counts));process.exitCode=report.failures.length?1:0;
})().catch(e=>{report.status='ERROR';report.error=e.stack;fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.error(e);process.exitCode=1;});
