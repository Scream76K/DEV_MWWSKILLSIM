'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),{JSDOM,VirtualConsole}=require('jsdom');
const f=require('./fixtures/dark172-bow-standard.json'),clone=x=>JSON.parse(JSON.stringify(x));
test('ID172 rank1 fixed Bow standard multiplies only native element in low-HP maximum',()=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://dark172-bow.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(x){captured=x;return adapter.evaluateCurrent(x);}};
 const run=input=>{w.applyBuildSnapshot(clone(input));w.document.getElementById('calcBuild').click();return JSON.parse(w.eval('JSON.stringify(currentConsumerCalculation())'));};
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
 try{w.__data=f.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const full=run({...f.input,selectedHp:'FULL_HP'}),low=run(f.input),direct=captured;
 if(process.env.CAPTURE)fs.writeFileSync(process.env.CAPTURE,JSON.stringify({direct,full,low},null,2));
 for(const [hp,result] of [['FULL_HP',full],['AT_OR_BELOW_30_PERCENT',low]])for(const ch of ['normal','maximum']){const a=f.expectedBefore[hp][ch],b=result.channels[ch],mult=hp==='AT_OR_BELOW_30_PERCENT'&&ch==='maximum'?1.14:1;assert.equal(b.execution.status,'complete');assert.equal(b.components.length,3);assert.deepEqual(b.finalState,a.finalState);let count=0;for(let i=0;i<3;i++){assert.equal(b.components[i].id,a.components[i].id);const old=f.referenceBefore[hp][(ch==='maximum'?3:0)+i].original;near(b.components[i].value,old.physical+old.element*mult);const d=b.components[i].details;assert.equal(d.elementBasis.capLimit,630);assert.equal(d.elementBasis.capBase,230);near(d.effectiveDisplayedElement,230*mult);assert.equal(d.special??0,0);assert.equal(d.trace.length,[3,5,6][i]);for(let j=0;j<d.trace.length;j++){count++;assert.equal(d.trace[j].techniqueId,old.trace[j].techniqueId);assert.equal(d.trace[j].hit,old.trace[j].hit);near(d.trace[j].physical,old.trace[j].physical);near(d.trace[j].element,old.trace[j].element*mult);}}assert.equal(count,14);}
 near(low.channels.maximum.metrics.comboTotalDamage.value,656.5194);

 const applied=r=>JSON.stringify(r).includes('dark-arts-body-element-multiplier')||!!r.channels?.maximum?.components?.some(c=>c.details?.elementBasis?.normalMultiplier===1.14);assert.equal(applied(low),true);assert.equal(applied(full),false);
 for(const mutation of [x=>{x.conditions.standardEvaluation=false},x=>{x.conditions.mounted=true},x=>{x.conditions.bowState.coating='POWER'},x=>{x.conditions.bowState.chargeLevel=2},x=>{x.techniqueIds=['BOW_SHOT_1'];x.techniqueId='BOW_SHOT_1'},x=>{x.weapon.id=999999},x=>{x.weapon.name='forged'},x=>{x.stats.elementComponents.weaponBase=300}]){
  const bad={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};mutation(bad);assert.equal(applied(adapter.evaluateCurrent(bad)),false,'out-of-scope input must not receive passive bonus');
 }
 for(const change of [{rankLevel:2,name:'ブラックナイト',required:4,count:4},{rankLevel:9},{count:4},{required:3},{bonusSkillId:999},{source:'group'},{name:'forged'}]){
  const bad={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};Object.assign(bad.stats.activeBonusEffects.find(e=>e.bonusSkillId===172),change);bad.stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(bad.stats,Object.fromEntries(bad.skills),'bow',bad.conditions,bad.weapon);assert.equal(applied(adapter.evaluateCurrent(bad)),false,'malformed/rank2 not adopted');
 }
 const duplicate={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};duplicate.stats.activeBonusEffects.push(clone(duplicate.stats.activeBonusEffects.find(e=>e.bonusSkillId===172)));duplicate.stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(duplicate.stats,Object.fromEntries(duplicate.skills),'bow',duplicate.conditions,duplicate.weapon);assert.equal(applied(adapter.evaluateCurrent(duplicate)),false,'duplicate is not adopted');
 const altered={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};altered.stats.conditionalConditionPlan.groupPlan.applied.find(x=>x.skill==='ダークアーツ').elementMultiplier=1.5;assert.equal(applied(adapter.evaluateCurrent(altered)),false,'wrong coefficient must not be adopted');
 for(const edit of [p=>{p.maximum.element+=10},p=>{p.maximumElementComponents.normalMultiplier=1.5}]){const bad={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};edit(bad.stats.conditionalConditionPlan);assert.equal(applied(adapter.evaluateCurrent(bad)),false,'altered element projection rejected');}
 for(const edit of [t=>{t.hits[0].elementModifier=2},t=>{t.hits.push(clone(t.hits[0]))}]){const id=direct.techniqueIds[0],changed=clone(direct.techniqueDb.get('bow',id));edit(changed);const bad={...direct,techniqueDb:{...direct.techniqueDb,get:(kind,key)=>key===id?changed:direct.techniqueDb.get(kind,key)}};assert.equal(applied(adapter.evaluateCurrent(bad)),false,'same-ID altered canonical hit rejected');}
 const unrelated={...w.JSON.parse(w.JSON.stringify(direct)),techniqueDb:direct.techniqueDb};unrelated.stats.conditionalConditionPlan.pending.push('UNRELATED_ID172_NEGATIVE_PENDING');assert.ok(JSON.stringify(adapter.evaluateCurrent(unrelated)).includes('UNRELATED_ID172_NEGATIVE_PENDING'));
 // Named A/B round-trip: real save/load/compare controls, not only applying the input again.
 const snapshots={};
 for(const [name,input,expected] of [['ID172-BOW-A-low',f.input,low],['ID172-BOW-B-full',{...f.input,selectedHp:'FULL_HP'},full]]){
  assert.deepEqual(run(input),expected);snapshots[name]=w.eval('JSON.stringify(buildSnapshotComparable(buildSnapshot()))');w.document.getElementById('buildName').value=name;w.saveNamedBuild();
  const stored=JSON.parse(w.eval('localStorage.getItem(BUILDS_KEY)'));w.__stored=stored[name];assert.equal(w.eval('JSON.stringify(buildSnapshotComparable(__stored))'),snapshots[name]);
 }
 const storeBytes=w.eval('localStorage.getItem(BUILDS_KEY)');
 for(const [name,expected] of [['ID172-BOW-A-low',low],['ID172-BOW-B-full',full],['ID172-BOW-A-low',low]]){
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
 const custom=clone(f.input);custom.combo.moves=direct.techniqueIds.map(id=>({techniqueId:'canonical:'+id}));const cr=run(custom);for(const ch of ['normal','maximum'])assert.ok(Number.isFinite(cr.channels?.[ch]?.metrics?.comboTotalDamage?.value));assert.equal(applied(cr),false);assert.ok(JSON.stringify(cr).includes('ダークアーツ'));
 // Genuine CM jewels; conditional multipliers and distinct conversion pending stay independent.
 const cm=clone(f.input);cm.decos={w0:14,w1:14,w2:14};const cmResult=run(cm);near(cmResult.channels.maximum.metrics.comboTotalDamage.value,671.8581);
 const coal=clone(cm);coal.charmCustom.skills=[{name:'災禍転福',level:1,type:'armor'}];const coalResult=run(coal);near(coalResult.channels.maximum.metrics.comboTotalDamage.value,677.737935);
 for(const [x,r,m] of [[cm,cmResult,1],[coal,coalResult,1.05]])for(const ch of ['normal','maximum']){const trace=r.channels[ch].components.flatMap(c=>c.details.trace);const factor=ch==='maximum'?1.14*m:1;near(trace.reduce((n,h)=>n+h.element,0),89.7*factor*1.15);near(trace.reduce((n,h)=>n+h.physical,0),ch==='maximum'?554.2614:480.35988);}
 const water=clone(cm);water.charmCustom.skills=[{name:'耐性変換【水】',level:1,type:'group'},{name:'水耐性',level:3,type:'armor'}];const wrong=run(water);near(wrong.channels.maximum.metrics.comboTotalDamage.value,671.8581);assert.match(JSON.stringify(wrong),/WATER_CONVERSION_SCOPE_UNSUPPORTED/);
 water.artia.element='water';const waterResult=run(water);near(waterResult.channels.maximum.metrics.comboTotalDamage.value,688.6164);assert.equal(applied(waterResult),false);assert.match(JSON.stringify(waterResult),/BONUS_DAMAGE_EFFECT_PENDING:ダークアーツ/);const wt=waterResult.channels.maximum.components.flatMap(c=>c.details.trace);near(wt.reduce((n,h)=>n+h.element,0),(230*1.15+80)/10*13*.3);near(wt.reduce((n,h)=>n+h.physical,0),554.2614);
 // Isolated reference cap probe is not an additional adopted equipment scenario.
 const capOptions=clone(f.referenceBefore.AT_OR_BELOW_30_PERCENT[3].optionsAfter);capOptions.skills.chargeMaster=3;capOptions.elementBasis={weaponBase:230,normalMultiplier:3,normalFlat:10,conditionalFlat:20,capLimit:629};capOptions.element=629;const capped=w.BowReference.technique(capOptions,w.TechniqueDBEngine,'BOW_SHOT_3');assert.equal(capped.effectiveDisplayedElement,629);assert.equal(capped.special,0);
 const fire=clone(f.input);fire.artia.element='fire';const fireResult=run(fire);for(const ch of ['normal','maximum'])assert.ok(Number.isFinite(fireResult.channels?.[ch]?.metrics?.comboTotalDamage?.value));assert.equal(applied(fireResult),false);assert.ok(JSON.stringify(fireResult).includes('ダークアーツ'));assert.deepEqual(errors,[]);
 }finally{w.close();}
});
