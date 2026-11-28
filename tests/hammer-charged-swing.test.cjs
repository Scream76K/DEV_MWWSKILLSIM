'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const { readSimulatorHtml } = require('../tools/dom-test-setup.cjs');
const { profiles } = require('./fixtures/selected-hp-inputs.json');
const { data } = require('./fixtures/offset-maximum-inputs.json');

test('charged swing is a single blunt contact in the editor and named comparison', t => {
  const errors = [];
  const virtualConsole = new VirtualConsole().on('jsdomError', e => errors.push(e.message));
  const w = new JSDOM(readSimulatorHtml(), {url:'https://hammer.invalid/', runScripts:'dangerously', virtualConsole,
    beforeParse(w) {
      w.fetch = () => Promise.reject(Error('OFFLINE'));
      w.confirm = () => true;
      w.structuredClone = x => w.JSON.parse(w.JSON.stringify(x));
    }
  }).window;
  t.after(() => { w.close(); assert.deepEqual(errors, []); });
  const el = id => w.document.getElementById(id);
  const change = (select, value) => {
    select.value = value;
    select.dispatchEvent(new w.Event('change', {bubbles:true}));
  };
  const snapshot = profiles.find(p => p.kind === 'hammer').input;
  w.source = data;
  w.snapshot = snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snapshot)');
  const id='HAM_CHARGED_SWING',move='canonical:'+id;
  const picker=el('comboMovePicker');
  change(picker,move);
  assert.equal(picker.selectedOptions[0]?.text,'溜め振り回し');
  el('addCombo').click();
  const run=()=>{
    const original=w.calcUserComboDamage;
    let result;
    w.calcUserComboDamage=(...args)=>(result=original(...args));
    try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
    return result;
  };
  const values=result=>{
    assert.ok(result.damage>0,JSON.stringify(result.blocked));
    return ['normal','maximum'].map(lane=>{
      const parts=result.pipeline.channels[lane].components;
      assert.deepEqual(Array.from(parts,c=>c.id),[id+':physical:0',id+':element:0']);
      return Array.from(parts,c=>c.value);
    });
  };
  const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' / '+b);
  const training=w.trainingRoomMonster;
  let element=.30,blunt=.8;
  w.trainingRoomMonster=()=>{
    const monster=training(),hz=monster.parts[0].multipliers;
    Object.assign(hz,{slash:.42,blunt,pierce:.23});
    for(const type of ['fire','ice','thunder','water','dragon'])hz[type]=element;
    return monster;
  };
  const control=values(run());
  blunt=.4;
  values(run()).forEach(([p,e],i)=>{near(p,control[i][0]/2);near(e,control[i][1]);});
  blunt=.8;
  element=.15;
  values(run()).forEach(([p,e],i)=>{near(p,control[i][0]);near(e,control[i][1]/2);});
  element=.30;
  el('buildName').value='swing';el('saveBuild').click();
  const saved=w.savedBuildMap().swing;
  assert.equal(saved.combo.moves[0].techniqueId,move);
  assert.equal(saved.combo.moves.length,1);
  const apply=(moves,skills=[])=>w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves},
    charmCustom:{...saved.charmCustom,skills}});
  const row={techniqueId:move};
  for(const [name,level,factor] of [['チャージマスター',1,1.15],['チャージマスター',3,1.25],['飛燕',1,1]]){
    apply([row],[{name,level,type:'weapon'}]);
    assert.equal(w.eval('calcState.total')[name],level);
    values(run()).forEach(([p,e],i)=>{near(p,control[i][0]);near(e,control[i][1]*factor);});
  }
  apply([row],[{name:'溜打強化',level:1,type:'weapon'}]);
  const assertOmitted = result => {
    assert.deepEqual(values(result),control);
    for(const lane of ['normal','maximum']){
      const omissions=result.pipeline.channels[lane].diagnostics?.ignoredSkillEffects || [];
      assert.equal(Array.from(omissions).filter(s=>s.skillId===83 && s.name==='溜打強化').length,1);
    }
  };
  assertOmitted(run());
  el('buildName').value='strike';el('saveBuild').click();
  assert.equal(w.savedBuildMap().strike.charmCustom.skills[0].name,'溜打強化');
  for(const moves of [[{techniqueId:'hm_charge2'}],[row,row],[{...row,repeat:2}],[{...row,count:2}],[row,{techniqueId:'hm_side'}]]){
    apply(moves);assert.equal(run().damage,null);
  }
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  el('compareBuilds').querySelector('[data-compare-name="swing"]').click();el('compareBuilds').querySelector('[data-compare-name="strike"]').click();el('runCompare').click();
  const rows=w.eval('lastBuildComparisonRows');
  const compared=rows.find(r=>r.name==='swing').oneHitPipeline;
  const savedStrike=rows.find(r=>r.name==='strike').oneHitPipeline;
  assertOmitted({damage:savedStrike.channels.normal.metrics.comboTotalDamage.value,pipeline:savedStrike});
  assert.deepEqual(values({damage:compared.channels.normal.metrics.comboTotalDamage.value,pipeline:compared}),control);
  change(el('savedBuildSelect'),'swing');el('savedBuildLoad').click();
  assert.deepEqual(values(run()),control);
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  t.diagnostic('normal/maximum [physical,element] '+JSON.stringify(control));
  // The follow-up is selected separately from its predecessor and from charge level two.
  const follow='canonical:HAM_CHARGED_RETURN_SWING';
  apply([]);change(picker,follow);
  assert.equal(picker.selectedOptions[0]?.text,'溜め返し振り');
  el('addCombo').click();
  const result=run();
  const checkFollow=p=>{
    for(const [i,ch] of ['normal','maximum'].entries()){
      const parts=p.channels[ch].components;
      assert.deepEqual(Array.from(parts,c=>c.id),['HAM_CHARGED_RETURN_SWING:physical:0','HAM_CHARGED_RETURN_SWING:element:0']);
      near(parts[0].value,control[i][0]*55/25);
      near(parts[1].value,control[i][1]/1.1);
    }
  };
  assert.ok(result.damage>0,JSON.stringify(result.blocked));checkFollow(result.pipeline);
  el('buildName').value='return';el('saveBuild').click();
  const savedBytes=w.eval('storageGet(BUILDS_KEY)');
  apply([{techniqueId:'hm_charge2'}]);assert.equal(run().damage,null);
  for(const input of el('compareBuilds').querySelectorAll('[data-compare-name]')){
    if(input.checked!==(input.dataset.compareName==='return'))input.click();
  }
  el('runCompare').click();checkFollow(w.eval('lastBuildComparisonRows[0].oneHitPipeline'));
  assert.equal(w.eval('storageGet(BUILDS_KEY)'),savedBytes);
  apply([{techniqueId:follow,repeat:2}]);assert.equal(run().damage,null);
  t.diagnostic('charged return swing normal/maximum '+result.damage+' / '+result.maximumDamage);

});

for(const [kind,id,old,name] of [
  ['hammer','HAM_CHARGED_UPPERCUT','hm_charge2','溜めアッパー'],
  ['gunlance','GL_RISING_SLASH','gl_thrust','斬り上げ']
])test(name+' uses the pinned ground contact in current and saved comparisons',t=>{
  const w=new JSDOM(readSimulatorHtml(),{url:'https://ground.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
  t.after(()=>w.close());
  const el=id=>w.document.getElementById(id),move='canonical:'+id;
  const snapshot=profiles.find(p=>p.kind===kind).input;
  w.source=data;w.snap=snapshot;
  w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snap)');
  const standard=()=>w.eval('JSON.stringify([calcState.realOneHit.evaluationPlan.techniqueIds,...Object.values(calcState.realOneHit.channels).map(c=>c.metrics.comboTotalDamage.value)])');
  const baseline=standard();
  const picker=el('comboMovePicker');picker.value=move;assert.equal(picker.selectedOptions[0]?.text,name);el('addCombo').click();
  const training=w.trainingRoomMonster;let body=.8,element=.3;
  w.trainingRoomMonster=()=>{const target=training(),hz=target.parts[0].multipliers;
    Object.assign(hz,{slash:kind==='hammer'?.31:body,blunt:kind==='hammer'?body:.53,pierce:.22});
    for(const key of ['fire','water','ice','thunder','dragon'])hz[key]=element;return target;
  };
  const run=()=>{el('calcUserComboDamage').click();return w.calcUserComboDamage();};
  const first=run();assert.ok(first.damage>0,JSON.stringify(first.blocked));
  const values=p=>['normal','maximum'].map(ch=>{
    const parts=p.channels[ch].components;
    assert.deepEqual(Array.from(parts,c=>c.id),[id+':physical:0',id+':element:0']);
    for(const component of parts){
      assert.equal(component.source,record.evidenceRefs[0]);
      assert.equal(component.revision,String(record.revision));
    }
    return Array.from(parts,c=>c.value);
  });
  const record=w.TechniqueDBEngine.get(kind,id);
  const hammer=kind==='hammer';
  const source='https://github.com/dtlnor/mhws-rcol-record/blob/90ed7dd76b11a165f1d8ed5685e4dd82999d4f13/Player/'+(hammer?'Wp04.csv#L11':'Wp07.csv#L10');
  assert.equal(record.hits[0].elementModifier,hammer?1:1.2);
  assert.equal(record.hits[0].mv,hammer?70:38);
  assert.equal(record.hits[0].partModifier,1);
  assert.equal(record.hits[0].damageType,hammer?'blunt':'slash');
  assert.equal(record.evidenceRefs[0],source);
  if(hammer)assert.deepEqual(Array.from(record.stunValues),[40]);
  const base=values(first.pipeline);assert.ok(base.every(([p,e])=>p>0&&e>0));
  const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' / '+b);
  const expected=kind==='hammer'?[154.9548,12.075]:[84.11832,18.216];
  base.forEach(([p,e])=>{near(p,expected[0]);near(e,expected[1]);});
  body=.4;values(run().pipeline).forEach(([p,e],i)=>{near(p,base[i][0]/2);near(e,base[i][1]);});
  body=.8;element=.15;values(run().pipeline).forEach(([p,e],i)=>{near(p,base[i][0]);near(e,base[i][1]/2);});element=.3;
  el('buildName').value='exact';el('saveBuild').click();
  const saved=w.savedBuildMap().exact;
  const apply=(moves,skills=[])=>w.applyBuildSnapshot({...saved,combo:{...saved.combo,moves},charmCustom:{...saved.charmCustom,skills}});
  apply([{techniqueId:old}]);if(hammer)assert.equal(run().damage,null);else assert.equal(run().pipeline.evaluationPlan.techniqueIds[0],'GL_ADVANCING_RISING');
  el('buildName').value='old';el('saveBuild').click();
  assert.equal(w.savedBuildMap().old.combo.moves[0].techniqueId,old);
  const bytes=w.eval('storageGet(BUILDS_KEY)');
  el('compareBuilds').querySelector('[data-compare-name="exact"]').click();el('runCompare').click();
  const compared=w.eval('lastBuildComparisonRows[0]');assert.deepEqual(values(compared.oneHitPipeline),base);
  near(compared.referenceCombo.damage,first.damage);assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
  apply([{techniqueId:move}],[{name:'飛燕',level:1,type:'weapon'}]);assert.deepEqual(values(run().pipeline),base);
  if(kind==='hammer'){
    apply([{techniqueId:move}],[{name:'チャージマスター',level:1,type:'weapon'}]);
    values(run().pipeline).forEach(([p,e],i)=>{near(p,base[i][0]);near(e,base[i][1]*1.15);});
  }
  for(const moves of [[{techniqueId:move,repeat:2}],[{techniqueId:move},{techniqueId:move}]]){
    apply(moves);assert.equal(run().damage,null);
  }
  w.trainingRoomMonster=training;w.applyBuildSnapshot(snapshot);assert.equal(standard(),baseline);
  t.diagnostic(kind+' '+snapshot.weaponId+' '+JSON.stringify(base));
});

test('踏み込み突き上げ keeps the saved ID and isolates native elemental damage',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://advancing.invalid/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 const el=id=>w.document.getElementById(id);
 w.source=data;w.snap={...profiles.find(p=>p.kind==='gunlance').input,weaponId:'315',armor:{},decos:{},combo:{moves:[]}};
 w.eval('DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();applyBuildSnapshot(snap)');
 const picker=el('comboMovePicker');picker.value='gl_thrust';el('addCombo').click();
 el('calcUserComboDamage').click();const result=w.calcUserComboDamage();
 const expected=90*.38*1.05*.8;
 assert.ok(Math.abs(result.damage-expected)<1e-8,JSON.stringify(result.blocked));
 for(const lane of ['normal','maximum']){
  const parts=result.pipeline.channels[lane].components;
  assert.deepEqual(Array.from(parts,c=>c.id),['GL_ADVANCING_RISING:physical:0']);
  assert.ok(Math.abs(parts[0].value-expected)<1e-8);
 }
 const training=w.trainingRoomMonster;
 w.trainingRoomMonster=()=>{const t=training();Object.assign(t.parts[0].multipliers,{slash:.4,blunt:.9,pierce:.7});return t;};
 assert.equal(w.calcUserComboDamage().damage,result.damage/2);
 w.trainingRoomMonster=()=>{const t=training();t.parts[0].wounded=true;return t;};
 assert.equal(w.calcUserComboDamage().damage,null);w.trainingRoomMonster=training;
 el('buildName').value='無属性';el('saveBuild').click();
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 assert.equal(w.savedBuildMap()['無属性'].combo.moves[0].techniqueId,'gl_thrust');
 w.applyBuildSnapshot({...w.snap,weaponId:'1151',combo:{moves:[{techniqueId:'gl_thrust'}]}});
 let dragonHz=.3;
 w.trainingRoomMonster=()=>{const target=training();target.parts[0].multipliers.dragon=dragonHz;return target;};
 el('calcUserComboDamage').click();
 const elemental=w.calcUserComboDamage();
 assert.ok(elemental.damage>0,JSON.stringify(elemental.blocked));
 for(const lane of ['normal','maximum']){
  const parts=elemental.pipeline.channels[lane].components;
  assert.deepEqual(Array.from(parts,c=>c.id),['GL_ADVANCING_RISING:physical:0','GL_ADVANCING_RISING:element:0']);
  assert.ok(Math.abs(parts[1].value-18.216)<1e-8,String(parts[1].value));
 }
 dragonHz=0;assert.equal(w.calcUserComboDamage().damage,elemental.pipeline.channels.normal.components[0].value);
 dragonHz=undefined;assert.equal(w.calcUserComboDamage().damage,null);dragonHz=.3;
 el('buildName').value='龍';el('saveBuild').click();
 const pairBytes=w.eval('storageGet(BUILDS_KEY)');
 w.applyBuildSnapshot(w.savedBuildMap()['無属性']);
 el('compareBuilds').querySelector('[data-compare-name="龍"]').checked=true;
 el('runCompare').click();
 const savedElement=w.eval("lastBuildComparisonRows.find(row=>row.name==='龍')");
 assert.deepEqual(savedElement.oneHitPipeline.channels,elemental.pipeline.channels);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),pairBytes);
 el('compareBuilds').querySelector('[data-compare-name="龍"]').checked=false;
 w.trainingRoomMonster=training;
 el('compareBuilds').querySelector('[data-compare-name="無属性"]').checked=true;el('runCompare').click();
 const row=w.eval('lastBuildComparisonRows[0]');assert.equal(row.referenceCombo.damage,result.damage);
 assert.deepEqual(row.oneHitPipeline.channels,result.pipeline.channels);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),pairBytes);
 assert.deepEqual(JSON.parse(bytes)['無属性'],JSON.parse(pairBytes)['無属性']);
 w.applyBuildSnapshot({...w.snap,weaponId:'343',combo:{moves:[{techniqueId:'gl_thrust'}]}});
 assert.equal(w.calcUserComboDamage().damage,null);
 w.applyBuildSnapshot({...w.snap,charmCustom:{...w.snap.charmCustom,skills:[{name:'属性変換',level:3,type:'armor'}]},combo:{moves:[{techniqueId:'gl_thrust'}]}});
 assert.equal(w.calcUserComboDamage().damage,null);
 for(const moves of [[{techniqueId:'gl_thrust',repeat:2}],[{techniqueId:'gl_thrust'},{techniqueId:'gl_thrust'}]]){
  w.applyBuildSnapshot({...w.snap,combo:{moves}});assert.equal(w.calcUserComboDamage().damage,null);
 }
 // Controlled equipment, separate from the real Artia comparison above.
 w.eval(`const control=weaponRows.find(w=>w.id===315);
   control.damage={raw:200,display:460};control.sharpness={...control.sharpness,white:20};
   control.specials=[{kind:'element',element:'dragon',hidden:false,damage:{raw:50,display:500}}];`);
 w.trainingRoomMonster=()=>{const target=training();Object.assign(target.parts[0].multipliers,{slash:.8,dragon:.3});return target;};
 w.applyBuildSnapshot({...w.snap,combo:{moves:[{techniqueId:'gl_thrust'}]}});
 const control=w.calcUserComboDamage();
 for(const channel of ['normal','maximum']){
  const lane=control.pipeline.channels[channel];
  for(const [i,expected] of [80.256,20.7].entries())assert.ok(Math.abs(lane.components[i].value-expected)<1e-8);
  assert.ok(Math.abs(lane.metrics.comboTotalDamage.value-100.956)<1e-8);
 }

});
