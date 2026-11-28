const assert=require('node:assert/strict'), path=require('node:path'), fs=require('node:fs'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'), {JSDOM,VirtualConsole}=require('jsdom'), cache='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
assert.equal(sha(cache),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
const pack=require(path.join(root,cache)), readHtml=require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml;
const test=require('node:test');
test('different saved Bow routes keep absolute damage without comparative ratios or duplicated trio',()=>{
const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
const w=new JSDOM(readHtml(),{url:'https://thousand-saved.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
try{
 const $=id=>w.document.getElementById(id), choose=(el,val)=>{el.value=val;assert.equal(el.value,val,el.id);el.dispatchEvent(new w.Event('change',{bubbles:true}));}, read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 const paste=s=>$('compareOut').querySelector(s)?.textContent;
 const cks=()=>[...w.document.querySelectorAll('#compareBuilds input[data-compare-name]')];
 const ids=['BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3','BOW_THOUSAND_DRAGONS'], tagged=ids.map(x=>'canonical:'+x);
 function moves(next) {
   w.eval('App.state.combo.moves=[];restoreComboRows();');const p=$('comboMovePicker');
   for(const x of next){choose(p,'canonical:'+x);$('addCombo').click();}
   assert.deepEqual(read('App.state.combo.moves').map(x=>x.techniqueId),next.map(x=>'canonical:'+x));
 }
 const keep=p=>({status:p?.status,reason:p?.reason,plan:p?.evaluationPlan?.selection,actualState:p?.evaluationPlan?.conditions?.bowState,channels:Object.fromEntries(['normal','maximum'].map(k=>{const c=p?.channels?.[k];return [k,{status:c?.metrics.comboTotalDamage?.status,reason:c?.metrics.comboTotalDamage?.reason||c?.execution?.reason,value:c?.metrics.comboTotalDamage?.value,components:c?.components&&Array.from(c.components,z=>({id:z.techniqueId,value:z.value,element:Array.from(z.details?.trace||[]).reduce((n,h)=>n+(h.element??h.e??0),0)}))}]}))});
 w.__archivedDB=w.JSON.parse(JSON.stringify(pack.data));w.eval('DB=normalizeDB(window.__archivedDB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();');
 const names=['KOTATU_BOW_01','SALADA_BOW_05','SINGLE'], positive={};
 for(const id of names){
  choose($('buildTemplateWeaponKind'),'bow');choose($('buildTemplateSelect'),id==='SINGLE'?'SALADA_BOW_05':id);$('loadBuildTemplate').click();
  assert.match($('buildTemplateStatus').textContent,/読み込み/);choose($('monster'),'training-room');choose($('monsterPart'),'training-front');
  moves(id==='SINGLE'?['BOW_THOUSAND_DRAGONS']:ids);choose($('powerBowCoating'),'NONE');choose($('powerBowRange'),'CRITICAL');choose($('powerBowStartShot'),'1');
  assert.equal(w.eval('calcState.stats.element'),372);assert.equal(w.eval('calcState.total["フォースショット"]'),1);
  $('calcUserComboDamage').click();assert.equal($('compareOut').dataset.resultMode,'current-custom');
  positive[id]={calc:keep(w.calcP0Damage('user').pipeline),total:paste('[data-custom-damage="total"]'),element:paste('[data-custom-damage="element"]'),used:paste('[data-used-combo]')};
  assert.ok(Object.values(positive[id].calc.channels).every(x=>x.status==='available'));
  $('buildName').value=id;assert.ok($('saveBuild'));$('saveBuild').click();assert.match($('buildSaveStatus').textContent,/保存しました/);
  const save=read('savedBuildMap()')[id];assert.deepEqual(save.combo.moves.map(x=>x.techniqueId),id==='SINGLE'?['canonical:BOW_THOUSAND_DRAGONS']:tagged);
  positive[id].chosen=read('compareStep5Snapshot().bowState');
  assert.deepEqual(save.target,{monsterId:'training-room',partId:'training-front'});
 }
 const prior=read('savedBuildMap()');
 for(const x of cks())x.checked=true;assert.equal(cks().length,3);
 function capture(){return read('lastBuildComparisonRows').map(row=>({name:row.name,kind:row.kind,upper:keep(row.oneHitPipeline),lower:{damage:row.referenceCombo?.damage,blocked:row.referenceCombo?.blocked},count:row.referenceCombo?.techniqueCount,comparedTarget:row.oneHitPipeline.evaluationPlan.target,openingValues:row.oneHitPipeline.evaluationPlan.bowOpening,opening:row.oneHitPipeline.evaluationPlan.automaticOpening}));}
 function compare(selected){
   for(const x of cks()){x.checked=selected.includes(x.dataset.compareName);x.dispatchEvent(new w.Event('change',{bubbles:true}));}
   const before=w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))'), data=w.eval('storageGet(BUILDS_KEY)'), conditions=w.eval('JSON.stringify(compareStep5Snapshot())');
   $('runCompare').click();
   assert.equal(w.eval('storageGet(BUILDS_KEY)'),data);
   assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))'),before);
   assert.equal(w.eval('JSON.stringify(compareStep5Snapshot())'),conditions);
   const r=capture();
   assert.deepEqual(r.map(x=>x.name).sort(),[...selected].sort());
   return r;
 }
 for(const liveCoating of ['NONE','PIERCE']) for(const pair of [[names[0],names[1]],[names[0],names[2]]]){
  choose($('powerBowCoating'),liveCoating);
  compare(pair);
  assert.equal($('powerBowCoating').value,liveCoating);
  for(const base of pair){
    const picker=$('comparisonBaseline');assert.ok(picker);
    choose(picker,String(pair.indexOf(base)));
    const cells=metric=>[...$('compareOut').querySelectorAll('[data-comparison-metric="'+metric+'"] td')].map(x=>({text:x.textContent.trim(),class:x.className}));
    const channels=Object.fromEntries(['power-index','max-power-index','power-index-change','max-power-index-change','relative-power-100','relative-max-power-100','consumer-relative-normal','reference-combo-damage','reference-combo-relative'].map(metric=>[metric,cells(metric)]));
    const mixed=pair.includes('SINGLE'), report=w.createBuildComparisonReport();
    assert.equal(report.baseline.name,base);
    if(mixed){
      const peer=pair.filter(n=>n!==base)[0], peerIndex=pair.indexOf(peer);
      assert.deepEqual(channels['power-index'].map(c=>c.text),['982.0','441.7']);
      assert.deepEqual(channels['max-power-index'].map(c=>c.text),['1228.7（+25.1%）','554.2（+25.5%）']);
      assert.match(paste('[data-used-combo]'),/KOTATU_BOW_01通常：剛射3 → 剛連射3 → 竜の千々矢.*SINGLE通常：竜の千々矢最大：竜の千々矢/);
      assert.deepEqual(channels['reference-combo-damage'].map(c=>c.text),['—','441.7']);
      assert.ok([...channels['power-index'],...channels['max-power-index']].every(c=>!c.class.includes('compare-best')));
      for(const metric of ['power-index-change','max-power-index-change','relative-power-100','relative-max-power-100','consumer-relative-normal'])assert.equal(channels[metric][peerIndex]?.text,'—',metric);
      const other=report.results[peerIndex];
      assert.equal(other.relativeReason,'REAL_SLICE:COMPARISON_TECHNIQUE_MISMATCH');
      assert.equal(other.relativePowerIndex,null);
      assert.equal(other.relativeMaximumPowerIndex,null);
      assert.equal(other.powerChange,null);
      assert.equal(other.legacyReference.relativePowerIndex,null);
      assert.equal(other.legacyReference.relativeMaximumPowerIndex,null);
      assert.equal(other.legacyReference.powerChange,null);
      assert.equal(other.legacyReference.referenceComboChange,null);
    }else{
      assert.deepEqual(channels['reference-combo-damage'],[]);
      assert.ok([...channels['power-index'],...channels['max-power-index']].some(c=>c.class.includes('compare-best')));
      assert.ok(report.results.every(row=>row.relativeReason===null&&Number.isFinite(row.relativePowerIndex)&&Number.isFinite(row.relativeMaximumPowerIndex)));
    }
  }
 }
 // The reverse arrangement must not silently bless an explicitly unsupported
 // saved coating just because the editor currently has NONE.
 choose($('powerBowCoating'),'PIERCE');
 $('buildName').value='COATED_SINGLE';$('saveBuild').click();
 assert.equal(read('savedBuildMap().COATED_SINGLE.combo.bowState.coating'),'PIERCE');
 choose($('powerBowCoating'),'NONE');
 const inverse=compare(['KOTATU_BOW_01','COATED_SINGLE']);
 const deniedRow=inverse.find(row=>row.name==='COATED_SINGLE');
 assert.equal(inverse.find(row=>row.name==='KOTATU_BOW_01').upper.channels.normal.value,positive.KOTATU_BOW_01.calc.channels.normal.value);
 assert.equal(deniedRow.upper.reason,'BOW_THOUSAND:STATE_NOT_ADOPTED');
 assert.equal(deniedRow.lower.damage,null);
 assert.equal(deniedRow.lower.blocked[0].reason,'BOW_THOUSAND:STATE_NOT_ADOPTED');
 const denied=w.createBuildComparisonReport().results.find(row=>row.name==='COATED_SINGLE');
 assert.equal(denied.power.normal,null);
 assert.equal(denied.power.maximum,null);
 assert.equal($('powerBowCoating').value,'NONE');
 // A historical saved row that predates explicit Bow fields follows the
 // normal opening defaults, and is still compared at the selected target.
 const legacy=JSON.parse(JSON.stringify(prior.SINGLE));
 delete legacy.combo.bowState;legacy.target.partId='training-back';
 w.__legacy=legacy;
 w.eval('storageSet(BUILDS_KEY,JSON.stringify({...savedBuildMap(),LEGACY_SINGLE:window.__legacy}));renderSavedBuilds();');
 choose($('powerBowCoating'),'PIERCE');
 const reopened=compare(['SINGLE','LEGACY_SINGLE']);
 for(const row of reopened){
  assert.equal(row.upper.channels.normal.value,positive.SINGLE.calc.channels.normal.value);
  assert.equal(row.upper.channels.maximum.value,positive.SINGLE.calc.channels.maximum.value);
  assert.deepEqual(row.comparedTarget,{monster:'training-room',part:'training-front'});
 }
 const restoredLegacy=reopened.find(row=>row.name==='LEGACY_SINGLE');
 assert.equal(restoredLegacy.lower.damage,positive.SINGLE.calc.channels.normal.value);
 assert.ok(restoredLegacy.opening.includes('ビンなし'));
 assert.ok(restoredLegacy.opening.includes('適正距離'));
 const weakness=$('maximumSkillConditions').querySelector('[data-maximum-skill="weaknessExploit"]');
 weakness.checked=false;weakness.dispatchEvent(new w.Event('change',{bubbles:true}));
 for(const row of compare(['SINGLE','LEGACY_SINGLE'])){
  assert.equal(row.upper.channels.normal.value,positive.SINGLE.calc.channels.normal.value);
  assert.ok(Number.isFinite(row.upper.channels.maximum.value)&&row.upper.channels.maximum.value<positive.SINGLE.calc.channels.maximum.value);
  assert.equal(row.lower.damage,positive.SINGLE.calc.channels.normal.value);
 }
 assert.equal($('powerBowCoating').value,'PIERCE');
 assert.deepEqual(errors,[]);
}finally{w.close()}
});
