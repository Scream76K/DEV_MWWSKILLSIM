const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);



 const kind=w.document.getElementById('buildTemplateWeaponKind');
 kind.value='charge-blade';kind.dispatchEvent(new w.Event('change'));
 const select=w.document.getElementById('buildTemplateSelect');select.value='KOTATU_CB_01';select.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();


 const official=read("window.MHAirborneHitRule"),hRule=read("window.MHCBHRouteRule");
 assert.ok(official&&official.status,'Airborne source rule required');
 assert.equal(hRule.status,'OWNER_APPROVED_PROVISIONAL');
 assert.deepEqual(hRule.techniqueIds,['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST','CB_AED','CB_FOLLOWUP_AED'],'exact audited ground H IDs');
 const expected=[118,119,120,121];
 const summary=real=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{
  status:real?.channels?.[ch]?.execution?.status,
  total:real?.channels?.[ch]?.metrics?.comboTotalDamage?.value,
  reason:real?.channels?.[ch]?.execution?.reason??null
 }]));
 const components=real=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,Object.fromEntries(['R','H'].map(route=>[route,(real?.routes?.[route]?.channels?.[ch]?.components||[]).map(c=>({
  id:c.id,status:c.status,value:c.value,airborneEffects:(c.effectsApplied||[]).filter(e=>String(e.id||'').startsWith('airborne:')).map(e=>e.id)
 }))]))]));
 for(const id of expected){
  w.__measuredWeaponId=id;
  w.eval("window.__measuredCB=DB.weapons.find(x=>x.id===window.__measuredWeaponId&&x.kind==='charge-blade'&&x.phial==='element');if(!window.__measuredCB)throw Error('MHDB_POWER_CB_NOT_FOUND');App.build.setWeapon(window.__measuredCB);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__measuredCB.id+'>'+window.__measuredCB.name+'</option>';weapon.value=String(window.__measuredCB.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'POWER_ELEMENT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const sourceWeapon=w.__measuredCB;
  const skill=sourceWeapon.skills.filter(x=>Number(x.skill?.id)===86);
  assert.equal(skill.length,1,'exact innate Flying Swallow / Airborne skill '+id);
  assert.equal(skill[0].level,1,'level1 test '+id);
  const withSkill=read('calcState.realOneHit');
  const withSummary=summary(withSkill), withComponents=components(withSkill);
  // Counterfactual is not a new official weapon; it exists only within this test.
  const without={...sourceWeapon,skills:sourceWeapon.skills.filter(x=>Number(x.skill?.id)!==86)};
  w.__without86=without;
  w.eval("DB.weapons=DB.weapons.map(x=>x.id===window.__without86.id?window.__without86:x);rebuildWeaponIndex(DB.weapons);App.build.setWeapon(window.__without86);calcBuild();");
  const noSkill=read('calcState.realOneHit'),noSummary=summary(noSkill),noComponents=components(noSkill);
  for(const ch of ['normal','maximum']){
   assert.equal(withSummary[ch].status,'complete','with Airborne '+id+' '+ch+' '+withSummary[ch].reason);
   assert.equal(noSummary[ch].status,'complete','without Airborne '+id+' '+ch+' '+noSummary[ch].reason);
   assert.equal(withSummary[ch].total,noSummary[ch].total,'whole R+H unchanged, ground movements do not trigger Airborne '+id+' '+ch);
   for(const route of ['R','H']){
    assert.deepEqual(withComponents[ch][route],noComponents[ch][route],id+' '+ch+' '+route+' component exact invariance');
    for(const c of withComponents[ch][route])assert.deepEqual(c.airborneEffects,[],'no airborne applied to '+c.id);
   }
  }
  out.cases.push({id,name:sourceWeapon.name,withAirborne:withSummary,withoutAirborne:noSummary,source:'https://a-to-monhan.com/2025/04/16/wilds-hien/;https://kuroyonhon.com/mhwilds/memo/27.php'});
  w.eval("DB.weapons=DB.weapons.map(x=>x.id===window.__measuredCB.id?window.__measuredCB:x);rebuildWeaponIndex(DB.weapons);App.build.setWeapon(window.__measuredCB);");
 }
 assert.deepEqual(errors,[]);
 out.outcome='CB_H_POWER_AIRBORNE_GROUND_NONAPPLICATION_CANDIDATE_PASS';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{console.log(JSON.stringify({outcome:out.outcome,caseSummaries:out.cases,failure:out.failure,errors},null,2));dom.window.close();}
