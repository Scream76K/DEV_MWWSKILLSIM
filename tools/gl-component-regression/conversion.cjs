'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
require('./verify-combined.cjs').verifyCombined();
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'work/input');
const snapshot=__dirname;
const adapterFile=path.join(root,'hope-hammer-browser-adapter.js');
const report={runId:process.env.SCOPE_RUN_ID||crypto.randomUUID(),root,adapterSha256:crypto.createHash('sha256').update(fs.readFileSync(adapterFile)).digest('hex'),cases:[],status:'RUNNING',numericGameAccuracyVerified:false};
const out=process.env.REPORT_FILE||path.join(__dirname,'regression-summary.json');
fs.writeFileSync(out,JSON.stringify(report,null,2));
const raw=JSON.parse(fs.readFileSync(snapshot+'/work/harness/skill-sources/raw-skills.json'));
const dbBytes=fs.readFileSync(root+'/normalized-data.json');
const clone=x=>structuredClone(x), clean=x=>JSON.parse(JSON.stringify(x));
function compareChannels(a,b){for(const ch of ['normal','maximum']){assert.equal(a.channels[ch].metrics.comboTotalDamage.status,'available',ch+': '+a.channels[ch].metrics.comboTotalDamage.reason);assert.equal(a.channels[ch].execution.status,'complete');assert.deepEqual(a.channels[ch].components.map(x=>[x.id,x.status,x.value]),b.channels[ch].components.map(x=>[x.id,x.status,x.value]));assert.equal(a.channels[ch].metrics.comboTotalDamage.value,b.channels[ch].metrics.comboTotalDamage.value);}}
function hasPending(r){return JSON.stringify(r).includes('チャージマスター:CONDITIONAL_DAMAGE_FORMULA_PENDING')||JSON.stringify(r).includes('Charge Master:CONDITIONAL_DAMAGE_FORMULA_PENDING');}
async function setup(kind,id){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://conversion-zero.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
 const w=dom.window;if(w.__localDBReady)await w.__localDBReady;
 let lastInput=null,adapterCalls=0,pipelineCalls=0;const original=w.MHWRealOneHitBrowserAdapter,factory=w.HimmelRealOneHitPipeline;w.eval(fs.readFileSync(snapshot+'/scope-baseline-adapter.js','utf8'));const frozenAdapter=w.MHWRealOneHitBrowserAdapter;
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

const targetName=element=>element==='water'?'耐性変換【水】':'耐性変換【雷】';
const grant=element=>({name:targetName(element),level:1,type:'weapon'});
const available=r=>r.channels?.maximum?.metrics?.comboTotalDamage?.status==='available';
function copyInput(a){return {...a,weapon:clone(a.weapon),stats:clone(a.stats),skills:clone(a.skills),conditions:clone(a.conditions),techniqueIds:clone(a.techniqueIds),bowState:clone(a.bowState),longSwordState:clone(a.longSwordState)};}
(async()=>{
 const db=JSON.parse(dbBytes),weapons=[...new Set(db.weapons.map(x=>x.kind))].map(kind=>db.weapons.filter(x=>x.kind===kind).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0]);
 const targeted=['great-sword','long-sword','sword-shield','dual-blades','hammer','lance','bow'];
 for(const weapon of weapons){
  const c=await setup(weapon.kind,weapon.id),baseline=c.calc();
  for(const element of ['thunder','water'])record('original:'+element+':'+weapon.kind,()=>{
   const r=c.calc([grant(element)]),a=c.input(),prior=clean(c.frozenAdapter.evaluateCurrent(a));
   const isTarget=element==='thunder'?targeted.includes(weapon.kind):['long-sword','bow'].includes(weapon.kind);
   if(isTarget){compareChannels(r,baseline);for(const ch of ['normal','maximum'])assert.equal(r.channels[ch].diagnostics[element==='water'?'waterResistanceConversion':'thunderResistanceConversion'].zeroResistanceNoop?.reason,'ISOLATED_EMPTY_EQUIPMENT_ZERO_ADD');}
   else assert.deepEqual(r.channels,prior.channels);
   return {target:isTarget,weaponId:weapon.id,maximum:r.channels?.maximum?.metrics?.comboTotalDamage,reason:r.reason};
  });
  compareChannels(c.calc(),baseline);c.close();
 }
 for(const element of ['thunder','water']){
  const c=await setup('long-sword',JSON.parse(dbBytes).weapons.filter(w=>w.kind==='long-sword').sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id)[0].id),baseline=c.calc();c.calc([grant(element)]);const valid=c.input(),field=element+'ResistanceInput';
  const invoke=(mutate,adapter=c.original)=>{const a=copyInput(valid);mutate(a);return clean(adapter.evaluateCurrent(a));};
  const blocked=(name,mutate)=>record('guard:'+element+':'+name,()=>{const r=invoke(mutate);assert.equal(available(r),false);const old=invoke(mutate,c.frozenAdapter);assert.deepEqual(r.channels,old.channels);return {reason:r.reason||r.channels?.maximum?.execution?.reason};});
  const inputScopes=[['stats',a=>a.stats],['normal',a=>a.stats.conditionalConditionPlan.normal],['maximum',a=>a.stats.conditionalConditionPlan.maximum]];
  for(const [label,get] of inputScopes)for(const [name,mutate] of [
   ['missing',s=>delete s[field]],['unknown',s=>s[field].status='UNRESOLVED'],['positive',s=>s[field].total=5],['negative',s=>s[field].total=-1],['fraction',s=>s[field].total=.5],['nan',s=>s[field].total=NaN],['null',s=>s[field].total=null],['wrong-armor-base',s=>s[field].armorBase=5],['missing-rows',s=>delete s[field].rows],['duplicate-slot',s=>s[field].rows[1]=clone(s[field].rows[0])],['equipped-armor',s=>s[field].rows[0]={slot:'head',equipped:true,id:1,value:0}],['missing-slot',s=>s[field].rows.pop()],['nonzero-row',s=>s[field].rows[0].value=1],['missing-record',s=>s[field].missing=['head']],['reason',s=>s[field].reason='UNRESOLVED'],['contribution',s=>s[field].contributions.push({skillId:118,add:0})],['absorption',s=>s[field].absorptionPlan={level:1,status:'RESOLVED',maximumResistanceAdd:12}],['unknown-element',s=>s.elementKnown=false],['positive-element',s=>s.element=10],['missing-element-components',s=>delete s.elementComponents],['element-flat',s=>s.elementComponents.normalFlat=30],['element-base-nan',s=>s.elementComponents.weaponBase=NaN],['active-bonus',s=>s.activeBonusEffects.push({bonusSkillId:153})],
  ])blocked(label+':'+name,a=>mutate(get(a)));
  for(const [name,mutate] of [
   ['level-zero',a=>a.skills=[[targetName(element),0]]],['level-two',a=>a.skills=[[targetName(element),2]]],['level-fraction',a=>a.skills=[[targetName(element),.5]]],['duplicate-aggregate',a=>a.skills.push([targetName(element),1])],['wrong-id',a=>a.weapon.skills=[{skill:{id:3,name:targetName(element)},level:1}]],['wrong-name',a=>a.weapon.skills=[{skill:{id:element==='water'?181:165,name:'攻撃'},level:1}]],['duplicate-raw',a=>a.weapon.skills=[{skill:{id:element==='water'?181:165,name:targetName(element)},level:1},{skill:{id:element==='water'?181:165,name:targetName(element)},level:1}]],
   ['both-conversions',a=>a.skills.push([targetName(element==='water'?'thunder':'water'),1])],['absorption-skill',a=>a.skills.push(['属性吸収',1])],['defense-skill',a=>a.skills.push(['防御',1])],['resistance-skill',a=>a.skills.push([element==='water'?'水耐性':'雷耐性',1])],['guts-skill',a=>a.skills.push(['ヌシの魂',1])],['veil-skill',a=>a.skills.push(['波衣竜の守護',1])],['attack-skill',a=>a.skills.push(['攻撃',1])],
   ['phial',a=>a.weapon.phial={kind:'element'}],['maximum-flat',a=>a.stats.conditionalConditionPlan.maximumElementComponents.conditionalFlat=20],['self-add',a=>a.stats.conditionalConditionPlan.selfStatePlan.maximum.push({skillId:174,elementAdd:30})],['group-add',a=>a.stats.conditionalConditionPlan.groupPlan.applied.push({skill:'UNPROVEN_ELEMENT',elementAdd:30})],['conditional-resistance-effect',a=>a.stats.conditionalConditionPlan.applied.push({skill:'UNPROVEN_RESISTANCE',resistanceAdd:5})],['group-resistance-effect',a=>a.stats.conditionalConditionPlan.groupPlan.applied.push({skill:'UNPROVEN_RESISTANCE',resistanceAdd:5})],['self-resistance-effect',a=>a.stats.conditionalConditionPlan.selfStatePlan.maximum.push({skillId:999,resistanceAdd:5})],['conditions-state',a=>a.conditions.damageStatsState='OTHER'],['conditions-map',a=>a.conditions.stateStatsByState={OTHER:{element:100}}],['bundle-state',a=>a.longSwordState={...a.longSwordState,damageStatsState:'OTHER'}],['bundle-map',a=>a.longSwordState={...a.longSwordState,stateStatsByState:{OTHER:{element:100}}}],['combat-buff',a=>a.conditions.combatBuffs.meal='UNRESOLVED'],
  ])blocked(name,mutate);
  for(const what of ['record-state','hit-state','state-transition','special-component','generated-hit','wrong-identity','unapproved-reference'])blocked('record:'+what,a=>{const old=a.techniqueDb;a.techniqueDb={...old,get(...args){const t=old.get(...args);if(!t||args[1]!=='LS_RED_BLADE_I')return t;const n=clone(t);if(what==='record-state')n.damageStatsState='OTHER';if(what==='hit-state')n.hits[0].damageStatsState='OTHER';if(what==='state-transition')n.damageStateTransition={damageStatsState:'OTHER'};if(what==='special-component')n.specialComponents=['UNKNOWN'];if(what==='generated-hit')n.hits[0].componentSource='UNKNOWN';if(what==='wrong-identity')n.techniqueId='OTHER';if(what==='unapproved-reference')n.referenceKind='unknown';return n;}};});
  record('identity:'+element+':innate-aggregate',()=>{const r=invoke(a=>a.weapon.skills=[{skill:{id:element==='water'?181:165,name:targetName(element)},level:1}]);compareChannels(r,baseline);});
  record('unrelated-pending:'+element,()=>{const r=invoke(a=>a.stats.conditionalConditionPlan.pending.push('SENTINEL_UNRELATED'));assert.equal(available(r),false);assert.ok(JSON.stringify(r).includes('SENTINEL_UNRELATED'));});
  if(element==='water')for(const bad of ['missing-coefficient','zero-coefficient','nan-coefficient','different-coefficient','unadopted-rule','wrong-rule-id'])record('water-rule:'+bad,()=>{const old=c.w.MHWaterConversionRule;try{const n={...old,coefficients:{...old.coefficients}};if(bad==='missing-coefficient')delete n.coefficients['long-sword'];if(bad==='zero-coefficient')n.coefficients['long-sword']=0;if(bad==='nan-coefficient')n.coefficients['long-sword']=NaN;if(bad==='different-coefficient')n.coefficients['long-sword']=3;if(bad==='unadopted-rule')n.status='UNRESOLVED';if(bad==='wrong-rule-id')n.skillId=999;c.w.MHWaterConversionRule=n;assert.equal(available(invoke(()=>{})),false);}finally{c.w.MHWaterConversionRule=old;}});
  for(const bad of ['missing','status','flat','multiplier'])record('cap:'+element+':'+bad,()=>{const old=c.w.MHWElementCapRule;try{c.w.MHWElementCapRule=bad==='missing'?null:{...old,...(bad==='status'?{status:'UNRESOLVED'}:bad==='flat'?{flat:NaN}:{multiplier:NaN})};const r=invoke(()=>{});assert.equal(available(r),false);}finally{c.w.MHWElementCapRule=old;}});
  for(const [name,level] of [['属性吸収',1],['防御',1],['防御',7],[element==='water'?'水耐性':'雷耐性',1]])record('public-producer:'+element+':'+name+':'+level,()=>{const r=c.calc([grant(element),{name,level,type:'armor'}]);assert.equal(available(r),false);assert.deepEqual(r.channels,clean(c.frozenAdapter.evaluateCurrent(c.input())).channels);return {input:c.input().stats[field],reason:r.reason||r.channels?.maximum?.execution?.reason};});
  c.close();
 }
 // Existing positive-resistance and matching-element controls must be identical.
 const conditionsReport=require('./resistance-plan.cjs').makeResistanceCases(JSON.parse(dbBytes),require('./work/harness/skill-sources/classification.candidate.json'),raw);
 for(const previous of conditionsReport.cases.filter(x=>x.premise!=='NO_MATCHING_ELEMENT_CONTROL')){
  const c=await setup(previous.kind,previous.weaponId);
  if(previous.armorId!==null)c.w.eval(`{const a=DB.armor.find(a=>a.id===${previous.armorId});build.armor[a.kind]=a;}`);
  record('matching-unchanged:'+previous.key,()=>{const r=c.calc([grant(previous.element)]),old=clean(c.frozenAdapter.evaluateCurrent(c.input()));assert.deepEqual(r.channels,old.channels);return {maximum:r.channels?.maximum?.metrics?.comboTotalDamage};});c.close();
 }
 assert.equal(report.cases.length,266);report.status=report.cases.every(x=>x.status==='PASS')?'PASS':'FAIL';report.counts={passed:report.cases.filter(x=>x.status==='PASS').length,failed:report.cases.filter(x=>x.status==='FAIL').length};fs.writeFileSync(out,JSON.stringify(report,null,2));process.exitCode=report.status==='PASS'?0:1;
})().catch(e=>{report.status='HARNESS_FAILURE';report.error=e.stack;fs.writeFileSync(out,JSON.stringify(report,null,2));console.error(e);process.exitCode=2;});
