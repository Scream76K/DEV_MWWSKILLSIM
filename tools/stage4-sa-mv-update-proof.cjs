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

 for(const saveName of ['KOTATU_SA_01_A','KOTATU_SA_01_B']){
 const id='KOTATU_SA_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_SA_01'?'switch-axe':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();for(const id of CANONICAL_COMBO_PRESETS['switch-axe'].moves)addCombo(id);monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';comboSAMode.value='SWORD';comboSAAwakened.value='1';App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,hits:techniqueDbHits('switch-axe',id).map(h=>({mv:h.mv,elementModifier:h.elementModifier,damageType:h.damageType??null}))};})`);
 assert.deepEqual(selected.map(x=>x.id),['SA_SWORD_VERTICAL','SA_SWORD_RIGHT_RISING','SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH']);assert.deepEqual(selected.map(x=>x.hits.length),[1,1,2,1]);out.selected=selected;assert.deepEqual(selected.flatMap(x=>x.hits.map(h=>h.mv)),[40,58,40,60,40]);
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:realPipelineWeapon(selectedWeapon()),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 if(!c.status.includes('未照合') && c.result.reason!=='REAL_SLICE:ARTIA_COMPLETED_VALUES_UNRESOLVED')for(const ch of ['normal','maximum'])assert.equal(c.result.channels?.[ch]?.execution.status,'complete',JSON.stringify(c.result));
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}
 out.offControl=[];
 const oldOn=JSON.parse(fs.readFileSync('docs/reports/stage4-bow-representatives/sa-rising-awakened-after.json')).cases[0].result;
 const on=out.cases[0].result;
 w.eval("comboSAAwakened.value='0';App.combo.syncFromDOM();calcBuild();");out.off=read('calcState.realOneHit');
 for(const ch of ['normal','maximum']){
  assert.equal(out.off.channels[ch].metrics.comboTotalDamage.status,'available');
  const keep=c=>c.id.includes('element')||c.id.includes('followup');
  assert.deepEqual(on.channels[ch].components.filter(keep).map(c=>({id:c.id,value:c.value})),oldOn.channels[ch].components.filter(keep).map(c=>({id:c.id,value:c.value})));
 }
 out.boundaries=[];
 for(const [mode,awake,reason] of [['AXE','1','REAL_SLICE:STATE_REQUIREMENT_MISMATCH:mode'],['SWORD','','REAL_SLICE:SA_AWAKENED_STATE_UNRESOLVED']]){
 w.document.getElementById('comboSAMode').value=mode;w.document.getElementById('comboSAAwakened').value=awake;w.eval('App.combo.syncFromDOM();calcBuild();');const result=read('calcState.realOneHit');out.boundaries.push({mode,awake,result});assert.equal(result.reason,reason);
 }
 out.runtimeRecords=read(`Object.fromEntries(['SA_SWORD_VERTICAL','SA_SWORD_RIGHT_RISING','SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'].map(id=>[id,TechniqueDBEngine.get('switch-axe',id)]))`);assert.deepEqual(errors,[]);out.preservation='passed';out.blocked=out.cases.some(c=>c.status.includes('未照合')||c.result.status==='UNAVAILABLE');out.verdict=out.blocked?'BLOCKED: SA numerical verification incomplete; persistence assertions do not mean firepower PASS':'SA same-weapon saved copies verified; not two different equipment builds';if(out.blocked)process.exitCode=2;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
