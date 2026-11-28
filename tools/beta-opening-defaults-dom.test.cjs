const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs'),{data}=require('../tests/fixtures/offset-maximum-inputs.json'),{profiles}=require('../tests/fixtures/selected-hp-inputs.json');
test('exact custom moves start in a supported state only when the user has not supplied one',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://opening.invalid',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;t.after(()=>w.close());
 w.source=data;
 w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters()');
 const e=id=>w.document.getElementById(id);
 for(const [kind,id,field,compatible,incompatible,label] of [
  ['long-sword','ls_helm','comboLSSpiritGauge','RED','NONE','赤ゲージ'],
  ['long-sword','canonical:LS_FORESIGHT_SPIN_SLASH','comboLSSpiritGauge','RED','NONE','赤ゲージ'],
  ['dual-blades','db_dance1','comboDBDemonMode','ARCHDEMON','1','鬼人強化'],
  ['switch-axe','sa_heavy','comboSAAxeBoosted','1','0','斧強化'],
 ]){
  const setup=()=>{
   w.snap={...profiles.find(p=>p.kind===kind).input,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
   w.eval('applyBuildSnapshot(snap)');
   e('comboMovePicker').value=id;assert.equal(e('comboMovePicker').value,id);e('addCombo').click();
  };
  const calculate=()=>{e('calcUserComboDamage').click();return [...e('compareOut').querySelectorAll('[data-custom-damage="total"] td')].slice(0,2).map(x=>x.textContent);};
  setup();assert.equal(e(field).value,'');const automatic=calculate();
  assert.ok(automatic.length===2&&automatic.every(n=>Number(n)>0),id+': '+automatic.join('/'));
  assert.match(e('compareOut').textContent,new RegExp('自動設定：[^。]*'+label));
  assert.equal(e(field).value,'',id+' never writes an inferred state into the form');
  setup();e(field).value=compatible;
  if(kind==='switch-axe'){e('comboSAMode').value='AXE';e('comboSAAwakened').value='0';}
  if(kind==='dual-blades')e('comboDBDemonGauge').value='1';
  assert.deepEqual(calculate(),automatic,id+' uses the same values as the explicit state');
  setup();e(field).value=incompatible;
  assert.deepEqual(calculate(),['未算出','未算出'],id+' does not override explicit state');
 }
});
