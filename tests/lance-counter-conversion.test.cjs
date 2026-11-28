'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {data}=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json');

test('KOTATU lance counter replays maximum dragon conversion on both body hits',t=>{
 const errors=[],vc=new VirtualConsole().on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://lance-convert.invalid',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id);
 const set=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new w.Event('change',{bubbles:true}));};
 w.source=data;
 w.eval('DB=normalizeDB(source);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI()');
 w.fixture=require('./fixtures/lance-counter-conversion-armor-fixture.json');
 w.eval("__buildTemplateDB.templates.find(g=>g.weapon_type_id==='lance').builds.push(fixture);__renderBuildTemplateUI()");
 set('buildTemplateWeaponKind','lance');set('buildTemplateSelect','KOTATU_LAN_01');el('loadBuildTemplate').click();
 assert.equal(String(w.selectedWeapon().id),'1166');
 w.eval('App.state.combo.moves=[];restoreComboRows()');
 const id='LAN_COUNTER_DOUBLE_THRUST';
 set('comboMovePicker','canonical:'+id);el('addCombo').click();
 set('comboLANCounter','CHARGE3_COUNTER_SUCCESS_ALL_HITS');
 set('monster','training-room');set('monsterPart','training-front');
 set('powerAttributeConversionNormal','OFF');
 let raw,input;
 const api=w.MHWRealOneHitBrowserAdapter;
 w.MHWRealOneHitBrowserAdapter={...api,evaluateCurrent(x){
  const r=api.evaluateCurrent(x);if(x.techniqueIds?.includes(id)){input=x;raw=r;}return r;
 }};
 function run(maximum,name){
  set('powerAttributeConversionMaximum',maximum);el('calcUserComboDamage').click();
  const channels=raw.channels;
  assert.equal(input.conditions.attributeConversionState.maximum,maximum==='ON');
  el('buildName').value=name;el('saveBuild').click();
  return channels;
 }
 const on=run('ON','on');
 assert.equal(on.maximum.diagnostics.attributeConversion?.active,true);
 const assertBodyOnly=channel=>{
  const d=channel.diagnostics;
  assert.equal((d.excludedCalculationSkills??[]).filter(x=>x.skillId===152).length,0);
  const followup=d.excludedSkillDamage.filter(x=>x.skillId===152);
  assert.equal(followup.length,1);
  assert.equal(followup[0].additionalDamage.includedInPower,false);
 };
 for(const ch of ['normal','maximum'])assertBodyOnly(on[ch]);
 const onInput=input,off=run('OFF','off');
 assert.deepEqual(on.normal.components,off.normal.components);
 for(const i of [0,1]){
  const part=(channels,type)=>channels.maximum.components.find(c=>c.id===id+':'+type+':'+i);
  assert.deepEqual(part(on,'physical'),part(off,'physical'));
  assert.equal(part(on,'element').details.appliedElement-part(off,'element').details.appliedElement,180);
  assert.ok(part(on,'element').value>part(off,'element').value);
 }
 assert.deepEqual(Array.from(on.maximum.components,c=>c.id),[id+':physical:0',id+':element:0',id+':physical:1',id+':element:1']);
 assert.equal(on.normal.metrics.comboTotalDamage.value,off.normal.metrics.comboTotalDamage.value);
 assert.ok(on.maximum.metrics.comboTotalDamage.value>off.maximum.metrics.comboTotalDamage.value);
 assert.equal(on.maximum.diagnostics.attributeConversion.capLimit,on.maximum.components[1].details.elementComponents.capLimit);
 t.diagnostic('OFF max '+off.maximum.metrics.comboTotalDamage.value+'; displayed '+off.maximum.components[1].details.appliedElement+' -> '+on.maximum.components[1].details.appliedElement);
 assert.equal(on.maximum.diagnostics.attributeConversion.baseElement,350);
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 for(const box of el('compareBuilds').querySelectorAll('input'))if(!box.checked)box.click();
 el('runCompare').click();
 const compared=w.eval('lastBuildComparisonRows');
 assert.deepEqual(Array.from(compared,r=>r.name).sort(),['off','on']);
 for(const r of compared){
  if(r.name==='on')for(const ch of ['normal','maximum'])assertBodyOnly(r.oneHitPipeline.channels[ch]);
  const expected=r.name==='on'?on:off;
  for(const ch of ['normal','maximum'])assert.deepEqual(r.oneHitPipeline.channels[ch].components,expected[ch].components);
 }
 assert.equal(el('powerAttributeConversionMaximum').value,'OFF');
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 t.diagnostic(JSON.stringify(['normal','maximum'].map(ch=>on[ch].metrics.comboTotalDamage.value)));
 const plan=onInput.stats.conditionalConditionPlan;
 const broken={...plan,groupPlan:{...plan.groupPlan,unresolvedEffects:['UNCONFIRMED_SERIES']}};
 const gated=api.evaluateCurrent({...onInput,stats:{...onInput.stats,conditionalConditionPlan:broken},conditionalConditionPlan:broken});
 assert.match(JSON.stringify(gated.channels?.maximum??gated.reason),/ATTRIBUTE_CONVERSION_CAP_INTERACTION_UNRESOLVED/);
 const other=api.evaluateCurrent({...onInput,techniqueIds:['LAN_MID_THRUST_I'],techniqueId:'LAN_MID_THRUST_I'});
 assert.equal(other.channels?.maximum?.diagnostics?.attributeConversion,undefined);
 const nominal=onInput.weapon.specials[0];
 const nonDragon=api.evaluateCurrent({...onInput,weapon:{...onInput.weapon,specials:[{...nominal,element:'water'}]}});
 assert.equal(nonDragon.channels?.maximum?.diagnostics?.attributeConversion,undefined);
 for(const state of [undefined,{normal:null,maximum:null}]){
  const saved=w.savedBuildMap().on;saved.combo.attributeConversionState=state;
  const plan=w.consumerEvaluationPlan('lance',saved.combo.moves,w.explicitSavedOpeningConditions('lance',saved.combo,input.conditions),input.target);
  assert.deepEqual(JSON.parse(JSON.stringify(plan.conditions.attributeConversionState)),{normal:false,maximum:true});
 }
 const invalid=w.savedBuildMap().on;invalid.combo.attributeConversionState={normal:false,maximum:'ON'};
 const invalidPlan=w.consumerEvaluationPlan('lance',invalid.combo.moves,w.explicitSavedOpeningConditions('lance',invalid.combo,input.conditions),input.target);
 assert.equal(invalidPlan.reason,'REAL_SLICE:ATTRIBUTE_CONVERSION_STATE_REQUIRED');
 w.applyBuildSnapshot(invalid);
 assert.equal(w.calcUserComboDamage().damage,null);
 set('powerAttributeConversionMaximum','ON');
 assert.equal(w.calcUserComboDamage().maximumDamage,on.maximum.metrics.comboTotalDamage.value);
 const malformed={...onInput,skills:onInput.skills.map(([k,v])=>[k,k==='属性変換'?'3':v])};
 assert.notEqual(api.evaluateCurrent(malformed).channels?.maximum?.execution.status,'complete');
});
