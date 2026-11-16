'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const snapshot=require('./fixtures/lbg-elemental-nontarget-input.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('physical-only standard rapid keeps elemental strengthening non-target in calculation and saved exports',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://lbg-elements.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const ids=[41,50,91,121,127],rows=data.skills.filter(s=>ids.includes(s.id));
 const apply=(skills=[])=>{const s=structuredClone(snapshot);Object.assign(s.combo.lightBowgunState,{normalPowder:'NONE',elementPowder:'NONE',rapidMagazine:'NONE',specialMagazine:'NONE'});s.charmCustom.skills=skills.map(([name,level])=>({name,level,type:'weapon'}));w.applyBuildSnapshot(s);click('calcBuild');return read('currentConsumerCalculation()');};
 const numeric=r=>Object.fromEntries(['normal','maximum'].map(ch=>{const c=r.channels[ch];return [ch,{value:c.metrics.comboTotalDamage.value,execution:c.execution,components:c.components,finalState:c.finalState}]}));
 const verify=(r,skill,level)=>{for(const ch of ['normal','maximum']){const c=r.channels[ch],d=c.diagnostics;assert.equal(c.metrics.comboTotalDamage.status,'available');assert.equal(c.components.flatMap(x=>x.details?.trace||[]).length,25);assert.equal(d.rapidAmmoSequence.consumedRounds,5);const own=(d.nonApplicableEffects||[]).filter(x=>x.skillId===skill.id);assert.equal(own.length,level?1:0,skill.name+' '+ch);if(level){assert.equal(own[0].level,level);assert.equal(own[0].name,skill.name);assert.equal(own[0].reason,'NON_TARGET_STANDARD_NORMAL_RAPID_AMMO');}assert.ok(![...(d.ignoredSkillEffects||[]),...(d.unappliedEffects||[])].some(x=>x.skillId===skill.id));}};
 try{
  w.__data=data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const baseline=apply();
  for(const skill of rows)for(const level of [0,1,2,3,0]){
   const r=apply(level?[[skill.name,level]]:[]);verify(r,skill,level);assert.deepEqual(numeric(r),numeric(baseline));
   if(level){w.document.getElementById('buildName').value='element-test';click('saveBuild');click('selectAllCompare');click('runCompare');const out=read('createBuildComparisonReport()').results.find(x=>x.name==='element-test').oneHitPipeline;verify(out,skill,level);assert.deepEqual(out.channels,r.channels);w.localStorage.removeItem('mh-wilds-builds-v625');w.eval('renderSavedBuilds()');}
  }
  for(const skill of rows){
   const shots=[['ファーストショット',3],['フォースショット',3]];
   const b=apply(shots),r=apply([...shots,[skill.name,3]]);verify(r,skill,3);assert.deepEqual(numeric(r),numeric(b));
   const pending=apply([[skill.name,3],['暗黒',1]]);verify(pending,skill,3);assert.ok(pending.channels.maximum.diagnostics.ignoredSkillEffects.some(x=>x.skillId===168));
   apply([[skill.name,3]]);
   w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE'};");
   // Synthetic validator control: this DB has no native LBG grant of these
   // five skills. Raw weapon rank 1 plus aggregate rank 3 is not duplicate input.
   const overlap=read("(()=>{const input={...__input,weapon:structuredClone(__input.weapon)};input.weapon.skills.push({skill:{id:"+skill.id+",name:"+JSON.stringify(skill.name)+"},level:1});return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input)})()");
   verify(overlap,skill,3);
   for(const patch of [
    "input.conditions.standardEvaluation=false",
    "input.lightBowgunState.ammoType='FIRE'",
    "input.lightBowgunState.shotMode='NORMAL'",
    "input.stats.conditionalConditionPlan.maximum.element=1",
    "input.stats.element=1",
    "input.skills.push(input.skills[0])",
    "input.skills[0][1]=4",
    "input.weapon.skills.push({skill:{id:"+skill.id+",name:'WRONG'},level:1})",
    "const engine=input.techniqueDb;input.techniqueDb={get:(kind,id)=>({...engine.get(kind,id),specialComponents:['AMMO_PHYSICAL','AMMO_ELEMENT']})}"
   ]){
    const bad=read("(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills),conditions:structuredClone(__input.conditions),lightBowgunState:structuredClone(__input.lightBowgunState)};"+patch+";return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input)})()");
    assert.notEqual(bad.status,'OK',patch);
   }
  }
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
