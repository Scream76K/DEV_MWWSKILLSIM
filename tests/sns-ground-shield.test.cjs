'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test'),{JSDOM,VirtualConsole}=require('jsdom');
const root=require('node:path').resolve(__dirname,'..');
const {readSimulatorHtml}=require(root+'/tools/dom-test-setup.cjs');
const {profiles}=require(root+'/tests/fixtures/selected-hp-inputs.json');
const {data}=require(root+'/tests/fixtures/offset-maximum-inputs.json');
test('Shield Attack standard custom UI: one blunt hit, weapon attribute ignored, white sharpness remains effective',t=>{
 const vc=new VirtualConsole(); const errors=[];vc.on('jsdomError',err=>errors.push(err.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://sns-shield.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});const e=id=>w.document.getElementById(id);
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 const base=profiles.find(p=>p.kind==='sword-and-shield').input;
 w.__raw=JSON.stringify(data);w.__build=JSON.stringify({...base,weaponId:'1056',armor:{},decos:{},combatBuffs:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
 w.eval("const source=JSON.parse(__raw);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(JSON.parse(__build));");
 assert.equal(read('String(selectedWeapon().id)'),'1056');
 const standard=read('calcState.realOneHit');
 const standardView=x=>({ids:x.evaluationPlan.techniqueIds,totals:['normal','maximum'].map(ch=>x.channels[ch].metrics.comboTotalDamage.value)});
 const pick=name=>{for(const option of w.document.querySelectorAll('[data-compare-name]'))if(option.checked!==(option.dataset.compareName===name))option.click();e('runCompare').click();};
 e('buildName').value='標準 QA';e('saveBuild').click();pick('標準 QA');
 const pre=read('lastBuildComparisonRows[0].oneHitPipeline');
 assert.deepEqual(standardView(pre),standardView(standard));
 const picker=e('comboMovePicker');assert.ok([...picker.options].some(x=>x.value==='sns_shield'&&!x.disabled));
 picker.value='sns_shield';e('addCombo').click();
 let got;const orig=w.calcUserComboDamage;w.calcUserComboDamage=(...a)=>(got=orig(...a));e('calcUserComboDamage').click();
 const lanes=['normal','maximum'].map(c=>w.consumerDamageMetric({oneHitPipeline:got.pipeline},c));
 t.diagnostic(JSON.stringify({lanes,plan:got.pipeline.evaluationPlan,stage:got.stages?.[0]?.result?.total}));
 assert.deepEqual(Array.from(got.pipeline.evaluationPlan.techniqueIds),['SNS_SHIELD_ATTACK']);
 for(const c of Object.values(got.pipeline.channels)){
   assert.equal(c.execution.status,'complete');
   assert.deepEqual(Array.from(c.execution.executed),['0:0']);
   assert.ok(Math.abs(c.metrics.comboTotalDamage.value-33.792)<1e-8,JSON.stringify(c.metrics));
   assert.equal(c.components.filter(x=>x.id.includes(':physical:')).length,1);
   assert.ok(c.components.filter(x=>x.id.includes(':element:')).every(x=>x.value===0));
   assert.equal(c.components.reduce((sum,x)=>sum+x.value,0),c.metrics.comboTotalDamage.value);
   assert.equal(c.diagnostics.snsGroundShield.physicalSharpnessApplies,true);
   assert.equal(c.diagnostics.snsGroundShield.sharpnessConsumption,0);
 }
 e('buildName').value='盾攻撃 QA';e('saveBuild').click();
 const opt=[...w.document.querySelectorAll('[data-compare-name]')].find(x=>x.dataset.compareName==='盾攻撃 QA');assert.ok(opt);opt.click();e('runCompare').click();
 const actual=read("['normal','maximum'].map(ch=>consumerDamageMetric(lastBuildComparisonRows[0],ch).value)");
 assert.deepEqual(actual,lanes.map(x=>x.value));
 assert.deepEqual(read("savedBuildMap()['盾攻撃 QA'].combo.moves.map(x=>x.techniqueId)"),['sns_shield']);
 assert.match(e('compareOut').textContent,/属性なし。斬れ味は消費しませんが、物理補正は適用/);
 assert.ok(lanes.every(x=>x.value===33.792));
 pick('標準 QA');
 assert.deepEqual(standardView(read('lastBuildComparisonRows[0].oneHitPipeline')),standardView(pre));
 const shield=read("savedBuildMap()['盾攻撃 QA']");
 for (const malformed of [{repeat:'1'},{count:2},{repeat:0}]){
  const snapshot={...shield,combo:{...shield.combo,moves:[{techniqueId:'sns_shield',...malformed}]}};
  w.__import=JSON.stringify(snapshot);
  w.eval("localStorage.setItem(BUILDS_KEY,JSON.stringify({...savedBuildMap(),broken:JSON.parse(__import)}));renderSavedBuilds()");
  pick('broken');
  assert.ok(read("['normal','maximum'].map(ch=>consumerDamageMetric(lastBuildComparisonRows[0],ch).value)").every(x=>x===null));
  e('savedBuildSelect').value='broken';e('savedBuildSelect').dispatchEvent(new w.Event('change',{bubbles:true}));e('savedBuildLoad').click();
  assert.deepEqual(read('App.state.combo.moves'),snapshot.combo.moves);
  e('calcUserComboDamage').click();
  assert.match(e('compareOut').textContent,/未算出/);
 }
 const context=w.eval("evaluateConsumerCombat({kind:'sword-and-shield',moves:[{techniqueId:'sns_shield'}],conditions:{...compareStep5Snapshot(),powerClashWin:true},target:{monster:'training-room',part:'training-front'}})");
 assert.match(w.consumerDamageMetric({oneHitPipeline:context},'normal').reason,/CONTEXT_UNSUPPORTED/);

});
