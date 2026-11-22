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
 assert.deepEqual([...picker.options].map(o=>o.textContent),['部位を選択','頭','胴','翼','鎖刃（解放状態）','鎖刃（解除状態）','脚','尻尾']);
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
