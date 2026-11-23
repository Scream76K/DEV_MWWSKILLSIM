const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const ids=['BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3','BOW_THOUSAND_DRAGONS'];
test('ordered current bow combo joins real consumers without widening saved routes',t=>{
 const w=new JSDOM(readSimulatorHtml(),{url:'https://bow-mixed.invalid',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());
 const {data}=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json');
 const weapon=data.weapons.find(x=>x.id===1&&x.kind==='bow');
 const charm=data.charms.find(x=>x.id===11),rank=charm.ranks.find(x=>x.level===1);
 w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind.bow=DB.weapons;weaponKind.value='bow';weapon.innerHTML='<option value="1">ホープボウⅠ</option>';weapon.value='1';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};renderComboForWeapon();renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';calcBuild();`);
 function set(sequence){w.document.getElementById('combo').replaceChildren();for(const id of sequence)w.addCombo('canonical:'+id);assert.equal(w.document.querySelectorAll('#combo .cmove').length,sequence.length);}
 const calculation=()=>w.calcP0Damage('user').pipeline;
 const check=(p,reason)=>assert.match(JSON.stringify(p),new RegExp(reason));
 const total=(p,c)=>p.channels[c].metrics.comboTotalDamage.value;
 const mount=w.document.createElement('input');mount.type='checkbox';mount.id='powerMounted';w.document.body.append(mount);
 const oracle=w.eval(`(()=>{
   const o={state:{coating:'NONE',range:'CRITICAL',chargeLevel:3},attack:calcState.stats.attackTrue,affinity:calcState.stats.affinity,element:0,criticalMultiplier:1.25,physicalHitzone:80,elementalHitzone:0};
   return BowReference.technique(o,TechniqueDBEngine,'BOW_POWER_SHOT_3').comparisonPower+
    BowReference.technique(o,TechniqueDBEngine,'BOW_POWER_VOLLEY_3').comparisonPower+
    BowReference.thousandDragons({...o,specialAmmoLevel:0},TechniqueDBEngine).total;
 })()`);
 const doc=w.document, calculate=doc.getElementById('calcUserComboDamage'), output=doc.getElementById('compareOut');
 const coating=doc.getElementById('powerBowCoating'), range=doc.getElementById('powerBowRange');
 const choose=(select,value)=>{select.value=value;select.dispatchEvent(new w.Event('change',{bubbles:true}));};
 assert.equal(coating.value,'');assert.equal(range.value,'');
 set(ids);calculate.click();
 doc.dispatchEvent(new w.Event('change'));
 const conditions=coating.closest('details');
 assert.equal(conditions.open,false);
 for(let e=conditions;e;e=e.parentElement)if(e.localName==='details'&&!e.open)e.querySelector('summary').click();
 assert.ok(conditions.open);assert.notEqual(coating.closest('#consumerBowConditions').hidden,true);
 choose(coating,'NONE');choose(range,'CRITICAL');
 conditions.querySelector('summary').click();assert.equal(conditions.open,false);
 set(ids.slice(0,2));
 for(const channel of ['normal','maximum'])assert.ok(Math.abs(total(calculation(),channel)-160.38)<.09);
 set(ids);
 w.document.getElementById('calcUserComboDamage').click();
 const mixed=calculation();assert.equal(mixed.channels?.normal?.execution.status,'complete',JSON.stringify(mixed));
 for(const c of ['normal','maximum']){
  assert.equal(mixed.channels[c].execution.status,'complete');
  assert.deepEqual([...w.MHWRealOneHitBrowserAdapter.usedComboSteps(mixed.channels[c])],['剛射3','剛連射3','竜の千々矢']);
  assert.ok(Math.abs(total(mixed,c)-oracle)<1e-8);
  assert.equal(mixed.channels[c].components.length,3);
 }
 t.diagnostic(JSON.stringify({normal:total(mixed,'normal'),maximum:total(mixed,'maximum')}));
 assert.match(w.document.getElementById('compareOut').textContent,/237\.6/);
 assert.ok(output.querySelector('[data-current-custom-heading]'));
 const cells=()=>[...output.querySelectorAll('[data-custom-damage="total"] td')].map(x=>x.textContent);
 assert.deepEqual(cells().slice(0,2),['237.6','237.6']);
 assert.match(output.querySelector('[data-used-combo]').textContent,/通常：剛射3 → 剛連射3 → 竜の千々矢/);
 assert.match(w.document.getElementById('compareOut').textContent,/各技がそれぞれの適正距離で全段命中/);
 assert.equal(mixed.evaluationPlan.scope,'PER_MOVE_OPTIMAL_DISTANCE_FULL_HIT_REFERENCE');
 assert.doesNotMatch(w.document.getElementById('comboMovePicker').textContent,/MV 0/);
 w.calcBuild();check(w.eval('calcState.realOneHit'),'BOW_THOUSAND:SINGLE_SHOT_REQUIRED');
 check(w.eval('evaluateSavedSnapshotOneHit(buildSnapshot(),null,compareStep5Snapshot())'),'BOW_THOUSAND:SINGLE_SHOT_REQUIRED');
 w.eval(`DB.charms=${JSON.stringify([charm])};DB.skills=${JSON.stringify(data.skills)};renderCharmEditor();`);
 choose(doc.getElementById('charmPreset'),charm.id+'|'+rank.id);
 assert.equal(w.eval("calcState.total['挑戦者']"),1);
 calculate.click();
 const buffed=calculation();
 assert.equal(total(buffed,'normal'),total(mixed,'normal'));
 assert.ok(Math.abs(total(buffed,'maximum')-250.0212)<1e-8,JSON.stringify(buffed));
 assert.equal(w.eval('JSON.stringify(compareStep5Snapshot()).includes("currentCustomBowMixed")'),false);
 assert.equal(w.eval('JSON.stringify(buildSnapshot()).includes("currentCustomBowMixed")'),false);
 assert.deepEqual(cells().slice(0,2),['237.6','250.0']);
 t.diagnostic(JSON.stringify({weapon:weapon.name,charm:rank.name,normal:total(buffed,'normal'),maximum:total(buffed,'maximum')}));

 set([ids[1],ids[0],ids[2]]);check(calculation(),'BOW_THOUSAND:SINGLE_SHOT_REQUIRED');
 set(ids);
 w.eval("powerBowCoating.value=''");check(calculation(),'BOW_THOUSAND:STATE_NOT_ADOPTED');
 calculate.click();
 assert.match(output.textContent,/「個別技の検証用条件」で「ビンなし」と「適正距離」/);
 assert.doesNotMatch(output.textContent,/BOW_THOUSAND:/);

 w.eval("powerBowCoating.value='POWER'");check(calculation(),'BOW_THOUSAND:STATE_NOT_ADOPTED');
 w.eval("powerBowCoating.value='NONE';powerMounted.checked=true");check(calculation(),'BOW_THOUSAND:STATE_NOT_ADOPTED');
 w.eval("powerMounted.checked=false;calcState.stats={...calcState.stats,elementType:'fire',element:180}");
 check(calculation(),'BOW_THOUSAND:ELEMENT_NOT_ADOPTED|REAL_SLICE:ELEMENT_NOT_ZERO_OR_UNKNOWN');
});
