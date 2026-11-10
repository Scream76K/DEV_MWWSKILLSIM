'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{chromium}=require('playwright');
const [root,fixtures,out]=process.argv.slice(2).map(x=>path.resolve(x));
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases;
const files=['index.html','hope-hammer-browser-adapter.js','bowgun-normal-reference.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'],hash=n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,n))).digest('hex');
const report={scope:'DISPOSABLE_CHROMIUM_BOWGUN_STANDARD_SEQUENCE',hashes:Object.fromEntries(files.map(n=>[n,hash(n)])),rows:[],failures:[]};fs.mkdirSync(out,{recursive:true});
(async()=>{
 const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname,p=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.json')?'application/json':p.endsWith('.png')?'image/png':'text/html');res.end(b);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});
 try{for(const [kind,id] of [['heavy-bowgun',469],['heavy-bowgun',464],['heavy-bowgun',517],['light-bowgun',783],['light-bowgun',763],['light-bowgun',771],['light-bowgun',773]]){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());const row={kind,id};report.rows.push(row);
  try{
   await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/index.html');await page.evaluate(()=>window.__localDBReady);
   await page.evaluate(data=>{window.__data=data;window.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');},pack.data);
   const snapshot=structuredClone(cases.find(c=>c.kind===kind).inputSnapshots[0]);Object.assign(snapshot,{weaponId:String(id),target:{monsterId:'13',partId:'2700'},armor:{},decos:{},charmCustom:{skills:[{name:'ファーストショット',level:3,type:'weapon'},{name:'フォースショット',level:3,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}});
   snapshot.combo.moves=[];snapshot.combo[kind==='light-bowgun'?'lightBowgunState':'hbgReferenceState']={ammoType:'NORMAL',ammoLevel:2,shotMode:'NORMAL',contactPolicy:'ALL_THREE',range:'CRITICAL',normalModeLevel:0,magazineCapacity:4,shotOrdinal:1,fullMagazine:true,normalPowder:'NONE',specialMagazine:'NONE'};
   await page.evaluate(s=>{applyBuildSnapshot(s);calcBuild();},snapshot);
   const probe=()=>page.evaluate(()=>{
    const kind=canonicalWeaponKind(selectedWeapon()),target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId},plan=consumerEvaluationPlan(kind,App.state.combo.moves,compareStep5Snapshot(),target),stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total,kind,plan.conditions)};
    const input={weapon:realPipelineWeapon(selectedWeapon(),plan.conditions.lightBowgunState),stats,target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:plan.conditions,hbgState:plan.conditions.hbgState,lightBowgunState:plan.conditions.lightBowgunState,retrievedAt:'FIXTURE_2026_11_05'};
    const state=()=>JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),input,summary:document.getElementById('buildSummary').textContent});
    const before=state(),ten=evaluateConsumerCombat({kind,moves:[],conditions:compareStep5Snapshot(),target,plan});
    return {ten,summary:document.getElementById('buildSummary').textContent,preserved:before===state()};
   });
   const first=await probe();assert.ok(first.preserved);if(id===773){assert.match(first.ten.reason,/WEAPON_NORMAL_RAPID_UNSUPPORTED/);row.status='EXPECTED_UNAVAILABLE';continue;}
   for(const ch of ['normal','maximum']){assert.equal(first.ten.channels[ch].execution.status,'complete');assert.equal(first.ten.channels[ch].components.flatMap(c=>c.details?.trace||[]).length,kind==='light-bowgun'?25:30);}
   if(kind==='light-bowgun'){assert.ok(first.summary.includes('一部スキル未反映'));assert.ok(first.summary.includes('フォースショット'));}
   const values=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels[ch].metrics.comboTotalDamage.value]));
   row.totals=values(first.ten);
   await page.fill('#buildName','explicit-ten');await page.click('#saveBuild');await page.evaluate(s=>{applyBuildSnapshot({...s,target:{monsterId:'training-room',partId:'training-back'}});calcBuild();},snapshot);
   await page.click('[data-build-load="explicit-ten"]');await page.click('#calcBuild');const loaded=await probe();assert.ok(loaded.preserved);assert.deepEqual(values(loaded.ten),row.totals);
   const stable=()=>page.evaluate(()=>JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap()}));const before=await stable();await page.click('#selectAllCompare');await page.click('#runCompare');assert.equal(await stable(),before);assert.deepEqual(errors,[]);if(id===771||id===517)await page.screenshot({path:path.join(out,'standard-'+id+'.png'),fullPage:true});row.status='PASS';
  }catch(e){row.status='FAIL';row.error=e.stack;report.failures.push({kind,error:e.message});}finally{await page.close();}
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
 report.runtimeUnchanged=files.every(n=>hash(n)===report.hashes[n]);report.status=report.failures.length?'FAIL':'PASS';fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exitCode=report.status==='PASS'?0:1;
})().catch(e=>{console.error(e);process.exitCode=1;});
