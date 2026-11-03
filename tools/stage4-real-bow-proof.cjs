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
 for(const id of ['KOTATU_BOW_01','SALADA_BOW_05']){
  w.document.getElementById('buildTemplateWeaponKind').value='bow';w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
  w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));
  w.document.getElementById('loadBuildTemplate').click();
  w.eval(`App.state.combo.moves=[];restoreComboRows();for(const id of ['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3'])addCombo('canonical:'+id);monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();`);
  const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='bow').builds.find(x=>x.id==='${id}'),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=id;out.cases.push(c);
  w.document.getElementById('buildName').value=id;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');
 out.loads=[];
 for(const id of ['KOTATU_BOW_01','SALADA_BOW_05']){w.document.querySelector('[data-build-load="'+id+'"]').click();w.calcBuild();out.loads.push({id,...read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})')});}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval(`document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();`);
 out.comparison=read('lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline}))');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');
 assert.deepEqual(out.savedBefore,out.savedAfter);assert.deepEqual(out.before,out.after);assert.equal(out.comparison.length,2);
 out.preservation='passed';
 const kotatu=out.cases.find(c=>c.id==='KOTATU_BOW_01'),salada=out.cases.find(c=>c.id==='SALADA_BOW_05');
 for(const ch of ['normal','maximum'])assert.equal(kotatu.result.channels[ch].metrics.comboTotalDamage.status,'available');
 for(const ch of ['normal','maximum']){assert.equal(salada.result.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(salada.result.channels[ch].execution.status,'complete');const value=salada.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(salada.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}
 for(const c of out.cases){const loaded=out.loads.find(x=>x.id===c.id),row=out.comparison.find(x=>x.name===c.id);assert.deepEqual(loaded.result,c.result);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);}
 assert.deepEqual(errors,[]);
 out.publicTotals='Both representative totals available; not full beta verification';
 const previous=JSON.parse(fs.readFileSync('docs/reports/stage4-bow-representatives/public-explicit-state.json'));
 assert.deepEqual(salada.result.channels,previous.cases.find(x=>x.id===salada.id).result.channels);
 w.document.querySelector('[data-build-load="KOTATU_BOW_01"]').click();
 w.eval("powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
 const off=read('calcState.realOneHit');out.conversionOff=off;
 for(const ch of ['normal','maximum']){const a=kotatu.result.channels[ch],b=off.channels[ch];assert.equal(a.components.length,b.components.length);for(let i=0;i<a.components.length;i++){assert.equal(a.components[i].details.physical,b.components[i].details.physical);assert.equal(a.components[i].details.trace.length,b.components[i].details.trace.length);const basis=a.components[i].details.elementBasis;assert.equal(a.components[i].details.effectiveDisplayedElement,Math.min(basis.uncapped,basis.capLimit));assert.equal(a.components[i].details.effectiveDisplayedElement-b.components[i].details.effectiveDisplayedElement,ch==='maximum'?180:0);}}
 out.boundaries=[];
 w.eval("powerAttributeConversionMaximum.value='';App.combo.syncFromDOM();calcBuild();");const missing=read('calcState.realOneHit');out.boundaries.push({name:'maximum unspecified',result:missing});assert.equal(missing.channels.normal.metrics.comboTotalDamage.status,'available');assert.notEqual(missing.channels.maximum.metrics.comboTotalDamage.status,'available');assert.ok(JSON.stringify(missing.channels.maximum).includes('ATTRIBUTE_CONVERSION_STATE_REQUIRED'));
 w.eval("powerAttributeConversionMaximum.value='ON';powerBowCoating.value='CLOSE_RANGE';App.combo.syncFromDOM();calcBuild();");const coating=read('calcState.realOneHit');out.boundaries.push({name:'non-adopted coating',result:coating});assert.equal(coating.reason,'REAL_SLICE:ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED');
 out.verdict='Two real representative builds plus limited ID152 boundaries verified in JSDOM; game and full beta unverified';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
