const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
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

 for(const saveName of ['KOTATU_CB_MIX_A','KOTATU_CB_MIX_B']){
 const id='KOTATU_CB_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_CB_01'?'charge-blade':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();window.__rPreset=comboData().presets.find(p=>p.id==='adopted:cb_release_r');if(!window.__rPreset)throw Error('CB_R_PUBLIC_PRESET_MISSING:'+JSON.stringify(comboData().moves.filter(x=>x.id.startsWith('canonical:CB_')).map(x=>({id:x.id,numericOrigin:x.numericOrigin,blocked:x.calculationBlocked}))));comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({shieldBoosted:true,axeBoosted:true,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0});monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='${process.env.CB_R_MAX_OFF==='1'?'OFF':'ON'}';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';comboCBMode.value='AXE';comboCBSword.value='0';App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,hits:TechniqueDBEngine.get('charge-blade',id).hits.map(h=>({mv:h.mv,elementModifier:h.elementModifier,damageType:h.damageType??null}))};})`);
 assert.deepEqual(selected.map(x=>x.id),['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED']);out.selected=selected;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:(()=>{try{return realPipelineWeapon(selectedWeapon())}catch(e){return {error:e.message}}})(),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 out.weaponElement=c.weapon.specials?.[0]?.damage?.display;out.sourceElement=c.artiaSource;
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){if(c.result.channels[ch].metrics.comboTotalDamage.status!=='available')continue;const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}

 assert.ok(out.cases.every(c=>c.result.scope==='CB_INDEPENDENT_R_H_SUM'));

 const capture=()=>read('calcState.realOneHit');const original=out.cases[0].result;
 for(const [ch,expected] of [['normal',3586.0131],['maximum',4357.1291]]){
  const c=original.channels[ch];assert.equal(c.execution.status,'complete');assert.ok(Math.abs(c.metrics.comboTotalDamage.value-expected)<1e-8);
  assert.equal(c.metrics.comboTotalDamage.value,original.routes.R.channels[ch].metrics.comboTotalDamage.value+original.routes.H.channels[ch].metrics.comboTotalDamage.value);
  assert.equal(original.routes.R.channels[ch].finalState.chargeBlade.normalPhials,0);assert.equal(original.routes.H.channels[ch].finalState.chargeBlade.normalPhials,1);
 }
 out.oldAcceptedContrast={};
 for(const [route,file] of [['R','r-nearby.json'],['H','final.json']]){
  const old=JSON.parse(fs.readFileSync('docs/reports/stage4-bow-representatives/cb-h-connection/'+file)).cases[0].result;
  for(const ch of ['normal','maximum']){assert.deepEqual(original.routes[route].channels[ch].components,old.channels[ch].components);assert.equal(original.routes[route].channels[ch].metrics.comboTotalDamage.value,old.channels[ch].metrics.comboTotalDamage.value);}
  out.oldAcceptedContrast[route]='components and unrounded totals identical; evidence reused for expected values only; current mix route actually executed';
 }
 assert.ok(out.cases[0].summary.includes('R/H各1回の合計実ダメージ'));assert.ok(out.comparisonText.includes('独立開始'));assert.ok(w.document.querySelector('[data-comparison-metric="cb-mix-normal-total"]'));assert.equal(w.document.querySelector('[data-comparison-metric="dps"]'),null);
 out.boundaries=[];
 const base=read('comboCBStoredState()');
 for(const [name,change,failing] of [['H_missing',"comboCBHMode.value=''",'H'],['R_stock',"comboCBNormalPhials.value='1.5'",'R'],['H_stock',"comboCBHNormalPhials.value='0.5'",'H']]){
  w.__mixBase=base;w.eval('restoreComboCBState(window.__mixBase);'+change+';App.combo.syncFromDOM();calcBuild();');const result=capture();out.boundaries.push({name,result});
  for(const ch of ['normal','maximum']){assert.notEqual(result.channels[ch].metrics.comboTotalDamage.status,'available');assert.notEqual(result.channels[ch].execution.status,'complete');assert.ok(result.channels[ch].execution.reason.includes(failing+':'));assert.equal(result.routes[failing==='R'?'H':'R'].channels[ch].execution.status,'complete');}
 }
 w.__mixBase=base;w.eval("restoreComboCBState(window.__mixBase);powerAttributeConversionMaximum.value='';App.combo.syncFromDOM();calcBuild();");out.maximumUnknown=capture();
 assert.deepEqual(out.maximumUnknown.channels.normal,original.channels.normal);assert.notEqual(out.maximumUnknown.channels.maximum.metrics.comboTotalDamage.status,'available');
 // Load saved values after deliberately changing both route and skill conditions.
 w.document.querySelector('[data-build-load="'+out.cases[0].id+'"]').click();w.calcBuild();out.restored=capture();assert.deepEqual(out.restored,original);
 // Same shared H stock applied to both saved records; their stored 2 remains untouched.
 w.eval("comboCBHNormalPhials.value='1';App.combo.syncFromDOM();calcBuild();document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.shared=read('({rows:lastBuildComparisonRows.map(x=>x.oneHitPipeline),state:comboCBStoredState(),saved:savedBuildMap(),result:calcState.realOneHit})');
 assert.equal(out.shared.state.mixH.normalPhials,1);assert.deepEqual(out.shared.saved,out.savedBefore);
 for(const row of out.shared.rows){assert.deepEqual(row.channels,out.shared.result.channels);for(const ch of ['normal','maximum'])assert.equal(row.routes.H.channels[ch].finalState.chargeBlade.normalPhials,0);}
 // Adapter boundary probe: capture the real public calcBuild input; only IDs are varied.
 w.eval("window.__cbOriginalAdapter=MHWRealOneHitBrowserAdapter;window.MHWRealOneHitBrowserAdapter={...window.__cbOriginalAdapter,evaluateCurrent(input){window.__cbActualInput=input;return window.__cbOriginalAdapter.evaluateCurrent(input)}};calcBuild();window.MHWRealOneHitBrowserAdapter=window.__cbOriginalAdapter;");
 out.idBoundaries=[];
 for(const [name,extra] of [['malformed','canonical:'],['unknown','CB_UNKNOWN_TECHNIQUE'],['valid',null]]){
  w.__cbExtraId=extra;const result=read("window.__cbOriginalAdapter.evaluateCurrent({...window.__cbActualInput,techniqueIds:[...window.__cbActualInput.techniqueIds,...(window.__cbExtraId?[window.__cbExtraId]:[])]})");out.idBoundaries.push({name,kind:'adapter input boundary injection after public input capture; not DOM selection',result});
  if(extra){assert.equal(result.status,'UNAVAILABLE',name);assert.equal(result.channels,undefined);if(name==='malformed')assert.ok(result.reason.startsWith('REAL_SLICE:TECHNIQUE_ID_UNRESOLVED:'));}
  else assert.deepEqual(result,out.shared.result);
 }
 w.eval('restoreComboCBState({});');out.oldSave=read('comboCBStoredState()');assert.equal(out.oldSave.mixMode,null);assert.equal(out.oldSave.mixH.mode,null);assert.equal(out.oldSave.mixH.normalPhials,null);
 assert.deepEqual(errors,[]);
 out.preservation='passed';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
