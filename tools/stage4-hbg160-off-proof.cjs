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

 for(const saveName of ['KOTATU_HBG_01_A','KOTATU_HBG_01_B']){
 const id='KOTATU_HBG_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_HBG_01'?'heavy-bowgun':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:HBG_ELEMENT_FIRST_HIT_REFERENCE');monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';powerHbgElementType.value='fire';powerHbgAmmoLevel.value='1';powerHbgContactPolicy.value='EXPLICIT_CONTACTS';powerHbgContactCount.value='3';powerHbgRange.value='CRITICAL';powerHbgNormalMode.value='0';powerHbgCapacity.value='2';powerHbgShotOrdinal.value='1';powerHbgFullMagazine.value='YES';powerAmmoBladescaleNormal.value='OFF';powerAmmoBladescaleMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,record:TechniqueDBEngine.get('heavy-bowgun',id)};})`);
 assert.deepEqual(selected.map(x=>x.id),['HBG_ELEMENT_FIRST_HIT_REFERENCE']);out.selected=selected;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:realPipelineWeapon(selectedWeapon()),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 if(out.cases.length===1){
 out.boundaries=[];
 const normalValue=c.result.channels.normal.metrics.comboTotalDamage.value;
 for(const [n,m] of [['OFF','ON'],['ON','OFF'],['','OFF'],['OFF','']]){
 w.eval(`powerAmmoBladescaleNormal.value='${n}';powerAmmoBladescaleMaximum.value='${m}';App.combo.syncFromDOM();calcBuild();`);
 const r=read('calcState.realOneHit');out.boundaries.push({normal:n,maximum:m,result:r});
 for(const [ch,v] of [['normal',n],['maximum',m]])assert.equal(r.channels[ch].metrics.comboTotalDamage.status,v==='OFF'?'available':'unavailable');
 if(n==='OFF')assert.equal(r.channels.normal.metrics.comboTotalDamage.value,normalValue);
 }
 // Unknown saved state is not coerced to OFF; legacy missing value stays unselected.
 for(const saved of [{normal:'OFF',maximum:'UNKNOWN'},null]){
 w.__savedBlade=saved;w.eval('restoreExplicitAffinityState({ammoBladescaleState:window.__savedBlade});App.combo.syncFromDOM();calcBuild();');
 const r=read('({state:compareStep5Snapshot().ammoBladescaleState,result:calcState.realOneHit})');out.boundaries.push({savedUnknown:saved,...r});assert.deepEqual(r.state,{normal:null,maximum:null});
 for(const ch of ['normal','maximum'])assert.equal(r.result.channels[ch].metrics.comboTotalDamage.status,'unavailable');
 }
 w.eval("powerAmmoBladescaleNormal.value='OFF';powerAmmoBladescaleMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
 assert.deepEqual(read('calcState.realOneHit'),c.result);
 assert.equal(c.skills['刃鱗増装'],1);assert.ok(Math.abs(c.result.channels.normal.metrics.comboTotalDamage.value-89.35344)<1e-8);assert.ok(Math.abs(c.result.channels.maximum.metrics.comboTotalDamage.value-112.2421344)<1e-8);
 }
 assert.equal(c.charm.status,'possible');for(const ch of ['normal','maximum'])assert.equal(c.result.channels?.[ch]?.metrics.comboTotalDamage.status,'available',JSON.stringify(c.result));
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}
 // Shared comparison OFF/ON overrides saved OFF/OFF without mutating either save.
 w.eval("powerAmmoBladescaleMaximum.value='ON';App.combo.syncFromDOM();calcBuild();");
 out.sharedBefore=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.runBuildCompare();out.sharedRows=read('lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline}))');
 out.sharedAfter=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 assert.deepEqual(out.sharedBefore,out.sharedAfter);assert.deepEqual(read('savedBuildMap()'),out.savedBefore);assert.equal(out.sharedRows.length,2);
 for(const row of out.sharedRows){assert.equal(row.pipeline.channels.normal.metrics.comboTotalDamage.status,'available');assert.equal(row.pipeline.channels.maximum.metrics.comboTotalDamage.status,'unavailable');assert.deepEqual(row.pipeline.channels,out.sharedBefore.result.channels);}
 assert.deepEqual(errors,[]);out.preservation='passed';out.blocked=out.cases.some(c=>c.status.includes('未照合')||c.result.status==='UNAVAILABLE');out.verdict=out.blocked?'BLOCKED: HBG numerical verification incomplete; persistence assertions do not mean firepower PASS':'HBG same-weapon saved copies verified; not two different equipment builds';if(out.blocked)process.exitCode=2;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
