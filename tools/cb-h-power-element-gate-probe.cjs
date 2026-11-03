const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const htmlOriginal=require('./dom-test-setup.cjs').readSimulatorHtml();
const hGate="if(officialPhialType!=='IMPACT'||chargeBladeState.phialType!=='IMPACT')return fail('REAL_SLICE:CB_H_IMPACT_ONLY');";
assert.equal(htmlOriginal.split(hGate).length,2,'H gate drift');
const htmlProbe=htmlOriginal.replace(hGate,'/* IN-MEMORY POWER ELEMENT PROBE ONLY; PRODUCT UNCHANGED */');
const dom=new JSDOM(htmlProbe,{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
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
 const baseline=read('comboCBStoredState()');

 const probes=[
  {name:'power_normal_two',hNormal:2,hEnhanced:0},
  {name:'power_enhanced_half_and_normal_half',hNormal:0.5,hEnhanced:0.5}
 ];
 for(const p of probes){
  w.__cbBase=baseline;w.eval('restoreComboCBState(window.__cbBase)');
  w.document.getElementById('comboCBHNormalPhials').value=String(p.hNormal);
  w.document.getElementById('comboCBHEnhancedPhials').value=String(p.hEnhanced);
  w.eval('App.combo.syncFromDOM();calcBuild()');
  const r=read("calcState.realOneHit");
  out.cases.push({name:p.name,realStatus:r?.status,reason:r?.reason,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{execution:r.channels?.[ch]?.execution,metric:r.channels?.[ch]?.metrics?.comboTotalDamage,h:r.routes?.H?.channels?.[ch]?.metrics?.comboTotalDamage,finalH:r.routes?.H?.channels?.[ch]?.finalState?.chargeBlade}]))});
 }
 assert.deepEqual(errors,[]);
 out.outcome='PROBE_ONLY_NOT_ADOPTED';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();}
