'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const product=path.resolve(process.argv[2]||path.join(__dirname,'..')),fixture=process.argv[3];
if(!fixture)throw Error('Usage: node tools/skill-continuation-public.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT');
const pack=JSON.parse(fs.readFileSync(path.join(fixture,'mhdb-catalog-source/raw-pack.json'))),cases=JSON.parse(fs.readFileSync(path.join(fixture,'ui-public-14-strict.json'))).cases;
const failures=[],rows=[],clone=x=>JSON.parse(JSON.stringify(x));
for(const c of (process.env.QUICK?cases.slice(0,1):cases)){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(product,'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://skill-continuation.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=x=>JSON.parse(w.eval('JSON.stringify('+x+')'));
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base={...clone(c.inputSnapshots[0]),armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]}};
 const apply=s=>{w.__snapshot=s;w.eval('applyBuildSnapshot(__snapshot);window.__beforeCalculation=buildSnapshot()');w.document.getElementById('calcBuild').click();return read('calcState.realOneHit');};
 const baseline=apply(base);const vals=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels?.[ch]?.metrics?.comboTotalDamage]));
 for(const name of (process.env.QUICK?['飛燕']:['飛燕','溜打強化','チャージマスター','心眼'])){
  const sk=pack.data.skills.find(s=>s.name===name);const level=sk.ranks.at(-1).level;
  const snap={...clone(base),charmCustom:{...clone(base.charmCustom),skills:[{name,level,type:sk.kind==='weapon'?'weapon':'armor'}]}};
  const r=apply(snap),preserved=read('buildSnapshotComparable(buildSnapshot())'),row={kind:c.kind,name,level,values:vals(r),reason:r.reason||null,baseline:vals(baseline),pipeline:process.env.QUICK?r:undefined,omitted:Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.channels?.[ch]?.diagnostics?.ignoredSkillEffects||[]]))};rows.push(row);
  try {for(const ch of ['normal','maximum'])assert.equal(r.channels?.[ch]?.metrics?.comboTotalDamage?.status,'available',c.kind+' '+name+' '+ch+' '+(r.reason||r.channels?.[ch]?.metrics?.comboTotalDamage?.reason));assert.equal(read('calcState.total')[name],level);assert.deepEqual(preserved,read("buildSnapshotComparable(window.__beforeCalculation)"));for(const ch of ['normal','maximum'])if(row.omitted[ch].length){assert.ok(w.document.querySelector('.one-hit-compact').textContent.includes('未反映'));assert.ok(w.document.getElementById('buildSummary').textContent.includes(name));}}
  catch(e){failures.push(e.message);}
 }
 // Illegal source rank remains invalid; it must not be converted to a skill omission.
 const invalid=apply({...base,charmCustom:{...base.charmCustom,skills:[{name:'攻撃',level:6,type:'weapon'}]}});try{assert.match(invalid.reason||'',/SAVED_SKILL_LEVEL_EXCEEDS_MAX/);}catch(e){failures.push('invalid '+c.kind+' '+e.message);}
 if(errors.length)failures.push(...errors);w.close();
}
console.log(JSON.stringify({scope:'JSDOM_PUBLIC_INPUT_MAPPING_NOT_FULL_LEGAL_EQUIPMENT_OR_GAME_NUMERIC_CERTIFICATION',rows,failures},null,2));process.exitCode=failures.length?1:0;
