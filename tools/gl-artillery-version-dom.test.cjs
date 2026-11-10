const {test}=require('node:test'),assert=require('node:assert/strict');
const {createSyntheticCombatDom,equipSyntheticWeapon}=require('./synthetic-combat-fixture.cjs');
// Synthetic identity 987 and a one-unit white segment are explicit test inputs.
// White preserves the legacy page's 1.32/1.15 sharpness premise, not real equipment evidence.
function setup(t){const w=createSyntheticCombatDom(t);equipSyntheticWeapon(w,{id:987,gameId:987,sharpness:{white:1},kind:'great-sword',name:'Parity',damage:{raw:200,display:960},affinity:0,specials:[],slots:[],skills:[{name:'攻撃',level:2},{name:'見切り',level:1},{name:'超会心',level:2}]});return w;}

function gl(t){const w=setup(t);w.eval(`const f=DB.weapons[0];f.kind='gunlance';weaponIndexByKind['gunlance']=[f];weaponKind.value='gunlance';calcBuild();renderComboForWeapon();monsterHZ=()=>({hz:45,ehz:20});`);return w;}

function shell(w,type='NORMAL',stock=6){w.eval(`comboGLType.value='${type}';comboGLPower.value='MEDIUM';comboGLLoaded.value='${stock}';comboGLCharged.value='1';comboGLFireHz.value='20';comboPreset.value='adopted:gl_shell_reference';comboMovePicker.value='reference:gl_NORMAL';`);}
function clear(w){w.eval("document.getElementById('combo').innerHTML='';App.combo.reset()");}

for(const [type,stock] of [['NORMAL',6],['LONG',3],['WIDE',2]])for(const level of [1,2,3])test('current-version Artillery '+type+' Lv'+level+' never publishes an incomplete action total',t=>{const w=gl(t);shell(w,type,stock);w.eval('selectedWeapon().shellLevel=2;calcState.total='+JSON.stringify({'砲術':level}));for(const action of ['NORMAL','CHARGED','FULL_BURST']){clear(w);w.document.getElementById('comboMovePicker').value='reference:gl_'+action;w.addCombo('reference:gl_'+action);for(const fn of ['calcSelectedTechniqueDamage','calcUserComboDamage']){const r=w[fn]();assert.equal(r.damage,null,action+fn);assert.match(w.document.getElementById(fn==='calcSelectedTechniqueDamage'?'singleTechniqueDamageOut':'userComboDamageOut').textContent,/未算出/);assert.match(w.document.getElementById(fn==='calcSelectedTechniqueDamage'?'singleTechniqueDamageOut':'userComboDamageOut').textContent,/砲術/);}}w.document.getElementById('comboPreset').value='adopted:gl_shell_reference';assert.equal(w.calcTemplateComboDamage().damage,null);});
