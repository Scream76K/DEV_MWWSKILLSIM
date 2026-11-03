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

 for(const saveName of ['KOTATU_HH_01_A','KOTATU_HH_01_B']){
 const id='KOTATU_HH_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_HH_01'?'hunting-horn':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();if(!comboData().presets.some(p=>p.id==='adopted:hh_target_four'))throw Error('HH_TARGET_FOUR_PRESET_MISSING');window.__hhPresetBefore=comboHHStoredState();comboPreset.value='adopted:hh_target_four';comboPreset.dispatchEvent(new Event('change'));window.__hhPresetAfter=comboHHStoredState();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';restoreHHStoredState({model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['SELF_IMPROVEMENT'],echoBubbles:1,selfImprovementLevel:0,attackMelody:null,attackMelodyLevel:0});App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,hits:TechniqueDBEngine.get('hunting-horn',id).hits.map(h=>({mv:h.mv,elementModifier:h.elementModifier,damageType:h.damageType??null}))};})`);
 assert.deepEqual(selected.map(x=>x.id),['HH_LEFT_SWING','HH_FORWARD_ATTACK','HH_SELF_IMPROVEMENT_PERFORMANCE','HH_ENCORE_JUST']);out.selected=selected;assert.deepEqual(read('__hhPresetAfter'),read('__hhPresetBefore'));out.presetStateUnchanged=true;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:(()=>{try{return realPipelineWeapon(selectedWeapon())}catch(e){return {error:e.message}}})(),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 assert.equal(c.charm.status,'possible');assert.equal(c.weapon.specials[0].damage.display,380);assert.equal(c.artiaSource.element,380);assert.equal(c.result.channels.normal.execution.status,'complete');assert.equal(c.result.channels.maximum.execution.status,'complete');
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){if(c.result.channels[ch].metrics.comboTotalDamage.status!=='available')continue;const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}
 const original=out.cases[0].result;
 const traceCounts=channel=>{const counts={};for(const c of channel.components)for(const t of c.details?.trace||[])counts[t.techniqueId]=(counts[t.techniqueId]||0)+t.scenarioCount;return counts;};
 out.eventCounts={};
 for(const ch of ['normal','maximum']){
  const c=original.channels[ch];assert.equal(c.execution.status,'complete');assert.deepEqual(c.execution.expected,c.execution.executed);assert.equal(c.execution.executed.length,12);
  assert.equal(c.components.filter(x=>x.id.includes(':physical:')).length,5);assert.equal(c.components.filter(x=>x.id.includes(':element:')).length,5);
  out.eventCounts[ch]=traceCounts(c);assert.deepEqual(out.eventCounts[ch],{HH_ECHO_BUBBLE_FOLLOWUP:2,HH_PERFORMANCE_SHOCKWAVE:1,HH_ECHO_BUBBLE_MELODY_EVENT:2});
  assert.equal(c.finalState.huntingHorn.selfImprovementLevel,2);assert.equal(c.finalState.huntingHorn.attackMelodyLevel,0);
  assert.ok(Math.abs(c.metrics.comboTotalDamage.value-c.components.reduce((sum,x)=>sum+x.value,0))<1e-8);
 }
 // No echo: same body/sound/state, exactly the four explicit echo triggers removed.
 w.eval("comboHHBubbleCount.value='0';App.combo.syncFromDOM();calcBuild();");out.noEcho=read('calcState.realOneHit');
 for(const ch of ['normal','maximum']){
  const c=out.noEcho.channels[ch];assert.equal(c.execution.status,'complete');assert.deepEqual(c.finalState,original.channels[ch].finalState);assert.deepEqual(traceCounts(c),{HH_PERFORMANCE_SHOCKWAVE:1});
  for(const x of c.components)assert.deepEqual(x,original.channels[ch].components.find(y=>y.id===x.id));
 }
 // Two already-stocked self melodies is a distinct explicit scenario, not generated notes.
 w.eval("comboHHBubbleCount.value='1';comboHHMelodyCount.value='2';App.combo.syncFromDOM();calcBuild();");out.twoMelodies=read('calcState.realOneHit');
 for(const ch of ['normal','maximum']){
  const c=out.twoMelodies.channels[ch];assert.equal(c.execution.status,'complete');const fixed=c.components.filter(x=>x.details?.trace?.some(t=>t.techniqueId==='HH_MELODY_COMPLETION_FIXED_10'));
  assert.equal(fixed.length,1);assert.equal(fixed[0].value,10);assert.equal(fixed[0].details.physical,0);assert.equal(fixed[0].details.element,0);assert.deepEqual(fixed[0].effectsApplied,[]);
 }
 out.boundaries=[];
 for(const field of ['comboHHMelodyCount','comboHHBubbleCount','comboHHSelfLevel']){
  w.eval("restoreHHStoredState({model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['SELF_IMPROVEMENT'],echoBubbles:1,selfImprovementLevel:0});");w.document.getElementById(field).value='';w.eval('App.combo.syncFromDOM();calcBuild();');const result=read('calcState.realOneHit');out.boundaries.push({field,result});assert.ok(result.status==='UNAVAILABLE'||Object.values(result.channels||{}).every(c=>c.execution.status!=='complete'));
 }
 // Changed values must not replace saved state when loading; shared comparison still restores current state.
 w.document.querySelector('[data-build-load="'+out.cases[0].id+'"]').click();w.calcBuild();assert.deepEqual(read('calcState.realOneHit'),original);
 assert.deepEqual(read('savedBuildMap()'),out.savedBefore);
 assert.deepEqual(errors,[]);out.preservation='passed';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
