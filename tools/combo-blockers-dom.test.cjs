const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=require('./dom-test-setup.cjs').readSimulatorHtml();
function setup(t){
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.addEventListener('error',e=>errors.push(e.message));w.fetch=()=>Promise.reject(Error('OFFLINE_TEST'));}});
  t.after(()=>dom.window.close());const w=dom.window,d=w.document;
  w.eval(`clearWeaponBuckets();const fixture={id:987,kind:'charge-blade',name:'Fixture',affinity:0,damage:{raw:200,display:200},specials:[],slots:[],skills:[]};DB.weapons=[fixture];weaponIndexByKind[API_WEAPON_KIND['charge-blade']]=[fixture];weaponKind.value='charge-blade';weapon.innerHTML='<option value="987">Fixture</option>';weapon.value='987';calcBuild();comboCBShield.value='1';comboCBAxe.value='1';renderComboForWeapon();`);
  return {w,d,errors};
}
test('all blocked stages are listed in route order without partial totals',t=>{
  const {w,d,errors}=setup(t);
  ['CB_SWORD_TO_AXE_MORPH','CB_AED','CB_SHIELD_THRUST'].forEach(id=>w.addCombo('canonical:'+id));
  assert.equal(w.calcDps(),null);
  const items=[...d.querySelectorAll('.combo-blocked-item')];assert.equal(items.length,2);
  assert.match(items[0].textContent,/^2\./);assert.match(items[1].textContent,/^3\./);
  assert.match(items[0].textContent,/ビン/);assert.match(items[1].textContent,/ビン/);
  assert.equal(d.querySelector('.combo-hit-detail'),null);
  assert.doesNotMatch(d.getElementById('dpsOut').textContent,/実戦DPS：|1コンボ [\d.]+ ダメージ/);
  assert.deepEqual(errors,[]);
});
test('unknown saved IDs are escaped and repeated stages remain separate',t=>{
  const {w,d,errors}=setup(t),id='<img src=x onerror=alert(1)>';
  w.addCombo(id,{allowMissing:true});w.addCombo(id,{allowMissing:true});assert.equal(w.calcDps(),null);
  const items=[...d.querySelectorAll('.combo-blocked-item')];assert.equal(items.length,2);
  assert.ok(items.every(x=>x.textContent.includes(id)));assert.ok(items.every(x=>x.textContent.includes('保存技が現在の技一覧にありません')));
  assert.equal(d.querySelector('#dpsOut img'),null);assert.deepEqual(errors,[]);
});
test('removing blocked stages restores a fresh complete route calculation',t=>{
  const {w,d,errors}=setup(t);w.addCombo('canonical:CB_SWORD_TO_AXE_MORPH');const before=w.calcDps();assert.ok(before.damage>0);
  w.addCombo('canonical:CB_AED');w.addCombo('canonical:CB_SHIELD_THRUST');assert.equal(w.calcDps(),null);
  assert.equal(d.querySelectorAll('.combo-blocked-item').length,2);assert.equal(d.querySelector('.combo-hit-detail'),null);
  d.querySelectorAll('.comboRow .del')[2].click();d.querySelectorAll('.comboRow .del')[1].click();
  const after=w.calcDps();assert.equal(after.damage,before.damage);assert.equal(d.querySelector('.combo-blocked-item'),null);
  assert.equal(d.querySelectorAll('.combo-hit-detail tbody tr').length,5);assert.deepEqual(errors,[]);
});
test('invalid shared CB context is reported rather than throwing or leaving stale totals',t=>{
  const {w,d,errors}=setup(t);w.addCombo('canonical:CB_SWORD_TO_AXE_MORPH');w.calcDps();
  w.eval('calcState.stats.rapidMorphLevel=1.5');let result;assert.doesNotThrow(()=>{result=w.calcDps();});assert.equal(result,null);
  assert.match(d.getElementById('dpsOut').textContent,/計算保留/);assert.equal(d.querySelector('.combo-hit-detail'),null);assert.deepEqual(errors,[]);
});
