'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),fixtures=process.argv[3];
if(!fixtures)throw Error('Usage: node tools/skill-continuation-equipment-smoke.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT');
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases,rows=[],failures=[];
for(const c of cases){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://skill-real-equipment.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 try{
  w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  w.__snapshot=c.inputSnapshots[0];w.eval('applyBuildSnapshot(__snapshot)');const before=read('buildSnapshotComparable(buildSnapshot())'),start=performance.now();
  w.document.getElementById('calcBuild').click();const elapsedMs=performance.now()-start,result=read('calcState.realOneHit'),after=read('buildSnapshotComparable(buildSnapshot())');
  const channels=Object.fromEntries(['normal','maximum'].map(ch=>{const r=result.channels?.[ch];return [ch,{metric:r?.metrics?.comboTotalDamage,omitted:r?.diagnostics?.ignoredSkillEffects||[],continuation:r?.diagnostics?.skillContinuation||null}]}));
  const row={kind:c.kind,weaponId:before.weaponId,armor:before.armor,skills:read('calcState.total'),elapsedMs,channels};rows.push(row);
  assert.deepEqual(before,after);assert.equal(Object.values(before.armor).filter(Boolean).length,5);
  for(const ch of ['normal','maximum'])assert.equal(channels[ch].metric?.status,'available',c.kind+' '+ch+' '+(result.reason||channels[ch].metric?.reason));
  assert.deepEqual(errors,[]);
 }catch(e){failures.push({kind:c.kind,error:e.message,errors});}finally{w.close();}
}
console.log(JSON.stringify({scope:'PUBLIC_CALCULATE_ORIGINAL_FOURTEEN_REAL_FIVE_ARMOR_BUILD_FIXTURES;NOT_ALL_LEGAL_COMBINATIONS_OR_GAME_ACCURACY',concurrentLoadMayAffectTiming:true,rows,failures},null,2));process.exitCode=failures.length?1:0;
