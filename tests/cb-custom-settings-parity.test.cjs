'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<1e-8,`${a} != ${b}`);
function setup(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://explicit-defaults.invalid',virtualConsole:vc,runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const ev=s=>w.eval(s),read=s=>JSON.parse(ev('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 w.__pack=data;
 ev('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 function apply(kind, combo={},skills=[]){
  const input=profiles.find(x=>x.kind===kind).input;
  w.__s=JSON.stringify({...input,selectedHp:'FULL_HP',charmCustom:{...input.charmCustom,skills},combo:{...input.combo,moves:[],...combo}});
  ev('applyBuildSnapshot(JSON.parse(__s));');
 }
 function add(id){
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
 }
 return {w,ev,el,read,apply,add,close(){w.close();assert.deepEqual(errors,[]);}};
}

test('CB optional controls survive named save, comparison and reload without affecting standard R+H',t=>{
 const x=setup();t.after(()=>x.close());
 const {w,el,read}=x;
 x.apply('charge-blade');
 const detail=el('comparisonOptionalConditions'),weapons=el('customWeaponSettings');
 assert.equal(detail.open,false);assert.equal(weapons.open,false);
 const controls=Object.fromEntries(Array.from(weapons.querySelectorAll('[data-weapon-field]'),e=>[e.dataset.weaponField,e]));
 assert.deepEqual(Object.values(controls).map(e=>e.value),['','','','','','']);
 const select=(key,value)=>{const e=controls[key];e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 w.calcBuild();
 const standard=read('calcState.realOneHit');
 assert.equal(standard.scope,'CB_INDEPENDENT_R_H_SUM');
 select('shieldBoosted','1');select('swordBoosted','0');select('axeBoosted','0');
 select('normalPhials','1');select('enhancedPhials','0');select('enhancedPhial','0');
 w.calcBuild();
 assert.deepEqual(read('calcState.realOneHit'),standard);
 x.add('canonical:CB_ELEMENT_DISCHARGE_1');
 const run=()=>{let result;const original=w.calcUserComboDamage;w.calcUserComboDamage=()=>result=original();
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}return result.pipeline;};
 const adapter=w.MHWRealOneHitBrowserAdapter,received=[];
 w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(input){received.push(input.chargeBladeState);return adapter.evaluateCurrent(input);}};
 const audit=[['swordBoosted','1',true,'0'],['shieldBoosted','0',false,'1'],['axeBoosted','1',true,'0'],
  ['normalPhials','2',2,'1'],['enhancedPhials','0.5',.5,'0'],['enhancedPhial','1',true,'0']];
 for(const [key,input,value,reset] of audit){
  select(key,input);received.length=0;
  const result=run();
  assert.equal(received[0]?.[key],value,key);
  t.diagnostic(key+'='+input+' '+JSON.stringify({reason:result?.reason??null,normal:result?.channels?.normal?.metrics.comboTotalDamage.value??null,maximum:result?.channels?.maximum?.metrics.comboTotalDamage.value??null}));
  select(key,reset);
 }
 const stateBefore=read('comboCBFormState()'),p=run();
 for(const ch of ['normal','maximum']){
  assert.equal(p.channels?.[ch]?.execution.status,'complete',p.reason||p.channels?.[ch]?.execution.reason);
  assert.equal(p.channels[ch].finalState.chargeBlade.normalPhials,0);
 }
 assert.deepEqual(read('comboCBFormState()'),stateBefore);
 el('buildName').value='CB saved';el('saveBuild').click();
 assert.match(el('buildSaveStatus').textContent,/保存しました/);
 select('axeBoosted','1');select('normalPhials','0');
 const live=run();assert.equal((live.channels?.normal?.metrics.comboTotalDamage.value??null),null);
 const bytes=x.ev('storageGet(BUILDS_KEY)');
 assert.deepEqual(read('savedBuildMap()["CB saved"].combo.customChargeBladeSettings'),
  {swordBoosted:false,shieldBoosted:true,axeBoosted:false,normalPhials:1,enhancedPhials:0,enhancedPhial:false});
 const check=el('compareBuilds').querySelector('[data-compare-name="CB saved"]');
 check.checked=true;el('runCompare').click();
 const row=read('lastBuildComparisonRows[0]');
 for(const ch of ['normal','maximum']){
  near(row.oneHitPipeline.channels[ch].metrics.comboTotalDamage.value,p.channels[ch].metrics.comboTotalDamage.value);
  assert.deepEqual(row.oneHitPipeline.channels[ch].finalState,JSON.parse(JSON.stringify(p.channels[ch].finalState)));
 }
 near(row.referenceCombo.damage,p.channels.normal.metrics.comboTotalDamage.value);
 assert.equal(controls.normalPhials.value,'0');assert.equal(controls.axeBoosted.value,'1');
 assert.equal(x.ev('storageGet(BUILDS_KEY)'),bytes);
 el('savedBuildSelect').value='CB saved';el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
 assert.deepEqual(Object.values(controls).map(e=>e.value),['0','1','0','1','0','0']);
 for(const ch of ['normal','maximum'])near(run().channels[ch].metrics.comboTotalDamage.value,p.channels[ch].metrics.comboTotalDamage.value);
 const old=read('savedBuildMap()["CB saved"]');delete old.combo.customChargeBladeSettings;
 w.__old=old;x.ev('storageSet(BUILDS_KEY,JSON.stringify({...savedBuildMap(),old:__old}));renderSavedBuilds();');
 el('savedBuildSelect').value='old';el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
 assert.ok(Object.values(controls).every(e=>e.value===''));
 for(const ch of ['normal','maximum'])near(run().channels[ch].metrics.comboTotalDamage.value,280.029924);
 select('normalPhials','-1');
 el('buildName').value='invalid';el('saveBuild').click();
 assert.match(el('buildSaveStatus').textContent,/保存に失敗.*通常ビン残数/);
 assert.equal(read('Object.hasOwn(savedBuildMap(),"invalid")'),false);


});

test('CB saved comparison and loaded editor distinguish missing, explicit zero and malformed settings',t=>{
 const x=setup();t.after(()=>x.close());
 const {w,el,read,ev}=x;
 x.apply('charge-blade');
 w.calcBuild();const standard=read('calcState.realOneHit');
 assert.equal(standard.scope,'CB_INDEPENDENT_R_H_SUM');
 x.add('canonical:CB_ELEMENT_DISCHARGE_1');
 const baseline=read('buildSnapshot()');
 const variants=[
  ['legacy',undefined,280.029924],
  ['zero',{axeBoosted:false,normalPhials:0},null],
  ['bad stock',{axeBoosted:false,normalPhials:'0'},null],
  ['bad toggle',{axeBoosted:'OFF',normalPhials:1},null],
  ['bad pair',{axeBoosted:'OFF',normalPhials:'0'},null],
 ];
 w.__names=JSON.stringify(Object.fromEntries(variants.map(([name,state])=>[name,{...baseline,combo:{...baseline.combo,...(state===undefined?{}:{customChargeBladeSettings:state})}}])));
 ev('storageSet(BUILDS_KEY,__names);renderSavedBuilds();');
 const store=ev('storageGet(BUILDS_KEY)'), channels=['normal','maximum'];
 const values=p=>channels.map(ch=>p?.channels?.[ch]?.metrics?.comboTotalDamage?.value??null);
 const result=html=>html.includes('未算出');
 const reports=[];
 for(const [name,,expected] of variants){
  for(const box of el('compareBuilds').querySelectorAll('input[data-compare-name]'))box.checked=box.dataset.compareName===name;
  el('runCompare').click();
  const p=read('lastBuildComparisonRows[0].oneHitPipeline');
  const compared=values(p),comparisonUnavailable=result(el('compareOut').textContent),reason=p.reason??p.channels?.normal?.execution?.reason??null;
  if(name.startsWith('bad'))assert.match(el('compareOut').textContent,/保存したチャージアックスの設定値が無効/);
  el('savedBuildSelect').value=name;el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
  if(name.startsWith('bad'))assert.match(el('status').textContent,/保存したチャージアックスの設定値が無効/);
  let current;const original=w.calcUserComboDamage;w.calcUserComboDamage=()=>current=original();
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  reports.push({name,expected,compared,reason,comparisonUnavailable,loaded:values(current?.pipeline),loadedUnavailable:result(el('compareOut').textContent)});
  assert.equal(ev('storageGet(BUILDS_KEY)'),store,'must preserve raw saved bytes: '+name);
 }
 t.diagnostic(JSON.stringify(reports));
 for(const r of reports){
  if(r.expected!==null){for(const value of [...r.compared,...r.loaded])near(value,r.expected);continue;}
  assert.deepEqual(r.compared,[null,null],r.name+' must not get a number in saved comparison');
  assert.equal(r.comparisonUnavailable,true,r.name);
  assert.ok(r.reason,r.name+' must provide a reason');
  assert.deepEqual(r.loaded,[null,null],r.name+' must not get a number when loaded');
  assert.equal(r.loadedUnavailable,true,r.name);
 }
 // Dedicated single-technique calculation does not read custom overrides.
 for(const value of values(w.calcP0Damage('single').pipeline))near(value,280.029924);
 // The last load has two invalid fields. Editing one must leave the other
 // blocked, including while the compare UI temporarily applies another build.
 const edit=(id,value)=>{const field=el(id);field.value=value;field.dispatchEvent(new w.Event('change',{bubbles:true}));};
 edit('customWeaponAxeBoosted_comboCBAxe','0');
 el('calcUserComboDamage').click();
 assert.match(el('compareOut').textContent,/無効です（通常ビン残数）/);
 for(const box of el('compareBuilds').querySelectorAll('input[data-compare-name]'))box.checked=box.dataset.compareName==='legacy';
 el('runCompare').click();
 for(const value of values(read('lastBuildComparisonRows[0].oneHitPipeline')))near(value,280.029924);
 assert.equal(el('customWeaponAxeBoosted_comboCBAxe').value,'0');
 el('calcUserComboDamage').click();
 assert.match(el('compareOut').textContent,/無効です（通常ビン残数）/);
 edit('customWeaponNormalPhials_comboCBNormalPhials','1');
 let repaired;const original=w.calcUserComboDamage;w.calcUserComboDamage=()=>repaired=original();
 try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
 for(const value of values(repaired.pipeline))near(value,165.495204);
 assert.equal(ev('storageGet(BUILDS_KEY)'),store);
 x.apply('charge-blade');w.calcBuild();
 assert.deepEqual(read('calcState.realOneHit'),standard);
});
