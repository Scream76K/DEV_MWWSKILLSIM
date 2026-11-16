'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom'),{readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const snapshot=require('./fixtures/lbg-elemental-nontarget-input.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('fixed LBG passive skills preserve stats, non-damage classification and independent pending',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://lbg-elements.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),click=id=>w.document.getElementById(id).click();
 const ids=[118,119,156],rows=data.skills.filter(s=>ids.includes(s.id));
 const apply=(skills=[])=>{const s=structuredClone(snapshot);Object.assign(s.combo.lightBowgunState,{normalPowder:'NONE',elementPowder:'NONE',rapidMagazine:'NONE',specialMagazine:'NONE'});s.charmCustom.skills=skills.map(([name,level])=>({name,level,type:data.skills.find(s=>s.name===name).kind}));w.applyBuildSnapshot(s);click('calcBuild');return read('currentConsumerCalculation()');};
 const numeric=r=>Object.fromEntries(['normal','maximum'].map(ch=>{const c=r.channels[ch];return [ch,{value:c.metrics.comboTotalDamage.value,execution:c.execution,components:c.components,finalState:c.finalState}]}));
 const verify=(r,skill,level)=>{for(const ch of ['normal','maximum']){const c=r.channels[ch],d=c.diagnostics;assert.equal(c.metrics.comboTotalDamage.status,'available');assert.equal(c.components.flatMap(x=>x.details?.trace||[]).length,25);assert.equal(d.rapidAmmoSequence.consumedRounds,5);const own=(d.nonApplicableEffects||[]).filter(x=>x.skillId===skill.id);assert.equal(own.length,level?1:0,skill.name+' '+ch);if(level){assert.equal(own[0].level,level);assert.equal(own[0].name,skill.name);assert.equal(own[0].reason,'PASSIVE_STATS_ONLY_FIXED_NORMAL_RAPID');}assert.ok(![...(d.ignoredSkillEffects||[]),...(d.unappliedEffects||[])].some(x=>x.skillId===skill.id));}};
 try{
  w.__data=data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const baseline=apply();
  for(const skill of rows)for(const level of [0,...skill.ranks.map(r=>r.level),0]){
   const r=apply(level?[[skill.name,level]]:[]);verify(r,skill,level);
   const st=read('calcState.stats');
   const resistance=skill.id===156?[0,6,12,20][level]:skill.id===118?(level>=6?5:level>=4?3:0):0;
   assert.equal(st.thunderResistanceInput.total,resistance,skill.name+' thunder source retained');
   assert.equal(read('calcState.total['+JSON.stringify(skill.name)+']||0'),level);
   if(skill.id===118&&level)assert.ok(st.defense>1,'Defense stat retained');
assert.deepEqual(numeric(r),numeric(baseline));
   if(level){w.document.getElementById('buildName').value='element-test';click('saveBuild');click('selectAllCompare');click('runCompare');const out=read('createBuildComparisonReport()').results.find(x=>x.name==='element-test').oneHitPipeline;verify(out,skill,level);assert.deepEqual(out.channels,r.channels);w.localStorage.removeItem('mh-wilds-builds-v625');w.eval('renderSavedBuilds()');}
  }
  for(const skill of rows){
   const shots=[['ファーストショット',3],['フォースショット',3]];
   const b=apply(shots),r=apply([...shots,[skill.name,3]]);verify(r,skill,3);assert.deepEqual(numeric(r),numeric(b));
   // Conversion remains independent; never discard defensive/resistance producers.
   const pending=apply([[skill.name,3],['耐性変換【雷】',1]]);assert.ok(pending.channels.maximum.diagnostics.ignoredSkillEffects.some(x=>x.skillId===165&&x.reason==='LBG_RAPID:SKILL_COMBINATION_NOT_ADOPTED'));
   apply([[skill.name,3]]);
   w.eval("window.__kind=canonicalWeaponKind(selectedWeapon());window.__target={monster:buildSnapshot().target.monsterId,part:buildSnapshot().target.partId};window.__cond=compareStep5Snapshot();window.__plan=consumerEvaluationPlan(__kind,App.state.combo.moves,__cond,__target);window.__stats={...calcState.stats,conditionalConditionPlan:standardPowerConditionPlan(calcState.stats,calcState.total||{},__kind,__plan.conditions)};window.__input={weapon:realPipelineWeapon(selectedWeapon(),__plan.conditions.lightBowgunState),stats:__stats,target:__target,skills:Object.entries(calcState.total),equipmentSkillsResolved:realPipelineSkillsResolved(),techniqueIds:__plan.techniqueIds,techniqueDb:TechniqueDBEngine,trainingRoom:trainingRoomMonster(),conditions:__plan.conditions,lightBowgunState:__plan.conditions.lightBowgunState,retrievedAt:'FIXTURE'};");
   // Source overlap: raw weapon rank and aggregated rank are not duplicate rows.
   const overlap=read("(()=>{const input={...__input,weapon:structuredClone(__input.weapon)};input.weapon.skills.push({skill:{id:"+skill.id+",name:"+JSON.stringify(skill.name)+"},level:1});return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input)})()");
   verify(overlap,skill,3);
   for(const mutation of ['missing','wrong-name','missing-rank']){
    const originalDb=w.__getBetaDB;
    try{
     w.__getBetaDB=()=>{const db=originalDb(),skills=JSON.parse(JSON.stringify(db.skills));
      if(mutation==='missing')return {...db,skills:skills.filter(s=>s.id!==skill.id)};
      const row=skills.find(s=>s.id===skill.id);if(mutation==='wrong-name')row.name='WRONG';else row.ranks=row.ranks.filter(r=>r.level!==3);
      return {...db,skills};};
     const rejected=read('MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(__input)');
     assert.notEqual(rejected.status,'OK',mutation);
     assert.ok(!JSON.stringify(rejected).includes('PASSIVE_SKILL_CONTRACT_INVALID'),'no new passive hard error');
    }finally{w.__getBetaDB=originalDb;}
   }
   for(const patch of [
    "input.conditions.standardEvaluation=false",
    "input.weapon.id=1157",
    "input.lightBowgunState.ammoLevel=3",
    "input.conditions.mounted=true",
    "input.lightBowgunState.ammoType='FIRE'",
    "input.lightBowgunState.shotMode='NORMAL'",
    "input.stats.conditionalConditionPlan.maximum.element=1",
    "input.stats.element=1",
    "input.skills.push(input.skills[0])",
    "input.skills[0][1]=99",
    "input.weapon.skills.push({skill:{id:"+skill.id+",name:'WRONG'},level:1})",
    "const engine=input.techniqueDb;input.techniqueDb={get:(kind,id)=>({...engine.get(kind,id),specialComponents:['AMMO_PHYSICAL','AMMO_ELEMENT']})}"
   ]){
    const bad=read("(()=>{const input={...__input,weapon:structuredClone(__input.weapon),stats:structuredClone(__input.stats),skills:structuredClone(__input.skills),conditions:structuredClone(__input.conditions),lightBowgunState:structuredClone(__input.lightBowgunState)};"+patch+";return MHWRealOneHitBrowserAdapter.evaluateRapidFiveShot(input)})()");
    assert.notEqual(bad.status,'OK',patch);assert.ok(!JSON.stringify(bad).includes('PASSIVE_SKILL_CONTRACT_INVALID'));
   }
  }
  const mixed=apply([['防御',7],['匠',5],['雷耐性',3]]);
  for(const ch of ['normal','maximum'])assert.deepEqual(mixed.channels[ch].diagnostics.nonApplicableEffects.filter(x=>ids.includes(x.skillId)).map(x=>x.skillId).sort(),[118,119,156]);
  assert.deepEqual(numeric(mixed),numeric(baseline));assert.equal(read('calcState.stats.thunderResistanceInput.total'),25);
  const converted=apply([['防御',7],['雷耐性',3],['耐性変換【雷】',1]]);
  assert.equal(read('calcState.stats.thunderResistanceInput.total'),25);
  assert.ok(converted.channels.maximum.diagnostics.ignoredSkillEffects.some(x=>x.skillId===165));
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
