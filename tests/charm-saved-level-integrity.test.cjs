'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const fixture=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data;
const clone=value=>JSON.parse(JSON.stringify(value));
function setup(t){
 const errors=[],alerts=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://charm-input.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=value=>w.JSON.parse(w.JSON.stringify(value));w.confirm=()=>true;w.alert=m=>alerts.push(m);}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);assert.deepEqual(alerts,[]);});
 w.__fixture=clone(fixture);
 w.eval(`DB=normalizeDB({...__fixture,weapons:consolidateArtiaFixedVariantRows(__fixture.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();weaponKind.value='great-sword';renderWeapon();weapon.value='236';syncWeaponStateFromUI();build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();calcBuild();window.__base=buildSnapshot();`);
 const read=source=>JSON.parse(w.eval('JSON.stringify('+source+')'));
 return {w,read,base:read('__base')};
}
function storeAndLoad(s,grant,name='original'){
 const input={...clone(s.base),charmCustom:{skills:[grant],slots:[0,0],weaponSlots:[],weaponSlot:false}};
 s.w.__input=input;s.w.__name=name;
 s.w.eval(`storageSet(BUILDS_KEY,JSON.stringify({[__name]:__input}));renderSavedBuilds();`);
 const before=s.read('savedBuildMap()');
 s.w.document.querySelector('[data-build-load]').click();
 s.w.document.getElementById('calcBuild').click();
 assert.deepEqual(s.read('savedBuildMap()'),before,'loading must not rewrite original stored JSON');
 return input;
}
for(const [label,grant] of [
 ['null',{name:'攻撃',level:null,type:'weapon'}],
 ['empty string',{name:'攻撃',level:'',type:'weapon'}],
 ['missing',{name:'攻撃',type:'weapon'}],
 ['fractional',{name:'攻撃',level:2.5,type:'weapon'}],
 ['non-numeric',{name:'攻撃',level:'bad',type:'weapon'}]
])test('saved named charm '+label+' level stays invalid through load, calculation, save and reload',t=>{
 const s=setup(t),{w,read}=s;storeAndLoad(s,grant);
 t.diagnostic(JSON.stringify({input:grant,loaded:read('build.charmCustom.skills[0]'),legality:read('validateCurrentCharm().status'),attackTrue:read('calcState.stats.attackTrue'),reason:read('calcState.realOneHit.reason||null')}));
 assert.deepEqual(read('build.charmCustom.skills[0]'),grant,'normalizer must retain invalid evidence');
 assert.equal(read('validateCurrentCharm().status'),'invalid');
 assert.equal(read('calcState.stats.attackTrue'),90,'malformed Attack must not become Attack Lv1');
 assert.match(read('calcState.realOneHit.reason'),/SAVED_SKILL_LEVEL_INVALID:72/);
 assert.equal(read('calcState.realOneHit.status'),'UNAVAILABLE');
 assert.ok(w.document.getElementById('charmLegality').textContent.includes('条件不一致'));
 w.document.getElementById('buildName').value='roundtrip';w.document.getElementById('saveBuild').click();
 assert.deepEqual(read('savedBuildMap().roundtrip.charmCustom.skills[0]'),grant);
 w.eval('applyBuildSnapshot(__base)');
 [...w.document.querySelectorAll('[data-build-load]')].find(x=>x.dataset.buildLoad==='roundtrip').click();
 assert.deepEqual(read('build.charmCustom.skills[0]'),grant);
 assert.match(read('calcState.realOneHit.reason'),/SAVED_SKILL_LEVEL_INVALID:72/);
});
test('valid legacy numeric level and absent optional slot/type fields still load and calculate',t=>{
 const s=setup(t),{w,read}=s;
 w.__input={...s.base,charmCustom:{skills:[{name:'攻撃',level:'2'}]}};
 w.eval('applyBuildSnapshot(__input)');
 assert.equal(read('build.charmCustom.skills[0].level'),'2');
 assert.equal(read('calcState.stats.attackTrue'),95);
 for(const ch of ['normal','maximum'])assert.equal(read('calcState.realOneHit.channels.'+ch+'.metrics.comboTotalDamage.status'),'available');
});
test('blank editor rows retain their harmless default without granting a skill',t=>{
 const {w,read}=setup(t);
 w.eval(`build.charmCustom={skills:[{name:'',level:null}],slots:[0,0],weaponSlots:[]};normalizeCharm();calcBuild();`);
 assert.equal(read('build.charmCustom.skills[0].level'),1);
 assert.deepEqual(read('currentCharmSkills()'),{});
 assert.equal(read('validateCurrentCharm().status'),'empty');
 for(const ch of ['normal','maximum'])assert.equal(read('calcState.realOneHit.channels.'+ch+'.metrics.comboTotalDamage.status'),'available');
});
test('owner-excluded valid skill remains displayed and saved without changing power',t=>{
 const s=setup(t),{w,read}=s,before=read('calcState.realOneHit.channels');
 const grant={name:'破壊王',level:3,type:'armor'};storeAndLoad(s,grant);
 for(const ch of ['normal','maximum'])assert.equal(read('calcState.realOneHit.channels.'+ch+'.metrics.comboTotalDamage.value'),before[ch].metrics.comboTotalDamage.value);
 assert.ok(w.document.getElementById('buildSummary').textContent.includes('破壊王'));
 w.document.getElementById('buildName').value='excluded';w.document.getElementById('saveBuild').click();
 assert.deepEqual(read('savedBuildMap().excluded.charmCustom.skills[0]'),grant);
});

test('saved comparison keeps malformed row unavailable and restores original invalid input',t=>{
 const s=setup(t),{w,read}=s,grant={name:'攻撃',level:null,type:'weapon'};
 storeAndLoad(s,grant,'invalid');
 w.__valid=clone(s.base);
 w.eval("{const m=savedBuildMap();m.valid=__valid;storageSet(BUILDS_KEY,JSON.stringify(m));renderSavedBuilds();}");
 const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stored:savedBuildMap()})');
 w.document.getElementById('selectAllCompare').click();w.document.getElementById('runCompare').click();
 const rows=read('lastBuildComparisonRows');assert.equal(rows.length,2);
 const invalid=rows.find(x=>x.name==='invalid'),valid=rows.find(x=>x.name==='valid');
 assert.equal(invalid.oneHitPipeline.status,'UNAVAILABLE');
 assert.match(invalid.oneHitPipeline.reason,/SAVED_SKILL_LEVEL_INVALID:72/);
 for(const ch of ['normal','maximum'])assert.equal(valid.oneHitPipeline.channels[ch].metrics.comboTotalDamage.status,'available');
 assert.deepEqual(read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),stored:savedBuildMap()})'),before);
 assert.deepEqual(read('build.charmCustom.skills[0]'),grant);
 assert.match(read('calcState.realOneHit.reason'),/SAVED_SKILL_LEVEL_INVALID:72/);
});
