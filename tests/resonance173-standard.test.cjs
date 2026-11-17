'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom'),fixture=require('./fixtures/resonance173-inputs.json');
test('source-proven inactive Resonance is excluded only in fixed Artia GL/LBG standard',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://resonance.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(JSON.stringify(x));}}).window;
 const adapter=w.MHWRealOneHitBrowserAdapter,contexts=[];
 w.MHWRealOneHitBrowserAdapter={...adapter,...Object.fromEntries(['evaluateCurrent','evaluateRapidFiveShot'].map(k=>[k,i=>{contexts.push({k,i});return adapter[k](i);}]))};
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),clone=x=>JSON.parse(JSON.stringify(x)),results=[];
 try{
 const data=clone(require('./fixtures/offset-maximum-inputs.json').data);data.armor=data.armor.filter(x=>!fixture.armor.some(y=>y.id===x.id)).concat(fixture.armor);data.skills=data.skills.filter(x=>x.id!==173).concat(fixture.skills);w.__data=data;
 w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 for(const base of fixture.inputs)for(const count of [0,2,4,0]){
 if(count===0){w.localStorage.removeItem('mh-wilds-builds-v625');w.eval('renderSavedBuilds()');}const s=clone(base);if(s.combo.lightBowgunState)Object.assign(s.combo.lightBowgunState,{normalPowder:'NONE',elementPowder:'NONE',rapidMagazine:'NONE',specialMagazine:'NONE'});s.armor=Object.fromEntries([['head',640],['chest',641],['arms',642],['waist',643]].slice(0,count));contexts.length=0;w.applyBuildSnapshot(s);w.document.getElementById('calcBuild').click();const r=read('currentConsumerCalculation()');results.push({weapon:s.weaponId,count,r,context:JSON.parse(JSON.stringify(contexts[0]))});
 if(process.env.CAPTURE_ONLY)continue;
 // Owner SLAM1 removes one old native coefficient. Four pieces attach Burst1:
 // maximum element440+60; normal and two-piece maximum remain440. No critical element.
 for(const ch of ['normal','maximum']){const c=r.channels[ch];assert.equal(c.metrics.comboTotalDamage.status,'available');assert.equal(c.execution.status,'complete');if(count){const expected=s.weaponId==='1151'?(count===4&&ch==='maximum'?1566.0250368-(440+60)/10*.3*1.15:1459.23594-440/10*.3*1.15):(count===4&&ch==='maximum'?745.9515:707.42525);assert.ok(Math.abs(c.metrics.comboTotalDamage.value-expected)<1e-8,JSON.stringify({weapon:s.weaponId,count,ch,actual:c.metrics.comboTotalDamage.value,expected}));}const rows=(c.diagnostics.excludedCalculationSkills||[]).filter(x=>x.skillId===173);assert.equal(rows.length,count?1:0);if(count){assert.equal(rows[0].status,'NOT_APPLICABLE');assert.equal(rows[0].reason,'RESONANCE_FIXED_STANDARD_OWNER_EXCLUDED');}assert.ok(!(c.diagnostics.ignoredSkillEffects||[]).some(x=>/レゾナンス/.test(x.name||x.reason||'')));}
 if(count){
 const {k,i}=contexts[0];
 for(const mutate of [
  c=>{c.conditions.standardEvaluation=false;},c=>{c.conditions.standardSoloPolicy=false;},c=>{c.conditions.selfSkillState.shared.omega='FAR';},
  c=>{c.weapon.name='FORGED';},c=>{c.stats.armorThunderResistanceInput.rows[0].id=9999;},c=>{c.stats.armorThunderResistanceInput.rows[0].equipped=false;c.stats.armorThunderResistanceInput.rows[0].id=null;c.stats.armorThunderResistanceInput.rows[0].value=0;} ,c=>{c.stats.activeBonusEffects[0].count=1;},c=>{c.stats.activeBonusEffects[0].name='FORGED';},
  c=>{c.stats.conditionalConditionPlan.selfStatePlan.maximum.find(x=>x.skillId===173).attackAdd=99;},
  c=>{c.techniqueIds=['CUSTOM'];}
 ]){
 const c={...i,weapon:clone(i.weapon),stats:clone(i.stats),skills:clone(i.skills),conditions:clone(i.conditions),techniqueIds:clone(i.techniqueIds)};mutate(c);const bad=adapter[k](c);
 assert.ok(!JSON.stringify(bad).includes('RESONANCE_FIXED_STANDARD_OWNER_EXCLUDED'),'invalid/source/out-of-scope input must not gain exclusion');
 }
 // Preserve a different unresolved self-state instead of swallowing the whole plan.
 const c={...i,stats:clone(i.stats)};c.stats.conditionalConditionPlan.selfStatePlan.pending.push('maximum:OTHER_PENDING_CONTROL');const other=adapter[k](c);assert.ok(JSON.stringify(other).includes('OTHER_PENDING_CONTROL'));
 }
 if(count){w.document.getElementById('buildName').value='Resonance-'+s.weaponId+'-'+count;w.document.getElementById('saveBuild').click();if(count===2)continue;w.document.getElementById('selectAllCompare').click();w.document.getElementById('runCompare').click();const saved=read('createBuildComparisonReport()').results.find(x=>x.name==='Resonance-'+s.weaponId+'-'+count);assert.deepEqual(saved.oneHitPipeline.channels,r.channels);}
 }
 if(process.env.OUTPUT)fs.writeFileSync(process.env.OUTPUT,JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);
 }finally{w.close();}
});
