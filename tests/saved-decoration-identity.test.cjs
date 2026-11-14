'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const fixture=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data;
function setup(t){
 const errors=[],alerts=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://saved-decoration-identity.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=v=>w.JSON.parse(w.JSON.stringify(v));w.confirm=()=>true;w.alert=m=>alerts.push(m);}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 w.__fixture=JSON.parse(JSON.stringify(fixture));
 const ev=x=>w.eval(x),read=x=>JSON.parse(ev('JSON.stringify('+x+')'));
 ev("DB=normalizeDB({...__fixture,weapons:consolidateArtiaFixedVariantRows(__fixture.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();weaponKind.value='great-sword';renderWeapon();weapon.value='236';syncWeaponStateFromUI();updateWeaponInfo();build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();calcBuild();window.__base=buildSnapshot();");
 const click=id=>w.document.getElementById(id).click();
 const save=name=>{w.document.getElementById('buildName').value=name;click('saveBuild');};
 const load=name=>[...w.document.querySelectorAll('[data-build-load]')].find(x=>x.dataset.buildLoad===name).click();
 const stored=()=>ev('storageGet(BUILDS_KEY)');
 const state=()=>read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),calculation:calcState})');
 const ui=()=>JSON.stringify({values:[...w.document.querySelectorAll('select,input,textarea')].filter(x=>!x.closest('#compareBuilds,#compareOut')).map(x=>({id:x.id,slot:x.dataset.slot,armor:x.dataset.armor,value:x.value,checked:x.checked})),outputs:['buildSummary','weaponSkillPreview','weaponSlotPreview','armorSelectors','charmEditor'].map(id=>w.document.getElementById(id)?.innerHTML)});
 save('control');
 const store=input=>{w.__input=input;ev("storageSet(BUILDS_KEY,JSON.stringify({...savedBuildMap(),candidate:__input}));renderSavedBuilds();");};
 return {w,ev,read,click,save,load,stored,state,ui,alerts,store};
}
function publicAttackSave(c){
 const select=c.w.document.getElementById('weapon');select.value='239';select.dispatchEvent(new c.w.Event('change',{bubbles:true}));
 const deco=c.w.document.querySelector('.decoSel[data-slot="w0"]');assert.ok(deco);
 deco.value='15';deco.dispatchEvent(new c.w.Event('change',{bubbles:true}));
 c.save('attack');const saved=c.read('savedBuildMap().attack');
 assert.equal(String(saved.weaponId),'239');assert.equal(saved.decos.w0,'15');
 assert.equal(c.read('calcState.stats.attackTrue'),165);
 for(const ch of ['normal','maximum'])assert.equal(c.read('calcState.realOneHit.channels.'+ch+'.metrics.comboTotalDamage.status'),'available');
 c.ev('applyBuildSnapshot(__base)');c.click('calcBuild');
 return saved;
}
test('public saved decoration missing from current MHDB is rejected before changing live input or result',t=>{
 const c=setup(t);const saved=publicAttackSave(c);
 c.ev('DB.decorations=DB.decorations.filter(d=>d.id!==15)');
 const before=c.state(),ui=c.ui(),stored=c.stored();c.load('attack');
 assert.equal(c.alerts.length,1,'an unresolved saved decoration must be reported, not silently dropped');
 assert.match(c.alerts[0],/装飾品がDBに見つかりません.*w0.*15/);
 assert.deepEqual(c.state(),before);assert.equal(c.ui(),ui);assert.equal(c.stored(),stored);
 assert.deepEqual(c.read('savedBuildMap().attack'),saved);
});
test('comparison rejects only the unresolved decoration row and restores original live and stored data',t=>{
 const c=setup(t);publicAttackSave(c);c.ev('DB.decorations=DB.decorations.filter(d=>d.id!==15)');
 const before=c.state(),ui=c.ui(),stored=c.stored();
 c.click('selectAllCompare');c.click('runCompare');
 const rows=c.read('lastBuildComparisonRows');assert.equal(rows.length,2);
 const bad=rows.find(r=>r.name==='attack'),good=rows.find(r=>r.name==='control');
 assert.equal(bad.oneHitPipeline.status,'UNAVAILABLE');
 assert.match(bad.oneHitPipeline.reason,/装飾品がDBに見つかりません.*w0.*15/);
 for(const ch of ['normal','maximum'])assert.equal(good.oneHitPipeline.channels[ch].metrics.comboTotalDamage.status,'available');
 assert.deepEqual(c.state(),before);assert.equal(c.ui(),ui);assert.equal(c.stored(),stored);assert.deepEqual(c.alerts,[]);
 const prepare=()=>{c.w.document.getElementById('aiPrompt').value='Compare the saved builds';c.click('aiPrepare');return JSON.parse(c.w.document.getElementById('aiPayload').textContent).currentBuild.buildComparison;};
 let report=prepare();assert.equal(report.schemaVersion,3);assert.equal(report.baseline.name,'attack');assert.equal(report.baseline.damage,null);assert.match(report.baseline.reason,/w0.*15/);
 const badReport=report.results.find(r=>r.name==='attack'),goodReport=report.results.find(r=>r.name==='control');
 assert.equal(badReport.powerIndex,null);assert.equal(badReport.maxPowerIndex,null);assert.match(badReport.damageReason,/装飾品がDBに見つかりません.*w0.*15/);
 assert.equal(goodReport.powerIndex,good.oneHitPipeline.channels.normal.metrics.comboTotalDamage.value);
 assert.equal(goodReport.maxPowerIndex,good.oneHitPipeline.channels.maximum.metrics.comboTotalDamage.value);
 for(const r of report.results){assert.equal(r.relativePowerIndex,null);assert.equal(r.relativeMaximumPowerIndex,null);}
 const baseline=c.w.document.getElementById('comparisonBaseline');baseline.value=String(rows.findIndex(r=>r.name==='control'));baseline.dispatchEvent(new c.w.Event('change',{bubbles:true}));
 report=prepare();assert.equal(report.baseline.name,'control');assert.equal(report.results.find(r=>r.name==='control').relativePowerIndex,100);assert.equal(report.results.find(r=>r.name==='attack').relativePowerIndex,null);
 assert.match(report.results.find(r=>r.name==='attack').damageReason,/w0.*15/);
 assert.deepEqual(c.state(),before);assert.equal(c.stored(),stored);
});
for(const [label,value] of [['numeric',15],['numeric-string','15']])test('valid legacy '+label+' equipment identities still load and save',t=>{
 const c=setup(t),input=c.read('__base');input.weaponId=label==='numeric'?239:'239';input.armor.head=label==='numeric'?1:'1';input.decos={w0:value};c.store(input);
 const stored=c.stored();c.load('candidate');assert.deepEqual(c.alerts,[]);assert.equal(c.stored(),stored);
 assert.equal(c.read('selectedWeapon().id'),239);assert.equal(c.read('build.armor.head.id'),1);
 assert.equal(c.read('build.decos.w0'),value);assert.equal(c.read('calcState.stats.attackTrue'),165);
 for(const ch of ['normal','maximum'])assert.equal(c.read('calcState.realOneHit.channels.'+ch+'.metrics.comboTotalDamage.status'),'available');
 c.save('roundtrip');assert.equal(c.read('savedBuildMap().roundtrip.decos.w0'),value);
});
test('absent, null and empty decoration selections retain ordinary empty-slot behavior',t=>{
 const c=setup(t);for(const decos of [undefined,{}, {w0:null,w1:''}]){
  const input=c.read('__base');input.weaponId='239';if(decos!==undefined)input.decos=decos;else delete input.decos;c.store(input);c.load('candidate');
  assert.equal(c.read('selectedWeapon().id'),239);assert.equal(c.read('calcState.stats.attackTrue'),160);
 }assert.deepEqual(c.alerts,[]);
});
test('known decoration slot cleanup is not converted into an identity error',t=>{
 const c=setup(t),input=c.read('__base');input.weaponId='239';input.decos={w0:'263'};c.store(input);const stored=c.stored();c.load('candidate');
 assert.deepEqual(c.alerts,[]);assert.deepEqual(c.read('build.decos'),{});assert.equal(c.read('calcState.stats.attackTrue'),160);assert.equal(c.stored(),stored);
});
for(const [label,slot,id] of [['unknown real slot','w0','999999999'],['unknown absent slot','unused','999999999'],['zero','w0',0],['false','w0',false],['object','w0',{}]])test('unresolved '+label+' decoration identity is rejected without erasing its source',t=>{
 const c=setup(t),input=c.read('__base');input.weaponId='239';input.decos={[slot]:id};c.store(input);
 const before=c.state(),ui=c.ui(),stored=c.stored();c.load('candidate');
 assert.equal(c.alerts.length,1);assert.match(c.alerts[0],/装飾品がDBに見つかりません/);assert.ok(c.alerts[0].includes(slot));
 assert.deepEqual(c.state(),before);assert.equal(c.ui(),ui);assert.equal(c.stored(),stored);
});
for(const [label,mutate,missing] of [
 ['missing weapon',x=>{delete x.weaponId;},null],
 ['unknown weapon',x=>{x.weaponId='999999999';},null],
 ['removed weapon',x=>{x.weaponId='239';},'DB.weapons=DB.weapons.filter(w=>w.id!==239);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);'],
 ['removed armor',x=>{x.armor.head='1';},'DB.armor=DB.armor.filter(a=>a.id!==1);']
])test(label+' continues to reject before live mutation',t=>{
 const c=setup(t),input=c.read('__base');mutate(input);c.store(input);if(missing)c.ev(missing);
 const before=c.state(),ui=c.ui(),stored=c.stored();c.load('candidate');assert.equal(c.alerts.length,1);
 assert.deepEqual(c.state(),before);assert.equal(c.ui(),ui);assert.equal(c.stored(),stored);
});

for(const explicit of [false,true])test('source-valid Charge Master decoration roundtrips: '+(explicit?'explicit unreviewed route':'standard noncharged route'),t=>{
 const c=setup(t),input=c.read('__base');input.weaponId='701';input.weaponKind='lance';input.decos={w0:'14'};
 if(explicit)input.combo.moves=['canonical:LAN_MID_THRUST_I','canonical:LAN_MID_THRUST_II','canonical:LAN_MID_THRUST_III','canonical:LAN_TRIPLE_THRUST'].map(techniqueId=>({techniqueId}));
 c.store(input);const stored=c.stored();c.load('candidate');
 assert.deepEqual(c.alerts,[]);assert.equal(c.stored(),stored);assert.equal(c.read('build.decos.w0'),'14');
 assert.equal(c.read('calcState.total["チャージマスター"]'),1);
 const r=c.read('calcState.realOneHit');
 for(const ch of ['normal','maximum']) {
  const channel=r.channels[ch];assert.equal(channel.metrics.comboTotalDamage.status,'available');
  const d=channel.diagnostics;
  if(!explicit){assert.equal(d.chargeMasterApplicability?.reason,'STANDARD_NONCHARGED_BODY_CM_NOT_APPLICABLE');assert.equal(d.ignoredSkillEffects?.some(x=>x.skillId===24)??false,false);}
  else if(ch==='maximum'){assert.equal(d.chargeMasterApplicability,undefined);assert.equal(d.ignoredSkillEffects?.find(x=>x.skillId===24)?.reason,'UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING');}
 }
 c.save('roundtrip');assert.equal(c.read('savedBuildMap().roundtrip.decos.w0'),'14');
});
