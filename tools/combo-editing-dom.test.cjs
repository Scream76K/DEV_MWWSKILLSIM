const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=require('./dom-test-setup.cjs').readSimulatorHtml();
function setup(t){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.addEventListener('error',e=>errors.push(e.message));w.fetch=()=>Promise.reject(new Error('OFFLINE_TEST'));}});
  t.after(()=>dom.window.close());const w=dom.window,d=w.document;
  w.eval(`clearWeaponBuckets();const fixture={id:987,kind:'great-sword',name:'Fixture',damage:{raw:200,display:200},specials:[],slots:[],skills:[]};DB.weapons=[fixture];weaponIndexByKind['great-sword']=[fixture];document.getElementById('weaponKind').value='great-sword';document.getElementById('weapon').innerHTML='<option value="987">Fixture</option>';document.getElementById('weapon').value='987';calcBuild();renderComboForWeapon();`);
  return {w,d,errors};
}
const ids=d=>[...d.querySelectorAll('#combo .cmove')].map(s=>s.value);
function staleOutputs(w,d){
  d.getElementById('buildName').value='A';d.getElementById('saveBuild').click();
  d.getElementById('selectAllCompare').click();d.getElementById('runCompare').click();
  assert.ok(d.querySelector('#compareOut table'));
  w.prepareComboVerificationReport();assert.ok(d.getElementById('comboReportOut').textContent);
  d.getElementById('aiPayload').textContent='old context';d.getElementById('groupProposalOut').textContent='old proposal';
}
function assertInvalidated(w,d){
  assert.equal(d.getElementById('dpsOut').textContent,'未計算');
  assert.equal(d.getElementById('comboReportOut').textContent,'');
  assert.equal(d.getElementById('aiPayload').textContent,'');
  assert.ok(!d.getElementById('groupProposalOut').textContent.includes('old proposal'));
  assert.ok(!d.querySelector('#compareOut table'));w.dispatchEvent(new w.Event('resize'));
  assert.ok(!d.querySelector('#compareOut table'));
}
test('moving a row changes stored and reported order without recreating selections',t=>{
  const {w,d,errors}=setup(t);['gs_charge3','gs_strong3','gs_charge3'].forEach(id=>w.addCombo(id));
  const row=d.querySelectorAll('.comboRow')[1],select=row.querySelector('.cmove');
  row.querySelector('.combo-up').click();assert.deepEqual(ids(d),['gs_strong3','gs_charge3','gs_charge3']);
  assert.equal(d.querySelector('.cmove'),select);
  d.querySelector('.comboRow .combo-down').click();assert.deepEqual(ids(d),['gs_charge3','gs_strong3','gs_charge3']);
  d.getElementById('buildName').value='Ordered';d.getElementById('saveBuild').click();
  assert.deepEqual(JSON.parse(JSON.stringify(w.savedBuildMap().Ordered.combo.moves.map(x=>x.techniqueId))),['gs_charge3','gs_strong3','gs_charge3']);
  const report=w.createComboVerificationReport();assert.deepEqual(JSON.parse(JSON.stringify(report.stages.map(x=>x.techniqueId))),['gs_charge3','gs_strong3','gs_charge3']);
  assert.deepEqual(errors,[]);
});
test('move boundaries stay disabled after add delete and restoration including unknown IDs',t=>{
  const {w,d,errors}=setup(t);w.addCombo('gs_charge3');
  assert.equal(d.querySelector('.combo-up').disabled,true);assert.equal(d.querySelector('.combo-down').disabled,true);
  w.addCombo('retired-id',{allowMissing:true});assert.equal(d.querySelector('.combo-down').disabled,false);
  d.querySelectorAll('.comboRow')[1].querySelector('.combo-up').click();assert.deepEqual(ids(d),['retired-id','gs_charge3']);
  d.querySelectorAll('.comboRow')[1].querySelector('.del').click();assert.equal(d.querySelector('.combo-down').disabled,true);
  const snapshot=w.buildSnapshot();w.applyBuildSnapshot(snapshot);assert.deepEqual(ids(d),['retired-id']);assert.equal(d.querySelector('.combo-up').disabled,true);
  assert.equal(w.calcDps(),null);assert.deepEqual(errors,[]);
});
test('editing deleting adding and reordering invalidate actual comparison caches and reports',t=>{
  const {w,d,errors}=setup(t);w.addCombo('gs_charge3');w.addCombo('gs_strong3');
  for(const action of [()=>{const s=d.querySelector('.cmove');s.value='gs_strong3';s.dispatchEvent(new w.Event('change'));},()=>d.querySelector('.combo-down').click(),()=>d.querySelector('.del').click(),()=>w.addCombo('gs_charge3')]){
    staleOutputs(w,d);action();assertInvalidated(w,d);
  }
  assert.deepEqual(errors,[]);
});
test('uptime edits presets and empty restoration clear old reports',t=>{
  const {w,d,errors}=setup(t);w.addCombo('gs_charge3');staleOutputs(w,d);
  d.getElementById('uptime').value='55';d.getElementById('uptime').dispatchEvent(new w.Event('input'));assertInvalidated(w,d);
  staleOutputs(w,d);d.getElementById('uptimeMode').value='0';d.getElementById('uptimeMode').dispatchEvent(new w.Event('change'));assertInvalidated(w,d);
  staleOutputs(w,d);d.getElementById('comboPreset').value='adopted:gs_standard';w.applyComboPreset();assertInvalidated(w,d);
  staleOutputs(w,d);const snapshot=w.buildSnapshot();snapshot.combo.moves=[];w.applyBuildSnapshot(snapshot);assert.deepEqual(ids(d),[]);assertInvalidated(w,d);
  assert.deepEqual(errors,[]);
});

test('the custom editor has one public preset picker and keeps legacy presets only as internal data',t=>{
 const {w,d}=setup(t),custom=d.getElementById('consumerCustomCombo'),preset=d.getElementById('comboPreset');
 assert.equal(preset.closest('details'),custom);
 assert.equal(d.querySelectorAll('label[for="comboPreset"]').length,1);
 assert.ok(custom.contains(d.querySelector('label[for="comboPreset"]')));
 assert.equal(d.getElementById('consumerWeaponConditions').querySelector('summary').textContent,'武器の開始条件');
 assert.doesNotMatch(preset.textContent,/旧参考|技DB採用|技DB参照/);
 const records=w.comboData().presets;
 assert.ok(records.some(p=>p.id==='gs_tcs'),'legacy data is retained');
 const ids=[...preset.options].filter(o=>!o.hidden).map(o=>o.value).filter(Boolean);
 assert.ok(ids.length>0);
 assert.ok(ids.every(id=>records.find(p=>p.id===id)?.origin==='CANONICAL_DB'));
 const selected=records.find(p=>p.id===ids[0]);
 preset.value=selected.id;preset.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.deepEqual([...d.querySelectorAll('#combo .cmove')].map(e=>e.value),Array.from(selected.moves));
});
