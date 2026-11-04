const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const productionHtml=require('./dom-test-setup.cjs').readSimulatorHtml();
// Run the unchanged feature-branch production HTML; no test-time gate patch.
const dom=new JSDOM(productionHtml,{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);



 const kind=w.document.getElementById('buildTemplateWeaponKind');
 kind.value='charge-blade';kind.dispatchEvent(new w.Event('change'));
 const select=w.document.getElementById('buildTemplateSelect');select.value='KOTATU_CB_01';select.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();





 const weaponId=79;
 w.__scopeWeaponId=weaponId;
 w.eval("window.__scopeWeapon=DB.weapons.find(x=>x.id===window.__scopeWeaponId&&x.kind==='charge-blade');if(!window.__scopeWeapon)throw Error('SOURCE_CB_MISSING');App.build.setWeapon(window.__scopeWeapon);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__scopeWeapon.id+'>'+window.__scopeWeapon.name+'</option>';weapon.value=String(window.__scopeWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';");
 const baseline={mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}};
 const cases=[
   {name:'adopted-baseline',state:baseline,normal:'OFF',maximum:'ON',expected:'complete'},
   {name:'no-axe-boost',state:{...baseline,axeBoosted:false,normalPhials:5,mixH:{...baseline.mixH,normalPhials:5}},normal:'OFF',maximum:'ON',expected:'blocked'},
   {name:'no-shield-boost',state:{...baseline,shieldBoosted:false},normal:'OFF',maximum:'ON',expected:'blocked'},
   {name:'unknown-max-activation',state:baseline,normal:'OFF',maximum:'UNKNOWN',expected:'blocked'},
 ];
 const summarize=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{
   status:r?.channels?.[ch]?.execution?.status??'missing',
   reason:r?.channels?.[ch]?.execution?.reason??r?.channels?.[ch]?.metrics?.comboTotalDamage?.reason??null,
   value:r?.channels?.[ch]?.metrics?.comboTotalDamage?.value??null
 }]));
 for(const t of cases){
  w.__cb152ScopeState=t.state;w.__cb152ScopeNormal=t.normal;w.__cb152ScopeMaximum=t.maximum;
  w.eval("restoreComboCBState(window.__cb152ScopeState);comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value=String(window.__cb152ScopeState.mixH.normalPhials);comboCBHEnhancedPhials.value='0';powerAttributeConversionNormal.value=window.__cb152ScopeNormal;powerAttributeConversionMaximum.value=window.__cb152ScopeMaximum;App.combo.syncFromDOM();calcBuild();");
  const r=read("calcState.realOneHit");
  const summary=summarize(r);
  const row={name:t.name,summary};
  if(t.name!=='no-shield-boost')assert.equal(summary.normal.status,'complete','normal channel independent '+t.name+' '+summary.normal.reason);
  assert.equal(summary.maximum.status,t.expected,'maximum boundary '+t.name+' '+summary.maximum.reason);
  if(t.expected==='blocked')assert.ok(summary.maximum.reason&&summary.maximum.reason.length>0,'explicit reason on rejected candidate '+t.name);
  if(t.name==='adopted-baseline'){
   for(const route of ['R','H']){
    const result=r.routes?.[route]?.channels?.maximum;
    assert.equal(result?.diagnostics?.referenceScope,'CB_RH_NON_DRAGON_FLAT_NOT_APPLICABLE_FOLLOWUP_EXCLUDED','explicit non-dragon scope '+route);
    assert.equal(result?.metrics?.comboTotalDamage?.scope,'CB_RH_NON_DRAGON_FLAT_NOT_APPLICABLE_FOLLOWUP_EXCLUDED','explicit non-dragon metric scope '+route);
   }
  }
  if(t.name==='no-axe-boost')assert.match(summary.maximum.reason,/ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED/,'non-adopted CB state must not widen 152 flat scope');
  if(t.name==='unknown-max-activation')assert.match(summary.maximum.reason,/ATTRIBUTE_CONVERSION_STATE_REQUIRED/,'unknown activation must remain rejected');
  out.cases.push(row);
 }
 // A real power-element Charge Blade must not accidentally enter the
 // impact-phial-only non-dragon no-flat candidate. Keep the same equipped
 // Skill 152 source from the loaded template and the same public R/H route.
 w.__cb152PowerWeaponId=103;
 w.eval("window.__cb152PowerWeapon=DB.weapons.find(x=>x.id===window.__cb152PowerWeaponId&&x.kind==='charge-blade'&&x.phial==='element');if(!window.__cb152PowerWeapon)throw Error('MHDB_103_POWER_CB_MISSING');App.build.setWeapon(window.__cb152PowerWeapon);weaponKind.value='charge-blade';weapon.innerHTML='<option value=103>POWER_ELEMENT_CB103</option>';weapon.value='103';renderComboForWeapon();restoreComboCBState({...window.__cb152ScopeState,axeBoosted:true,shieldBoosted:true,phialType:'POWER_ELEMENT',normalPhials:2,enhancedPhials:0,mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();");
 const powerOn=read("calcState.realOneHit"),powerOnSummary=summarize(powerOn);
 assert.equal(powerOnSummary.normal.status,'complete','power-element CB normal independent of maximum 152');
 assert.equal(powerOnSummary.maximum.status,'blocked','power-element must not enter impact-only no-flat 152 scope');
 assert.match(powerOnSummary.maximum.reason,/ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED/,'power-element max ON remains explicit pending');
 w.eval("powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
 const powerOff=read("calcState.realOneHit"),powerOffSummary=summarize(powerOff);
 assert.equal(powerOffSummary.normal.status,'complete','power-element CB normal with 152 max OFF');
 assert.equal(powerOffSummary.maximum.status,'complete','power-element CB H remains available with max 152 OFF');
 assert.equal(powerOnSummary.normal.value,powerOffSummary.normal.value,'maximum 152 must not mutate normal power-element damage');
 out.cases.push({name:'real-power-element-103',maximum152On:powerOnSummary,maximum152Off:powerOffSummary});
 assert.deepEqual(errors,[]);
 out.outcome='CB_152_CANDIDATE_NEGATIVE_STATE_GUARDS_PASS';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();
}
