'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');

test('fixed dragon CB R/H keeps every numeric component and exposes unresolved ID24 in both channels',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://cb24-fixed.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const capture=(level,extra=[])=>{
  const input=structuredClone(profiles.find(x=>x.kind==='charge-blade').input);
  input.selectedHp='FULL_HP';
  input.charmCustom.skills=[...(level?[{name:'チャージマスター',level,type:'weapon'}]:[]),...extra];
  w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();
  return JSON.parse(w.eval('JSON.stringify(calcState.realOneHit)'));
 };
 try{
  w.__pack=structuredClone(data);
  w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const base=capture(0);
  for(const level of [0,1,2,3,0]){
   const active=capture(level);
   assert.equal(active.scope,'CB_INDEPENDENT_R_H_SUM');
   assert.equal(active.evaluationPlan.selection,'STANDARD');
   for(const channel of ['normal','maximum']){
    const a=active.channels[channel],b=base.channels[channel];
    assert.deepEqual(a.execution,b.execution);
    assert.equal(a.metrics.comboTotalDamage.status,'available');
    assert.equal(a.metrics.comboTotalDamage.value,b.metrics.comboTotalDamage.value);
    assert.deepEqual(a.finalState,b.finalState);
    for(const [route,count] of [['R',54],['H',29]]){
     const part=active.routes[route].channels[channel],original=base.routes[route].channels[channel];
     assert.equal(part.components.length,count);
     assert.deepEqual(part.components,original.components);
     assert.deepEqual(part.execution,original.execution);
     assert.deepEqual(part.finalState,original.finalState);
    }
    const warnings=a.diagnostics.ignoredSkillEffects||[],keep=b.diagnostics.ignoredSkillEffects||[];
    assert.deepEqual(warnings.filter(x=>x.skillId!==24),keep);
    const charge=warnings.filter(x=>x.skillId===24);
    assert.equal(charge.length,level?1:0,`Lv${level} ${channel}: missing or duplicate omission`);
    if(level){
     assert.equal(a.diagnostics.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');
     assert.equal(charge[0].level,level);assert.equal(charge[0].channel,channel);
     assert.equal(charge[0].status,'IGNORED_UNSUPPORTED_EFFECT');
    }
   }
  }
  const wet=[{name:'濡れ刃紋',level:1,type:'weapon'}];
  const wetBase=capture(0,wet),wetCharge=capture(3,wet);
  for(const channel of ['normal','maximum']){
   const active=wetCharge.channels[channel],original=wetBase.channels[channel];
   assert.deepEqual(active.metrics,original.metrics,'ID24 must not change fixed R/H metrics');
   assert.deepEqual(active.execution,original.execution);
   assert.deepEqual(active.finalState,original.finalState);
   for(const route of ['R','H'])assert.deepEqual(wetCharge.routes[route].channels[channel].components,wetBase.routes[route].channels[channel].components);
  }
  const normalNote=wetCharge.channels.normal.diagnostics.ignoredSkillEffects.find(x=>x.skillId===24);
  assert.equal(Object.hasOwn(normalNote,'retainedSkills'),false,'normal ID24 note must not inherit maximum-only retained skills');
  assert.equal(Object.hasOwn(normalNote,'reasonOrigin'),false,'normal ID24 note must not claim a maximum recovery trial');
  assert.equal(Object.hasOwn(normalNote,'scope'),false,'normal ID24 note must not inherit a maximum recovery scope');
  assert.deepEqual(Object.keys(normalNote).sort(),['channel','level','name','rankLevel','reason','skillId','sourceRef','status'].sort());
  const maximumNote=wetCharge.channels.maximum.diagnostics.ignoredSkillEffects.find(x=>x.skillId===24);
  assert.equal(maximumNote.retainedSkills.some(x=>x.skillId===39),true,'maximum provenance remains unchanged');
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
