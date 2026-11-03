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

 for(const saveName of ['KOTATU_LAN_01_A','KOTATU_LAN_01_B']){
 const id='KOTATU_LAN_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_LAN_01'?'lance':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LAN_COUNTER_DOUBLE_THRUST');comboLANCounter.value='CHARGE3_COUNTER_SUCCESS_ALL_HITS';comboLANCounter.dispatchEvent(new Event('change'));monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();`);
 w.eval(`window.__formulaCalls=[];window.__originalFormula=damageFromParams;damageFromParams=function(p){const r=window.__originalFormula(p);window.__formulaCalls.push({params:p,result:r});return r;};calcBuild();damageFromParams=window.__originalFormula;`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,hits:window.TechniqueDBEngine.get('lance',id).hits.map(h=>({mv:h.mv,elementModifier:h.elementModifier,damageType:h.damageType??null}))};})`);
 assert.deepEqual(selected.map(x=>x.id),['LAN_COUNTER_DOUBLE_THRUST']);assert.equal(selected.reduce((n,x)=>n+x.hits.length,0),2);out.selected=selected;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:(()=>{try{return realPipelineWeapon(selectedWeapon())}catch(e){return {error:e.message}}})(),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.formulaCalls=read('window.__formulaCalls');c.id=saveName;c.templateId=id;out.cases.push(c);
 assert.equal(c.charm.status,'possible');assert.equal(c.weapon.specials[0].damage.display,350);assert.equal(c.artiaSource.element,350);if(!c.status.includes('未照合') && c.result.reason!=='REAL_SLICE:ARTIA_COMPLETED_VALUES_UNRESOLVED')for(const ch of ['normal','maximum'])assert.equal(c.result.channels?.[ch]?.execution.status,'complete',JSON.stringify(c.result));
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){const value=c.result.channels[ch].metrics.comboTotalDamage.value;assert.ok(c.summary.includes(value.toFixed(1)));assert.ok(out.comparisonText.includes(value.toFixed(1)));}}

 out.counterChecks=[];
 for(const c of out.cases){
  for(const ch of ['normal','maximum']){
   const parts=c.result.channels[ch].components;assert.equal(parts.length,4);
   for(const [i,mv] of [33,50].entries()){
    const physical=parts.find(x=>x.id.endsWith(':physical:'+i)),element=parts.find(x=>x.id.endsWith(':element:'+i));
    assert.equal(physical.effectsApplied.filter(x=>x.id==='lance-charge3-counter:'+i).length,1);
    assert.equal(element.effectsApplied.filter(x=>x.id.startsWith('lance-charge3-counter:')).length,0);
    const calls=c.formulaCalls.filter(x=>Math.abs(x.params.mv-mv*1.7)<1e-9&&x.params.element===0);
    assert.ok(calls.some(x=>x.result.p===physical.value));
    const call=calls.find(x=>x.result.p===physical.value);
    const raw=call.params.attack*(mv/100)*call.params.sharp*(call.params.hz/100)*call.result.critMultiplier;
    const expected=Math.round(raw*1.7*100)/100;assert.equal(physical.value,expected);
    out.counterChecks.push({save:c.id,channel:ch,hit:i,formulaInput:call.params,rawPhysicalWithoutCounter:raw,expected,actual:physical.value,element:element.value});
   }
  }
 }
 // Synthetic no-factor DB control, same equipment/conditions. Not an adopted failure branch.
 w.eval(`window.__realTechDb=window.TechniqueDBEngine;window.TechniqueDBEngine={...window.__realTechDb,get:(kind,id)=>{const r=window.__realTechDb.get(kind,id);return id==='LAN_COUNTER_DOUBLE_THRUST'?{...r,counterReference:{...r.counterReference,physicalMultiplier:1}}:r;}};calcBuild();`);
 out.noFactorControl=read('calcState.realOneHit');
 for(const ch of ['normal','maximum']){const active=out.before.result.channels[ch],base=out.noFactorControl.channels[ch];assert.equal(base.execution.status,'complete');assert.deepEqual(base.components.filter(x=>x.id.includes(':element:')).map(x=>x.value),active.components.filter(x=>x.id.includes(':element:')).map(x=>x.value));}
 w.eval('window.TechniqueDBEngine=window.__realTechDb;calcBuild();');
 out.negative=[];
 for(const value of ['', 'CHARGE2_COUNTER_SUCCESS_ALL_HITS','CHARGE3_COUNTER_FAILED']){
  w.__bad=value;w.eval(`const sel=$('comboLANCounter');if(window.__bad){const op=document.createElement('option');op.value=window.__bad;sel.append(op);}sel.value=window.__bad;sel.dispatchEvent(new Event('change'));calcBuild();`);
  const result=read('calcState.realOneHit');out.negative.push({value,result});assert.equal(result.reason,'REAL_SLICE:LANCE_COUNTER_EXPLICIT_CHARGE3_SUCCESS_REQUIRED');assert.ok(!result.channels);
 }
 w.eval(`restoreComboLANState({counter:'CHARGE3_COUNTER_SUCCESS_ALL_HITS'});addCombo('canonical:LAN_COUNTER_DOUBLE_THRUST');App.combo.syncFromDOM();calcBuild();`);
 out.repeated=read('calcState.realOneHit');assert.equal(out.repeated.reason,'REAL_SLICE:LANCE_COUNTER_SINGLE_ACTION_REQUIRED');
 w.eval(`App.state.combo.moves=[];restoreComboRows();for(const id of CANONICAL_COMBO_PRESETS.lance.moves)addCombo(id);restoreComboLANState(null);App.combo.syncFromDOM();calcBuild();`);
 out.standardRegression=read('calcState.realOneHit');for(const ch of ['normal','maximum'])assert.equal(out.standardRegression.channels[ch].execution.status,'complete');
 assert.deepEqual(read('savedBuildMap()'),out.savedBefore);
 assert.deepEqual(errors,[]);out.preservation='passed';out.blocked=out.cases.some(c=>c.status.includes('未照合')||c.result.status==='UNAVAILABLE');out.verdict=out.blocked?'BLOCKED: Lance numerical verification incomplete; persistence assertions do not mean firepower PASS':'Lance same-weapon saved copies verified; not two different equipment builds';if(out.blocked)process.exitCode=2;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
