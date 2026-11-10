'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{JSDOM,VirtualConsole}=require('jsdom');
const [product,fixtures]=process.argv.slice(2).map(x=>path.resolve(x));
const packBytes=fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json')),fixtureBytes=fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'));
const pack=JSON.parse(packBytes),source=JSON.parse(fixtureBytes),html=require(path.join(product,'tools/dom-test-setup.cjs')).readSimulatorHtml(),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const runtime=['index.html','hope-hammer-browser-adapter.js','skill-effect-continuation.js','skill-calculation-policy.js'];
const report={scope:'REAL_BLACK_KNIGHT_FOUR_PIECES_AND_DISTINCT_LEG_ARMOR_PUBLIC_PARTIAL_SAVE_LOAD_COMPARE_ALL14;NOT_GAME_ACCURACY_OR_ALL_COMBINATIONS',hashes:{database:hash(packBytes),fixtures:hash(fixtureBytes),script:hash(fs.readFileSync(__filename)),...Object.fromEntries(runtime.map(p=>[p,hash(fs.readFileSync(path.join(product,p)))]))},rows:[],failures:[],jsdomErrors:[]};
const armor={head:653,chest:654,arms:655,waist:656};
for(const[k,id]of Object.entries(armor))assert.equal(pack.data.armor.find(x=>x.id===id)?.kind,k);assert.equal(pack.data.armor.find(x=>x.id===709)?.kind,'legs');
const values=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels?.[ch]?.metrics]));
const omissions=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[]]));
const available=r=>{for(const ch of ['normal','maximum']){const m=r.channels?.[ch]?.metrics?.comboTotalDamage;assert.equal(m?.status,'available',ch+' must calculate');assert.ok(Number.isFinite(m.value));assert.ok(omissions(r)[ch].some(x=>x.skillId===172&&x.rankLevel===2),'Black Knight omission must be explicit in '+ch);}};
for(const c of source.cases){
 const row={kind:c.kind,weaponId:c.inputSnapshots[0].weaponId,status:'RUNNING',inputs:[],comparison:[]};report.rows.push(row);
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(html,{url:'https://partial-save-all14.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE_TEST'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 try{
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const base={...c.inputSnapshots[0],target:{monsterId:"13",partId:"2700"},armor,decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}},snapshots=[base,{...base,armor:{...armor,legs:709}}],saved=[];
  assert.notDeepEqual(snapshots[0].armor,snapshots[1].armor);
  for(const[i,snapshot]of snapshots.entries()){
   w.__snapshot=JSON.parse(JSON.stringify(snapshot));w.eval('applyBuildSnapshot(__snapshot)');click('calcBuild');
   const result=read('({real:calcState.realOneHit,snapshot:buildSnapshot()})');available(result.real);
   for(const text of ['一部スキル未反映','ブラックナイト'])assert.ok(w.document.getElementById('buildSummary').textContent.includes(text));
   saved.push(result);row.inputs.push({name:['A','B'][i],armor:result.snapshot.armor,values:values(result.real),omissions:omissions(result.real)});
   w.document.getElementById('buildName').value=['A','B'][i];click('saveBuild');
  }
  for(const[i,name]of ['A','B'].entries()){
   w.document.querySelector('[data-build-load="'+name+'"]').click();click('calcBuild');const loaded=read('calcState.realOneHit');available(loaded);assert.deepEqual(loaded.channels,saved[i].real.channels,'full channels must survive '+name+' load');
  }
  w.document.querySelector('[data-build-load="A"]').click();click('calcBuild');
  const state='({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),channels:calcState.realOneHit.channels})',before=read(state);
  click('selectAllCompare');click('runCompare');const compared=read('lastBuildComparisonRows');assert.equal(compared.length,2);
  for(const[i,name]of ['A','B'].entries()){
   const result=compared.find(x=>x.name===name)?.oneHitPipeline;assert.ok(result);available(result);assert.deepEqual(values(result),values(saved[i].real),name+' comparison metrics');assert.deepEqual(omissions(result),omissions(saved[i].real),name+' omission receipt');row.comparison.push({name,values:values(result),omissions:omissions(result)});
  }
  for(const text of ['一部スキル未反映','ブラックナイト'])assert.ok(w.document.getElementById('compareOut').textContent.includes(text));
  assert.deepEqual(read(state),before,'compare must preserve build, conditions, storage and channels');assert.deepEqual(errors,[]);row.status='PASS';
 }catch(e){row.status='FAIL';row.error=e.stack;report.failures.push({kind:c.kind,error:e.message});}
 finally{w.close();report.jsdomErrors.push(...errors.map(error=>({kind:c.kind,error})));}
}
report.counts={weapons:report.rows.length,distinctBuilds:report.rows.length*2,currentChannels:report.rows.length*4,comparedChannels:report.rows.length*4,failures:report.failures.length,jsdomErrors:report.jsdomErrors.length};report.runtimeUnchanged=runtime.every(p=>hash(fs.readFileSync(path.join(product,p)))===report.hashes[p]);assert.ok(report.runtimeUnchanged);report.status=report.failures.length||report.jsdomErrors.length?'FAIL':'PASS';console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='PASS'?0:1;
