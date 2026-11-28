const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
test('public charm editor has controls without a rule shortcut, explanation or visible verdict',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://charm-public.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 const doc=w.document, editor=doc.getElementById('charmEditor'), verdict=doc.getElementById('charmLegality');
 for(const [setup,status,shown] of [
   ['build.charmCustom={skills:[],slots:[0,0],weaponSlots:[]}', 'empty','未設定'],
   ["build.charmCustom={skills:[{name:'Unknown fixture',level:1}],slots:[0,0],weaponSlots:[]}",'unconfirmed','未確認'],
   ["build.charmCustom={skills:[{name:'Unknown fixture',level:0}],slots:[0,0],weaponSlots:[]}",'invalid','条件不一致'],
   ["DB.skills=[{id:72,name:'攻撃',kind:'weapon',ranks:[{level:1}]}];build.charmCustom={skills:[{name:'攻撃',type:'weapon',level:1}],slots:[0,0],weaponSlots:[]}",'possible','実現可能']
 ]){
   w.eval(setup+';renderCharmLegality()');
   assert.equal(w.eval('validateCurrentCharm().status'),status);
   assert.equal(verdict.textContent,shown);
   assert.ok(verdict.hidden);
   assert.equal(w.getComputedStyle(verdict).display,'none');
 }
 w.eval("build.charmCustom={skills:[{name:'攻撃',type:'weapon',level:1}],slots:[0,0],weaponSlots:[]};renderCharmEditor()");
 assert.ok(editor.querySelector('#charmPreset'));
 assert.equal(editor.querySelectorAll('.chSkill').length,3);
 const patterns=[...editor.querySelector('#charmSlotPattern').options].slice(1).map(x=>x.value);
 assert.ok(patterns.length>0);
 assert.deepEqual(patterns,JSON.parse(w.eval("JSON.stringify(['防1','防1-防1','防2','防2-防1','防3','武1','武1-防1','武1-防1-防1'].filter(x=>charmPossibleSlotValues(build.charmCustom.skills).includes(x)))")).map(x=>x).slice());
 assert.doesNotMatch(editor.textContent,/レア度ごとの生成テーブル|護石スキルとスロットは完全連動/);
 assert.equal(doc.querySelector('a[href*="kuroyonhon.com/mhwilds/memo/34.php"]'),null);
 assert.doesNotMatch(verdict.textContent,/護石生成可能性|護石テーブル更新基準|判定ルールの参照元/);
 assert.equal(w.eval('CHARM_RULE_SOURCE'),'https://kuroyonhon.com/mhwilds/memo/34.php');
});
