const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs'),{data}=require('../tests/fixtures/offset-maximum-inputs.json'),{profiles}=require('../tests/fixtures/selected-hp-inputs.json');
test('current build custom route is actionable from its editor, repeats and invalidates safely',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://comboaudit.invalid',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;t.after(()=>w.close());
 const d=w.document,e=id=>d.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__db=JSON.stringify(data);w.__build=JSON.stringify(profiles.find(p=>p.kind==='great-sword').input);
 w.eval('const src=JSON.parse(__db);DB=normalizeDB({...src,weapons:consolidateArtiaFixedVariantRows(src.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters(); const snap=JSON.parse(__build);applyBuildSnapshot({...snap,armor:{},decos:{},combo:{moves:[]}});');
 const button=e('calcUserComboDamage'),out=e('compareOut'),custom=e('consumerCustomCombo');
 const compareFold=out.closest('details'),optional=e('comparisonOptionalConditions');
 assert.ok(compareFold.contains(custom),'combo editor stays inside the existing comparison');
 assert.equal(custom.parentElement,optional.parentElement,'custom and advanced folds are siblings');
 assert.equal(e('currentComboCard'),null,'no extra top-level card');
 assert.equal(custom.tagName,'DETAILS');
 assert.equal(custom.querySelector(':scope > summary').textContent.trim(),'コンボを自分で組む');
 assert.equal(custom.open,false,'the inline section is folded initially');
 assert.equal(optional.open,false,'advanced settings still start folded');
 custom.querySelector(':scope > summary').click();
 assert.equal(custom.open,true);
 assert.equal(optional.open,false,'opening the combo does not open advanced settings');
 for(const id of ['comboMovePicker','addCombo','combo','calcUserComboDamage']){
  assert.equal(d.querySelectorAll('#'+id).length,1,id+' must not be cloned');
  assert.ok(custom.contains(e(id)),id+' remains actionable inside comparison');
 }
 assert.ok(custom.contains(button),'action remains in the editor');
 for(let ancestor=button;ancestor;ancestor=ancestor.parentElement){
  assert.equal(ancestor.hidden,false);assert.notEqual(w.getComputedStyle(ancestor).display,'none');
  if(ancestor.tagName==='DETAILS')ancestor.open=true;
 }
 for(const id of ['calcUserComboDamage','userComboDamageOut'])assert.equal(d.querySelectorAll('#'+id).length,1);
 assert.match(custom.textContent,/現在の装備セット/);assert.match(custom.textContent,/ビルド火力比較/);
 const add=()=>{e('comboMovePicker').value='gs_charge3';assert.equal(e('comboMovePicker').value,'gs_charge3');e('addCombo').click();};
 const dataRow=key=>out.querySelector('[data-custom-damage="'+key+'"]');
 const values=key=>[...dataRow(key).querySelectorAll('td')].map(x=>x.textContent);
 const numbers=()=>{
  assert.match(out.textContent,/指定コンボ・現在のビルド/);
  assert.match(out.textContent,/暫定・参考/);
  const table=out.querySelector('.compare-table');
  assert.equal(out.querySelector('[data-used-combo]').nextElementSibling,table);
  assert.equal(table.querySelector('table').style.width,'100%');
  assert.deepEqual([...table.querySelectorAll('thead th')].map(x=>x.textContent),['項目','通常','最大','増減']);
  return values('total').slice(0,2).map(Number);
 };
 add();assert.equal(optional.open,false);
 button.click();
 const first=numbers();assert.ok(first.every(n=>n>0));
 assert.equal(optional.open,false,'calculating a combo does not open advanced settings');
 assert.equal(custom.open,true,'calculation leaves the editor open');
 assert.equal(d.activeElement,out.querySelector('[data-current-custom-heading]'));
 assert.deepEqual(values('element'),['24.8','24.8','0.0%']);
 add();assert.equal(out.querySelector('.compare-table'),null);button.click();const repeated=numbers();assert.ok(repeated.every((n,i)=>n>first[i]));
 t.diagnostic(JSON.stringify({first,repeated}));
 assert.equal(d.querySelectorAll('#combo .cmove').length,2);
 e('buildName').value='custom';e('saveBuild').click();
 assert.deepEqual(read('savedBuildMap().custom.combo.moves').map(x=>x.techniqueId),['gs_charge3','gs_charge3']);
 const boxes=()=>[...d.querySelectorAll('#compareBuilds input[data-compare-name]')];
 boxes()[0].checked=true;const saved=w.eval('storageGet(BUILDS_KEY)'),checks=boxes().map(x=>x.checked);
 e('runCompare').click();const standard=out.innerHTML;assert.doesNotMatch(standard,/指定コンボ・現在のビルド/);assert.match(standard,/custom/);
 button.click();assert.equal(d.activeElement.textContent,'指定コンボ・現在のビルド');w.dispatchEvent(new w.Event('resize'));assert.equal(numbers()[0],repeated[0]);assert.match(out.querySelector('[data-used-combo]').textContent,/通常：溜め斬りⅢ ×2最大：溜め斬りⅢ ×2/);
 const currentMarkup=out.innerHTML;
 const maximum=e('maximumSkillConditions');
 const toggle=maximum.querySelector('[data-maximum-skill]')||d.createElement('input');
 toggle.dataset.maximumSkill='fixture';if(!toggle.parentElement)maximum.append(toggle);
 toggle.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(out.innerHTML,currentMarkup);
 assert.equal(out.dataset.resultMode,'current-custom');
 assert.equal(w.eval('lastBuildComparisonRows'),null);
 w.runBuildCompare();assert.equal(out.dataset.resultMode,undefined);
 w.refreshP0DamageResults();w.dispatchEvent(new w.Event('resize'));assert.equal(out.innerHTML,standard);assert.deepEqual(boxes().map(x=>x.checked),checks);assert.equal(w.eval('storageGet(BUILDS_KEY)'),saved);
 button.click();e('monsterPart').dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(out.querySelector('.compare-table'),null);
 button.click();e('weapon').dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(out.querySelector('.compare-table'),null);
 w.addCombo('retired-test-id',{allowMissing:true});button.click();
 const fake=(physical,element)=>({execution:{status:'complete'},metrics:{comboTotalDamage:{status:'available',value:physical+element}},components:[{id:'body',status:'available',value:physical+element,details:{physical,element}}]});
 assert.match(out.textContent,/指定した技が現在の技データにありません/);assert.match(out.textContent,/未算出/);assert.deepEqual(values('total'),['未算出','未算出','—']);assert.doesNotMatch(out.textContent,/合計ダメージ：[\d]|DPS/);
 out.innerHTML=w.renderCurrentCustomResult({pipeline:{channels:{normal:fake(100.04,0),maximum:fake(124.04,3)}}});
 assert.deepEqual(values('total'),['100.0','127.0','+27.0%']);
 assert.deepEqual(values('element'),['0.0','3.0','—']);
 out.innerHTML=w.renderCurrentCustomResult({pipeline:{channels:{normal:{execution:{status:'blocked',reason:'準備条件が不明'}},maximum:fake(124.04,3)}}});
 assert.deepEqual(values('total'),['未算出','127.0','—']);
 assert.match(out.textContent,/準備条件が不明/);
 const notes=(id,ch)=>w.renderCurrentCustomResult({pipeline:{evaluationPlan:{techniqueIds:[id]},channels:{normal:ch}}});
 assert.match(notes('HBG_WYVERN_AMMO',{...fake(20,0),diagnostics:{referenceScope:'STANDARD_MODE_FULL_TWO_HIT_PROVISIONAL'}}),/竜撃弾.*2Hit.*ゲーム版/);
 assert.doesNotMatch(notes('HBG_WYVERN_AMMO',{execution:{status:'pending'}}),/2Hit|暫定・参考/);
 assert.match(notes('BOW_POWER_SHOT_3',fake(15,5)),/弓：.*ビン.*距離/);
});
test('comparison-session rollback restores output and its mode atomically',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const {functionSource}=require('./legacy-ocr-source.cjs');
 const src=fs.readFileSync(path.join(__dirname,'../ui/comparison-session.js'),'utf8');
 const expected='指定コンボ・現在のビルド';
 const output={innerHTML:expected,dataset:{resultMode:'current-custom'}},inputs={compareOut:output,weaponKind:{value:'great-sword'}};
 const ctx={build:{},calcState:{},App:{state:{combo:{}}},lastBuildComparisonRows:[{name:'previous'}],lastBuildComparisonContext:{},lastBuildComparisonBaselineIndex:0,restoring:false,
  validate(){},normalizeSelectedHp:()=> 'FULL_HP',check(v){assert.ok(v)},copy(x){return JSON.parse(JSON.stringify(x));},
  $(id){return inputs[id]||{}},captureDataControls:()=>({}),compareStep5Snapshot:()=>({}),applyBuildSnapshot(){delete output.dataset.resultMode;output.innerHTML='comparison interrupted';throw Error('test restore failure');},
  refreshWeaponListForCurrentKind(){},renderAll(){},restoreDataControls(){},restoreComboRows(){}};
 vm.createContext(ctx);vm.runInContext(functionSource(src,'restore'),ctx);
 assert.throws(()=>ctx.restore({currentBuild:{},conditions:{}},false),/test restore failure/);
 assert.equal(output.innerHTML,expected);assert.equal(output.dataset.resultMode,'current-custom');
 assert.equal(ctx.lastBuildComparisonRows[0].name,'previous');
});
