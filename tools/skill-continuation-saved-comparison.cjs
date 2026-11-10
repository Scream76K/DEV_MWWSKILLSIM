'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),fixtures=process.argv[3],bodyMode=process.env.MHW_BODY_CASE==='1';
if(!fixtures)throw Error('Usage: node tools/skill-continuation-saved-comparison.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT');
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),fixture=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases.find(x=>x.kind==='gunlance');
const clone=x=>JSON.parse(JSON.stringify(x));
const differences=(a,b,p='')=>JSON.stringify(a)===JSON.stringify(b)?[]:a&&b&&typeof a==='object'&&typeof b==='object'?[...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>differences(a[k],b[k],p+'.'+k)):[p];
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://skill-saved-comparison.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const read=x=>JSON.parse(w.eval('JSON.stringify('+x+')'));
const apply=s=>{w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot)');w.document.getElementById('calcBuild').click();return read('calcState.realOneHit');};
const capture=()=>({snapshot:read('buildSnapshotComparable(buildSnapshot())'),conditions:read('compareStep5Snapshot()'),result:read('calcState.realOneHit'),stored:read('savedBuildMap()')});
try{
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base={...clone(fixture.inputSnapshots[0]),armor:bodyMode?{head:609,arms:611,chest:706}:{},decos:{},charmCustom:{skills:[{name:'攻撃',level:4,type:'weapon'},{name:'飛燕',level:1,type:'weapon'}],slots:[0,0,0],weaponSlots:[]}},saved=[];
 base.artia={...base.artia,seriesSkill:'',groupSkill:''};
 for(const [name,id]of [['A Artia',1151],['B Hope',319]]){
  assert.ok(pack.data.weapons.some(x=>x.id===id));const result=apply({...clone(base),weaponId:String(id)});
  w.document.getElementById('buildName').value=name;w.document.getElementById('saveBuild').click();saved.push({name,id,result});
 }
 apply({...clone(base),charmCustom:{...clone(base.charmCustom),skills:[{name:'攻撃',level:1,type:'weapon'}]}});
 const before=capture();w.document.getElementById('selectAllCompare').click();w.document.getElementById('runCompare').click();const rows=read('lastBuildComparisonRows'),after=capture();
 assert.equal(rows.length,2);for(const key of ['snapshot','conditions','stored'])assert.deepEqual(after[key],before[key]);assert.deepEqual(after.result.channels,before.result.channels);
 const metadataDifferences=differences(before.result,after.result),known=new Set(['.conditionKey','.comparisonContext.damage','.comparisonContext.dps']);assert.ok(metadataDifferences.every(x=>known.has(x)),JSON.stringify(metadataDifferences));
 for(const row of rows){const a=saved.find(x=>x.name===row.name);assert.deepEqual(row.oneHitPipeline.channels,a.result.channels);for(const ch of ['normal','maximum']){const c=row.oneHitPipeline.channels[ch];assert.equal(c.execution.status,'complete');assert.equal(c.metrics.comboTotalDamage.status,'available');assert.deepEqual((c.diagnostics.ignoredSkillEffects||[]).map(x=>x.skillId),row.name==='A Artia'?(bodyMode?[162,86]:[86]):(bodyMode?[86]:[]));}}
 assert.equal(w.document.querySelectorAll('#compareOut [data-ignored-skill-channel]').length,bodyMode?4:2);
 const exported=read('createBuildComparisonReport()');for(const row of exported.results)assert.deepEqual(row.oneHitPipeline.channels,saved.find(x=>x.name===row.name).result.channels);
 for(const item of saved){[...w.document.querySelectorAll('[data-build-load]')].find(n=>n.dataset.buildLoad===item.name).click();assert.deepEqual(read('buildSnapshotComparable(buildSnapshot())'),read('buildSnapshotComparable(savedBuildMap()['+JSON.stringify(item.name)+'])'));assert.deepEqual(read('calcState.realOneHit').channels,item.result.channels);assert.deepEqual(read('savedBuildMap()'),before.stored);}
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({status:'PASS',bodyMode,scope:'JSDOM_TWO_DISTINCT_REAL_MHDB_GL_WEAPONS_PUBLIC_SAVE_LOAD_COMPARE;NOT_GAME_ACCURACY',rows:rows.map(r=>({name:r.name,values:Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.oneHitPipeline.channels[ch].metrics.comboTotalDamage.value]))})),savedMapPreserved:true,currentSnapshotPreserved:true,currentConditionsPreserved:true,currentChannelsPreserved:true,standaloneComparisonChannelsEqual:true,knownBaselineMetadataDifferences:metadataDifferences,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','skill-effect-continuation.js','skill-calculation-policy.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')])),errors},null,2));
}finally{w.close();}
