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

test('legacy move diagnostics agree in the editor, comparison counts and individual lanes',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://legacy.invalid',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;t.after(()=>w.close());
 const el=id=>w.document.getElementById(id);
 w.source=data;
 w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters()');
 for(const [kind,id,message,repeat=1] of [
  ['heavy-bowgun','hbg_pierce2','「貫通弾 Lv2」は指定コンボの計算に未接続です。'],
  ['gunlance','gl_thrust','踏み込み突き上げは傷のない部位への地上本体1打のみ算出します。',2],
  ['hammer','hm_charge2','「溜め2攻撃」だけでは開始条件や技の種類を特定できません。'],
  ['dual-blades','db_dance3','「鬼人連斬Ⅲ」に対応する技は未登録です。「乱舞Ⅲ」は別の技です。'],
  ['long-sword','ls_release','「練気解放無双斬り（赤）」だけでは開始条件や技の種類を特定できません。'],
  ['switch-axe','sa_element','「属性解放突き」だけでは開始条件や技の種類を特定できません。'],
  ['bow','bow_arc','「曲射」だけでは開始条件や技の種類を特定できません。'],
  ['hammer','retired-fixture','指定した技が現在の技データにありません。']
 ]){
  w.applyBuildSnapshot({...profiles.find(p=>p.kind===kind).input,combo:{moves:[{techniqueId:id,repeat}]}});
  el('calcUserComboDamage').click();
  assert.ok(el('compareOut').textContent.includes(message),el('compareOut').textContent);
  if(['ls_release','sa_element','bow_arc'].includes(id)){
   const output=el('compareOut');
   assert.deepEqual([...output.querySelector('[data-custom-damage="total"]').querySelectorAll('td')].map(x=>x.textContent),['未算出','未算出','—']);
   assert.doesNotMatch(output.textContent,/指定した技が現在の技データにありません/);
  }
  el('buildName').value='確認';el('saveBuild').click();
  assert.equal(w.savedBuildMap()['確認'].combo.moves[0].techniqueId,id);
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  el('compareBuilds').querySelector('[data-compare-name="確認"]').checked=true;
  el('runCompare').click();
  const reasons=el('compareOut').querySelector('[data-comparison-pending]').textContent;
  assert.equal(reasons.split(message).length-1,3,reasons);
  assert.ok(!reasons.includes(id),reasons);assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 }
});

for(const [prefix,kind,fixture,expected] of [
 ['LBG','light-bowgun','r260-lbg-element-first-hit',7.812],
 ['HBG','heavy-bowgun','r259-hbg-element-first-hit',11.16]
])test(prefix+' presents only the selected elemental first contact in live and saved views',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://first.invalid',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;t.after(()=>w.close());
 const f=require('../docs/reports/'+fixture+'/fixture.json'),el=id=>w.document.getElementById(id);
 const id=prefix+'_ELEMENT_FIRST_HIT_REFERENCE',move='canonical:'+id;
 w.fixture=f;w.kind=kind;
 w.eval('clearWeaponBuckets();DB.weapons=[fixture.weapon];DB.skills=fixture.skills;DB.decorations=[];weaponIndexByKind[kind]=DB.weapons;weaponKind.value=kind;weapon.replaceChildren(new Option(fixture.weapon.name,fixture.weapon.id));App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value="training-room";renderMonsterParts();monsterPart.value="training-front";renderComboForWeapon();App.state.combo.moves=[];restoreComboRows()');
 el('comboMovePicker').value=move;el('addCombo').click();
 const fields=prefix==='LBG'?{comboLBGMode:'NORMAL',comboLBGAmmoType:'THUNDER',comboLBGAmmoLevel:'1',comboLBGRange:'CRITICAL',comboLBGNormalMode:'0',comboLBGContactPolicy:'FIRST_HIT'}:
 {powerHbgElementType:'thunder',powerHbgAmmoLevel:'1',powerHbgRange:'CRITICAL',powerHbgNormalMode:'0'};
 for(const [field,value] of Object.entries(fields))el(field).value=value;
 w.calcBuild();
 el('calcUserComboDamage').click();
 const reference=()=>el('compareOut').querySelector('[data-element-first-contact]')?.textContent;
 const label='初段のみ（参考） 通常 '+expected.toFixed(1)+' ／ 最大 '+expected.toFixed(1);
 assert.equal(reference(),label);
 assert.match(el('compareOut').querySelector('[data-custom-damage="total"]').textContent,/未算出.*未算出/);
 el('buildName').value='保存';el('saveBuild').click();
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 const stateControl=el(prefix==='LBG'?'comboLBGRange':'powerHbgElementType');
 stateControl.value=prefix==='LBG'?'NEAR':'fire';
 stateControl.dispatchEvent(new w.Event('change',{bubbles:true}));
 el('calcUserComboDamage').click();assert.equal(reference(),undefined);
 el('compareBuilds').querySelector('[data-compare-name="保存"]').checked=true;el('runCompare').click();
 assert.equal(reference(),label);
 const row=w.eval('lastBuildComparisonRows[0]');
 for(const lane of ['normal','maximum']){
  const total=w.consumerDamageMetric(row,lane).value;
  if(prefix==='LBG'){
   assert.equal(total.toFixed(1),'299.9');
   assert.match(el('compareOut').textContent,/速射5回/);
  }else assert.equal(total,null);
 }
 const selection=w.elementFirstContactSelection(kind,[{techniqueId:move}]);
 const valid={diagnostics:{referenceScope:'FIRST_HIT_ONLY_NOT_WHOLE_SHOT'},execution:{status:'complete'},metrics:{
  firstHitReference:{status:'available',value:expected},comboTotalDamage:{status:'unavailable'}}};
 const pipeline={evaluationPlan:{selection:'EXPLICIT',techniqueIds:[id]},channels:{maximum:valid}};
 const render=()=>w.renderElementFirstContact({...selection,oneHitPipeline:pipeline});
 assert.match(render(),/最大/);assert.doesNotMatch(render(),/通常/);
 pipeline.channels={normal:valid};assert.match(render(),/通常/);assert.doesNotMatch(render(),/最大/);
 pipeline.evaluationPlan.selection='STANDARD';assert.equal(render(),'');
 pipeline.evaluationPlan.selection='EXPLICIT';valid.diagnostics.referenceScope=prefix+'_EXPLICIT_CONTACT_SEQUENCE';
 valid.metrics.comboTotalDamage={status:'available',value:expected*2};assert.equal(render(),'');
 for(const moves of [[{techniqueId:id}],[{techniqueId:move,repeat:2}],[{techniqueId:move},{techniqueId:move}]]){
  assert.equal(w.elementFirstContactSelection(kind,moves).elementFirstContact,undefined);
 }

 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
});

for(const [kind,weaponId,damage] of [['light-bowgun',763,35.8344],['heavy-bowgun',467,91.43808]])
 for(const view of ['current','saved'])test(kind+' ordinary explicit contact label in '+view,t=>{
  const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
  const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://move-audit.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
  t.after(()=>{w.close();assert.deepEqual(errors,[]);});
  const el=id=>w.document.getElementById(id);
  w.__db=JSON.stringify(data);
  w.eval('const src=JSON.parse(__db);DB=normalizeDB({...src,weapons:consolidateArtiaFixedVariantRows(src.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
  const count=5,element='thunder';
  const light=kind==='light-bowgun', id='canonical:'+(light?'LBG':'HBG')+'_ELEMENT_FIRST_HIT_REFERENCE';
  const base=profiles.find(p=>p.kind===kind).input;
  const weapon=data.weapons.find(w=>String(w.id)===String(weaponId));
  assert.ok(weapon);
  const ammo=weapon.ammo.find(a=>a.kind===element);assert.ok(ammo);
  const common={shotMode:'NORMAL',ammoLevel:ammo.level,range:'CRITICAL',normalModeLevel:0,shotOrdinal:1,fullMagazine:true,contactTargetPolicy:'CURRENT_TARGET',contactPolicy:'EXPLICIT_CONTACTS',contactCount:count};
  const details=light?{lightBowgunState:{...common,ammoType:element.toUpperCase(),loadedRounds:ammo.capacity,elementPowder:'NONE'}}:{hbgReferenceState:{...common,elementType:element,ammoType:'ELEMENT',magazineCapacity:ammo.capacity}};
  w.__snap=JSON.stringify({...base,weaponId:String(weaponId),armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},combatBuffs:{meal:'NONE',charm:'NO',otherBuffs:'NONE'},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],...details}});
  w.eval('applyBuildSnapshot(JSON.parse(__snap))');
  el('comboMovePicker').value=id;el('addCombo').click();

  const current=w.calcUserComboDamage();
  const output=()=>el('compareOut').querySelector('.used-combo-entry').textContent;
  const label='電撃弾 Lv1・射撃 5命中（参考）';
  const checkTotal=(pipeline,expected)=>{
    for(const lane of ['normal','maximum'])
      assert.ok(Math.abs(pipeline.channels[lane].metrics.comboTotalDamage.value-expected)<1e-8);
  };
  checkTotal(current.pipeline,damage);
  if(view==='current'){
    assert.ok(output().includes('通常：'+label+'最大：'+label),output());
    const p=current.pipeline, selection={elementFirstContact:id.slice(10)};
    const evaluate=(plan,channel)=>w.evaluatedElementContacts(selection,{evaluationPlan:plan,channels:{normal:channel}},'normal');
    const plan=p.evaluationPlan,c=p.channels.normal;
    for(const patch of [{projectileCount:2},{shotMode:'RAPID'},{contactCount:4}]){
      assert.equal(evaluate({...plan,standardAmmo:{...plan.standardAmmo,...patch}},c),null);
    }
    assert.equal(evaluate(plan,{...c,components:[]}),null);
    assert.equal(evaluate(plan,{...c,execution:{...c.execution}}),null); // No evaluated name for a copied execution.
    assert.equal(evaluate(plan,{...c,diagnostics:{referenceScope:'FIRST_HIT_ONLY_NOT_WHOLE_SHOT'}}),null);
    return;
  }
  el('buildName').value='保存';el('saveBuild').click();
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  el('combo').querySelector('.del').click();
  el('compareBuilds').querySelector('[data-compare-name="保存"]').checked=true;el('runCompare').click();
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  const row=w.eval('lastBuildComparisonRows[0]');
  checkTotal(row.oneHitPipeline,light?299.88:damage);
  if(light){
    assert.ok(output().includes('通常：通常弾 Lv2・速射5回（25ヒット）最大：通常弾 Lv2・速射5回（25ヒット）'));
    assert.ok(output().includes('指定コンボ：通常 '+label+' 35.8 ／ 最大 '+label+' 35.8'),output());
  }else assert.ok(output().includes('通常：'+label+'最大：'+label),output());
});

for(const [kind,weaponId,id,legacy,hits,total,state] of [
 ['long-sword','836','LS_SPIRIT_RELEASE','ls_release',14,203.4018,{longSwordState:{spiritGauge:'YELLOW'}}],
 ['switch-axe','914','SA_GROUND_ELEMENT_DISCHARGE_FULL_TRIAL','sa_element',10,248.55012,{switchAxeState:{mode:'SWORD',awakened:false}}],
 ['bow','1','BOW_ARC_1_FULL_TRIAL','bow_arc',8,44.64+2*require('../tests/fixtures/bow-arc-blast-measured.json').observations[0].reportedDamagePerBlast,{bowState:{chargeLevel:1,coating:'NONE',range:'CRITICAL',guided:false}}]
])test('measurement picker and saved comparison: '+id,t=>{
 const errors=[],vc=new VirtualConsole().on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://measurement.invalid/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));
 }}).window;t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id),rowId='canonical:'+id;
 const base={...profiles.find(p=>p.kind===kind).input,weaponId,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[],...state}};
 w.fixtureData=data;w.fixtureSnapshot=base;
 w.eval('DB=normalizeDB({...fixtureData,weapons:consolidateArtiaFixedVariantRows(fixtureData.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(fixtureSnapshot);');
 const standard=()=>w.eval(`JSON.stringify((p=>[p.evaluationPlan.techniqueIds,...Object.values(p.channels||{}).map(c=>c.metrics.comboTotalDamage.value)])(evaluateConsumerCombat({kind:comboKind(),target:{monster:"training-room",part:"training-front"},conditions:compareStep5Snapshot()})))`);
 const standardBefore=standard();
 const picker=el('comboMovePicker');
 picker.value=rowId;
 assert.equal(picker.value,rowId,'explicit technique belongs in the picker');
 el('addCombo').click();
 let result;const calc=w.calcUserComboDamage;
 w.calcUserComboDamage=()=>result=calc();
 el('calcUserComboDamage').click();
 const check=pipeline=>{
  assert.ok(pipeline,result?.blocked?.[0]?.reason);
  for(const lane of ['normal','maximum']){
   const ch=pipeline.channels?.[lane];
   assert.ok(Math.abs(ch?.metrics.comboTotalDamage.value-total)<1e-8,JSON.stringify([pipeline.reason,pipeline.evaluationPlan,ch?.execution,ch?.issues,ch?.metrics.comboTotalDamage]));
   assert.equal(new Set(ch.components.filter(c=>c.status==='available').map(c=>c.eventId)).size,hits);
  }
 };
 check(result.pipeline);
 assert.match(el('compareOut').textContent,new RegExp(hits+'ヒット'));
 for(const name of ['A','B']){
  el('buildName').value=name;el('saveBuild').click();
  assert.equal(w.savedBuildMap()[name].combo.moves[0].techniqueId,rowId);
 }
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 if(kind==='bow'){
  el('powerBowCoating').value='POWER';
  el('powerBowCoating').dispatchEvent(new w.Event('change',{bubbles:true}));
  el('calcUserComboDamage').click();assert.equal(result.damage,null);
 }
 for(const e of el('compareBuilds').querySelectorAll('input[data-compare-name]'))e.checked=true;
 el('runCompare').click();
 const saved=w.eval('lastBuildComparisonRows');
 assert.equal(saved.length,2);
 for(const row of saved){
  check(row.oneHitPipeline);
  assert.ok(Math.abs(row.referenceCombo.damage-total)<1e-8);
 }
 assert.match(el('compareOut').textContent,new RegExp(hits+'ヒット'));
 if(kind==='bow')assert.equal(el('powerBowCoating').value,'POWER');
 w.applyBuildSnapshot({...base,combo:{...state,moves:[{techniqueId:rowId,repeat:2}]}});
 el('calcUserComboDamage').click();assert.equal(result.damage,null);
 assert.match(el('compareOut').textContent,/参考計算の条件外/);
 const wrongState=kind==='bow'?{bowState:{...state.bowState,coating:'POWER'}}:kind==='switch-axe'?{switchAxeState:{mode:'AXE',awakened:false}}:{longSwordState:{spiritGauge:'RED'}};
 w.applyBuildSnapshot({...base,combo:{...wrongState,moves:[{techniqueId:rowId}]}});
 el('calcUserComboDamage').click();assert.equal(result.damage,null);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 w.applyBuildSnapshot(base);
 assert.equal(standard(),standardBefore);
 w.applyBuildSnapshot({...base,combo:{...state,moves:[{techniqueId:legacy}]}});
 el('calcUserComboDamage').click();assert.equal(result.damage,null);
 assert.equal(el('combo').querySelector('.cmove').value,legacy);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
});
