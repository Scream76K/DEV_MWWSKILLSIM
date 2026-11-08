'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'work/input');
const snapshot=__dirname;
const adapterFile=path.join(root,'hope-hammer-browser-adapter.js');
const report={runId:process.env.COMBINED_RUN_ID||crypto.randomUUID(),root,adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(adapterFile)).digest('hex'),cases:[],status:'RUNNING',numericGameAccuracyVerified:false};
const out=process.env.REPORT_FILE||path.join(__dirname,'charge-master-summary.json');
fs.writeFileSync(out,JSON.stringify(report,null,2));
require('./verify-combined.cjs').verifyCombined();
const {JSDOM,VirtualConsole}=require('jsdom');
const raw=JSON.parse(fs.readFileSync(snapshot+'/work/harness/skill-sources/raw-skills.json'));
const dbBytes=fs.readFileSync(root+'/normalized-data.json');
const selected=require('./work/harness/skill-plan.cjs').makePlan(require('./work/harness/skill-sources/classification.candidate.json'),raw,JSON.parse(dbBytes)).weapons;
const selectedId=kind=>{const w=selected.find(w=>w.kind===kind);assert.ok(w,'Missing pinned selection '+kind);return w.id;};
const clone=x=>structuredClone(x), clean=x=>JSON.parse(JSON.stringify(x));
function compareChannels(a,b){for(const ch of ['normal','maximum']){assert.equal(a.channels[ch].metrics.comboTotalDamage.status,'available',ch+': '+a.channels[ch].metrics.comboTotalDamage.reason);assert.equal(a.channels[ch].execution.status,'complete');assert.deepEqual(a.channels[ch].components.map(x=>[x.id,x.status,x.value]),b.channels[ch].components.map(x=>[x.id,x.status,x.value]));assert.equal(a.channels[ch].metrics.comboTotalDamage.value,b.channels[ch].metrics.comboTotalDamage.value);}}
function hasPending(r){return JSON.stringify(r).includes('チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING')||JSON.stringify(r).includes('Charge Master:CONDITIONAL_DAMAGE_FORMULA_PENDING');}
async function setup(kind,id){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://charge-zero.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
 const w=dom.window;if(w.__localDBReady)await w.__localDBReady;
 let lastInput=null,adapterCalls=0,pipelineCalls=0;const original=w.MHWRealOneHitBrowserAdapter,factory=w.HimmelRealOneHitPipeline;w.eval(fs.readFileSync(snapshot+'/baseline-adapter.js','utf8'));const frozenAdapter=w.MHWRealOneHitBrowserAdapter;
 w.MHWRealOneHitBrowserAdapter={...original,evaluateCurrent(a){lastInput=a;adapterCalls++;return original.evaluateCurrent(a);}};
 w.HimmelRealOneHitPipeline=function(...args){const p=factory(...args);return {...p,evaluate(...args){pipelineCalls++;return p.evaluate(...args);}};};
 w.__testData=JSON.parse(dbBytes);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 w.eval(`build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();weaponKind.value=${JSON.stringify(kind==='sword-shield'?'sword-and-shield':kind)};renderWeapon();weapon.value=${JSON.stringify(String(id))};syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
 const get=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));const saved=get('savedBuildMap()');
 function calc(grants=[]){w.__grants=grants;w.eval('build.charmCustom.skills=window.__grants;normalizeCharm();');w.calcBuild();w.calcBuild();return get('calcState.realOneHit');}
 function input(){const a=lastInput;return {...a,weapon:clone(a.weapon),stats:clone(a.stats),skills:clone(a.skills),conditions:clone(a.conditions),techniqueIds:clone(a.techniqueIds)};}
 return {w,original,frozenAdapter,calc,input,errors,close(){assert.deepEqual(errors,[]);assert.deepEqual(get('savedBuildMap()'),saved);assert.deepEqual(clean(w.__testData),JSON.parse(dbBytes));assert.ok(adapterCalls>0&&pipelineCalls>0);dom.window.close();}};
}
function record(key,fn){try{const detail=fn();report.cases.push({key,status:'PASS',detail});console.log('PASS '+key);}catch(e){report.cases.push({key,status:'FAIL',error:e.stack});console.log('FAIL '+key+': '+e.message);}}
(async()=>{
 for(const kind of ['long-sword','sword-shield','dual-blades','lance']){const id=selectedId(kind);
  const c=await setup(kind,id),baseline=c.calc();
  for(const level of [1,2,3])record(kind+':'+level,()=>{const active=c.calc([{name:'チャージマスター',level,type:'weapon'}]);compareChannels(active,baseline);assert.equal(hasPending(active),false);return {normal:active.channels.normal.metrics.comboTotalDamage.value,maximum:active.channels.maximum.metrics.comboTotalDamage.value};});
  compareChannels(c.calc(),baseline);c.close();
 }

 // Public adapter boundary probes use an actual UI-produced input; only the named
 // input field changes. No mock engine, formula, damage, or component producer.
 {
  const c=await setup('long-sword',selectedId('long-sword')),baseline=c.calc();c.calc([{name:'チャージマスター',level:1,type:'weapon'}]);const valid=c.input();
  const invoke=mutate=>{const a={...valid,weapon:clone(valid.weapon),stats:clone(valid.stats),skills:clone(valid.skills),conditions:clone(valid.conditions),techniqueIds:clone(valid.techniqueIds)};mutate(a);return clean(c.original.evaluateCurrent(a));};
  const blocked=(name,mutate,{mustKeepPending=true}={})=>record('guard:'+name,()=>{const r=invoke(mutate);assert.notEqual(r.channels?.maximum?.metrics?.comboTotalDamage?.status,'available');if(mustKeepPending&&!hasPending(r)){const a={...valid,weapon:clone(valid.weapon),stats:clone(valid.stats),skills:clone(valid.skills),conditions:clone(valid.conditions),techniqueIds:clone(valid.techniqueIds)};mutate(a);const prior=clean(c.frozenAdapter.evaluateCurrent(a));assert.deepEqual(r,prior,'Earlier guard must be identical to frozen baseline');}return {reason:r.reason??r.channels?.maximum?.execution?.reason};});
  for(const [name,mutate] of [
   ['unknown-element',a=>a.stats.elementKnown=false],['unknown-type',a=>a.stats.typeKnown=false],['missing-element-status',a=>delete a.stats.elementStatus],['null-element',a=>a.stats.element=null],['nan-element-base',a=>a.stats.elementComponents.weaponBase=NaN],['missing-element-components',a=>delete a.stats.elementComponents],
   ['max-unknown-element',a=>a.stats.conditionalConditionPlan.maximum.elementKnown=false],['normal-unknown-element',a=>a.stats.conditionalConditionPlan.normal.elementKnown=false],['max-nan-element',a=>a.stats.conditionalConditionPlan.maximum.element=NaN],['normal-positive-element',a=>a.stats.conditionalConditionPlan.normal.element=10],['maximum-positive-element',a=>a.stats.conditionalConditionPlan.maximum.element=10],
   ['normal-nan-base',a=>a.stats.conditionalConditionPlan.normal.elementComponents.weaponBase=NaN],['maximum-normal-flat',a=>a.stats.conditionalConditionPlan.maximum.elementComponents.normalFlat=30],['maximum-type-unknown',a=>a.stats.conditionalConditionPlan.maximum.typeKnown=false],['max-conditional-flat',a=>a.stats.conditionalConditionPlan.maximumElementComponents.conditionalFlat=20],['max-normal-flat',a=>a.stats.conditionalConditionPlan.maximumElementComponents.normalFlat=20],['normal-flat',a=>a.stats.elementComponents.normalFlat=20],['max-base',a=>a.stats.conditionalConditionPlan.maximumElementComponents.weaponBase=20],['nan-multiplier',a=>a.stats.conditionalConditionPlan.maximumElementComponents.normalMultiplier=NaN],['missing-max-flat',a=>delete a.stats.conditionalConditionPlan.maximumElementComponents.conditionalFlat],
   ['cooking-max-add',a=>a.stats.conditionalConditionPlan.selfStatePlan.maximum.push({skillId:174,elementAdd:30})],['cooking-normal-add',a=>a.stats.conditionalConditionPlan.selfStatePlan.normal.push({skillId:174,elementAdd:30})],['cooking-nan-add',a=>a.stats.conditionalConditionPlan.selfStatePlan.maximum.push({skillId:174,elementAdd:NaN})],['group-element-add',a=>a.stats.conditionalConditionPlan.groupPlan.applied.push({skill:'mock-element-grant',elementAdd:30})],['conditional-element-add',a=>a.stats.conditionalConditionPlan.applied.push({skill:'mock-element-grant',elementAdd:30})],['absorption-skill',a=>a.skills.push(['属性吸収',1])],
   ['bonus-activation',a=>a.stats.activeBonusEffects.push({name:'巨戟龍の黙示録',bonusSkillId:178})],['unknown-bonus-list',a=>delete a.stats.activeBonusEffects],['phial-not-null',a=>a.weapon.phial={kind:'dragon'}],
   ['level-zero',a=>a.skills=[['チャージマスター',0]]],['level-four',a=>a.skills=[['チャージマスター',4]]],['level-fraction',a=>a.skills=[['チャージマスター',1.5]]],['duplicate-name-grants',a=>a.skills.push(['チャージマスター',1])],
   ['mismatched-id',a=>{a.weapon.skills=[{skill:{id:3,name:'チャージマスター'},level:1}];}],['mismatched-name',a=>{a.weapon.skills=[{skill:{id:24,name:'攻撃'},level:1}];}],['duplicate-id-raw',a=>{a.weapon.skills=[{skill:{id:24,name:'チャージマスター'},level:1},{skill:{id:24,name:'Charge Master'},level:1}];}],['conflicting-level-alias',a=>{a.weapon.skills=[{skill:{id:24,name:'Charge Master'},level:2}];}],
  ])blocked(name,mutate);
  blocked('weapon-specials-unknown',a=>delete a.weapon.specials,{mustKeepPending:false});
  blocked('unknown-special',a=>a.weapon.specials=[{kind:'unknown'}],{mustKeepPending:false});
  record('valid-innate-plus-aggregate',()=>{const r=invoke(a=>{a.weapon.skills=[{skill:{id:24,name:'チャージマスター'},level:1}];});compareChannels(r,baseline);assert.equal(hasPending(r),false);});
  record('valid-canonical-alias-with-id',()=>{const r=invoke(a=>{a.weapon.skills=[{skill:{id:24,name:'Charge Master'},level:1}];});compareChannels(r,baseline);assert.equal(hasPending(r),false);});
  for(const field of ['maxElement','maximumElement'])record('nonconsumed-display-field:'+field,()=>{const r=invoke(a=>{a.stats[field]=300;});compareChannels(r,baseline);});
  record('retains-unrelated-pending',()=>{const r=invoke(a=>a.stats.conditionalConditionPlan.pending.push('SENTINEL_UNRELATED_UNRESOLVED'));assert.notEqual(r.channels?.maximum?.metrics?.comboTotalDamage?.status,'available');assert.ok(JSON.stringify(r).includes('SENTINEL_UNRELATED_UNRESOLVED'));assert.equal(hasPending(r),false);});
  record('retains-other-damage-skill',()=>{const a=c.calc([{name:'チャージマスター',level:1,type:'weapon'},{name:'攻撃',level:1,type:'weapon'}]);const b=c.calc([{name:'攻撃',level:1,type:'weapon'}]);compareChannels(a,b);assert.ok(a.channels.maximum.metrics.comboTotalDamage.value>baseline.channels.maximum.metrics.comboTotalDamage.value);});
  record('retains-dark-unresolved',()=>{const r=c.calc([{name:'チャージマスター',level:1,type:'weapon'},{name:'暗黒',level:1,type:'weapon'}]);assert.notEqual(r.channels?.maximum?.metrics?.comboTotalDamage?.status,'available');assert.ok(JSON.stringify(r).includes('暗黒:DARK_WEAPON_UNRESOLVED'));});


  // Alternate state stats must not substitute positive/unknown element after
  // the ordinary normalized element proof. This previously escaped the guard.
  for(const stateCase of ['hit-state','hit-state-only','record-transition','record-transition-only','implicit-hp-state','conditions-state-map','selected-bundle-state-map'])blocked('alternate-state:'+stateCase,a=>{
   a.conditions.damageStatsState='INJECTED';a.conditions.stateStatsByState={INJECTED:{attack:200,element:100,affinity:0},TRIPLE_EXTRACT:{attack:200,element:100,affinity:0}};
   if(stateCase.endsWith('-only')){delete a.conditions.damageStatsState;delete a.conditions.stateStatsByState;}
   if(stateCase==='selected-bundle-state-map'){delete a.conditions.damageStatsState;delete a.conditions.stateStatsByState;a.longSwordState={...a.longSwordState,damageStatsState:'INJECTED',stateStatsByState:{INJECTED:{attack:200,element:100,affinity:0}}};}
   const old=a.techniqueDb;a.techniqueDb={...old,get(...args){const t=old.get(...args);if(!t||args[1]!=='LS_RED_BLADE_I')return t;const copy=clone(t);
    if(stateCase==='hit-state'||stateCase==='hit-state-only'||stateCase==='selected-bundle-state-map')copy.hits=copy.hits.map(h=>({...h,damageStatsState:'INJECTED'}));
    if(stateCase==='record-transition'||stateCase==='record-transition-only')copy.damageStateTransition={requiredAtActivation:'PREACTIVATED',damageStatsState:'INJECTED'};
    if(stateCase==='implicit-hp-state'){copy.techniqueId='IG_ENHANCED_DIAGONAL_SLASH';copy.hpOnlyProvisional='IG_ENHANCED_DIAGONAL_SLASH_20261025';copy.numericStatus='SOURCE_CONFIRMED';copy.verificationStatus='PARTIALLY_VERIFIED';a.conditions.damageStatsState='TRIPLE_EXTRACT';}
    return copy;
   }};
  });
  for(const name of ['special-component','generated-body-hit','reference-kind','unadopted-body'])blocked('technique:'+name,a=>{if(name==='unadopted-body')a.techniqueIds[0]='UNKNOWN_TECHNIQUE';const originalDb=a.techniqueDb;a.techniqueDb={...originalDb,get(kind,id){const t=originalDb.get(kind,id);if(id!=='LS_RED_BLADE_I'||!t)return t;const patched=clone(t);if(name==='special-component')patched.specialComponents=['UNKNOWN_ELEMENT'];if(name==='generated-body-hit')patched.hits[0].componentSource='INDEPENDENT_GENERATED_ELEMENT';if(name==='reference-kind')patched.referenceKind='unknown-reference';if(name==='unadopted-body'){a.techniqueIds[0]='UNKNOWN_TECHNIQUE';}return patched;}};});
  c.close();
 }
 const cases=require('./charge-plan.cjs').makeChargePlan(JSON.parse(dbBytes),require('./work/harness/skill-sources/classification.candidate.json'),raw).cases;
 for(const previous of cases.filter(x=>x.caseType!=='ORIGINAL_UNRESOLVED_CHARGE_MASTER'||['hunting-horn','gunlance','switch-axe','charge-blade'].includes(x.kind)&&x.level===1)){
  const c=await setup(previous.kind,previous.weapon.id),baseline=c.calc(),active=c.calc([{name:'チャージマスター',level:1,type:'weapon'}]);
  record('unchanged:'+previous.key,()=>{for(const ch of ['normal','maximum']){const old=clean(c.frozenAdapter.evaluateCurrent(c.input())).channels[ch],actual=active.channels[ch];assert.deepEqual(actual.metrics.comboTotalDamage,old.metrics.comboTotalDamage);assert.deepEqual(actual.execution,old.execution);assert.deepEqual(actual.components,old.components);}return {reason:active.channels.maximum.execution.reason??null};});
  c.close();
 }

 const allWeapons=JSON.parse(dbBytes).weapons;
 for(const kind of ['great-sword','hammer','insect-glaive','bow']){
  const weapon=allWeapons.filter(x=>x.kind===kind&&(x.specials||[]).some(z=>z.kind==='element'&&z.hidden===false&&z.damage?.raw>0)&&!(x.skills||[]).some(x=>x.skill?.id===24)).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];
  const c=await setup(kind,weapon.id);
  for(const level of [1,2,3])record('elemental-adoption-unchanged:'+kind+':'+level,()=>{const r=c.calc([{name:'チャージマスター',level,type:'weapon'}]);const prior=clean(c.frozenAdapter.evaluateCurrent(c.input()));assert.deepEqual(r.channels,prior.channels);for(const ch of ['normal','maximum'])assert.equal(r.channels[ch].metrics.comboTotalDamage.status,'available');return {weaponId:weapon.id,maximum:r.channels.maximum.metrics.comboTotalDamage.value};});
  c.close();
 }
 for(const kind of ['long-sword','sword-shield','dual-blades','lance']){
  const weapon=allWeapons.filter(x=>x.kind===kind&&(x.specials||[]).some(z=>z.kind==='status'&&z.hidden===false&&z.damage?.raw>0)&&!(x.skills||[]).some(x=>x.skill?.id===24)).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0];
  if(!weapon)throw Error('Missing real status control '+kind);
  const c=await setup(kind,weapon.id);record('status-stays-pending:'+kind,()=>{const r=c.calc([{name:'チャージマスター',level:1,type:'weapon'}]);assert.equal(hasPending(r),true);const prior=clean(c.frozenAdapter.evaluateCurrent(c.input()));assert.deepEqual(r.channels,prior.channels);return {weaponId:weapon.id};});c.close();
 }
 // Source database and fixed runner are read-only inputs to this separate test.
 assert.equal(fs.readFileSync(root+'/normalized-data.json','utf8'),dbBytes.toString());
 assert.equal(report.cases.length,96,'Expected all 96 Charge Master cases');
 report.status=report.cases.every(x=>x.status==='PASS')?'PASS':'FAIL';report.counts={passed:report.cases.filter(x=>x.status==='PASS').length,failed:report.cases.filter(x=>x.status==='FAIL').length};fs.writeFileSync(out,JSON.stringify(report,null,2));process.exitCode=report.status==='PASS'?0:1;
})().catch(e=>{report.status='HARNESS_FAILURE';report.error=e.stack;fs.writeFileSync(out,JSON.stringify(report,null,2));console.error(e);process.exitCode=2;});
