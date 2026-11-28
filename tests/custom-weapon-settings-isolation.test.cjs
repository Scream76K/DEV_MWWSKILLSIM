'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');

test('weapon-only settings are collapsed and change current custom conditions without changing legacy/standard or a named save', t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://custom-weapon.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 const change=(x,v)=>{assert.ok(x);x.value=v;assert.equal(x.value,v);x.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const snapshot=kind=>({...profiles.find(x=>x.kind===kind).input,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
 const apply=kind=>{w.__snap=JSON.stringify(snapshot(kind));w.eval('applyBuildSnapshot(JSON.parse(__snap))');};
 const run=()=>{let result;const orig=w.calcUserComboDamage;w.calcUserComboDamage=()=>result=orig();try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=orig;}assert.equal(el('compareOut').dataset.resultMode,'current-custom');return result;};
 const amounts=r=>[r.damage,r.maximumDamage];
 w.__data=JSON.stringify(data);
 w.eval('const loaded=JSON.parse(__data);DB=normalizeDB({...loaded,weapons:consolidateArtiaFixedVariantRows(loaded.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 apply('long-sword');
 const detail=el('comparisonOptionalConditions'),settings=el('customWeaponSettings');
 assert.ok(settings,'missing independent weapon settings');
 assert.equal(detail.open,false);
 assert.equal(settings.open,false);
 assert.equal(settings.closest('#comparisonOptionalConditions'),detail);
 assert.equal(settings.hidden,false);
 assert.deepEqual(Array.from(settings.querySelectorAll('select'),s=>s.id),['customWeaponSpiritGauge']);
 const standard=read('calcState.realOneHit');
 const legacyGauge=el('comboLSSpiritGauge').value;
 const gauge=el('customWeaponSpiritGauge');
 assert.equal(gauge.value,'');
 assert.equal(gauge.options[0].text,'おまかせ');
 change(gauge,'RED');
 assert.deepEqual(read('calcState.realOneHit'),standard);
 assert.equal(el('comboLSSpiritGauge').value,legacyGauge);
 change(el('comboMovePicker'),'ls_fade');el('addCombo').click();
 assert.ok(run().blocked[0].reason.includes('LS_FORESIGHT_SLASH:GAUGE'));
 assert.equal(el('compareOut').querySelector('[data-used-weapon-settings]'),null);
 change(gauge,'NONE');
 const accepted=run();assert.ok(amounts(accepted).every(n=>Math.abs(n-34.70004)<1e-8));
 const used=el('compareOut').querySelector('[data-used-weapon-settings]');
 assert.match(used.textContent,/練気ゲージ：なし/);
 assert.ok(used.previousElementSibling.matches('[data-used-combo]'));
 el('buildName').value='look';el('saveBuild').click();
 const save=read('savedBuildMap().look');
 change(gauge,'RED');
 assert.notEqual(el('compareOut').dataset.resultMode,'current-custom');
 assert.deepEqual(read('savedBuildMap().look'),save);
 assert.equal(el('comboLSSpiritGauge').value,legacyGauge);
 assert.deepEqual(amounts(w.calcP0Damage('single')),amounts(accepted));
 change(gauge,'');
 assert.deepEqual(amounts(run()),amounts(accepted));
 assert.equal(el('compareOut').querySelector('[data-used-weapon-settings]'),null);
 for(const kind of ['sword-and-shield','gunlance','lance','hammer']){
  apply(kind);assert.equal(settings.hidden,true,kind);
 }
});

test('explicit Bow NONE and LBG customization zero travel only through current damage; invalid numeric input is not treated as Auto', t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://weapon-ballistics.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id), change=(id,value)=>{const e=el(id);assert.ok(e,id);e.value=value;assert.equal(e.value,value,id);e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 const pack=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json');
 w.__db=JSON.stringify(pack.data);w.eval('DB=normalizeDB(JSON.parse(__db));weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();');
 change('buildTemplateWeaponKind','bow');change('buildTemplateSelect','SALADA_BOW_05');el('loadBuildTemplate').click();
 change('monster','training-room');change('monsterPart','training-front');
 w.eval('App.state.combo.moves=[];restoreComboRows();');
 change('comboMovePicker','canonical:BOW_THOUSAND_DRAGONS');el('addCombo').click();
 const totals=()=>Array.from(el('compareOut').querySelectorAll('[data-custom-damage="total"] td'),x=>x.textContent).slice(0,2);
 const bow='customWeaponCoating_powerBowCoating';
 for(const legacy of ['powerBowCoating','powerBowRange','powerBowStartShot'])change(legacy,'');
 const standardBow=read('calcState.realOneHit');
 assert.deepEqual(el(bow).value,'');
 change(bow,'NONE');el('calcUserComboDamage').click()

 assert.deepEqual(totals(),['441.7','554.2'],el('compareOut').textContent);
 assert.match(el('compareOut').querySelector('[data-used-weapon-settings]').textContent,/ビン：ビンなし/);
 assert.equal(el('powerBowCoating').value,'');
 change(bow,'PIERCE');el('calcUserComboDamage').click();
 assert.deepEqual(totals(),['未算出','未算出']);
 assert.equal(el('compareOut').querySelector('[data-used-weapon-settings]'),null);
 assert.deepEqual(read('calcState.realOneHit'),standardBow);
 change(bow,'');el('calcUserComboDamage').click();assert.deepEqual(totals(),['441.7','554.2'],el('compareOut').textContent);

 w.__db=JSON.stringify(data);
 w.eval('const loaded2=JSON.parse(__db);DB=normalizeDB({...loaded2,weapons:consolidateArtiaFixedVariantRows(loaded2.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const base=profiles.find(p=>p.kind==='light-bowgun').input;
 w.__snap=JSON.stringify({...base,weaponId:'763',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
 w.eval('applyBuildSnapshot(JSON.parse(__snap))');
 const standardLbg=read('calcState.realOneHit');
 const picker=el('comboMovePicker'),id='canonical:LBG_NORMAL_AMMO_2';
 assert.ok(Array.from(picker.options,x=>x.value).includes(id),Array.from(picker.options,x=>x.value).join(','));
 for(let i=0;i<2;i++){change('comboMovePicker',id);el('addCombo').click();}
 const mode='customWeaponShotMode_comboLBGMode',type='customWeaponAmmoType_comboLBGAmmoType',level='customWeaponAmmoLevel_comboLBGAmmoLevel',boost='customWeaponNormalModeLevel_comboLBGNormalMode';
 change(mode,'NORMAL');change(type,'NORMAL');change(level,'2');change(boost,'0');
 el('calcUserComboDamage').click();
 assert.deepEqual(totals(),['82.3','82.3']);
 assert.match(el('compareOut').querySelector('[data-used-weapon-settings]').textContent,/弾Lv：2/);
 assert.equal(el('comboLBGNormalMode').value,'');
 assert.deepEqual(read('calcState.realOneHit'),standardLbg);
 change(level,'0');el('calcUserComboDamage').click();
 assert.deepEqual(totals(),['未算出','未算出']);
 assert.match(el('compareOut').textContent,/弾Lv.*入力範囲/);
});
