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

 for(const saveName of ['KOTATU_CB_H_A','KOTATU_CB_H_B']){
 const id='KOTATU_CB_01'; // Identical real equipment saved twice: persistence probe, not two distinct builds.
 const kind=id==='KOTATU_CB_01'?'charge-blade':'bow';
 w.document.getElementById('buildTemplateWeaponKind').value=kind;w.document.getElementById('buildTemplateWeaponKind').dispatchEvent(new w.Event('change'));
 w.document.getElementById('buildTemplateSelect').value=id;w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));w.document.getElementById('loadBuildTemplate').click();
 w.eval(`App.state.combo.moves=[];restoreComboRows();window.__rPreset=comboData().presets.find(p=>p.id==='adopted:cb_aed_h');if(!window.__rPreset)throw Error('CB_H_PUBLIC_PRESET_MISSING:'+JSON.stringify(comboData().moves.filter(x=>x.id.startsWith('canonical:CB_')).map(x=>({id:x.id,numericOrigin:x.numericOrigin,blocked:x.calculationBlocked}))));comboPreset.value='adopted:cb_aed_h';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({shieldBoosted:true,axeBoosted:true,phialType:'IMPACT',enhancedPhial:false,previousAction:'AXE_NEUTRAL',mode:'AXE',swordBoosted:false,normalPhials:2,enhancedPhials:0});monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';powerBowStartShot.value='1';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='${process.env.CB_R_MAX_OFF==='1'?'OFF':'ON'}';App.combo.syncFromDOM();calcBuild();`);
 const selected=read(`App.state.combo.moves.map(x=>{const m=comboMove(x.techniqueId);const id=m.canonicalTechniqueId;return {uiId:x.techniqueId,id,hits:TechniqueDBEngine.get('charge-blade',id).hits.map(h=>({mv:h.mv,elementModifier:h.elementModifier,damageType:h.damageType??null}))};})`);
 assert.deepEqual(selected.map(x=>x.id),['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST','CB_AED','CB_FOLLOWUP_AED']);out.selected=selected;
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
 const capture=()=>read('calcState.realOneHit');
 const on=out.cases[0].result;
 if(process.env.CB_R_MAX_OFF!=='1'){
  w.eval("powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");out.offControl=capture();
  assert.deepEqual(on.channels.normal,out.offControl.channels.normal);
  for(const key of ['execution','finalState'])assert.deepEqual(on.channels.maximum[key],out.offControl.channels.maximum[key]);
  let elementCount=0,unchangedOther=0;
  for(const c of on.channels.maximum.components){const other=out.offControl.channels.maximum.components.find(x=>x.id===c.id);assert.ok(other);
   if(c.coefficientUnit==='ELEMENT_MODIFIER'){elementCount++;assert.ok(c.value>=other.value);assert.equal(c.details.elementComponents.normalFlat-other.details.elementComponents.normalFlat,180);assert.equal(c.effectsApplied.filter(e=>e.id==='attribute-conversion-element-add').length,1);}
   else {unchangedOther++;assert.equal(c.value,other.value);}
  }
  assert.ok(elementCount>0&&unchangedOther>0);out.componentContrast={elementCount,unchangedOther};
  assert.ok(on.channels.maximum.metrics.comboTotalDamage.value>out.offControl.channels.maximum.metrics.comboTotalDamage.value);
  w.eval("powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();");
 }

 for(const c of out.cases)for(const channel of Object.values(c.result.channels))assert.equal(channel.execution.status,'complete');
 for(const c of out.cases)for(const ch of ['normal','maximum']){assert.equal(c.result.channels[ch].finalState.chargeBlade.normalPhials,1);}
 w.eval("comboCBNormalPhials.value='0.5';App.combo.syncFromDOM();calcBuild();");out.insufficient=capture();out.testScope={maximumConversion:process.env.CB_R_MAX_OFF==='1'?'OFF_ALTERNATE_CONDITION':'ON_ORIGINAL_REPRESENTATIVE',notMixedBaseline:true};assert.ok(Object.values(out.insufficient.channels).every(x=>x.execution.status!=='complete'));
 out.boundaries=[];
 for(const [name,override] of [['missingMode',{mode:null}],['wrongMode',{mode:'SWORD'}],['unknownSword',{swordBoosted:null}],['swordBoosted',{swordBoosted:true}],['shieldOff',{shieldBoosted:false}],['powerElement',{phialType:'POWER_ELEMENT'}]]){
  w.__hState={shieldBoosted:true,axeBoosted:true,phialType:'IMPACT',enhancedPhial:false,previousAction:'AXE_NEUTRAL',mode:'AXE',swordBoosted:false,normalPhials:2,enhancedPhials:0,...override};
  w.eval('restoreComboCBState(window.__hState);App.combo.syncFromDOM();calcBuild();');const result=capture();out.boundaries.push({name,result});
  assert.ok(result.status==='UNAVAILABLE'||Object.values(result.channels||{}).some(x=>x.execution.status!=='complete'),name+' must stop');
 }
 for(const ch of ['normal','maximum']){
  const cs=on.channels[ch].components;
  const morph=cs.filter(x=>x.id.includes('CB_AXE_TO_SWORD_MORPH'));
  assert.equal(morph.length,2,'morph one physical + one element; no axe extra');
  const shield=cs.filter(x=>x.id.includes('CB_SHIELD_THRUST'));
  assert.equal(shield.length,5,'shield two physical + two element + one phial component');
 }
 assert.deepEqual(errors,[]);out.preservation='passed';out.blocked=out.cases.some(c=>c.charm.status!=='possible'||c.status.includes('未照合')||c.result.status==='UNAVAILABLE'||Object.values(c.result.channels||{}).some(x=>x.execution.status!=='complete'));out.verdict=out.blocked?'BLOCKED: Charge blade numerical verification incomplete; persistence assertions do not mean firepower PASS':'Charge blade same-weapon saved copies verified; not two different equipment builds';if(out.blocked)process.exitCode=2;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify(out,null,2));dom.window.close();}
