'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]),fixtures=path.resolve(process.argv[4]||path.join(__dirname,'fixtures'));
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),source=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json')));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const report={scope:'DISPOSABLE_CHROMIUM_PUBLIC_CALCULATE_SAVE_LOAD_COMPARE;NOT_LIVE_GAME_ACCURACY',root,productHashes:{index:hash('index.html'),adapter:hash('hope-hammer-browser-adapter.js')},cases:[],failures:[]};fs.mkdirSync(out,{recursive:true});
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
   const plain={...structuredClone(c.inputSnapshots[0]),target:{monsterId:"13",partId:"2700"},armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}};
   const apply=async snapshot=>{await page.evaluate(s=>{window.__snapshot=s;window.eval('applyBuildSnapshot(__snapshot)');},snapshot);await page.click('#calcBuild');return page.evaluate(()=>({real:calcState.realOneHit,skills:calcState.total,snapshot:buildSnapshot()}));};
   const values=result=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,result.channels?.[ch]?.metrics]));
   const empty=await apply(plain);for(const ch of ['normal','maximum'])assert.equal(empty.real.channels?.[ch]?.metrics.comboTotalDamage.status,'available');
   const current=[];
   for(const level of [1,2,3]){const r=await apply({...plain,charmCustom:{...plain.charmCustom,skills:[{name:'破壊王',level,type:'armor'}]}});assert.deepEqual(values(r.real),values(empty.real));assert.equal(r.skills['破壊王'],level);for(const ch of ['normal','maximum'])assert.equal(r.real.channels[ch].diagnostics.excludedCalculationSkills.filter(x=>Number(x.skillId)===129&&x.level===level).length,1);current.push(values(r.real));}
   row.partbreakerLevels=3;row.channels=2;row.damage=current[2];await page.locator('#buildSummary .one-hit-diagnostics > summary').click();assert.ok((await page.locator('#buildSummary').innerText()).includes('破壊王'));assert.ok((await page.locator('#skillOutput').innerText()).includes('破壊王'));
   await page.fill('#buildName','integration-A');await page.click('#saveBuild');
   const b=await apply({...plain,charmCustom:{...plain.charmCustom,skills:[{name:'破壊王',level:1,type:'armor'}]}});await page.fill('#buildName','integration-B');await page.click('#saveBuild');
   await page.click('[data-build-load="integration-A"]');await page.click('#calcBuild');assert.equal(await page.evaluate(()=>calcState.total['破壊王']),3);
   const before=await page.evaluate(()=>JSON.stringify({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()}));
   await page.click('#selectAllCompare');await page.click('#runCompare');const rows=await page.evaluate(()=>lastBuildComparisonRows.map(r=>r.oneHitPipeline));assert.equal(rows.length,2);assert.deepEqual(rows.map(values),[current[2],values(b.real)]);assert.equal(await page.evaluate(()=>JSON.stringify({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()})),before);
   row.savedCompared=2;
   if(['switch-axe','charge-blade'].includes(c.kind)){for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#buildSummary').screenshot({path:path.join(out,c.kind+'-'+width+'.png')});}}
   assert.deepEqual(errors,[]);row.status='PASS';row.errors=errors;
  }catch(e){row.status='FAIL';row.error=e.stack;row.errors=errors;report.failures.push({kind:c.kind,error:e.message});}finally{await page.close();}
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(row.kind,row.status);
 }}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
 assert.equal(hash('index.html'),report.productHashes.index);assert.equal(hash('hope-hammer-browser-adapter.js'),report.productHashes.adapter);report.status=report.failures.length?'FAIL':'PASS';report.counts={weapons:report.cases.length,levels:report.cases.length*3,channels:report.cases.length*3*2,saveLoadCompare:report.cases.length,failures:report.failures.length};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.counts));process.exitCode=report.failures.length?1:0;
})().catch(e=>{report.status='ERROR';report.error=e.stack;fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.error(e);process.exitCode=1;});
