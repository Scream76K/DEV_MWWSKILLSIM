'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');

test('fixed CB draw omissions are maximum-only, intersect R/H, preserve ID24 and saved builds',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://cb-draw.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const clone=x=>JSON.parse(JSON.stringify(x)),names={8:'抜刀術【力】',103:'抜刀術【技】',24:'チャージマスター',86:'飛燕'};
 const capture=(skills)=>{
  const input=structuredClone(profiles.find(x=>x.kind==='charge-blade').input);input.selectedHp='FULL_HP';
  input.charmCustom.skills=skills.map(([id,level])=>({name:names[id],level,type:'weapon'}));
  w.applyBuildSnapshot(input);w.document.getElementById('calcBuild').click();return clone(w.eval('calcState.realOneHit'));
 };
 try{
  w.__pack=structuredClone(data);w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const base=capture([]);
  for(const skills of [[],... [8,103].flatMap(id=>[1,2,3].map(l=>[[id,l]])),[[8,3],[103,2]],[[8,3],[103,2],[24,3]],[[8,3],[24,3],[86,1]],[]]){
   const result=capture(skills);
   for(const channel of ['normal','maximum']){
    assert.deepEqual(result.channels[channel].metrics,base.channels[channel].metrics);
    for(const route of ['R','H']){
     assert.deepEqual(result.routes[route].channels[channel].components,base.routes[route].channels[channel].components);
     assert.deepEqual(result.routes[route].channels[channel].finalState,base.routes[route].channels[channel].finalState);
     assert.deepEqual(result.routes[route].channels[channel].execution,base.routes[route].channels[channel].execution);
    }
    const warnings=result.channels[channel].diagnostics.ignoredSkillEffects||[];
    for(const id of [8,103]){
     const level=skills.find(x=>x[0]===id)?.[1];const notes=warnings.filter(x=>x.skillId===id);
     assert.equal(notes.length,channel==='maximum'&&level?1:0,`${id} ${level} ${channel}`);
     if(notes.length){assert.equal(notes[0].level,level);assert.equal(notes[0].channel,'maximum');assert.equal(notes[0].reason,'DRAW_STANDARD_OPENING_ELIGIBILITY_PENDING');assert.equal(Object.hasOwn(notes[0],'retainedSkills'),false);assert.equal(result.channels.maximum.diagnostics.calculationCompleteness,'PARTIAL_SKILL_EFFECTS');}
    }
    assert.equal(warnings.filter(x=>x.skillId===24).length,skills.some(x=>x[0]===24)?1:0);
    if(skills.some(x=>x[0]===86)&&channel==='maximum')assert.ok(warnings.some(x=>x.skillId===86));
   }
  }
  const donor=capture([[8,3],[103,2]]);
  const withoutSummary=()=>{const r=clone(donor);r.channels.maximum.diagnostics.ignoredSkillEffects=[];return r;};
  const project=r=>{w.__candidate=r;return clone(w.eval('projectFixedCbDrawOmissions(__candidate)'));};
  for(const change of [
   r=>r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects=r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects.filter(x=>x.skillId!==8),
   r=>r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects.find(x=>x.skillId===8).level=2,
   r=>r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects.find(x=>x.skillId===8).reason='OTHER_PENDING',
   r=>r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects.push(clone(r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects.find(x=>x.skillId===8))),
   r=>r.routes.H.channels.maximum.diagnostics.ignoredSkillEffects.find(x=>x.skillId===8).sourceRef='OTHER_SOURCE'
  ]){const r=withoutSummary();change(r);const a=project(r);assert.equal(a.channels.maximum.diagnostics.ignoredSkillEffects.filter(x=>x.skillId===8).length,0);assert.equal(a.channels.maximum.diagnostics.ignoredSkillEffects.filter(x=>x.skillId===103).length,1);}
  for(const change of [r=>r.channels.maximum.execution.status='partial',r=>r.routes.H.channels.maximum.execution.status='partial',r=>r.channels.maximum.metrics.comboTotalDamage.value=null]){const r=withoutSummary();change(r);assert.deepEqual(project(r),r);}
  assert.deepEqual(project(donor),donor,'duplicate projection must be idempotent');
  capture([[8,3],[103,2],[24,3]]);w.eval("buildName.value='cb-draw-A';saveNamedBuild();");capture([]);w.eval("buildName.value='cb-draw-B';saveNamedBuild();");
  const saved=w.eval('JSON.stringify(savedBuildMap())');w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
  assert.equal(w.eval('JSON.stringify(savedBuildMap())'),saved);
  const rows=clone(w.eval('lastBuildComparisonRows'));assert.equal(rows.length,2);
  const a=rows.find(x=>x.name==='cb-draw-A').oneHitPipeline;
  for(const id of [8,103]){assert.equal(a.channels.maximum.diagnostics.ignoredSkillEffects.filter(x=>x.skillId===id).length,1);assert.equal((a.channels.normal.diagnostics.ignoredSkillEffects||[]).filter(x=>x.skillId===id).length,0);}
  assert.deepEqual(errors,[]);
 }finally{w.close();}
});
