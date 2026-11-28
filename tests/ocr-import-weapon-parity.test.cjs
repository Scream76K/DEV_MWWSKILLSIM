'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {data}=require('./fixtures/offset-maximum-inputs.json');
test('OCR imports the selected official weapon and keeps the same UI/API identity across all weapon types',t=>{
 const errors=[],v=new VirtualConsole();v.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://ocr-import.test/',runScripts:'dangerously',virtualConsole:v,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>JSON.parse(JSON.stringify(x));}}).window;
 t.after(()=>w.close());w.__pack=data;
 w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const keys=w.eval('KINDS.map(([ui])=>[ui,API_WEAPON_KIND[ui]])');
 for(const [ui,key] of [['sword-and-shield','sword-shield'],...keys.filter(([ui])=>ui!=='sword-and-shield')]){
  const record=data.weapons.find(x=>x.kind===key&&(ui!=='sword-and-shield'||x.name==='破滅のキリエヴェルド'));
  assert.ok(record,key);
  const {id,name,kind}=record;
  w.__review={equipment:[{key:'mainWeapon',id,name,kind}]};
  assert.equal(w.eval('applyOCRImportPayload(__review)'),true,ui);
  assert.equal(w.document.querySelector('#weaponKind').value,ui);
  assert.equal(w.document.querySelector('#weapon').value,String(id));
  assert.equal(w.eval('selectedWeapon()?.id'),id);
  assert.equal(w.eval('App.state.build.weapon?.kind'),key);
 }
 assert.deepEqual(errors,[]);
});
