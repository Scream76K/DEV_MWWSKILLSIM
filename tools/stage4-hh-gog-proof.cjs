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
 w.eval(`App.state.combo.moves=[];restoreComboRows();for(const id of ['HH_SELF_IMPROVEMENT_PERFORMANCE','HH_ENCORE_JUST','HH_LEFT_SWING'])addCombo('canonical:'+id);monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';restoreHHStoredState({model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['ATTACK_SMALL'],echoBubbles:1,selfImprovementLevel:2,attackMelody:'ATTACK_SMALL',attackMelodyLevel:0});App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,hits:TechniqueDBEngine.get('hunting-horn',id).hits.map(h=>({mv:h.mv,elementModifier:h.elementModifier,damageType:h.damageType??null}))};})`);
 assert.deepEqual(selected.map(x=>x.id),['HH_SELF_IMPROVEMENT_PERFORMANCE','HH_ENCORE_JUST','HH_LEFT_SWING']);out.selected=selected;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:(()=>{try{return realPipelineWeapon(selectedWeapon())}catch(e){return {error:e.message}}})(),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 assert.equal(c.charm.status,'possible');assert.equal(c.weapon.specials[0].damage.display,380);assert.equal(c.artiaSource.element,380);assert.equal(c.result.channels.normal.execution.status,'complete');assert.equal(c.result.channels.maximum.execution.status,'complete');assert.ok(Math.abs(c.result.channels.normal.metrics.comboTotalDamage.value-879.94272512)<1e-8);
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){if(c.result.channels[ch].metrics.comboTotalDamage.status!=='available')continue;const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}
 const beforeLog=JSON.parse(fs.readFileSync('docs/reports/stage4-bow-representatives/hh178-before.json'));
 for(const key of ['components','metrics','execution','finalState'])assert.deepEqual(out.cases[0].result.channels.normal[key],beforeLog.cases[0].result.channels.normal[key]);
 for(const c of out.cases){
  const max=c.result.channels.maximum,body=max.components.find(x=>x.details?.appliedElement!==undefined);
  assert.ok(Math.abs(body.details.appliedElement-874)<1e-8);
  const refs=max.components.filter(x=>x.details?.trace);
  for(const x of refs){const n=c.result.channels.normal.components.find(y=>y.id===x.id);const normalElement=c.result.channels.normal.components.find(y=>y.details?.appliedElement!==undefined).details.appliedElement;assert.ok(Math.abs(x.details.element-n.details.element*874/normalElement)<1e-8);assert.equal(new Set(x.effectsApplied.map(e=>e.id)).size,x.effectsApplied.length);}
 }
 // Additional explicit model condition, not the source-video combo or a different equipment build.
 w.eval("restoreHHStoredState({model:'HH_NORMAL_MELODY_PROVISIONAL',melodies:['ATTACK_SMALL','ATTACK_SMALL'],echoBubbles:1,selfImprovementLevel:2,attackMelody:'ATTACK_SMALL',attackMelodyLevel:0});calcBuild();");
 out.twoMelodies=read('calcState.realOneHit');
 for(const channel of Object.values(out.twoMelodies.channels)){
  assert.equal(channel.execution.status,'complete');
  const fixed=channel.components.filter(x=>x.details?.trace?.some(t=>t.techniqueId==='HH_MELODY_COMPLETION_FIXED_10'));
  assert.equal(fixed.length,1);assert.equal(fixed[0].value,10);assert.equal(fixed[0].details.element,0);assert.equal(fixed[0].details.physical,0);assert.equal(fixed[0].effectsApplied.length,0);
 }
 out.twoMelodyConditions=read('compareStep5Snapshot()');
 // Same real gear, explicit maximum attribute-conversion OFF avoids cap masking.
 w.eval("powerAttributeConversionMaximum.value='OFF';calcBuild();");out.uncappedGog=read('calcState.realOneHit');
 // Synthetic resolved-plan control only: no equipment substitution, not another real build.
 w.eval("window.__originalGroupPlan=standardGroupPowerPlan;standardGroupPowerPlan=(...args)=>{const p=window.__originalGroupPlan(...args);return {...p,applied:p.applied.map(x=>x.skillId===178?{...x,elementMultiplier:1,elementAdd:0}:x)}};calcBuild();");out.syntheticNoGog=read('calcState.realOneHit');
 const on=out.uncappedGog.channels.maximum,off=out.syntheticNoGog.channels.maximum;
 assert.equal(on.execution.status,'complete');assert.equal(off.execution.status,'complete');assert.deepEqual(on.finalState,off.finalState);assert.deepEqual(on.execution,off.execution);
 const onBody=on.components.find(x=>x.details?.appliedElement!==undefined),offBody=off.components.find(x=>x.details?.appliedElement!==undefined);
 assert.ok(onBody.details.appliedElement<onBody.details.elementComponents.capLimit);
 assert.ok(Math.abs(onBody.details.appliedElement-(offBody.details.appliedElement+380*1.2*.2+20))<1e-8);
 for(const x of on.components){const y=off.components.find(c=>c.id===x.id);if(x.id.includes(':physical:'))assert.equal(x.value,y.value);if(x.details?.trace){assert.equal(x.details.physical,y.details.physical);assert.equal(x.details.fixed,y.details.fixed);assert.ok(Math.abs(x.details.element-y.details.element*onBody.details.appliedElement/offBody.details.appliedElement)<1e-8);}}
 w.eval('standardGroupPowerPlan=window.__originalGroupPlan');
 // Invalid model reaches the same public calcBuild entry; only the input getter is injected.
 w.eval("window.__hhStoredGetter=comboHHStoredState;comboHHStoredState=()=>({...window.__hhStoredGetter(),model:'UNKNOWN'});calcBuild();");
 out.unknownModel=read('calcState.realOneHit');
 assert.ok(JSON.stringify(out.unknownModel).includes('HH_MODEL_UNKNOWN'));w.eval('comboHHStoredState=window.__hhStoredGetter');
 assert.deepEqual(errors,[]);out.preservation='passed';out.blocked=out.cases.some(c=>c.status.includes('未照合')||c.result.status==='UNAVAILABLE'||Object.values(c.result.channels||{}).some(ch=>ch.metrics.comboTotalDamage.status!=='available'));out.verdict=out.blocked?'BLOCKED: Hunting-horn numerical verification incomplete; persistence assertions do not mean firepower PASS':'Hunting-horn same-weapon saved copies verified; not two different equipment builds';if(out.blocked)process.exitCode=2;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
