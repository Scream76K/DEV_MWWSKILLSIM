const {test}=require('node:test'),assert=require('node:assert/strict');
const {createSyntheticCombatDom,equipSyntheticWeapon}=require('./synthetic-combat-fixture.cjs');
// Synthetic identity 987 and a one-unit white segment are explicit test inputs.
// White preserves the legacy page's 1.32/1.15 sharpness premise, not real equipment evidence.
const kinds=['great-sword','long-sword','sword-and-shield','dual-blades','hammer','lance','switch-axe','charge-blade','insect-glaive','hunting-horn','gunlance','bow','heavy-bowgun','light-bowgun'];
for(const kind of kinds)test(`14-weapon matrix: ${kind} selected / fixed / free are coherent in explicit supported scope`,t=>{
 const w=createSyntheticCombatDom(t);equipSyntheticWeapon(w,{id:987,gameId:987,sharpness:{white:1},kind:kind,name:'Matrix',damage:{raw:200,display:960},affinity:20,specials:[{kind:'element',element:'dragon',damage:{raw:30,display:300}}],slots:[],skills:[],...(kind==='charge-blade'?{phial:'element'}:{})});w.eval(`monsterHZ=()=>({hz:45,ehz:20});comboCBShield.value='0';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='0';comboIGExtract.value='NO_EXTRACT';comboIGKinsect.value='STOWED';comboHHEcho.value='NONE';comboHHMelody.value='NONE';comboLBGMode.value='NORMAL';comboSAMode.value='SWORD';comboSAAwakened.value='0';powerBowCoating.value='NONE';powerHbgNormalMode.value='0';`);
 const preset=Array.from(w.eval('comboData().presets')).find(p=>p.origin==='CANONICAL_DB'&&p.id!=='adopted:gl_shell_reference');assert.ok(preset);
 w.document.getElementById('comboPreset').value=preset.id;const fixed=w.calcTemplateComboDamage();assert.ok(fixed.damage>0,JSON.stringify(fixed.blocked));let sum=0;
 for(const id of preset.moves){w.document.getElementById('comboMovePicker').value=id;const one=w.calcSelectedTechniqueDamage();assert.ok(one.damage>0,JSON.stringify(one.blocked));sum+=one.damage;w.addCombo(id);}const free=w.calcUserComboDamage();assert.ok(Math.abs(free.damage-fixed.damage)<1e-9);assert.ok(Math.abs(sum-fixed.damage)<1e-9);assert.equal(free.theoreticalDps,null);
 w.addCombo('UNKNOWN_COMPONENT',{allowMissing:true});assert.equal(w.calcUserComboDamage().damage,null);
});
