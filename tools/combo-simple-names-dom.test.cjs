'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
test('combo picker and added rows use only the identifying move name for every weapon',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://compact-combo.test',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 const d=w.document,picker=d.getElementById('comboMovePicker'),rows=d.getElementById('combo');
 const exact={
  'canonical:BOW_SHOT_3':'射撃（溜め3）',
  'canonical:BOW_POWER_SHOT_3':'剛射3',
  'canonical:BOW_POWER_VOLLEY_3':'剛連射3',
  'canonical:BOW_THOUSAND_DRAGONS':'竜の千々矢',
  'reference:gl_NORMAL':'通常砲撃',
  'reference:gl_FULL_BURST':'フルバースト（竜杭なし）',
  'canonical:HBG_ELEMENT_FIRST_HIT_REFERENCE':'属性弾（初段）',
  'canonical:LBG_ELEMENT_FIRST_HIT_REFERENCE':'属性弾・非速射（初段）',
  'canonical:LBG_NORMAL_RAPID_1':'Lv1通常弾速射',
  'canonical:LBG_NORMAL_RAPID_3':'Lv3通常弾速射（強化火薬）',
 };
 const kinds=w.eval('KINDS.map(x=>x[0])');assert.equal(kinds.length,14);
 for(const kind of kinds){
  const weapon={id:987,kind,name:'Test',specials:[],affinity:0,damage:{raw:200,display:200},skills:[],slots:[]};
  w.eval(`clearWeaponBuckets();const f=${JSON.stringify(weapon)};DB.weapons=[f];weaponIndexByKind[API_WEAPON_KIND[f.kind]||f.kind]=DB.weapons;weaponKind.value=f.kind;document.getElementById('weapon').innerHTML='<option value="987">Test</option>';document.getElementById('weapon').value='987';App.build.setWeapon(f);renderComboForWeapon();`);
  const opts=[...picker.options];assert.ok(opts.length&&!picker.disabled,'active picker: '+kind);
  for(const opt of opts){
   assert.doesNotMatch(opt.textContent,/MV\s*\d|計算未対応：|計算保留|時間未確認|共通参考条件|参考計算|技データ参照/,kind+': '+opt.value);
   if(Object.hasOwn(exact,opt.value))assert.equal(opt.textContent,exact[opt.value]);
  }
  rows.replaceChildren();
  picker.value=opts[0].value;w.addCombo();
  const select=rows.querySelector('.cmove');
  assert.ok(select,'added row: '+kind);assert.equal(select.value,opts[0].value);
  assert.deepEqual([...select.options].map(o=>[o.value,o.textContent]),opts.map(o=>[o.value,o.textContent]));
 }
});
