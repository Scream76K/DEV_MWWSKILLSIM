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
 const prefixRule=read("window.MHCBHRouteRule");
 assert.equal(prefixRule.status,'OWNER_APPROVED_PROVISIONAL','existing H route remains provisional');
 assert.equal(prefixRule.prefixConsumption,0,'shield/morph prefix consumes no stock in current candidate');
 assert.deepEqual(prefixRule.prefixIds,['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST'],'exact zero-cost H prefix IDs');
 const shieldRecord=read("window.TechniqueDBEngine.get('charge-blade','CB_SHIELD_THRUST')");
 assert.ok(shieldRecord,'sourced shield thrust technique must exist');
 assert.ok(Array.isArray(shieldRecord.evidenceRefs)&&shieldRecord.evidenceRefs.length>0,'shield thrust evidence refs');
 const baseline=read('comboCBStoredState()');

 const probes=[
  {name:'power_normal_two',hNormal:2,hEnhanced:0},
  {name:'power_enhanced_half_and_normal_half',hNormal:0.5,hEnhanced:0.5}
 ];
 for(const p of probes){
  w.__cbBase=baseline;w.eval('restoreComboCBState(window.__cbBase)');
  w.document.getElementById('comboCBHNormalPhials').value=String(p.hNormal);
  w.document.getElementById('comboCBHEnhancedPhials').value=String(p.hEnhanced);
  w.document.getElementById('comboCBMode').value='AXE';w.eval('App.combo.syncFromDOM();calcBuild()');
  const r=read("calcState.realOneHit");
  const hDetail=Object.fromEntries(['normal','maximum'].map(ch=>[ch,(r.routes?.H?.channels?.[ch]?.components||[]).filter(c=>String(c.id||'').includes(':phial:')).map(c=>({id:c.id,kind:c.kind,value:c.value,unit:c.unit,source:c.source,parameters:c.parameters,formula:c.formula,trace:c.trace}))]));
  out.componentAudit=out.componentAudit||[];
  const hComponents=Object.fromEntries(['normal','maximum'].map(ch=>[ch,(r.routes?.H?.channels?.[ch]?.components||[])]));
  const shieldHitCounts=Object.fromEntries(['normal','maximum'].map(ch=>[ch,{
    physical:hComponents[ch].filter(c=>String(c.id||'').startsWith('CB_SHIELD_THRUST:physical:')).length,
    element:hComponents[ch].filter(c=>String(c.id||'').startsWith('CB_SHIELD_THRUST:element:')).length,
    phial:hComponents[ch].filter(c=>String(c.id||'').startsWith('CB_SHIELD_THRUST:phial:')).length
  }]));
  const hResourceContracts=Object.fromEntries(['normal','maximum'].map(ch=>[ch,r.routes?.H?.channels?.[ch]?.diagnostics?.resourceContracts]));
  out.componentAudit.push({name:p.name,h:hDetail,shieldHitCounts,hResourceContracts});
  out.cases.push({name:p.name,realStatus:r?.status,reason:r?.reason,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{execution:r.channels?.[ch]?.execution,metric:r.channels?.[ch]?.metrics?.comboTotalDamage,h:r.routes?.H?.channels?.[ch]?.metrics?.comboTotalDamage,finalH:r.routes?.H?.channels?.[ch]?.finalState?.chargeBlade}]))});
 }
 const expected={
  power_normal_two:1940.8619999999992,
  power_enhanced_half_and_normal_half:1977.365999999999
 };
 for(const c of out.cases){
  for(const ch of ['normal','maximum']){
   assert.equal(c.channels[ch].execution?.status,'complete',c.name+' '+ch+' '+c.channels[ch].execution?.reason);
   assert.equal(c.channels[ch].metric?.status,'available',c.name+' '+ch);
   assert.ok(Math.abs(c.channels[ch].metric.value-expected[c.name])<1e-7,c.name+' '+ch+' mismatched damage');
   assert.ok(Number.isFinite(c.channels[ch].h?.value),c.name+' '+ch+' H absent');
   assert.equal(c.channels[ch].finalH?.enhancedPhials,0);
   assert.equal(c.channels[ch].finalH?.normalPhials,c.name==='power_normal_two'?1:0);
  }
 }
 // Independent phial-only arithmetic uses the MHDB displayed water value 260, shield 1.3,
 // target water hitzone 0.3 and the existing sourced phial coefficients. The reference
 // count is an adopted H-candidate input, not independently game-verified here.
 const element=260/10, shield=1.3, waterHZ=0.3;
 const componentExpected={
  power_normal_two:{
   'CB_SHIELD_THRUST:phial:0':element*1.5*shield*waterHZ,
   'CB_AED:phial:0':element*4.2*shield*waterHZ*2,
   'CB_FOLLOWUP_AED:phial:0':element*4.2*shield*waterHZ*3
  },
  power_enhanced_half_and_normal_half:{
   'CB_SHIELD_THRUST:phial:0':element*1.5*shield*waterHZ,
   'CB_AED:phial:0':element*6*shield*waterHZ*2,
   'CB_FOLLOWUP_AED:phial:0':element*4.2*shield*waterHZ*3
  }
 };
 for(const item of out.componentAudit){
  for(const ch of ['normal','maximum']){
   const rows=item.h[ch];
   // Candidate contract only: the source confirms the shield-boosted phial event
   // and 1.5 coefficient; the exact one-explosion H composition still needs
   // independent in-game confirmation and OWNER acceptance.
   const eventResources=item.hResourceContracts[ch];
   assert.ok(eventResources,'per-event H resource plan required '+item.name+' '+ch);
   const prefix=['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST'];
   const discharge=['CB_AED','CB_FOLLOWUP_AED'];
   assert.deepEqual(Object.keys(eventResources),[...prefix,...discharge],'exact ordered four H event resources '+item.name+' '+ch);
   for(const id of prefix){
    const plan=eventResources[id];
    assert.equal(plan.techniqueId,id,'prefix event identity '+id);
    assert.equal(plan.id,'CB_H_PREFIX_RESOURCE','prefix contract kind '+id);
    assert.equal(plan.consumeNormalPhials,0,'zero-cost H prefix '+id);
    assert.equal(plan.resourceKey,'normalPhials','zero-cost prefix resource label '+id);
    assert.equal(plan.status,id==='CB_SHIELD_THRUST'?'OWNER_APPROVED':'OWNER_APPROVED_PROVISIONAL','specific shield-thrust owner decision '+id);
    if(id==='CB_SHIELD_THRUST'){
     assert.equal(plan.ownerDecision?.status,'OWNER_APPROVED','owner-confirmed strong H shield 1Hit and 0 cost');
     assert.equal(plan.ownerDecision?.phialExplosionHits,1);
     assert.equal(plan.ownerDecision?.consumedPhials,0);
     assert.equal(plan.ownerDecision?.decisionDate,'2026-11-04');
     assert.equal(plan.ownerDecision?.verificationStatus,'OWNER_SPEC_CONFIRMED_GAME_MEASUREMENT_NOT_CLAIMED');
    }
    assert.ok(plan.source,'H prefix provenance '+id);
   }
   for(const id of discharge){
    const plan=eventResources[id];
    assert.equal(plan.techniqueId,id,'discharge event identity '+id);
    assert.equal(plan.consumeNormalPhials,0.5,'axe-boosted H half-phial cost '+id);
    assert.ok(['normalPhials','enhancedPhials'].includes(plan.resourceKey),'H discharge stock kind '+id);
    assert.ok(plan.source,'discharge source '+id);
   }
   assert.equal(eventResources.CB_AED.resourceKey,item.name==='power_normal_two'?'normalPhials':'enhancedPhials','enhanced priority first on AED');
   assert.equal(eventResources.CB_FOLLOWUP_AED.resourceKey,'normalPhials','followup uses remaining normal stock');
   assert.equal(item.shieldHitCounts[ch].physical,2,'shield thrust two body hits '+item.name+' '+ch);
   assert.equal(item.shieldHitCounts[ch].element,2,'shield thrust two elemental body hits '+item.name+' '+ch);
   assert.equal(item.shieldHitCounts[ch].phial,1,'shield thrust candidate one phial explosion '+item.name+' '+ch);
   assert.equal(rows.length,3,item.name+' '+ch+' component count');
   for(const c of rows){
    assert.ok(Object.hasOwn(componentExpected[item.name],c.id),'unexpected '+c.id);
    assert.ok(Math.abs(c.value-componentExpected[item.name][c.id])<1e-9,item.name+' '+ch+' '+c.id+' expected '+componentExpected[item.name][c.id]+' got '+c.value);
    assert.ok(c.source,'missing provenance '+c.id);
   }
  }
 }
 assert.deepEqual(errors,[]);
 out.outcome='PROBE_ONLY_NOT_ADOPTED';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{console.log(JSON.stringify({outcome:out.outcome,shieldPrefix:{prefixConsumption:out.prefixConsumption??null},cases:out.cases,componentAudit:out.componentAudit,failure:out.failure,errors},null,2));dom.window.close();}
