const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const originalHtml=require('./dom-test-setup.cjs').readSimulatorHtml();
const hGuard="if(chargeBladeState.enhancedPhial!==false||chargeBladeState.enhancedPhials!==0)return fail('REAL_SLICE:CB_H_NORMAL_PHIAL_ONLY');";
assert.equal(originalHtml.split(hGuard).length,2,'expected exactly one H-only gate in test HTML');
const probeHtml=originalHtml.replace(hGuard,"/* EXPERIMENTAL TEST ONLY: H enhanced-stock gate temporarily bypassed; no product changes */");
const dom=new JSDOM(probeHtml,{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
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
 const baseline=read('comboCBStoredState()');

 const cases=[
  {name:'normal_H_control',hNormal:2,hEnhanced:0},
  {name:'enhanced_half_H',hNormal:0.5,hEnhanced:0.5},
  {name:'enhanced_one_H',hNormal:1,hEnhanced:1},
  {name:'enhanced_two_H',hNormal:0,hEnhanced:2},
  {name:'cross_type_half_H',hNormal:0.5,hEnhanced:0.5}
 ];
 for(const item of cases){
  w.__cbBaseline=baseline;w.eval('restoreComboCBState(window.__cbBaseline)');
  w.document.getElementById('comboCBHNormalPhials').value=String(item.hNormal);
  w.document.getElementById('comboCBHEnhancedPhials').value=String(item.hEnhanced);
  w.eval('App.combo.syncFromDOM();calcBuild()');
  const x=read('calcState.realOneHit');
  out.cases.push({name:item.name,normalPhials:item.hNormal,enhancedPhials:item.hEnhanced,status:x?.status,reason:x?.reason,channels:Object.fromEntries(['normal','maximum'].map(ch=>{const y=x?.channels?.[ch];return [ch,{execution:y?.execution,metric:y?.metrics?.comboTotalDamage,reason:y?.execution?.reason??y?.metrics?.comboTotalDamage?.reason??x?.reason,phialComponents:x?.routes?.H?.channels?.[ch]?.components?.filter(z=>/phial/i.test(z.id??z.type??'')).map(z=>({id:z.id,damage:z.damage,value:z.value,consumedPhialKind:z.consumedPhialKind}))??[],finalState:x?.routes?.H?.channels?.[ch]?.finalState?.chargeBlade}]}))});
 }
 assert.deepEqual(errors,[]);
 out.outcome='PROBE_COMPLETED_NOT_ADOPTED';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,sourceGuardRemovedInMemoryOnly:true,sourceUrl:'https://kuroyonhon.com/mhwilds/memo/12.php',cases:out.cases,failure:out.failure,errors},null,2));
 dom.window.close();
}
