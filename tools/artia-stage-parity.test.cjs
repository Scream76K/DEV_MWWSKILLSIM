'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const {data}=require('../tests/fixtures/offset-maximum-inputs.json');
const ids=[305,380,456,71,147,229,753,828,906,977,523,600,677,1059];
function setup(t){
 const errors=[],v=new VirtualConsole();v.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://artia-parity.invalid/',runScripts:'dangerously',virtualConsole:v,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>JSON.parse(JSON.stringify(x));}}).window;
 t.after(()=>w.close());w.__pack=data;
 w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 assert.deepEqual(errors,[]);
 return {w,d:w.document,read:s=>JSON.parse(w.eval('JSON.stringify('+s+')'))};
}
function load(w,id,artia){
 w.stateFixture={weaponId:String(id),selectedHp:'FULL_HP',armor:{},artia:{production:'attack',element:'fire',sameElementPartCount:3,parts:['attack','attack','attack'],restores:['atk:I','none','none','none','none'],...artia},decos:{}};
 w.eval('applyBuildSnapshot(stateFixture)');
}
function change(w,e,v){assert.ok(e,'control present');e.value=v;e.dispatchEvent(new w.Event('change',{bubbles:true}));}
const allOpts=d=>[...d.querySelectorAll('#artiaBox .aR')][0]?.options;
test('official rare-8 record stays unchanged on both stages across all 14 kinds, and I never applies stored restoration',t=>{
 const {w,d,read}=setup(t);
 for(const id of ids){
  const original=read('DB.weapons.find(w=>w.id==='+id+')');
  assert.equal(original.rarity,8);
  load(w,id,{baseStage:'I'});
  assert.equal(d.querySelector('#aBaseStage')?.value,'I');
  assert.equal(d.querySelectorAll('#artiaBox .aR').length,0);
  assert.equal(read('restoreStats(selectedWeapon())').attack,0);
  assert.equal(read('buildSnapshot().artia.restores[0]'),'atk:I');
  assert.equal(d.querySelector('#aElem option:checked').textContent,'火');
  change(w,d.querySelector('#aBaseStage'),'II');
  assert.equal(d.querySelectorAll('#artiaBox .aR').length,5);
  assert.equal(read('restoreStats(selectedWeapon())').attack,5);
  assert.deepEqual(read('DB.weapons.find(w=>w.id==='+id+')'),original);
  change(w,d.querySelector('#aBaseStage'),'I');
  assert.equal(read('restoreStats(selectedWeapon())').attack,0);
 }
});
test('legacy populated rare-8 saves infer II without rewrite, and only type-eligible Japanese choices are offered',t=>{
 const {w,d,read}=setup(t);
 load(w,828,{});assert.equal(d.querySelector('#aBaseStage')?.value,'II');
 assert.equal(Object.hasOwn(read('buildSnapshot().artia'),'baseStage'),false);
 assert.equal(read('restoreStats(selectedWeapon())').attack,5);
 let choices=[...allOpts(d)];assert.ok(choices.some(o=>o.value==='capacity:I'));
 assert.ok(choices.every(o=>!['elem:I','sharp:I'].includes(o.value)));
 assert.doesNotMatch(choices.map(o=>o.textContent).join(' '),/atk:I|aff:I|capacity:I/);
 load(w,71,{baseStage:'II',element:'poison'});assert.ok([...allOpts(d)].every(o=>!['elem:I','sharp:I','capacity:I'].includes(o.value)));
 load(w,380,{baseStage:'II'});
 assert.ok([...allOpts(d)].some(o=>o.value==='sharp:I'));
 assert.ok([...allOpts(d)].some(o=>o.value==='elem:I'));
 assert.ok([...allOpts(d)].every(o=>o.value!=='capacity:I'));
 load(w,828,{baseStage:'II',restores:['sharp:I','none','none','none','none']});
 assert.equal(read('restoreStats(selectedWeapon())').capacity,1);
 assert.equal(d.querySelector('.aR').value,'sharp:I');
 assert.match(d.querySelector('.aR option:checked').textContent,/旧装填数/);
});
test('R6/R7 source identities remain distinct (not simulator I/II) and saved choice keeps public validation without new effects',t=>{
 const {w,d,read}=setup(t);
 for(const id of [826,827]){
  const fixture=read('DB.weapons.find(w=>w.id==='+id+')');
  assert.ok(fixture,'public early bowgun row exists');
  load(w,id,{baseStage:'I'});
  assert.equal(d.querySelector('#aBaseStage'),null);
  assert.equal(read('restoreStats(selectedWeapon())').attack,5);
  assert.ok([...allOpts(d)].every(o=>o.value!=='capacity:I'));
 }
});
test('manual weapon changes scope dormant restorations per weapon without changing named bytes',t=>{
 const {w,d,read}=setup(t);
 load(w,828,{baseStage:'II',restores:['capacity:I','none','none','none','none']});
 d.querySelector('#buildName').value='QA';
 d.querySelector('#saveBuild').click();
 const persisted=w.eval('JSON.stringify(savedBuildMap())');
 change(w,d.querySelector('#weaponKind'),'heavy-bowgun');
 change(w,d.querySelector('#weapon'),'523');
 assert.equal(d.querySelector('#aBaseStage')?.value,'I');
 assert.equal(read('restoreStats(selectedWeapon())').capacity,0);
 change(w,d.querySelector('#aBaseStage'),'II');
 assert.equal(read('restoreStats(selectedWeapon())').capacity,0);
 change(w,d.querySelector('#weaponKind'),'light-bowgun');
 change(w,d.querySelector('#weapon'),'828');
 assert.equal(d.querySelector('#aBaseStage')?.value,'II');
 assert.equal(read('restoreStats(selectedWeapon())').capacity,1);
 assert.equal(w.eval('JSON.stringify(savedBuildMap())'),persisted);
});
