const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs'),{data}=require('../tests/fixtures/offset-maximum-inputs.json'),{profiles}=require('../tests/fixtures/selected-hp-inputs.json');
test('current build custom route is actionable from its editor, repeats and invalidates safely',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://comboaudit.invalid',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;t.after(()=>w.close());
 const d=w.document,e=id=>d.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__db=JSON.stringify(data);w.__build=JSON.stringify(profiles.find(p=>p.kind==='great-sword').input);
 w.eval('const src=JSON.parse(__db);DB=normalizeDB({...src,weapons:consolidateArtiaFixedVariantRows(src.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters(); const snap=JSON.parse(__build);applyBuildSnapshot({...snap,armor:{},decos:{},combo:{moves:[]}});');
 const button=e('calcUserComboDamage'),out=e('userComboDamageOut'),custom=e('consumerCustomCombo');
 assert.ok(custom.contains(button)&&custom.contains(out),'action and result belong to the editor');
 for(let ancestor=button;ancestor;ancestor=ancestor.parentElement){
  assert.equal(ancestor.hidden,false);assert.notEqual(w.getComputedStyle(ancestor).display,'none');
  if(ancestor.tagName==='DETAILS')ancestor.open=true;
 }
 for(const id of ['calcUserComboDamage','userComboDamageOut'])assert.equal(d.querySelectorAll('#'+id).length,1);
 assert.match(custom.textContent,/現在の装備セット/);assert.match(custom.textContent,/ビルド火力比較/);
 const add=()=>{e('comboMovePicker').value='gs_charge3';assert.equal(e('comboMovePicker').value,'gs_charge3');e('addCombo').click();};
 const numbers=()=>{const match=out.textContent.match(/通常：([\d.]+) ／ 最大：([\d.]+)/);assert.ok(match,out.textContent);return match.slice(1).map(Number);};
 add();button.click();const first=numbers();assert.ok(first.every(n=>n>0));
 add();button.click();const repeated=numbers();assert.ok(repeated.every((n,i)=>n>first[i]));
 t.diagnostic(JSON.stringify({first,repeated}));
 assert.equal(d.querySelectorAll('#combo .cmove').length,2);
 e('buildName').value='custom';e('saveBuild').click();
 assert.deepEqual(read('savedBuildMap().custom.combo.moves').map(x=>x.techniqueId),['gs_charge3','gs_charge3']);
 w.addCombo('retired-test-id',{allowMissing:true});button.click();
 assert.match(out.textContent,/未算出/);assert.doesNotMatch(out.textContent,/合計ダメージ：[\d]|DPS/);
});
