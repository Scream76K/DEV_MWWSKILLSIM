const assert=require('node:assert/strict'), path=require('node:path'), fs=require('node:fs'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'), {JSDOM,VirtualConsole}=require('jsdom'), cache='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json';
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
assert.equal(sha(cache),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
const pack=require(path.join(root,cache)), readHtml=require(path.join(root,'tools/dom-test-setup.cjs')).readSimulatorHtml;
const test=require('node:test');
test('saved Dragon372 mixed Bow comparison uses the shared target and the saved opening without modifying either build',()=>{
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
 const names=['KOTATU_BOW_01','SALADA_BOW_05'], positive={};
 for(const id of names){
  choose($('buildTemplateWeaponKind'),'bow');choose($('buildTemplateSelect'),id);$('loadBuildTemplate').click();
  assert.match($('buildTemplateStatus').textContent,/読み込み/);choose($('monster'),'training-room');choose($('monsterPart'),'training-front');
  moves(ids);choose($('powerBowCoating'),'NONE');choose($('powerBowRange'),'CRITICAL');choose($('powerBowStartShot'),'1');
  assert.equal(w.eval('calcState.stats.element'),372);assert.equal(w.eval('calcState.total["フォースショット"]'),1);
  $('calcUserComboDamage').click();assert.equal($('compareOut').dataset.resultMode,'current-custom');
  positive[id]={calc:keep(w.calcP0Damage('user').pipeline),total:paste('[data-custom-damage="total"]'),element:paste('[data-custom-damage="element"]'),used:paste('[data-used-combo]')};
  assert.ok(Object.values(positive[id].calc.channels).every(x=>x.status==='available'));
  $('buildName').value=id;assert.ok($('saveBuild'));$('saveBuild').click();assert.match($('buildSaveStatus').textContent,/保存しました/);
  const save=read('savedBuildMap()')[id];assert.deepEqual(save.combo.moves.map(x=>x.techniqueId),tagged);
  positive[id].chosen=read('compareStep5Snapshot().bowState');
  assert.deepEqual(save.target,{monsterId:'training-room',partId:'training-front'});
 }
 const prior=read('savedBuildMap()');
 for(const x of cks())x.checked=true;assert.equal(cks().length,2);
 function capture(){return read('lastBuildComparisonRows').map(row=>({name:row.name,kind:row.kind,upper:keep(row.oneHitPipeline),count:row.referenceCombo?.techniqueCount,comparedTarget:row.oneHitPipeline.evaluationPlan.target,openingValues:row.oneHitPipeline.evaluationPlan.bowOpening,opening:row.oneHitPipeline.evaluationPlan.automaticOpening}));}
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
 function equivalent(r){
   assert.deepEqual(r.upper.channels,positive[r.name].calc.channels,JSON.stringify(r));
   assert.equal(r.upper.plan,'EXPLICIT');
   assert.deepEqual(r.comparedTarget,{monster:'training-room',part:'training-front'});
   assert.deepEqual(r.openingValues,{chargeLevel:3,coating:'NONE',range:'CRITICAL',startShot:1});
 }
 compare(names).forEach(equivalent);
 for(const n of names)assert.deepEqual(prior[n].combo.bowState,{chargeLevel:3,coating:'NONE',range:'CRITICAL',startShot:1});
 assert.equal($('compareOut').querySelector('[data-comparison-metric="reference-combo-damage"]'),null);
 for(const c of ['normal','maximum'])assert.deepEqual([...$('compareOut').querySelectorAll('[data-comparison-metric="consumer-'+c+'-element"] td')].map(e=>Number(e.textContent.split('（')[0])),c==='normal'?[145.1,145.1]:[160.7,160.7]);
 assert.match(paste('[data-used-combo]'),/通常：剛射3 → 剛連射3 → 竜の千々矢.*最大：剛射3 → 剛連射3 → 竜の千々矢/);
 for(const [key,expected] of [['power-index',['982.0','981.9']],['max-power-index',['1228.7','1220.7']]]){
   const tr=$('compareOut').querySelector('[data-comparison-metric="'+key+'"]');
   assert.ok(tr);assert.deepEqual([...tr.querySelectorAll('td')].map(e=>e.textContent.trim().match(/^[0-9,.]+/)?.[0]?.replaceAll(',','')),expected);
 }
 const weakness=$('maximumSkillConditions').querySelector('[data-maximum-skill="weaknessExploit"]');
 assert.ok(!weakness.closest('label').hidden);
 weakness.checked=false;weakness.dispatchEvent(new w.Event('change',{bubbles:true}));
 for(const r of compare(names)){
   assert.equal(r.upper.channels.normal.value,positive[r.name].calc.channels.normal.value);
   assert.ok(r.upper.channels.maximum.value<positive[r.name].calc.channels.maximum.value);
 }
 weakness.checked=true;weakness.dispatchEvent(new w.Event('change',{bubbles:true}));
 const numericCoating='PIERCE';
 moves(ids);choose($('powerBowCoating'),numericCoating);$('buildName').value='COATED';$('saveBuild').click();assert.match($('buildSaveStatus').textContent,/保存しました/);
 const fixtures=read('savedBuildMap()');
 assert.equal(fixtures.COATED.combo.bowState.coating,numericCoating);
 fixtures.LEGACY=structuredClone(fixtures.KOTATU_BOW_01);delete fixtures.LEGACY.combo.bowState;
 fixtures.LEGACY.target.partId='training-back';
 fixtures.WRONG_ORDER=structuredClone(fixtures.KOTATU_BOW_01);[fixtures.WRONG_ORDER.combo.moves[0],fixtures.WRONG_ORDER.combo.moves[1]]=[fixtures.WRONG_ORDER.combo.moves[1],fixtures.WRONG_ORDER.combo.moves[0]];
 w.__qaFixtures=fixtures;w.eval('storageSet(BUILDS_KEY,JSON.stringify(window.__qaFixtures));renderSavedBuilds()');
 moves(['BOW_THOUSAND_DRAGONS']);choose($('powerBowCoating'),numericCoating);
 const legacy=compare(['LEGACY','SALADA_BOW_05']).find(r=>r.name==='LEGACY');
 assert.deepEqual(legacy.upper.channels,positive.KOTATU_BOW_01.calc.channels);
 assert.deepEqual(legacy.comparedTarget,{monster:'training-room',part:'training-front'});
 assert.deepEqual(legacy.openingValues,{chargeLevel:3,coating:'NONE',range:'CRITICAL',startShot:1});
 assert.ok(legacy.opening.some(x=>x.field==='coating'||x.key==='coating'||JSON.stringify(x).includes('ビンなし')));
 const coated=compare(['COATED','KOTATU_BOW_01']).find(r=>r.name==='COATED');
 assert.match($('compareOut').textContent,/ビンなしが前提|ビンなし・適正距離/);
 assert.match(String(coated.upper.reason),/^BOW_THOUSAND:(STATE_NOT_ADOPTED|UNVERIFIED_MIXED_RESOURCE)$/);
 assert.equal(coated.openingValues.coating,'PIERCE');
 assert.equal(coated.upper.channels.normal.value,undefined);
 assert.equal(coated.upper.channels.maximum.value,undefined);
 const order=compare(['WRONG_ORDER','KOTATU_BOW_01']).find(r=>r.name==='WRONG_ORDER');
 assert.equal(order.upper.reason,'BOW_THOUSAND:SINGLE_SHOT_REQUIRED');
 assert.equal(order.upper.channels.normal.value,undefined);
 assert.equal(order.upper.channels.maximum.value,undefined);
 choose($('savedBuildSelect'),'KOTATU_BOW_01');$('savedBuildLoad').click();
 assert.equal($('powerBowCoating').value,'NONE');assert.equal($('powerBowRange').value,'CRITICAL');assert.equal($('powerBowStartShot').value,'1');
 choose($('savedBuildSelect'),'LEGACY');$('savedBuildLoad').click();
 assert.equal($('powerBowCoating').value,'');assert.equal($('powerBowRange').value,'');assert.equal($('powerBowStartShot').value,'');
 assert.deepEqual(errors,[]);
}finally{w.close()}
});
