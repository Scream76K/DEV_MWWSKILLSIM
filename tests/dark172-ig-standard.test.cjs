'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const f=require('./fixtures/dark172-ig-standard.json'),clone=x=>JSON.parse(JSON.stringify(x));
test('ID172 rank1 fixed IG standard multiplies only native element in low-HP maximum',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://dark172-ig.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(x){captured=x;return adapter.evaluateCurrent(x);}};
 const run=input=>{w.applyBuildSnapshot(clone(input));w.document.getElementById('calcBuild').click();return JSON.parse(w.eval('JSON.stringify(currentConsumerCalculation())'));};
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
 try{w.__data=f.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const full=run({...f.input,selectedHp:'FULL_HP'}),low=run(f.input),direct=captured;
 if(process.env.CAPTURE)fs.writeFileSync(process.env.CAPTURE,JSON.stringify({direct,full,low},null,2));
 for(const [hp,result] of [['FULL_HP',full],['AT_OR_BELOW_30_PERCENT',low]])for(const ch of ['normal','maximum']){const a=f.expectedBefore[hp][ch],b=result.channels[ch];assert.equal(b.execution.status,'complete');assert.equal(b.components.length,30);assert.deepEqual(b.finalState,a.finalState);for(let i=0;i<30;i++){assert.equal(b.components[i].id,a.components[i].id);near(b.components[i].value,a.components[i].value*(hp==='AT_OR_BELOW_30_PERCENT'&&ch==='maximum'&&b.components[i].id.includes(':element:')?1.14:1));}}
 near(low.channels.maximum.metrics.comboTotalDamage.value,1762.802316);assert.ok(!JSON.stringify(low).includes('BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ'));

 const applied=r=>JSON.stringify(r).includes('dark-arts-body-element-multiplier');
 for(const mutation of [x=>{x.conditions.standardEvaluation=false},x=>{x.conditions.mounted=true},x=>{x.conditions.insectGlaiveState.kinsectState='ACTIVE'},x=>{x.techniqueIds=['IG_SWEEP'];x.techniqueId='IG_SWEEP'},x=>{x.weapon.id=999999},x=>{x.weapon.name='forged'},x=>{x.stats.elementComponents.weaponBase=300}]){
  const bad={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};mutation(bad);assert.equal(applied(adapter.evaluateCurrent(bad)),false,'out-of-scope input must not receive passive bonus');
 }
 for(const change of [{rankLevel:2,name:'ブラックナイト',required:4,count:4},{rankLevel:9},{count:4},{required:3},{bonusSkillId:999},{source:'group'},{name:'forged'}]){
  const bad={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};Object.assign(bad.stats.activeBonusEffects.find(e=>e.bonusSkillId===172),change);bad.stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(bad.stats,Object.fromEntries(bad.skills),'insect-glaive',bad.conditions,bad.weapon);assert.equal(applied(adapter.evaluateCurrent(bad)),false,'malformed/rank2 not adopted');
 }
 const duplicate={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};duplicate.stats.activeBonusEffects.push(clone(duplicate.stats.activeBonusEffects.find(e=>e.bonusSkillId===172)));duplicate.stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(duplicate.stats,Object.fromEntries(duplicate.skills),'insect-glaive',duplicate.conditions,duplicate.weapon);assert.equal(applied(adapter.evaluateCurrent(duplicate)),false,'duplicate is not adopted');
 const altered={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};altered.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skill==='ダークアーツ').elementMultiplier=1.5;assert.equal(applied(adapter.evaluateCurrent(altered)),false,'wrong coefficient must not be adopted');
 for(const edit of [p=>{p.maximum.element+=10},p=>{p.maximumElementComponents.normalMultiplier=1.5}]){const bad={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};edit(bad.stats.conditionalConditionPlan);assert.equal(applied(adapter.evaluateCurrent(bad)),false,'altered element projection rejected');}
 for(const edit of [t=>{t.hits[0].elementModifier=2},t=>{t.hits.push(clone(t.hits[0]))}]){const id=direct.techniqueIds[0],changed=clone(direct.techniqueDb.get('insect-glaive',id));edit(changed);const bad={...direct,techniqueDb:{...direct.techniqueDb,get:(kind,key)=>key===id?changed:direct.techniqueDb.get(kind,key)}};assert.equal(applied(adapter.evaluateCurrent(bad)),false,'same-ID altered canonical hit rejected');}
 const unrelated={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};unrelated.stats.conditionalConditionPlan.pending.push('UNRELATED_ID172_NEGATIVE_PENDING');assert.ok(JSON.stringify(adapter.evaluateCurrent(unrelated)).includes('UNRELATED_ID172_NEGATIVE_PENDING'));
 // Named A/B round-trip: real save/load/compare controls, not only applying the input again.
 const snapshots={};
 for(const [name,input,expected] of [['ID172-IG-A-low',f.input,low],['ID172-IG-B-full',{...f.input,selectedHp:'FULL_HP'},full]]){
  assert.deepEqual(run(input),expected);snapshots[name]=w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))');w.document.getElementById('buildName').value=name;w.saveNamedBuild();
  const stored=JSON.parse(w.eval('localStorage.getItem(BUILDS_KEY)'));w.__stored=stored[name];assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(__stored))'),snapshots[name]);
 }
 const storeBytes=w.eval('localStorage.getItem(BUILDS_KEY)');
 for(const [name,expected] of [['ID172-IG-A-low',low],['ID172-IG-B-full',full],['ID172-IG-A-low',low]]){
  w.document.querySelector('[data-build-load="'+name+'"]').click();w.document.getElementById('calcBuild').click();
  assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))'),snapshots[name]);assert.deepEqual(JSON.parse(w.eval('JSON.stringify(currentConsumerCalculation())')),expected);assert.equal(w.eval('localStorage.getItem(BUILDS_KEY)'),storeBytes);
 }
 // Comparison deliberately uses one shared current HP setting for both saved rows.
 for(const [input,expected] of [[f.input,low],[{...f.input,selectedHp:'FULL_HP'},full]]){
  run(input);const beforeCompare=w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))');
  w.document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);w.runBuildCompare();
  const compared=JSON.parse(w.eval('JSON.stringify(lastBuildComparisonRows.map(x=>({name:x.name,real:x.oneHitPipeline})))'));assert.equal(compared.length,2);
  for(const row of compared)for(const ch of ['normal','maximum'])assert.deepEqual(row.real.channels[ch],expected.channels[ch]);
  assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))'),beforeCompare);assert.equal(w.eval('localStorage.getItem(BUILDS_KEY)'),storeBytes);assert.deepEqual(JSON.parse(w.eval('JSON.stringify(currentConsumerCalculation())')),expected);
 }
 // Genuine equipment on explicit/custom routes keeps a finite partial result, not a hard stop.
 const custom=clone(f.input);custom.combo.moves=direct.techniqueIds.map(id=>({techniqueId:'canonical:'+id}));custom.combo.insectGlaiveState={extractState:'TRIPLE_EXTRACT',kinsectState:'STOWED'};
 const customResult=run(custom);for(const ch of ['normal','maximum'])assert.ok(Number.isFinite(customResult.channels?.[ch]?.metrics?.comboTotalDamage?.value),'public outside-scope remains finite');
 assert.equal(applied(customResult),false);assert.ok(JSON.stringify(customResult).includes('ダークアーツ'));
 const fire=clone(f.input);fire.artia.element='fire';const fireResult=run(fire);for(const ch of ['normal','maximum'])assert.ok(Number.isFinite(fireResult.channels?.[ch]?.metrics?.comboTotalDamage?.value));assert.equal(applied(fireResult),false);assert.ok(JSON.stringify(fireResult).includes('ダークアーツ'));assert.deepEqual(errors,[]);
 }finally{w.close();}
});
