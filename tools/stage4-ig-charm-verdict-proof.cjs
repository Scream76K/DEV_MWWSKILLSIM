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

 for(const saveName of ['KOTATU_IG_01_A','KOTATU_IG_01_B']){
 const id='KOTATU_IG_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_IG_01'?'insect-glaive':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:IG_SWEEP');monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';comboIGExtract.value='NO_EXTRACT';comboIGKinsect.value='STOWED';App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,record:TechniqueDBEngine.get('insect-glaive',id)};})`);
 assert.deepEqual(selected.map(x=>x.id),['IG_SWEEP']);out.selected=selected;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:realPipelineWeapon(selectedWeapon()),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 assert.equal(c.result.status,'OK');assert.equal(c.charm.status,'unconfirmed');assert.equal(c.charm.label,'確認不能');assert.ok(w.document.getElementById('charmLegality').textContent.includes('確認不能')); // HP route only; charm remains unconfirmed.
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}
 // Isolated negative control: filter only Airborne at public Pipeline boundary; no equipment/save mutation.
 const adapter=w.MHWRealOneHitBrowserAdapter;
 w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent:a=>adapter.evaluateCurrent({...a,skills:a.skills.filter(x=>x[0]!=='飛燕')})};w.calcBuild();
 out.withoutAirborne=read('calcState.realOneHit');assert.equal(out.withoutAirborne.status,'OK');
 for(const ch of ['normal','maximum'])assert.deepEqual(out.withoutAirborne.channels[ch].metrics,out.before.result.channels[ch].metrics);
 w.MHWRealOneHitBrowserAdapter=adapter;w.calcBuild();assert.deepEqual(read('calcState.realOneHit'),out.before.result);
 out.controlNote='Airborne removal only at public adapter boundary is a synthetic negative control, not alternate real equipment';
 out.additional=[];
 for(const [technique,extract,kinsect,reason] of [['IG_SWEEP','','STOWED','REAL_SLICE:IG_REFERENCE_EXTRACT_STATE_REQUIRED'],['IG_SWEEP','NO_EXTRACT','DEPLOYED','REAL_SLICE:IG_REFERENCE_KINSECT_STOWED_REQUIRED']]){
  w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:${technique}');comboIGExtract.value='${extract}';comboIGKinsect.value='${kinsect}';App.combo.syncFromDOM();calcBuild();`);
  const r=read('calcState.realOneHit');out.additional.push({technique,extract,kinsect,result:r});if(reason)assert.equal(r.reason,reason);else assert.equal(r.status,'OK');
 }
 // Validator-only structural and registered-rule controls; not alternate real builds.
 const originalCharm=read('build.charmCustom');out.charmControls=[];
 for(const [name,change,status] of [
 ['registeredSlot',"build.charmCustom.slots=[2,0,0];",'possible'],
 ['invalidSlot',"build.charmCustom.slots=[3,3,3];",'invalid'],
 ['duplicateSkill',"build.charmCustom.skills=[build.charmCustom.skills[0],build.charmCustom.skills[0]];",'invalid']]){
  w.__originalCharm=originalCharm;w.eval('build.charmCustom=structuredClone(window.__originalCharm);'+change+'renderCharmLegality();');
  const verdict=read('validateCurrentCharm()');out.charmControls.push({name,verdict});assert.equal(verdict.status,status);
 }
 w.__originalCharm=originalCharm;w.eval('build.charmCustom=structuredClone(window.__originalCharm);renderCharmLegality();');
 assert.deepEqual(read('savedBuildMap()'),out.savedAfter);
 assert.deepEqual(errors,[]);out.preservation='passed';out.verdict='HP_REFERENCE_ROUTE_PASS; equipment charm remains UNCONFIRMED, not whole-build PASS; identical saved copies only';

}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
