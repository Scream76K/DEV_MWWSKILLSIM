'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
const channels=['maximum','normal'];
test('fixed elemental LS resolves zero resistance only, preserving totals, components and guarded controls',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://ls-zero-resistance.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const snapshot=structuredClone(profiles.find(x=>x.kind==='long-sword').input);snapshot.selectedHp='FULL_HP';
 const make=(element,resistance,level,rank=1)=>({...structuredClone(snapshot),artia:{...snapshot.artia,element},charmCustom:{...snapshot.charmCustom,skills:[...(rank?[{name:resistance==='water'?'耐性変換【水】':'耐性変換【雷】',level:rank,type:'weapon'}]:[]),...(level?[{name:resistance==='water'?'水耐性':'雷耐性',level,type:'armor'}]:[])]}});
 const run=input=>{w.applyBuildSnapshot(input);click('calcBuild');return {r:read('currentConsumerCalculation()'),stats:read('calcState.stats'),input};};
 const metric=p=>p.metrics.comboTotalDamage, omission=(p,id)=>p.diagnostics?.ignoredSkillEffects?.some(x=>Number(x.skillId)===id)||false;
 const numeric=p=>({total:metric(p).value,components:p.components.map(c=>[c.id,c.status,c.value]),execution:p.execution,state:p.finalState});
 try{
  w.__db=structuredClone(data);w.eval('DB=normalizeDB({...__db,weapons:consolidateArtiaFixedVariantRows(__db.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  for(const [resistance,id,other] of [['thunder',165,'water'],['water',181,'thunder']]){
   for(const element of ['dragon',other,resistance]){
    const off=run(make(element,resistance,0,0)),on=run(make(element,resistance,0));
    const diagKey=resistance+'ResistanceConversion',inputKey=resistance+'ResistanceInput';
    assert.equal(on.r.evaluationPlan.selection,'STANDARD');assert.deepEqual(on.r.evaluationPlan.techniqueIds,['LS_RED_BLADE_I','LS_RED_BLADE_II','LS_RED_BLADE_III']);
    assert.equal(on.stats[inputKey].total,0);assert.equal(on.stats[inputKey].status,'KNOWN_LIMITED');assert.equal(on.stats.elementType,element);
    for(const ch of channels){
     const p=on.r.channels[ch];assert.equal(metric(p).status,'available');assert.deepEqual(numeric(p),numeric(off.r.channels[ch]));
     assert.equal(omission(p,id),false,resistance+' '+element+' '+ch+' known-zero omission');
     assert.equal(p.diagnostics[diagKey].add,0);
     assert.deepEqual(p.diagnostics.ignoredSkillEffects??[],off.r.channels[ch].diagnostics.ignoredSkillEffects??[]);
     const elementDetails=q=>q.components.filter(c=>c.coefficientUnit==='ELEMENT_MODIFIER').map(c=>c.details);
     assert.equal(elementDetails(p).length,7);
     assert.deepEqual(elementDetails(p),elementDetails(off.r.channels[ch]));
     if(element!==resistance)assert.ok(p.diagnostics[diagKey].zeroResistanceNoop,resistance+' '+element+' '+ch+' missing zero proof');
    }
    const positive=run(make(element,resistance,3));assert.equal(positive.stats[inputKey].total,20);
    assert.equal(metric(positive.r.channels.normal).value,metric(off.r.channels.normal).value);
    if(element!==resistance){
     assert.ok(omission(positive.r.channels.maximum,id),resistance+' '+element+' positive resistance must remain unresolved');
     assert.deepEqual(numeric(positive.r.channels.maximum),numeric(off.r.channels.maximum));
    }else{
     const p=positive.r.channels.maximum;assert.equal(p.diagnostics[diagKey].add,80);
     assert.ok(Math.abs(metric(p).value-493.4274)<1e-9);
    }
   }
  }

  for(const [resistance,id] of [['thunder',165],['water',181]]){
   const on=run(make('dragon',resistance,0)).r,diag=resistance+'ResistanceConversion',inputKey=resistance+'ResistanceInput';
   w.eval("(()=>{const kind=canonicalWeaponKind(selectedWeapon()),target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId},plan=consumerEvaluationPlan(kind,App.state.combo.moves,compareStep5Snapshot(),target),conditions=plan.conditions;window.__input={weapon:realPipelineWeapon(selectedWeapon()),stats:{...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total,kind,conditions)},target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),conditions,longSwordState:conditions.longSwordState,techniqueIds:plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster()};})()");
   const evaluate=patch=>read(`(()=>{const original=__input,input={...original,stats:structuredClone(original.stats),weapon:structuredClone(original.weapon),conditions:structuredClone(original.conditions),longSwordState:structuredClone(original.longSwordState),techniqueIds:[...original.techniqueIds]};${patch};return MHWRealOneHitBrowserAdapter.evaluateCurrent(input)})()`);
   const direct=evaluate('');
   assert.equal(direct.status,'OK',direct.reason);
   assert.ok(direct.channels.maximum.diagnostics[diag].zeroResistanceNoop);
   const get=prefix=>`${prefix}.${inputKey}`;
   const mutations=[
    `${get('input.stats')}.status='UNRESOLVED'`,
    `${get('input.stats.conditionalConditionPlan.maximum')}.total=null`,
    `${get('input.stats.conditionalConditionPlan.normal')}.missing=['head']`,
    `${get('input.stats')}.rows[0].equipped=true`,
    `${get('input.stats')}.contributions.push({value:0})`,
    `${get('input.stats')}.total=-1`,
    "input.weapon.artiaCalculationEvidence.source='FORGED'",
    "input.weapon.id=1174",
    "input.conditions.standardEvaluation=false",
    "input.longSwordState.spiritGauge='WHITE'",
    "input.techniqueIds.reverse()",
    "input.stats.conditionalConditionPlan.maximumElementComponents.conditionalFlat=1",
    "input.techniqueDb={get:(k,id)=>{const t=original.techniqueDb.get(k,id);return id==='LS_RED_BLADE_I'?{...t,hits:t.hits.map(h=>({...h,mv:h.mv+1}))}:t;}}"
   ];
   for(const patch of mutations)assert.ok(!evaluate(patch).channels?.maximum?.diagnostics?.[diag]?.zeroResistanceNoop,patch);
   w.document.getElementById('buildName').value='LS zero '+id;click('saveBuild');
   click('selectAllCompare');click('runCompare');
   const saved=read('createBuildComparisonReport()').results.find(x=>x.name==='LS zero '+id).oneHitPipeline;
   for(const ch of channels){
    assert.deepEqual(numeric(saved.channels[ch]),numeric(on.channels[ch]));
    assert.ok(saved.channels[ch].diagnostics[diag].zeroResistanceNoop);
   }
  }
  assert.deepEqual(errors,[]);

 }finally{w.close();}
});
