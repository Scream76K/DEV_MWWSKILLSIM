'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {data,cases}=require('./fixtures/lbg-owner-exclusions-inputs.json'),{armor}=require('./fixtures/lbg161-festival-armor.json');

test('fixed LBG rapid comparison resolves both Flamefete ranks without enabling festival damage',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://lbg161-festival.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const input=structuredClone(cases[0].input);
 Object.assign(input.combo.lightBowgunState,{normalPowder:'NONE',elementPowder:'NONE',rapidMagazine:'NONE',specialMagazine:'NONE'});
 const run=(rank,hp='FULL_HP')=>{
  const equipped=Object.fromEntries(armor.slice(0,rank===1?2:rank===2?4:0).map(row=>[row.kind,row.id]));
  w.applyBuildSnapshot({...structuredClone(input),armor:equipped,selectedHp:hp});click('calcBuild');
  return read('currentConsumerCalculation()');
 };
 const expected=(rank,ch)=>3.2487*(215+(ch==='maximum'?[0,6,9][rank]:0));
 const verify=(r,rank)=>{
  assert.equal(r.evaluationPlan.selection,'STANDARD');
  for(const ch of ['normal','maximum']){
   const c=r.channels[ch],d=c.diagnostics;
   assert.equal(c.metrics.comboTotalDamage.status,'available');
   assert.ok(Math.abs(c.metrics.comboTotalDamage.value-expected(rank,ch))<1e-9,ch);
   assert.ok(!(d.ignoredSkillEffects||[]).some(x=>x.skillId===161),rank+' '+ch+' ID161 is a validated no-op');
   assert.notEqual(d.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');
   assert.equal(c.execution.status,'complete');
   assert.equal(d.rapidAmmoSequence.consumedRounds,5);
   assert.equal(c.components.flatMap(x=>x.details?.trace||[]).length,25);
  }
 };
 try{
  w.__data={...data,armor:[...data.armor,...armor]};w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  for(const hp of ['FULL_HP','AT_OR_BELOW_30_PERCENT'])for(const rank of [0,1,2,0]){
   const r=run(rank,hp),active=read('calcState.stats.activeBonusEffects').filter(e=>e.bonusSkillId===161);
   assert.equal(active.length,rank?1:0);
   if(rank)assert.equal(active[0].rankLevel,rank);
   verify(r,rank);
  }
  const r=run(2);
  w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,compareStep5Snapshot(),__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE'};");
  assert.equal(read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)').status,'OK');
  for(const alter of [
   "input.conditions.festivalId=161; input.stats.conditionalConditionPlan=standardPowerConditionPlan(input.stats,Object.fromEntries(input.skills),'light-bowgun',input.conditions)",
   "input.conditions.standardEvaluation=false",
   "input.stats.conditionalConditionPlan.groupPlan.applied.find(e=>e.skillId===161).attackMultiplier=1.09",
   "input.stats.conditionalConditionPlan.groupPlan.attackMultiplier=1.09",
   "input.stats.activeBonusEffects.find(e=>e.bonusSkillId===161).required=3",
   "input.stats.activeBonusEffects.push(structuredClone(input.stats.activeBonusEffects.find(e=>e.bonusSkillId===161)))"
  ]){
   const direct=read("(()=>{const input={...__input,conditions:structuredClone(__input.conditions),stats:structuredClone(__input.stats)};"+alter+";return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input)})()");
   assert.notEqual(direct.status,'OK',alter);
  }
  w.document.getElementById('buildName').value='ID161';click('saveBuild');click('selectAllCompare');click('runCompare');
  const saved=read('createBuildComparisonReport()').results.find(x=>x.name==='ID161').oneHitPipeline;
  verify(saved,2);assert.deepEqual(saved.channels,r.channels);
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
