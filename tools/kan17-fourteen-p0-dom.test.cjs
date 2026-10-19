const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const kinds=['great-sword','long-sword','sword-and-shield','dual-blades','hammer','lance','switch-axe','charge-blade','insect-glaive','hunting-horn','gunlance','bow','heavy-bowgun','light-bowgun'];
for(const kind of kinds)test(`14-weapon matrix: ${kind} selected / fixed / free are coherent in explicit supported scope`,t=>{
 const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});t.after(()=>d.window.close());const w=d.window;
 w.eval(`clearWeaponBuckets();const f={id:987,kind:${JSON.stringify(kind)},name:'Matrix',damage:{raw:200,display:960},affinity:20,specials:[{kind:'element',element:'dragon',damage:{raw:30,display:300}}],slots:[],skills:[]};DB.weapons=[f];weaponIndexByKind[API_WEAPON_KIND[f.kind]]=[f];weaponKind.value=f.kind;weapon.innerHTML='<option value="987">Fixture</option>';weapon.value='987';App.build.setWeapon(f);calcBuild();renderComboForWeapon();calcState.stats.element=300;calcState.stats.elementKnown=true;calcState.stats.typeKnown=true;calcState.stats.elementType='dragon';calcState.stats.elementStatus='KNOWN';comboCBShield.value='0';comboCBAxe.value='0';comboCBPhialType.value='POWER_ELEMENT';comboCBEnhancedPhial.value='0';comboIGExtract.value='NO_EXTRACT';comboIGKinsect.value='STOWED';comboHHEcho.value='NONE';comboHHMelody.value='NONE';comboLBGMode.value='NORMAL';powerBowCoating.value='NONE';powerHbgNormalMode.value='0';`);
 require('./p0-fixture-inputs.cjs').install(w);
 const preset=Array.from(w.eval('comboData().presets')).find(p=>p.origin==='CANONICAL_DB'&&p.id!=='adopted:gl_shell_reference');assert.ok(preset);
 w.document.getElementById('comboPreset').value=preset.id;const rawFixed=w.calcTemplateComboDamage(),fixed=rawFixed.channels?.NORMAL||rawFixed;assert.ok(fixed.damage>0,JSON.stringify(fixed.blocked));let sum=0;
 for(const id of preset.moves){w.document.getElementById('comboMovePicker').value=id;const one=w.calcSelectedTechniqueDamage();assert.ok(one.damage>0,JSON.stringify(one.blocked));sum+=one.damage;w.addCombo(id);}const rawFree=w.calcUserComboDamage(),free=rawFree.channels?.NORMAL||rawFree;assert.ok(Math.abs(free.damage-fixed.damage)<1e-9);assert.ok(Math.abs(sum-fixed.damage)<1e-9);if(kind==='dual-blades'){
  assert.deepEqual(Array.from(preset.moves),['canonical:DB_DEMON_DANCE_I','canonical:DB_DEMON_DANCE_II','canonical:DB_DEMON_DANCE_III']);
  // Independent 27-hit oracle: raw200, affinity20%, white1.32, slash45;
  // dragon300, element sharpness1.15, dragon20; each physical/element hit rounded to cents.
  const expectedRouteDps=(490.21+138.00)/5.39;
  assert.equal(rawFree.time,5.39);assert.ok(Math.abs(rawFree.theoreticalDps-expectedRouteDps)<1e-9);
  assert.ok(rawFree.stages.every(stage=>stage.time===null&&stage.move.timingStatus==='PENDING'));
  assert.deepEqual(Array.from(rawFree.pendingTimeTechniqueIds),Array.from(preset.moves));
 }else assert.equal(rawFree.theoreticalDps,null);
 w.addCombo('UNKNOWN_COMPONENT',{allowMissing:true});assert.equal(w.calcUserComboDamage().damage,null);
});
