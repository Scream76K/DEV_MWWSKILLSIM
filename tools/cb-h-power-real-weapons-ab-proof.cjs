const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const htmlOriginal=require('./dom-test-setup.cjs').readSimulatorHtml();
// Candidate branch source is tested directly. No test-time gate bypass.
assert.ok(htmlOriginal.includes('CANDIDATE_NOT_ADOPTED: extend exact H route to sourced POWER_ELEMENT phials.'),'candidate H gate missing');
const htmlProbe=htmlOriginal;
const dom=new JSDOM(htmlProbe,{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.alert=()=>{throw Error('UNEXPECTED_ALERT_IN_AB_PROOF')};w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);


 const kind=w.document.getElementById('buildTemplateWeaponKind');
 kind.value='charge-blade';kind.dispatchEvent(new w.Event('change'));
 const sel=w.document.getElementById('buildTemplateSelect');sel.value='KOTATU_CB_01';sel.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();
 w.eval("App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({shieldBoosted:true,axeBoosted:true,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0});monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';comboCBMode.value='AXE';comboCBSword.value='0';App.combo.syncFromDOM();calcBuild();");
 const sourceFixture=JSON.parse(fs.readFileSync('docs/reports/r250-stage6/evidence/cb103-conditional-ab-fixture.json','utf8'));
 assert.equal(sourceFixture.weapon.id,103);
 w.__cbPowerWeapon=sourceFixture.weapon;
 w.eval("DB.weapons=[window.__cbPowerWeapon];rebuildWeaponIndex(DB.weapons);App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};weaponKind.value='charge-blade';weapon.innerHTML='<option value=103>CB103</option>';weapon.value='103';renderComboForWeapon();restoreComboCBState({shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'POWER_ELEMENT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});App.combo.syncFromDOM();calcBuild();");

 const source103=JSON.parse(fs.readFileSync('docs/reports/r250-stage6/evidence/cb103-conditional-ab-fixture.json','utf8')).weapon;
 const source104=pack.data.weapons.find(x=>x.id===104&&x.kind==='charge-blade'&&x.phial==='element');
 assert.ok(source104,'actual MHDB104 power-element weapon is required; do not synthesize or substitute');
 assert.equal(source103.phial,'element');
 assert.equal(source104.specials?.[0]?.element,'water');
 const sources=[source103,source104];
 w.__powerCandidates=sources;
 const names=['CB_POWER_H_WEAPON103','CB_POWER_H_WEAPON104'];
 for(let i=0;i<sources.length;i++){
  const weaponRecord=sources[i];
  w.__powerSelected=weaponRecord;
  w.eval("DB.weapons=window.__powerCandidates;rebuildWeaponIndex(DB.weapons);App.build.setWeapon(window.__powerSelected);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__powerSelected.id+'>'+window.__powerSelected.name+'</option>';weapon.value=String(window.__powerSelected.id);renderComboForWeapon();restoreComboCBState({shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'POWER_ELEMENT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:0.5,enhancedPhials:0.5}});comboCBMode.value='AXE';App.combo.syncFromDOM();calcBuild();");
  const result=read("({snapshot:buildSnapshot(),stats:calcState.stats,real:calcState.realOneHit,conditions:compareStep5Snapshot()})");
  result.name=names[i];result.weaponId=weaponRecord.id;out.cases.push(result);
  for(const ch of ['normal','maximum']){
   const c=result.real?.channels?.[ch];
   assert.equal(c?.execution?.status,'complete',names[i]+' '+ch+' '+(c?.execution?.reason||result.real?.reason));
   assert.equal(c?.metrics?.comboTotalDamage?.status,'available');
   assert.equal(c.metrics.comboTotalDamage.value,result.real.routes.R.channels[ch].metrics.comboTotalDamage.value+result.real.routes.H.channels[ch].metrics.comboTotalDamage.value);
   assert.equal(result.real.routes.H.channels[ch].finalState.chargeBlade.enhancedPhials,0);
  }
  w.document.getElementById('buildName').value=names[i];w.saveNamedBuild();
 }
 assert.notEqual(out.cases[0].weaponId,out.cases[1].weaponId);
 assert.notEqual(out.cases[0].real.channels.normal.metrics.comboTotalDamage.value,out.cases[1].real.channels.normal.metrics.comboTotalDamage.value,'real weapon change must alter damage');
 out.savedBefore=read('savedBuildMap()');
 for(const c of out.cases){
  const el=w.document.querySelector('[data-build-load="'+c.name+'"]');assert.ok(el,c.name+' load control');
  el.click();w.eval("calcBuild()");
  const loaded=read('({snapshot:buildSnapshot(),real:calcState.realOneHit})');
  assert.deepEqual(loaded.real.channels,c.real.channels,'individual restore '+c.name);
  assert.equal(read('selectedWeapon()?.id'),c.weaponId,'restored weapon identity '+c.name);
  // UI reconstruction creates three blank charm input rows and defaults weaponSlot=false.
  // Compare semantic equipped skills; keep all meaningful skill names/levels under assertion.
  const semanticSnapshot=snap=>{
   const {savedAt,...rest}=snap;
   rest.charmCustom={...rest.charmCustom,weaponSlot:Boolean(rest.charmCustom?.weaponSlot),
    skills:(rest.charmCustom?.skills||[]).filter(x=>String(x.name||'').trim()!=='')};
   return rest;
  };
  assert.deepEqual(semanticSnapshot(loaded.snapshot),semanticSnapshot(c.snapshot),'saved snapshot semantic restore '+c.name);
 }
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),real:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.rows=read("lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null");
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),real:calcState.realOneHit})');
 assert.deepEqual(out.before,out.after,'comparison current state unchanged');
 assert.deepEqual(read('savedBuildMap()'),out.savedBefore,'comparison saved data unchanged');
 assert.equal(out.rows?.length,2,'comparison two real weapons');
 for(const row of out.rows){
  const c=out.cases.find(z=>z.name===row.name);assert.ok(c,'unexpected comparison name '+row.name);
  for(const ch of ['normal','maximum']){
   const val=row.pipeline?.channels?.[ch]?.metrics?.comboTotalDamage;
   assert.equal(val?.status,'available','comparison '+row.name+' '+ch+' '+row.pipeline?.channels?.[ch]?.execution?.reason);
   assert.equal(val.value,c.real.channels[ch].metrics.comboTotalDamage.value,'comparison and independent calculation '+row.name+' '+ch);
  }
 }
 assert.deepEqual(errors,[]);
 out.outcome='PASS_PROVISIONAL_H_ONLY';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,sourceGateRemovedInMemoryOnly:false,builds:out.cases.map(c=>({name:c.name,weaponId:c.weaponId,attack:c.stats?.attackTrue,element:c.stats?.element,normal:c.real?.channels?.normal?.metrics?.comboTotalDamage,maximum:c.real?.channels?.maximum?.metrics?.comboTotalDamage,reason:c.real?.reason})),comparison:out.rows?.map(r=>({name:r.name,normal:r.pipeline?.channels?.normal?.metrics?.comboTotalDamage,maximum:r.pipeline?.channels?.maximum?.metrics?.comboTotalDamage})),failure:out.failure,errors},null,2));dom.window.close();
}
