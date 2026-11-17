'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
for(const kind of ['great-sword','sword-and-shield','dual-blades','hammer','lance'])test(kind+' fixed native body thunder zero proof preserves numbers and guarded inputs',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://body-zero.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const base=structuredClone(profiles.find(x=>x.kind===kind).input);base.selectedHp='FULL_HP';
 const run=(element,on=true,resistance=0,name='耐性変換【雷】')=>{
  const s=structuredClone(base);s.artia.element=element;s.charmCustom.skills=[...(on?[{name,level:1,type:'weapon'}]:[]),...(resistance?[{name:'雷耐性',level:3,type:'armor'}]:[])];
  w.applyBuildSnapshot(s);click('calcBuild');return read('currentConsumerCalculation()');
 };
 const omission=(r,id=165)=>r.diagnostics?.ignoredSkillEffects?.some(x=>Number(x.skillId)===id)||false;
 const numeric=r=>({total:r.metrics.comboTotalDamage,components:r.components,execution:r.execution,state:r.finalState});
 try{
  w.__db=structuredClone(data);w.eval('DB=normalizeDB({...__db,weapons:consolidateArtiaFixedVariantRows(__db.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  for(const element of ['dragon','water']){
   const off=run(element,false),on=run(element);assert.ok(on.channels,JSON.stringify(on));assert.ok(off.channels,JSON.stringify(off));
   for(const ch of ['maximum','normal']){
    assert.equal(on.channels[ch].metrics.comboTotalDamage.status,'available');
    assert.deepEqual(numeric(on.channels[ch]),numeric(off.channels[ch]));
    assert.equal(omission(on.channels[ch]),false,kind+' '+element+' '+ch+' false zero warning');
    assert.ok(on.channels[ch].diagnostics.thunderResistanceConversion.zeroResistanceNoop);
   }
   const positive=run(element,true,20);assert.ok(omission(positive.channels.maximum));assert.deepEqual(numeric(positive.channels.maximum),numeric(off.channels.maximum));
  }
  const off=run('thunder',false),positive=run('thunder',true,20);
  assert.equal(omission(positive.channels.maximum),false);
  assert.equal(positive.channels.maximum.diagnostics.thunderResistanceConversion.add,20*(['great-sword','hammer'].includes(kind)?5:4));
  assert.ok(positive.channels.maximum.metrics.comboTotalDamage.value>off.channels.maximum.metrics.comboTotalDamage.value);
  const water=run('dragon',true,0,'耐性変換【水】');assert.ok(omission(water.channels.maximum,181),'water not expanded');
  const on=run('dragon');
  w.eval("(()=>{const kind=canonicalWeaponKind(selectedWeapon()),target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId},plan=consumerEvaluationPlan(kind,App.state.combo.moves,compareStep5Snapshot(),target),conditions=plan.conditions;window.__input={weapon:realPipelineWeapon(selectedWeapon()),stats:{...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total,kind,conditions)},target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),conditions,dualBladesState:conditions.dualBladesState,lanceState:conditions.lanceState,techniqueIds:plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster()};})()");
  const evaluate=patch=>read(`(()=>{const original=__input,input={...original,stats:structuredClone(original.stats),weapon:structuredClone(original.weapon),conditions:structuredClone(original.conditions),techniqueIds:[...original.techniqueIds]};${patch};return MHWRealOneHitBrowserAdapter.evaluateCurrent(input)})()`);
  assert.ok(evaluate('').channels.maximum.diagnostics.thunderResistanceConversion.zeroResistanceNoop);
  for(const patch of [
   "input.stats.thunderResistanceInput.status='UNRESOLVED'",
   "input.stats.conditionalConditionPlan.maximum.thunderResistanceInput.total=null",
   "input.stats.conditionalConditionPlan.normal.thunderResistanceInput.missing=['head']",
   "input.stats.thunderResistanceInput.rows[0].equipped=true",
   "input.stats.thunderResistanceInput.contributions.push({value:0})",
   "input.stats.thunderResistanceInput.total=-1",
   "input.weapon.artiaCalculationEvidence.source='FORGED'",
   "input.weapon.id=9999",
   "input.conditions.standardEvaluation=false",
   "input.techniqueIds.reverse()",
   "input.stats.conditionalConditionPlan.maximumElementComponents.conditionalFlat=1",
   "input.techniqueDb={get:(k,id)=>{const t=original.techniqueDb.get(k,id);return {...t,hits:t.hits.map(h=>({...h,mv:h.mv+1}))};}}"
  ])assert.ok(!evaluate(patch).channels?.maximum?.diagnostics?.thunderResistanceConversion?.zeroResistanceNoop,kind+' '+patch);
  w.document.getElementById('buildName').value='body zero '+kind;click('saveBuild');click('selectAllCompare');click('runCompare');
  const saved=read('createBuildComparisonReport()').results.find(x=>x.name==='body zero '+kind).oneHitPipeline;
  for(const ch of ['maximum','normal'])assert.deepEqual(numeric(saved.channels[ch]),numeric(on.channels[ch]));
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
