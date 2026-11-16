'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
test('ID159 Artia standard is explicitly non-target; saved A/B and separate pending routes are preserved',()=>{
 const f=require('./fixtures/id159-artia-source-inputs.json'),vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://corn-scope.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{
 w.__data={...require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data,...require('./fixtures/offset-maximum-inputs.json').data};
 w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(x){captured=x;return adapter.evaluateCurrent(x)}};
 const run=s=>{w.applyBuildSnapshot(structuredClone(s));w.document.getElementById('calcBuild').click();return read('currentConsumerCalculation()')};
 const base=run(f.input),s=structuredClone(f.input);s.charmCustom.skills=[{name:'焼き砲モロコシ',level:1,type:'weapon'}];const withSkill=run(s);
 for(const ch of ['normal','maximum']){
 const a=base.channels[ch],b=withSkill.channels[ch];
 for(const k of ['components','execution','finalState'])assert.deepEqual(b[k],a[k],ch+':'+k);
 assert.equal(b.metrics.comboTotalDamage.value,a.metrics.comboTotalDamage.value);
 assert.ok(Math.abs(a.metrics.comboTotalDamage.value-1450.03308)<1e-8);
 assert.ok((b.diagnostics.excludedCalculationSkills||[]).some(x=>x.skillId===159&&x.status==='NOT_APPLICABLE'&&x.reason==='CORNPOPPER_ARTIA_STANDARD_NOT_APPLICABLE'));
 assert.ok(!(b.diagnostics.ignoredSkillEffects||[]).some(x=>x.skillId===159));
 }
 for(const [name,input,expected] of [['ID159-A',f.input,base],['ID159-B',s,withSkill]]){run(input);w.document.getElementById('buildName').value=name;w.document.getElementById('saveBuild').click();}
 w.document.getElementById('selectAllCompare').click();w.document.getElementById('runCompare').click();
 const report=read('createBuildComparisonReport()');
 for(const [name,expected] of [['ID159-A',base],['ID159-B',withSkill]])assert.deepEqual(report.results.find(x=>x.name===name).oneHitPipeline.channels,expected.channels);
 run(s);
 const saved=read('buildSnapshot()');assert.deepEqual(run(saved),withSkill);assert.deepEqual(run(f.input),base);
 run(s);
 for(const change of [{conditions:{...captured.conditions,standardEvaluation:false}},{weapon:{...captured.weapon,id:999999}},{weapon:{...captured.weapon,name:'forged'}}]){
 const outside=adapter.evaluateCurrent({...captured,...change});assert.ok(JSON.stringify(outside).includes('CORNPOPPER_TECHNIQUE_NOT_ADOPTED'));
 }
 const stats=structuredClone(captured.stats);stats.conditionalConditionPlan.pending.push('INDEPENDENT_PENDING_ID159_TEST');assert.ok(JSON.stringify(adapter.evaluateCurrent({...captured,stats})).includes('INDEPENDENT_PENDING_ID159_TEST'));
 assert.deepEqual(errors,[]);
 }finally{w.close()}
});
