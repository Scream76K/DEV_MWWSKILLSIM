'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createSyntheticCombatDom,equipSyntheticWeapon}=require('./synthetic-combat-fixture.cjs');
const sourceSkill=require('./consumer-ai-comparison-source-skill.json');
const plain=x=>JSON.parse(JSON.stringify(x));
function setup(t,{kind='great-sword',element=false}={}){
  const w=createSyntheticCombatDom(t);
  equipSyntheticWeapon(w,{id:987,gameId:987,sharpness:{white:1},kind,name:'Synthetic A',damage:{raw:200,display:kind==='great-sword'?960:280},affinity:0,specials:element?[{kind:'element',element:'fire',damage:{display:100}}]:[],slots:[],skills:[]});
  w.confirm=()=>true;
  return w;
}
function save(w,name){w.document.getElementById('buildName').value=name;w.document.getElementById('saveBuild').click();assert.ok(w.savedBuildMap()[name]);}
function compare(w){w.document.getElementById('selectAllCompare').click();w.document.getElementById('runCompare').click();assert.equal(w.eval('lastBuildComparisonRows?.length'),Object.keys(w.savedBuildMap()).length);}
function prepare(w){w.document.getElementById('aiPrompt').value='現在の通常・最大と保存比較を確認';w.document.getElementById('aiPrepare').click();return JSON.parse(w.document.getElementById('aiPayload').textContent);}
function editSecondWeapon(w){w.eval(`const second={...DB.weapons[0],id:988,gameId:988,name:'Synthetic B',damage:{raw:220,display:1056}};DB.weapons.push(second);weaponIndexByKind['great-sword'].push(second);weapon.innerHTML+='<option value="988">Synthetic B</option>';weapon.value='988';App.build.setWeapon(second);calcBuild();`);}
function values(w,metric){return [...w.document.querySelectorAll('[data-comparison-metric="'+metric+'"] td')].map(x=>x.textContent);}
function selectBaseline(w,index){const e=w.document.getElementById('comparisonBaseline');e.value=String(index);e.dispatchEvent(new w.Event('change',{bubbles:true}));}
const close=(actual,expected)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);

// C01/C02: reporting an unselected STANDARD route instead of the displayed route is a bug.
test('public prepared comparison uses the displayed saved explicit routes rather than legacy STANDARD',t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();save(w,'A');editSecondWeapon(w);save(w,'B');compare(w);
  const r=prepare(w).currentBuild.buildComparison;
  assert.deepEqual(values(w,'power-index'),['371.7','408.9']);
  close(r.results[0].powerIndex,371.712);close(r.results[1].powerIndex,408.8832);
  close(r.results[0].maxPowerIndex,371.712);close(r.results[1].maxPowerIndex,408.8832);
  close(r.baseline.damage,371.712);
  assert.equal(r.schemaVersion,3);assert.equal(r.calculationScope,'CURRENT_CONSUMER_NORMAL_MAXIMUM');
  assert.equal(r.results[0].legacyReference.power.normal.comparisonPower,1049.664);
  assert.equal(r.results[0].oneHitPipeline.evaluationPlan.selection,'EXPLICIT');
  assert.deepEqual(r.results[0].oneHitPipeline.evaluationPlan.techniqueIds,['GS_CHARGED_SLASH_3']);
  assert.equal(r.coverage.normal,2);assert.equal(r.coverage.maximum,2);
  assert.ok(!r.coverage.pending.some(x=>x.metric==='dps'));
});

// C01/C05: valid absolute B survives invalid A; invalid technique A never becomes a STANDARD value.
test('unknown-technique A and valid B retain independent current absolutes and honest coverage in prepared data',t=>{
  const w=setup(t);w.addCombo('missing-technique',{allowMissing:true});w.calcBuild();save(w,'A');
  w.document.querySelector('.comboRow .del').click();w.addCombo('gs_charge3');w.calcBuild();save(w,'B');compare(w);
  const r=prepare(w).currentBuild.buildComparison;
  assert.deepEqual(values(w,'power-index'),['—','371.7']);assert.deepEqual(values(w,'consumer-relative-normal'),['—','—']);
  assert.equal(r.baseline.damage,null);assert.equal(r.results[0].powerIndex,null);assert.equal(r.results[0].maxPowerIndex,null);
  close(r.results[1].powerIndex,371.712);close(r.results[1].maxPowerIndex,371.712);
  for(const row of r.results){assert.equal(row.relativePowerIndex,null);assert.equal(row.relativeMaximumPowerIndex,null);}
  assert.equal(r.coverage.normal,1);assert.equal(r.coverage.maximum,1);
  assert.equal(r.coverage.pending.length,2);assert.ok(r.coverage.pending.every(x=>x.name==='A'&&x.reason==='REAL_SLICE:TECHNIQUE_NOT_FOUND:missing-technique'));
});

test('different saved technique identities preserve both totals but withhold relative prepared comparisons',t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();save(w,'A');
  const move=w.document.querySelector('.cmove');move.value='gs_strong3';move.dispatchEvent(new w.Event('change',{bubbles:true}));w.calcBuild();save(w,'B');compare(w);
  const r=prepare(w).currentBuild.buildComparison;
  close(r.results[0].powerIndex,371.712);close(r.results[1].powerIndex,394.944);
  assert.equal(r.results[0].relativePowerIndex,100);assert.equal(r.results[1].relativePowerIndex,null);
  assert.equal(r.results[1].relativeReason,'REAL_SLICE:COMPARISON_TECHNIQUE_MISMATCH');
  assert.equal(r.results[1].powerChange,null);
});

// C05: confirmed nonapplication and unreviewed explicit skill effects are separate states.
for(const explicit of [false,true])test('prepared current and saved Charge Master: '+(explicit?'explicit route remains incomplete':'standard route is not applicable'),t=>{
  const w=setup(t,{kind:'sword-and-shield',element:true});
  if(explicit)for(const id of ['sns_slash','canonical:SNS_SIDE_SLASH','sns_horizontal','canonical:SNS_RETURN_SLASH'])w.addCombo(id);
  w.calcBuild();
  const expected=explicit?prepare(w).currentBuild.currentCalculation.channels.maximum.metrics.comboTotalDamage.value:207.33;
  assert.ok(Number.isFinite(expected)&&expected>0);
  w.eval(`DB.skills.push(${JSON.stringify(sourceSkill.skill)});selectedWeapon().skills=[{skill:DB.skills.find(s=>s.id===24),level:1}];`);
  w.calcBuild();
  save(w,'Scope');compare(w);const payload=prepare(w),r=payload.currentBuild.buildComparison;
  close(r.results[0].maxPowerIndex,expected);
  const current=payload.currentBuild.currentCalculation;
  assert.ok(current,'current public result must be explicitly identified in prepared data');
  close(current.channels.normal.metrics.comboTotalDamage.value,expected);close(current.channels.maximum.metrics.comboTotalDamage.value,expected);
  for(const x of [current,r.results[0].oneHitPipeline]) {
   assert.equal(x.channels.normal.diagnostics.ignoredSkillEffects,undefined);
   const d=x.channels.maximum.diagnostics;
   if(explicit){assert.equal(d.chargeMasterApplicability,undefined);assert.equal(d.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');assert.deepEqual(d.ignoredSkillEffects.map(x=>x.skillId),[24]);assert.equal(d.ignoredSkillEffects[0].reason,'UNRESOLVED_EFFECTS:チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING');}
   else {assert.equal(d.chargeMasterApplicability?.reason,'STANDARD_NONCHARGED_BODY_CM_NOT_APPLICABLE');assert.notEqual(d.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');assert.equal(d.ignoredSkillEffects,undefined);}
  }
  assert.doesNotMatch(payload.instruction,/comboEvaluationがBLOCKEDの場合は全体火力・DPSを保留/);
  assert.match(payload.instruction,/DPS.*中止/);
});

test('prepared current results and saved comparison are detached and baseline change keeps absolute precision',t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();save(w,'A');editSecondWeapon(w);save(w,'B');
  const before=w.eval('JSON.stringify({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),channels:calcState.realOneHit.channels})');
  compare(w);const first=w.aiBuildData();assert.ok(first.currentCalculation);first.currentCalculation.channels.normal.metrics.comboTotalDamage.value=999;
  first.buildComparison.results[0].oneHitPipeline.channels.normal.metrics.comboTotalDamage.value=999;
  selectBaseline(w,1);assert.equal(w.document.getElementById('aiPayload').textContent,'');
  const second=prepare(w).currentBuild;
  close(second.currentCalculation.channels.normal.metrics.comboTotalDamage.value,408.8832);
  close(second.buildComparison.results[0].powerIndex,371.712);close(second.buildComparison.results[1].powerIndex,408.8832);
  close(second.buildComparison.baseline.damage,408.8832);close(second.buildComparison.results[0].relativePowerIndex,100/1.1);
  assert.equal(w.eval('JSON.stringify({build:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),saved:savedBuildMap(),channels:calcState.realOneHit.channels})'),before);
});

test('current-route edit invalidates prepared saved comparisons and withholds stale live values until recalculation',t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();save(w,'A');compare(w);prepare(w);
  const move=w.document.querySelector('.cmove');move.value='gs_strong3';move.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(w.document.getElementById('aiPayload').textContent,'');
  const current=prepare(w).currentBuild;
  assert.equal(current.buildComparison,null);assert.ok(current.currentCalculation);
  assert.equal(current.currentCalculation.status,'UNAVAILABLE');
  assert.equal(current.currentCalculation.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');
  assert.equal(current.currentCalculation.channels,undefined);
  w.document.getElementById('calcBuild').click();
  const refreshed=prepare(w).currentBuild;
  close(refreshed.currentCalculation.channels.normal.metrics.comboTotalDamage.value,394.944);
  assert.deepEqual(refreshed.currentCalculation.evaluationPlan.techniqueIds,['GS_STRONG_CHARGED_SLASH_3']);
  assert.equal(w.document.querySelector('#compareOut table'),null);
});

test('legacy-only diagnostic report remains schema 2 and cannot masquerade as a current consumer report',t=>{
  const w=setup(t);w.eval(`lastBuildComparisonRows=[{name:'Legacy',kind:'great-sword',power:{profileId:'fixture',normal:{comparisonPower:123,physical:123,element:0,special:0},maximum:null},element:0,elementKnown:true,typeKnown:true,elementType:'none'}];lastBuildComparisonContext={conditions:{}};`);
  const report=w.createBuildComparisonReport();assert.equal(report.schemaVersion,2);assert.equal(report.results[0].powerIndex,123);assert.equal(report.calculationScope,undefined);
});

// Reporter-boundary fixtures: channel results are explicit inputs, not engine claims.
test('current report preserves maximum when only that row normal is unavailable and preserves legitimate zero',t=>{
  const w=setup(t);
  w.eval(`const good=value=>({execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value}},components:[{id:'TEST:physical:0',status:'available',value}]});
    const bad={execution:{status:'blocked',reason:'NORMAL_INPUT_MISSING'},metrics:{comboTotalDamage:{status:'unavailable',reason:'NORMAL_INPUT_MISSING'}}};
    const plan={techniqueIds:['SAME'],target:{monster:'m',part:'p'}};
    lastBuildComparisonRows=[{name:'A',kind:'great-sword',element:0,elementType:'none',power:{},oneHitPipeline:{evaluationPlan:plan,channels:{normal:good(100),maximum:good(200)}}},{name:'B',kind:'great-sword',element:0,elementType:'none',power:{},oneHitPipeline:{evaluationPlan:plan,channels:{normal:bad,maximum:good(150)}}},{name:'C',kind:'great-sword',element:0,elementType:'none',power:{},oneHitPipeline:{evaluationPlan:plan,channels:{normal:good(0),maximum:good(0)}}}];lastBuildComparisonContext={conditions:{}};`);
  const r=w.createBuildComparisonReport();assert.equal(r.results[1].powerIndex,null);assert.equal(r.results[1].maxPowerIndex,150);assert.equal(r.results[1].relativePowerIndex,null);assert.equal(r.results[1].relativeMaximumPowerIndex,150);
  assert.equal(r.results[1].powerChange.normal,null);assert.equal(r.results[1].powerChange.maximum.changePercent,50);
  assert.equal(r.results[2].powerIndex,0);assert.equal(r.results[2].relativePowerIndex,0);assert.equal(r.coverage.normal,2);assert.equal(r.coverage.maximum,3);
});

test('mixed current cached rows cannot revive a missing pipeline from legacy STANDARD fallback',t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();save(w,'A');compare(w);
  w.eval(`lastBuildComparisonRows.push({name:'Legacy missing pipeline',kind:'great-sword',element:0,elementKnown:true,typeKnown:true,elementType:'none',power:{profileId:'LEGACY',normal:{comparisonPower:999,physical:999,element:0,special:0},maximum:{comparisonPower:999,physical:999,element:0,special:0}}});`);
  const r=w.createBuildComparisonReport();assert.equal(r.schemaVersion,3);assert.equal(r.results[1].powerIndex,null);assert.equal(r.results[1].maxPowerIndex,null);assert.equal(r.results[1].relativePowerIndex,null);assert.equal(r.coverage.normal,1);assert.equal(r.coverage.maximum,1);
});

for(const change of ['weapon','skill','target','condition'])test(`uncomputed ${change} changes cannot reuse a current prepared calculation`,t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();const before=prepare(w).currentBuild.currentCalculation;assert.equal(before.status,'OK');
  if(change==='weapon')w.eval('selectedWeapon().damage.raw=201');
  if(change==='skill')w.eval("build.charmCustom.skills=[{name:'攻撃',level:1,type:'weapon'}]");
  if(change==='target'){const e=w.document.getElementById('monsterPart');e.value=[...e.options].find(x=>x.value!==e.value).value;}
  if(change==='condition')w.document.getElementById('powerGutsState').value='AFTER';
  const current=prepare(w).currentBuild.currentCalculation;assert.equal(current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');assert.equal(current.channels,undefined);
});

test('completed unavailable evaluation stays current and repeated preparation does not mutate or fabricate it',t=>{
  const w=setup(t);w.addCombo('missing-technique',{allowMissing:true});w.calcBuild();
  const before=w.eval('JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit,saved:savedBuildMap()})');
  const first=prepare(w).currentBuild.currentCalculation,second=prepare(w).currentBuild.currentCalculation;
  assert.equal(first.reason,'REAL_SLICE:TECHNIQUE_NOT_FOUND:missing-technique');assert.deepEqual(second,first);
  assert.equal(w.eval('JSON.stringify({snapshot:buildSnapshotComparable(buildSnapshot()),conditions:compareStep5Snapshot(),result:calcState.realOneHit,saved:savedBuildMap()})'),before);
});

test('loading a different saved route prepares its freshly evaluated current result without another Calculate',t=>{
  const w=setup(t);w.addCombo('gs_charge3');w.calcBuild();save(w,'A');
  const move=w.document.querySelector('.cmove');move.value='gs_strong3';move.dispatchEvent(new w.Event('change',{bubbles:true}));w.calcBuild();save(w,'B');
  w.document.querySelector('[data-build-load="A"]').click();
  const current=prepare(w).currentBuild.currentCalculation;
  assert.notEqual(current.reason,'REAL_SLICE:CURRENT_CALCULATION_STALE');
  close(current.channels.normal.metrics.comboTotalDamage.value,371.712);assert.deepEqual(current.evaluationPlan.techniqueIds,['GS_CHARGED_SLASH_3']);
});
