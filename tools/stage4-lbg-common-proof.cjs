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

 for(const saveName of ['KOTATU_LBG_01_A','KOTATU_LBG_01_B']){
 const id='KOTATU_LBG_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_LBG_01'?'light-bowgun':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();addCombo('canonical:LBG_NORMAL_RAPID_3');monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';restoreComboLBGState({shotMode:'RAPID',ammoType:'NORMAL',ammoLevel:3,range:'CRITICAL',normalModeLevel:0,contactPolicy:'ALL_FIVE',loadedRounds:6,rapidReady:true,normalPowder:'LEVEL_PLUS_ONE',specialMagazine:'EQUIPPED'});App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,record:TechniqueDBEngine.get('light-bowgun',id)};})`);
 assert.deepEqual(selected.map(x=>x.id),['LBG_NORMAL_RAPID_3']);out.selected=selected;
 const c=read(`({status:buildTemplateStatus.textContent,snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),skills:calcState.total,stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,charm:validateCurrentCharm(),template:window.__buildTemplateDB.templates.find(x=>x.weapon_type_id==='${kind}').builds.find(x=>x.id==='${id}'),weapon:realPipelineWeapon(selectedWeapon()),artiaSource:artiaSourceElement(selectedWeapon(),build.artia),slots:Object.fromEntries(Object.entries(build.armor).map(([k,v])=>[k,{id:v?.id,name:v?.name,slots:maxBreakSlots(v)}]))})`);c.id=saveName;c.templateId=id;out.cases.push(c);
 assert.equal(c.charm.status,'possible');for(const ch of ['normal','maximum'])assert.equal(c.result.channels[ch].metrics.comboTotalDamage.status,'available');
 w.document.getElementById('buildName').value=saveName;w.saveNamedBuild();
 }
 out.savedBefore=read('savedBuildMap()');out.loads=[];
 for(const c of out.cases){w.document.querySelector('[data-build-load="'+c.id+'"]').click();w.calcBuild();const r=read('({snapshot:buildSnapshot(),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.loads.push({id:c.id,...r});assert.deepEqual(r.result,c.result);}
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.comparison=read('lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null');out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit})');out.savedAfter=read('savedBuildMap()');assert.deepEqual(out.before,out.after);assert.deepEqual(out.savedBefore,out.savedAfter);assert.ok(Array.isArray(out.comparison),'Comparison unavailable: '+out.comparisonText);assert.equal(out.comparison.length,2);
 for(const row of out.comparison){const c=out.cases.find(c=>c.id===row.name);assert.deepEqual(row.pipeline.channels,c.result.channels);assert.equal(row.pipeline.reason,c.result.reason);if(!c.result.channels)continue;for(const ch of ['normal','maximum']){const metric=c.result.channels[ch].metrics.comboTotalDamage;assert.equal(metric.status,'available');}}

 out.boundaries=[];
 const originalAdapter=w.MHWRealOneHitBrowserAdapter;
 // Boundary-only explicit target injection at the public calcBuild adapter boundary; equipment remains unchanged.
 for(const [hz,wounded,add] of [[.44,false,0],[.45,false,30],[.45,true,50]]){
 w.MHWRealOneHitBrowserAdapter={...originalAdapter,evaluateCurrent(a){const target={...a.trainingRoom,parts:a.trainingRoom.parts.map(p=>({...p,multipliers:{...p.multipliers,pierce:hz},originalMultipliers:{...p.multipliers,pierce:hz},wounded}))};return originalAdapter.evaluateCurrent({...a,trainingRoom:target});}};
 w.calcBuild();const result=read('calcState.realOneHit');out.boundaries.push({hz,wounded,add,result});
 for(const ch of ['normal','maximum']){const c=result.channels[ch];assert.equal(c.components.length,5);assert.equal(c.finalState.lightBowgun.loadedRounds,5);for(const component of c.components){const t=component.details.trace[0];assert.equal(t.affinity,Math.min(100,2+(ch==='maximum'?45:0)+add));assert.equal(t.attack,ch==='maximum'?293.25:257.25);assert.equal(t.element,0);assert.equal(component.details.state.magazineCapacity,6);}}
 }
 w.MHWRealOneHitBrowserAdapter={...originalAdapter,evaluateCurrent(a){const stats={...a.stats,activeBonusEffects:a.stats.activeBonusEffects.map(e=>e.bonusSkillId===131?{...e,rankLevel:2}:e)};return originalAdapter.evaluateCurrent({...a,stats});}};
 w.calcBuild();out.badRank=read('calcState.realOneHit');assert.equal(out.badRank.reason,'LBG_RAPID:SKILL_COMBINATION_NOT_ADOPTED');
 w.MHWRealOneHitBrowserAdapter=originalAdapter;w.calcBuild();
 assert.deepEqual(errors,[]);out.preservation='passed';out.blocked=out.cases.some(c=>c.status.includes('未照合')||c.result.status==='UNAVAILABLE'||Object.values(c.result.channels||{}).some(x=>x.metrics.comboTotalDamage.status!=='available'));out.verdict=out.blocked?'BLOCKED: LBG numerical verification incomplete; persistence assertions do not mean firepower PASS':'LBG same-weapon saved copies verified; not two different equipment builds';if(out.blocked)process.exitCode=2;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
