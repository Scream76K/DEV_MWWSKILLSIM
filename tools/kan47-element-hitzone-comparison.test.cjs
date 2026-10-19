const {test}=require('node:test'),a=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {db}=require('./kan108-fixture.cjs'),official=require('./official-bonus-fixture.cjs');
const clone=x=>JSON.parse(JSON.stringify(x));
const close=(x,y)=>a.ok(Number.isFinite(x)&&Math.abs(x-y)<1e-8,`${x} != ${y}`);
function setup(t){
 const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});
 t.after(()=>dom.window.close());const w=dom.window;w.__db=clone(db);
 w.eval(`DB=normalizeDB(window.__db);weaponIndexByKind=rebuildWeaponIndex(DB.weapons);build.armor={};build.charmCustom={skills:[],slots:[],weaponSlots:[]};build.decos={};renderMonsters();monster.value='13';renderMonsterParts();monsterPart.value='2700';`);
 return w;
}
function equip(w,id){w.__id=id;w.eval(`const chosen=DB.weapons.find(x=>x.id===window.__id);weaponKind.value=canonicalWeaponKind(chosen);weapon.innerHTML='<option value="'+chosen.id+'">Test</option>';weapon.value=String(chosen.id);App.build.setWeapon(chosen);calcBuild();renderComboForWeapon();`);}
function rows(w,ids){w.__ids=ids;w.eval(`document.getElementById('combo').innerHTML='';App.combo.reset();window.__ids.forEach(id=>addCombo(id));`);}
function state(w){return w.eval(`JSON.stringify({build:buildSnapshotComparable(buildSnapshot()),cond:compareStep5Snapshot(),monster:monster.value,part:monsterPart.value,rows:[...document.querySelectorAll('.cmove')].map(x=>x.value),stats:calcState.stats})`);}
function compare(w,cond,multipliers){w.__cond=clone(cond);w.__multipliers=multipliers===undefined?null:clone(multipliers);return clone(w.eval(`compareSnapshot('case',buildSnapshot(),window.__cond,window.__multipliers)`));}
function fixture(w,kind,type='thunder',raw=200){
 w.__kind=kind;w.__type=type;w.__raw=raw;
 w.eval(`const f={id:90001,kind:window.__kind,name:'Explicit regression fixture',damage:{raw:window.__raw,display:window.__raw},affinity:0,specials:window.__type==='none'?[]:[{kind:['poison','paralysis','sleep','blast'].includes(window.__type)?'status':'element',element:window.__type,status:window.__type,damage:{display:100,raw:10}}],skills:[],slots:[],sharpness:{red:10,orange:10,yellow:10,green:100,blue:0,white:0,purple:0}};DB.weapons.push(f);weaponIndexByKind=rebuildWeaponIndex(DB.weapons);`);
 equip(w,90001);
}
// One sequential test intentionally stops at the first failed regression assertion.
test('KAN47 row elemental hitzone: order, explicit conditions, restoration and dedicated consumers',t=>{
 const w=setup(t);equip(w,556);w.eval(`comboHHEcho.value='NONE';comboHHMelody.value='NONE';`);rows(w,['hh_left','hh_left']);
 w.eval(`buildName.value='A';saveNamedBuild();`);equip(w,571);w.eval(`buildName.value='B';saveNamedBuild();selectAllCompare.click();`);
 for(const current of [556,571])for(const order of [['A','B'],['B','A']]){
  equip(w,current);w.__order=order;
  w.eval(`const box=document.getElementById('compareBuilds');for(const name of window.__order){const input=[...box.querySelectorAll('input[data-compare-name]')].find(x=>x.dataset.compareName===name);box.appendChild(input.closest('label'));}`);
  const before=state(w);w.runBuildCompare();
  const actual=[...w.document.querySelectorAll('[data-comparison-metric="reference-combo-damage"] td')].map(x=>x.textContent);
  a.deepEqual(actual,order.map(n=>n==='A'?'80.0':'88.0'));a.equal(state(w),before);
  const report=clone(w.createBuildComparisonReport());a.deepEqual(report.results.map(x=>x.name),order);
  for(const r of report.results){close(r.referenceCombo.damage,r.name==='A'?79.96:87.96);close(r.dps,(r.name==='A'?79.96:87.96)/1.3);}
 }
 console.log('PASS order/current four combinations and complete restoration');
 equip(w,556);const cond=clone(w.compareStep5Snapshot());cond.ehz=7;const saved=JSON.stringify(cond);
 const explicit=compare(w,cond);close(explicit.referenceCombo.damage,75.28);a.equal(JSON.stringify(cond),saved);a.equal(JSON.stringify(w.__cond),saved);
 const zero=compare(w,cond,{thunder:0});close(zero.referenceCombo.damage,72.76);a.equal(JSON.stringify(w.__cond),saved);
 for(const map of [{},{thunder:null},{thunder:-.1},{thunder:1.1}])a.throws(()=>compare(w,cond,map),/COMPARISON_ELEMENT_HITZONE_PENDING/);
 // Inject only missing target metadata, never a calculation replacement.
 w.eval(`window.originalSelectedPart=selectedPart;selectedPart=()=>({...window.originalSelectedPart(),multipliers:{...window.originalSelectedPart().multipliers,thunder:undefined}});`);
 const beforeFailure=state(w);w.runBuildCompare();a.match(w.document.getElementById('compareOut').textContent,/COMPARISON_ELEMENT_HITZONE_PENDING:thunder/);a.equal(state(w),beforeFailure);a.equal(w.createBuildComparisonReport(),null);
 w.eval('selectedPart=window.originalSelectedPart;');w.runBuildCompare();a.equal(w.createBuildComparisonReport().results.length,2);
 console.log('PASS explicit ehz, zero, missing/invalid, fail restoration and next success');
 for(const type of ['none','poison']){const x=setup(t);fixture(x,'hunting-horn',type,100);x.eval(`comboHHEcho.value='NONE';comboHHMelody.value='NONE';`);rows(x,['hh_left']);const c=clone(x.compareStep5Snapshot());c.ehz=7;const before=compare(x,c),after=compare(x,c,{});close(after.referenceCombo.damage,25.99);a.deepEqual(after,before);}
 console.log('PASS none/status unchanged');
 // Dedicated ranged body and CB axe-boost consumers: explicit 7 vs target20.
 for(const [kind,id]of [['bow','BOW_SHOT_3'],['charge-blade','CB_SWORD_TO_AXE_MORPH'],['gunlance','GL_SLAM']]){
  const x=setup(t);fixture(x,kind);x.eval(`powerBowCoating.value='NONE';powerBowRange.value='CRITICAL';comboCBShield.value='1';comboCBAxe.value='1';`);rows(x,['canonical:'+id]);const c=clone(x.compareStep5Snapshot());c.ehz=7;
  const low=compare(x,c),high=compare(x,c,{thunder:.2});a.ok(Number.isFinite(high.referenceCombo.damage),JSON.stringify(high.referenceCombo));a.ok(high.referenceCombo.damage>low.referenceCombo.damage,kind);
  const lh=low.referenceCombo.stages[0].hits,hh=high.referenceCombo.stages[0].hits;a.equal(hh.length,lh.length);
  // Dedicated handlers expose their own traces; a changed element must not change physical damage.
  for(let i=0;i<hh.length;i++){const p=h=>h.p??h.physical,e=h=>h.e??h.element;close(p(hh[i]),p(lh[i]));a.ok(e(hh[i])>e(lh[i]),JSON.stringify(hh[i]));}
  if(kind==='charge-blade')a.equal(hh.length,5);
 }
 console.log('PASS bow/CB/GL body and CB axe elemental consumers');
 const gl=setup(t);fixture(gl,'gunlance');gl.eval(`comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='6';comboGLCharged.value='1';comboGLFireHz.value='20';`);rows(gl,['reference:gl_NORMAL']);const gc=clone(gl.compareStep5Snapshot());gc.ehz=7;
 const g1=compare(gl,gc,{thunder:.2});const gc2=clone(gc);gc2.gunlanceState.fireHitzone=40;
 // The shell state is captured independently from UI, so change its explicit input too.
 gl.document.getElementById('comboGLFireHz').value='40';const g2=compare(gl,gc2,{thunder:.2});
 const gh1=g1.referenceCombo.stages[0].hits[0],gh2=g2.referenceCombo.stages[0].hits[0];close(gh2.p,gh1.p);close(gh1.e,0);close(gh2.e,0);a.equal(gc.gunlanceState.fireHitzone,20);
 // Existing contract: a selected part overrides manual fire; absent part uses manual fire.
 gl.eval(`monster.value='';renderMonsterParts();comboGLFireHz.value='20';`);
 const manual1=compare(gl,gc,{thunder:.2});gl.document.getElementById('comboGLFireHz').value='40';const manual2=compare(gl,gc2,{thunder:.2});
 const mh1=manual1.referenceCombo.stages[0].hits[0],mh2=manual2.referenceCombo.stages[0].hits[0];
 close(mh1.e,70/10*.20);close(mh2.e,70/10*.40);close(mh2.p,mh1.p);close(mh1.p,gh1.p);
 console.log('PASS shell part-fire priority and absent-part manual fire downstream');
 const gs=setup(t);fixture(gs,'great-sword');official.installDOM(gs);gs.__effect=official.effect(172);rows(gs,['gs_charge3']);
 gs.eval(`powerDragonHz.value='30';powerDragonHz.dispatchEvent(new Event('input'));window.waveStats={...calcState.stats,activeBonusEffects:[window.__effect]};`);
 const dc=clone(gs.compareStep5Snapshot());dc.ehz=7;a.equal(dc.dragonHitzoneSource.kind,'MANUAL');
 const body=gs.standardPowerForStats('great-sword',gs.eval('calcState.stats'),dc,{});
 const wave=gs.standardPowerForStats('great-sword',gs.waveStats,dc,{});const dc2={...dc,ehz:20};const body2=gs.standardPowerForStats('great-sword',gs.eval('calcState.stats'),dc2,{}),wave2=gs.standardPowerForStats('great-sword',gs.waveStats,dc2,{});
 const extra=wave.normal.comparisonPower-body.normal.comparisonPower;close(wave2.normal.comparisonPower-body2.normal.comparisonPower,extra);a.ok(extra>0);a.equal(dc.dragonHz,'30');
 const wave3=gs.standardPowerForStats('great-sword',gs.waveStats,{...dc2,dragonHz:40},{});a.ok(wave3.normal.element>wave2.normal.element);
 console.log('PASS manual dragonHz downstream independent from body ehz');
 for(const [kind,id]of [['light-bowgun','LBG_NORMAL_AMMO_1'],['heavy-bowgun','HBG_NORMAL_AMMO_1']]){
  const x=setup(t);fixture(x,kind);x.eval(`powerHbgAmmoLevel.value='1';powerHbgRange.value='CRITICAL';powerHbgNormalMode.value='0';comboLBGMode.value='NORMAL';`);rows(x,['canonical:'+id]);const c=clone(x.compareStep5Snapshot());c.ehz=7;const plain=compare(x,c),excluded=compare(x,c,{});a.ok(plain.referenceCombo.damage>0,JSON.stringify(plain.referenceCombo));a.deepEqual(excluded,plain);
 }
 console.log('PASS LBG/HBG optional target exclusion');
});

// Regression: treating no selected part as an empty target map aborts valid explicit-condition reports.
test('KAN47 no selected part preserves explicit conditions, STANDARD report and restoration',t=>{
 const w=setup(t);fixture(w,'great-sword');
 w.eval(`monster.value='';renderMonsterParts();dMV.value='100';dHZ.value='60';dEHZ.value='7';buildName.value='explicit';saveNamedBuild();selectAllCompare.click();`);
 a.equal(w.selectedPart(),null);
 const before=state(w);w.runBuildCompare();
 const report=clone(w.createBuildComparisonReport());
 a.ok(report,w.document.getElementById('compareOut').textContent);
 a.equal(report.results.length,1);const row=report.results[0];
 // Fixture raw200, MV100, green1.05, physical60%; displayed thunder100 /10 * 7%.
 close(row.damage,200*1*1.05*.60+100/10*.07);
 a.equal(row.element,100);a.ok(row.power.normal.comparisonPower>0);
 a.equal(row.dps,null);a.equal(row.dpsReason,'COMBO_NOT_SELECTED');
 a.equal(state(w),before);a.equal(w.compareStep5Snapshot().ehz,'7');
});

// Regression: selected-but-unknown target metadata must not fall back to a stale explicit ehz.
test('KAN47 selected target rejects missing or invalid element, accepts zero and restores state',t=>{
 const w=setup(t);fixture(w,'great-sword');
 w.eval(`dMV.value='100';dHZ.value='60';dEHZ.value='7';buildName.value='target';saveNamedBuild();selectAllCompare.click();`);
 const part=w.selectedPart();a.ok(part);const original=clone(part.multipliers);
 const cases=[['absent map',undefined],['null map',null],['empty map',{}],
  ...[undefined,null,'0.2',NaN,Infinity,-.1,1.1].map(value=>['invalid thunder '+String(value),{...original,thunder:value}])];
 for(const [label,map] of cases){
  if(map===undefined)delete part.multipliers;else part.multipliers=map;
  const before=state(w);w.runBuildCompare();
  a.match(w.document.getElementById('compareOut').textContent,/COMPARISON_ELEMENT_HITZONE_PENDING:thunder/,label);
  a.equal(w.createBuildComparisonReport(),null,label);a.equal(state(w),before,label);
 }
 part.multipliers={...original,thunder:0};
 const beforeZero=state(w);w.runBuildCompare();const zero=clone(w.createBuildComparisonReport());
 a.ok(zero);close(zero.results[0].damage,200*1*1.05*.60);a.equal(state(w),beforeZero);
 // A later valid comparison recovers after the missing/invalid attempts; only its local row uses 20%.
 part.multipliers={...original,thunder:.2};
 const beforeValid=state(w);w.runBuildCompare();const valid=clone(w.createBuildComparisonReport());
 a.ok(valid);close(valid.results[0].damage,200*1*1.05*.60+100/10*.20);a.equal(state(w),beforeValid);
 a.equal(w.compareStep5Snapshot().ehz,'7');
});
