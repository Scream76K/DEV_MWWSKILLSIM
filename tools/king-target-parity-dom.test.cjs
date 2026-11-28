'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
function setup(t){
 const d=new JSDOM(readSimulatorHtml(),{url:'https://king-target-parity.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(new Error('OFFLINE'));}});
 t.after(()=>d.window.close());const w=d.window;
 w.eval(`DB.monsters=[{id:20,name:'アルシュベルド',kind:'large',parts:[{id:'base-wing-left',name:'左翼',multipliers:{slash:.44,dragon:.17}},{id:'base-wing-right',name:'右翼',multipliers:{slash:.45,dragon:.18}}]}];renderMonsters()`);
 return w;
}
const el=(w,id)=>w.document.getElementById(id);
function change(w,node,value){node.value=value;node.dispatchEvent(new w.Event('change',{bubbles:true}));}
test('King displays combined paired options only, and other monsters keep their individual part selection',t=>{
 const w=setup(t);
 change(w,el(w,'monster'),'20:king');
 const picker=el(w,'kingTargetPicker');
 assert.ok(picker,'King combined target picker exists');
 assert.deepEqual([...picker.options].filter(o=>!o.hidden).map(o=>o.textContent),['部位を選択','頭','胴','鎖刃（解放状態）','鎖刃（解除状態）','脚','尻尾']);
 assert.equal([...picker.options].find(o=>o.value==='king-alsh:2').hidden,true);
 assert.equal(el(w,'comparisonPartLabel').htmlFor,'kingTargetPicker');
 assert.ok(el(w,'monsterPart').hidden);
 assert.ok(el(w,'monsterStateBox').hidden);
 change(w,picker,'king-alsh:2');assert.equal(el(w,'monsterPart').value,'king-alsh:2');assert.equal(w.eval('selectedPart().multipliers.slash'),.42);
 change(w,picker,'king-alsh:6');assert.equal(el(w,'monsterPart').value,'king-alsh:6');assert.equal(w.eval('selectedPart().multipliers.slash'),.26);
 change(w,el(w,'monster'),'20');
 assert.equal(el(w,'kingTargetPicker'),null);assert.equal(el(w,'monsterState'),null);
 assert.equal(el(w,'monsterPart').hidden,false);assert.equal(el(w,'comparisonPartLabel').htmlFor,'monsterPart');
 assert.deepEqual([...el(w,'monsterPart').options].map(o=>o.value),['','base-wing-right','base-wing-left']);
 change(w,el(w,'monsterPart'),'base-wing-right');assert.equal(w.eval('selectedPart().multipliers.dragon'),.18);
});
test('restoring a legacy right chain target preserves its ID and phase; both picker choices use the existing phase hitzones',t=>{
 const w=setup(t);
 change(w,el(w,'monster'),'20:king');
 const part=el(w,'monsterPart'),state=el(w,'monsterState');
 // The state-restoring session writes legacy IDs before rendering the controls.
 part.value='king-alsh:5';state.value='releasedOff';w.renderMonsterInfo();
 assert.ok(el(w,'kingTargetPicker'),'King combined target picker exists');
 assert.equal(el(w,'kingTargetPicker').value,'king-chain-off');
 assert.match(el(w,'comparisonTargetCurrent').textContent,/鎖刃（解除状態）/);
 assert.match(el(w,'monsterInfo').textContent,/鎖刃（解除状態）/);
 assert.equal(w.eval('selectedPart().id'),'king-alsh:5');
 assert.equal(w.eval('selectedPart().multipliers.dragon'),.05);
 el(w,'useTargetDragonHz').click();assert.equal(el(w,'powerDragonHz').value,'5');
 w.renderMonsterParts();assert.equal(el(w,'monsterPart').value,'king-alsh:5');assert.equal(el(w,'monsterState').value,'releasedOff');
 change(w,el(w,'kingTargetPicker'),'king-chain-on');
 assert.equal(el(w,'monsterPart').value,'king-alsh:5');
 assert.equal(el(w,'monsterState').value,'released');
 assert.equal(w.eval('selectedPart().multipliers.dragon'),.20);
 assert.equal(el(w,'powerDragonHz').value,'');
 change(w,el(w,'kingTargetPicker'),'king-chain-off');
 assert.equal(el(w,'monsterPart').value,'king-alsh:5');assert.equal(el(w,'monsterState').value,'releasedOff');
 assert.equal(w.eval('selectedPart().multipliers.dragon'),.05);
 part.value='king-alsh:3';w.renderMonsterInfo();assert.equal(el(w,'kingTargetPicker').value,'king-alsh:2');assert.equal(part.value,'king-alsh:3');
 part.value='king-alsh:7';w.renderMonsterInfo();assert.equal(el(w,'kingTargetPicker').value,'king-alsh:6');assert.equal(part.value,'king-alsh:7');
});

test('unadopted variants warn before calculating and never present borrowed meat values as supported',t=>{
 const w=setup(t);
 w.eval("DB.monsters[0].variants=[{id:41,kind:'arch-tempered',name:'アルシュベルド（歴戦王）'}];renderMonsters()");
 const monster=el(w,'monster'),info=el(w,'monsterInfo');
 const old=[...monster.options].find(o=>o.value==='20:v41');
 assert.ok(old.hidden);
 assert.match(old.textContent,/火力計算未対応/);
 assert.deepEqual([...monster.options].filter(o=>!o.hidden&&(/歴戦王/.test(o.textContent))).map(o=>o.value),['20:king']);
 assert.doesNotMatch([...monster.options].find(o=>o.value==='20').textContent,/未対応/);
 change(w,monster,'20:v41');
 assert.match(info.textContent,/この個体の部位肉質は火力計算に未対応/);
 assert.equal(monster.value,'20:v41','the selected variant is not silently replaced');
 assert.equal(el(w,'monsterPart').hidden,true);
 change(w,el(w,'monsterPart'),'base-wing-right');
 assert.doesNotMatch(info.textContent,/物理肉質.*%/);
 assert.match(w.comparisonReasonText('REAL_SLICE:TARGET_VARIANT_HITZONE_SOURCE_NOT_ADOPTED'),/通常個体またはトレーニングルーム/);
 change(w,monster,'20:king');
 const king=el(w,'kingTargetPicker');
 assert.ok([...king.options].some(o=>o.textContent==='脚'));
 assert.ok(![...king.options].some(o=>o.textContent==='右脚'));
 change(w,king,'king-alsh:6');
 assert.match(info.textContent,/脚.*火力計算に未対応/);
 change(w,monster,'training-room');
 assert.match(info.textContent,/物理肉質 80%/);
});

test('Uth Duna separates its veil parts, and Ajarakan keeps unidentified hide parts only for old saves',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push(
  {id:25,kind:'large',name:'ウズ・トゥナ',parts:[{id:2836,name:'head'},{id:2837,name:'waterfilm-right-head'},{id:2835,name:'waterfilm-left-front-leg'}]},
  {id:21,kind:'large',name:'アジャラカン',variants:[{id:27,kind:'tempered',name:'アジャラカン（歴戦の個体）'}],parts:[{id:2795,name:'head'},{id:2796,name:'hide'},{id:2797,name:'hide'}]});
  renderMonsters();`);
 const monster=el(w,'monster'),part=el(w,'monsterPart');
 change(w,monster,'25');
 const groups=[...part.querySelectorAll('optgroup')];
 assert.deepEqual(groups.map(g=>g.label),['本体','ヴェール（水膜）']);
 assert.deepEqual([...groups[0].children].map(o=>o.textContent),['頭']);
 assert.deepEqual([...groups[1].children].map(o=>o.textContent).sort(),['ヴェール・前脚（左側）','ヴェール・頭（右側）'].sort());
 change(w,monster,'21');
 assert.deepEqual([...part.options].filter(o=>!o.hidden).map(o=>o.textContent),['部位を選択','頭']);
 change(w,part,'2797');
 assert.equal(part.value,'2797','exact old part stays restorable');
 change(w,monster,'21:v27');
 assert.deepEqual([...part.options].filter(o=>!o.hidden).map(o=>o.textContent),['部位を選択','頭']);
});

test('ordinary and tempered Arkveld group only equal source parts and do not use closed chain hitzones for released chains',t=>{
 const w=setup(t);
 w.eval(`
 const raw=DB.monsters[0];
 const hz={slash:.26,blunt:.25,pierce:.20,fire:.02,water:.02,thunder:.02,ice:.02,dragon:.04};
 const blade={slash:.5,blunt:.5,pierce:.45,fire:0,water:0,thunder:0,ice:0,dragon:0};
 raw.parts.push(...[['right-leg',2787,hz],['left-leg',2790,hz],['right-wing-blade',2784,blade],['left-wing-blade',2791,blade]].map(([name,id,multipliers])=>({id,name,kind:name,monster:{id:20},multipliers})));
 raw.variants=[{id:22,kind:'tempered',name:'アルシュベルド（歴戦の個体）'}];renderMonsters();
 `);
 for(const id of ['20','20:v22']){
  change(w,el(w,'monster'),id);
  const picker=el(w,'kingTargetPicker'),raw=el(w,'monsterPart');
  const labels=[...picker.options].filter(o=>!o.hidden).map(o=>o.textContent);
  assert.ok(labels.includes('脚'));
  assert.ok(labels.includes('鎖刃（解除状態）'));
  assert.ok(labels.includes('鎖刃（解放状態・火力計算未対応）'));
  assert.doesNotMatch(labels.join('/'),/左脚|右脚|左翼|右翼/);
  assert.equal(picker.querySelector('[value=arkveld-chain-released]').disabled,true);
  raw.value='2787';w.renderMonsterInfo();assert.equal(picker.value,'arkveld-legs');assert.equal(raw.value,'2787');
  change(w,picker,'arkveld-chain-released');assert.equal(raw.value,'2787');
  change(w,picker,'arkveld-chain-retracted');assert.equal(raw.value,'2791');
  assert.equal(w.eval('selectedPart().multipliers.dragon'),0);
 }
});

test('Omega exposes one choice with one known target table, and distinguishes a genuinely different table',t=>{
 const w=setup(t);
 w.eval(`const baseParts=[{id:2733,name:'head',kind:'head',multipliers:{slash:.45}}];
 DB.monsters.push({id:33,kind:'large',name:'オメガ・プラネテス',parts:baseParts,variants:[{id:38,name:'オメガ・プラネテス',kind:'tempered'}]});
 renderMonsters();`);
 const monster=el(w,'monster');
 const publicOmega=()=>[...monster.options].filter(o=>!o.hidden&&/オメガ/.test(o.textContent));
 assert.deepEqual(publicOmega().map(o=>o.value),['33']);
 change(w,monster,'33:v38');assert.equal(monster.value,'33:v38');
 w.eval("{const omega=DB.monsters.find(m=>m.id===33);omega.variants[0].parts=JSON.parse(JSON.stringify(omega.parts));renderMonsters()}");
 assert.deepEqual(publicOmega().map(o=>o.value),['33']);
 w.eval("DB.monsters.find(m=>m.id===33).variants[0].parts[0].multipliers.slash=.49;renderMonsters()");
 assert.equal(publicOmega().length,2);
 assert.match(publicOmega().find(o=>o.value==='33:v38').textContent,/零式/);
});

test('Gore Magala labels wing and wingleg independently in ordinary and tempered forms',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push({id:7,name:'ゴア・マガラ',kind:'large',variants:[{id:7,kind:'tempered',name:'ゴア・マガラ（歴戦の個体）'}],
 parts:['left-wing','right-wing','left-wing-legs','right-wing-legs'].map((kind,i)=>({id:2637+i,kind,name:kind}))});
 renderMonsters();`);
 for(const id of ['7','7:v7']){
  change(w,el(w,'monster'),id);
  const names=[...el(w,'monsterPart').options].slice(1).map(x=>x.textContent);
  assert.deepEqual(names.sort(),['左翼','右翼','左翼脚','右翼脚'].sort());
 }
});

test('Gogmazios only offers named locations; unknown hide targets retain their stored identities',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push({id:34,name:'ゴグマジオス',kind:'large',parts:[
  {id:2717,name:'head'},{id:2718,name:'hide'},{id:2723,name:'hide'}]});renderMonsters();`);
 change(w,el(w,'monster'),'34');
 const part=el(w,'monsterPart');
 assert.deepEqual([...part.options].filter(o=>!o.hidden).map(x=>x.textContent),['部位を選択','頭']);
 change(w,part,'2723');assert.equal(part.value,'2723');
});
