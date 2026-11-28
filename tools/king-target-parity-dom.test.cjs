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
 assert.deepEqual([...picker.options].filter(o=>!o.hidden).map(o=>o.textContent),['部位を選択','頭','胴','鎖刃（解放状態）','鎖刃（解除状態）','右/左脚','尻尾']);
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
 assert.equal(monster.querySelector('[value="20:king"]').textContent,'アルシュベルド（歴戦王）（火力計算未対応）');
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
 assert.ok([...king.options].some(o=>o.textContent==='右/左脚'));
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
  assert.ok(labels.includes('右/左脚'));
  assert.ok(labels.includes('鎖刃（解除状態）'));
  assert.ok(labels.includes('鎖刃（解放状態・火力計算未対応）'));
  assert.doesNotMatch(labels.filter(x=>x!=='右/左脚').join('/'),/左脚|右脚|左翼|右翼/);
  assert.equal(picker.querySelector('[value=arkveld-chain-released]').disabled,true);
  raw.value='2787';w.renderMonsterInfo();assert.equal(picker.value,'arkveld-legs');assert.equal(raw.value,'2787');
  change(w,picker,'arkveld-chain-released');assert.equal(raw.value,'2787');
  change(w,picker,'arkveld-chain-retracted');assert.equal(raw.value,'2791');
  assert.equal(w.eval('selectedPart().multipliers.dragon'),0);
 }
});

test('Omega exposes one choice with one known target table, and distinguishes a genuinely different table',t=>{
 const w=setup(t);
 w.eval(`const baseParts=[{id:2733,name:'head',kind:'head',multipliers:{slash:.45,blunt:.45,pierce:.45,fire:0,water:0,thunder:0,ice:0,dragon:0}}];
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

test('Xu Wu and Jin Dahaad show source-backed Japanese labels without losing their targets',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push(
  {id:23,name:'シーウー',kind:'large',variants:[{id:29,kind:'tempered',name:'シーウー（歴戦の個体）'}],
   parts:['umbrella','tentacle','mouth','left-front-arm','right-hind-arm','left-side-arm'].map((kind,i)=>({id:2813+i,kind,name:kind}))},
  {id:26,name:'ジン・ダハド',kind:'large',
   parts:['neck','frozen-core-waist','frozen-bigcore-before','frozen-bigcore-after'].map((kind,i)=>({id:2848+i,kind,name:kind}))});
 renderMonsters();`);
 const mon=el(w,'monster'),part=el(w,'monsterPart'),names=()=>[...part.options].slice(1).map(x=>x.textContent).sort();
 for(const id of ['23','23:v29']){
  change(w,mon,id);
  assert.deepEqual(names(),['傘膜','触腕','口','左第1腕','右第3腕','左第2腕'].sort());
 }
 change(w,mon,'26');
 assert.deepEqual(names(),['首','凍成殻（腰部）','大凍成殻（露出前）','大凍成殻（露出後）'].sort());
 const after=[...part.options].find(x=>x.textContent==='大凍成殻（露出後）');
 change(w,part,after.value);assert.equal(w.selectedPart().name,'frozen-bigcore-after');
});

test('Zoh Shia distinguishes crystallized parts from both unlabeled body rows and explains the labels',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push({id:1,name:'ゾ・シア',kind:'large',parts:[
  ['head-wear',.40],['head',.60],['head-hide',.65],['left-wing-arm-wear',.40],['left-wing-arm',.80],['left-wing-arm-hide',.85],
  ['right-wing-arm-wear',.40],['right-wing-arm',.80],['right-wing-arm-hide',.85]
 ].map(([kind,slash],i)=>({id:2557+i,kind,name:kind,multipliers:{slash}}))});renderMonsters();`);
 change(w,el(w,'monster'),'1');
 const part=el(w,'monsterPart'),info=el(w,'monsterInfo');
 assert.match(info.textContent,/白纏晶.*本体.*斬撃肉質/);
 const options=[...part.options].slice(1).map(o=>o.textContent);
 for(const name of ['頭（白纏晶）','頭（本体・斬撃60）','頭（本体・斬撃65）','左翼腕（白纏晶）','左翼腕（本体・斬撃80）','左翼腕（本体・斬撃85）','右翼腕（白纏晶）','右翼腕（本体・斬撃80）','右翼腕（本体・斬撃85）'])assert.ok(options.includes(name),name);
 const selected=[...part.options].find(o=>o.textContent==='頭（本体・斬撃65）');
 change(w,part,selected.value);assert.equal(w.selectedPart().multipliers.slash,.65);
 assert.match(info.textContent,/白纏晶.*本体.*斬撃肉質/);
});

test('Mizutsune and regular and tempered Chatacabra use identifiable Japanese part names',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push(
  {id:15,name:'タマミツネ',kind:'large',parts:['dorsal-fin','left-nail','right-nail'].map((kind,i)=>({id:2742+i,kind,name:kind}))},
  {id:14,name:'チャタカブラ',kind:'large',variants:[{id:14,name:'チャタカブラ（歴戦の個体）',kind:'tempered'}],parts:['ass','tongue'].map((kind,i)=>({id:2706+i,kind,name:kind}))});
 renderMonsters();`);
 const monster=el(w,'monster'),part=el(w,'monsterPart'),names=()=>[...part.options].slice(1).map(o=>o.textContent).sort();
 change(w,monster,'15');assert.deepEqual(names(),['背ビレ','左爪','右爪'].sort());
 for(const id of ['14','14:v14']){change(w,monster,id);assert.deepEqual(names(),['尻','舌'].sort());}
});

test('Doshaguma tail shows only the label, keeping its real part identity',t=>{
 const w=setup(t);
 w.eval(`DB.monsters.push({id:11,name:'ドシャグマ',kind:'large',parts:[{id:2677,name:'tail-hair',kind:'tail-hair'}]});renderMonsters();`);
 change(w,el(w,'monster'),'11');
 const part=el(w,'monsterPart');
 assert.equal([...part.options].find(o=>o.value==='2677').textContent,'尻尾');
 change(w,part,'2677');assert.equal(w.selectedPart().id,2677);
 assert.match(el(w,'comparisonTargetCurrent').textContent,/尻尾$/);
 assert.doesNotMatch(el(w,'comparisonTargetCurrent').textContent,/2677|tail-hair/);
});

test('monster families expose identified parts only and preserve hidden saved target IDs',t=>{
 const w=setup(t);
 const source=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data.monsters;
 const cases=[
   [27,{'2862':'傘膜','2863':'口','2866':'触腕','2859':'右/左第1腕','2861':'右/左第2腕','2860':'右/左第3腕'}],
   [6,{'2614':'外套膜','2607':'毒トゲ','2617':'腹部'}],
   [31,{'2633':'後脚','2634':'前脚'}],
   [4,{'2595':'花弁状部','2599':'尻尾'}],
   [3,{'2580':'右/左翼','2589':'尻尾'}],
   [16,{'2751':'鼻','2753':'頭'}],
 ];
 w.eval('DB.monsters.push(...'+JSON.stringify(source.filter(m=>cases.some(([id])=>id===m.id)))+');renderMonsters()');
 const mon=el(w,'monster'),part=el(w,'monsterPart');
 for(const [id,names] of cases){
   const fixture=source.find(m=>m.id===id);
   for(const key of [String(id),...fixture.variants.map(v=>id+':v'+v.id)]){
     change(w,mon,key);
     const opts=[...part.options],visible=opts.filter(o=>!o.hidden);
     assert.doesNotMatch(visible.map(o=>o.textContent).join('/'),/その他部位|ID /,key);
     for(const [value,label] of Object.entries(names))assert.equal(opts.find(o=>o.value===value)?.textContent,label,key);
     for(const row of fixture.parts.filter(p=>p.kind==='hide')){
       assert.equal(opts.find(o=>o.value===String(row.id))?.hidden,true,key);
       change(w,part,String(row.id));w.renderMonsterParts();
       assert.equal(part.value,String(row.id),key);
       if(key===String(id))assert.equal(w.selectedPart().id,row.id,key);
     }
   }
 }
});

test('Guardian Arkveld groups legs and chainblades without borrowing normal Arkveld target IDs',t=>{
 const w=setup(t);
 const guardian=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data.monsters.find(m=>m.id===9);
 w.eval('DB.monsters.push('+JSON.stringify(guardian)+');renderMonsters()');
 change(w,el(w,'monster'),'9');
 const picker=el(w,'kingTargetPicker'),raw=el(w,'monsterPart');
 assert.ok(picker);
 assert.deepEqual([...picker.options].filter(o=>!o.hidden).map(o=>o.textContent).sort(),[
   '部位を選択','右/左脚','鎖刃（解放状態・火力計算未対応）','鎖刃（解除状態）','頭','胴','尻尾'
 ].sort());
 raw.value='2664';w.renderMonsterInfo();assert.equal(picker.value,'arkveld-legs');
 change(w,picker,'arkveld-chain-retracted');assert.equal(raw.value,'2665');
 assert.equal(w.selectedPart().multipliers.dragon,0);
 assert.equal(picker.querySelector('[value=arkveld-chain-released]').disabled,true);
 change(w,picker,'arkveld-chain-released');assert.equal(raw.value,'2665');
 raw.value='2662';w.renderMonsterParts();assert.equal(raw.value,'2662');
 assert.equal(picker.querySelector('[value="2662"]').hidden,true);
});

test('all source monsters hide unidentified parts, and mirror choices merge only on matching full records',t=>{
 const w=setup(t);
 const source=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data.monsters;
 w.eval('DB.monsters='+JSON.stringify(source)+';renderMonsters()');
 const mon=el(w,'monster'),part=el(w,'monsterPart');
 for(const option of [...mon.options].filter(o=>!o.hidden&&o.value)){
  change(w,mon,option.value);
  const menu=el(w,'kingTargetPicker')||part;
  const names=[...menu.options].filter(o=>!o.hidden).map(o=>o.textContent);
  assert.doesNotMatch(names.join('/'),/その他部位|部位不明|ID \d|[a-z]+-[a-z]+/,option.textContent);
  assert.equal(new Set(names).size,names.length,option.textContent);
 }
 change(w,mon,'3');
 const combined=()=>[...part.options].filter(o=>!o.hidden).map(o=>o.textContent);
 assert.ok(combined().includes('右/左脚'));assert.ok(combined().includes('右/左翼'));
 part.value='2582';w.renderMonsterParts();assert.equal(w.selectedPart().id,2582);
 assert.equal(part.selectedOptions[0].textContent,'右/左脚');
 w.eval("DB.monsters.find(m=>m.id===3).parts.find(p=>p.id===2582).multipliers.ice=.99;renderMonsterParts()");
 assert.ok(combined().includes('右脚'));assert.ok(combined().includes('左脚'));
 assert.ok(!combined().includes('右/左脚'));
});

test('only explicitly matching complete variant tables share a visible monster choice',t=>{
 const w=setup(t);
 w.eval(`const table=[{id:71,kind:'head',name:'head',multipliers:{slash:.4,blunt:.4,pierce:.4,fire:.1,water:0,thunder:0,ice:.1,dragon:0},states:[{kind:'wound',slash:.6}]}];
 const same=JSON.parse(JSON.stringify(table));same[0].id=72;
 const distinct=JSON.parse(JSON.stringify(table));distinct[0].id=73;distinct[0].states[0].slash=.7;
 DB.monsters.push({id:2,kind:'large',name:'アジャラカン',parts:table,variants:[
 {id:17,kind:'tempered',name:'アジャラカン（歴戦の個体）',parts:same},
 {id:18,kind:'arch-tempered',name:'アジャラカン（歴戦王）',parts:distinct},
 {id:19,kind:'frenzied',name:'狂竜化アジャラカン'}]});
 renderMonsters();`);
 const mon=el(w,'monster'),part=el(w,'monsterPart');
 const option=v=>[...mon.options].find(o=>o.value===v);
 assert.equal(option('2').textContent,'アジャラカン（通常/歴戦個体）');
 assert.equal(option('2:v17').hidden,true);
 assert.equal(option('2:v18').hidden,false);assert.equal(option('2:v19').hidden,false);
 change(w,mon,'2:v17');part.value='72';w.renderMonsterParts();
 assert.equal(mon.value,'2:v17');assert.equal(part.value,'72');
});
