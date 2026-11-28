'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict'), {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'), {data}=require('./fixtures/offset-maximum-inputs.json');

test('plain long-sword rising slash calculates one colorless cut while preserving saved identity and explicit condition gates',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://ls-rise.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id), read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')), id='ls_base3',tag='canonical:LS_SPIRIT_THRUST';
 const official=profiles.find(x=>x.kind==='long-sword').input;
 const snapshot={...official,armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
 const apply=s=>{w.__snap=JSON.stringify(s);w.eval('applyBuildSnapshot(JSON.parse(__snap))');};
 const run=()=>{let computed;const normal=w.calcUserComboDamage;w.calcUserComboDamage=(...args)=>(computed=normal.apply(w,args));try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=normal;}assert.equal(el('compareOut').dataset.resultMode,'current-custom');return computed;};
 const lanes=result=>['normal','maximum'].map(k=>w.consumerDamageMetric({oneHitPipeline:result.pipeline||{reason:result.blocked?.[0]?.reason}},k));
 w.__data=JSON.stringify(data);
 w.eval('const source=JSON.parse(__data);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 apply(snapshot);assert.equal(read('String(selectedWeapon().id)'),'1172');
 assert.equal(el('comboLSSpiritGauge').value,'');
 el('comboMovePicker').value=id;assert.equal(el('comboMovePicker').selectedOptions[0].text,'斬り上げ');el('addCombo').click();
 assert.deepEqual(read('App.state.combo.moves'),[{techniqueId:id}]);
 const defaultGauge=read('compareStep5Snapshot().longSwordState'),calc=run();
 t.diagnostic('default ordinary rising slash '+JSON.stringify(lanes(calc)));
 assert.ok(lanes(calc).every(x=>x.value>0),JSON.stringify(lanes(calc)));
 assert.deepEqual(Array.from(calc.pipeline.evaluationPlan.techniqueIds),['LS_RISING_SLASH']);
 assert.deepEqual(read('compareStep5Snapshot().longSwordState'),defaultGauge);
 assert.equal(calc.stages.length,1);assert.equal(calc.stages[0].result.total,lanes(calc)[0].value);
 assert.ok(calc.pipeline.channels.normal.components.every(x=>x.techniqueId==='LS_RISING_SLASH'&&x.eventId==='0:0'));
 assert.ok(calc.pipeline.channels.normal.components.some(x=>x.id==='LS_RISING_SLASH:physical:0'&&x.value>0));
 assert.ok(calc.pipeline.channels.normal.components.some(x=>x.id==='LS_RISING_SLASH:element:0'&&x.value>0));
 assert.match(el('compareOut').querySelector('[data-used-combo]').textContent,/通常：斬り上げ最大：斬り上げ/);
 assert.match(el('compareOut').querySelector('[data-ls-rising-slash-provisional]').textContent,/練気色なし.*派生前の技は含めない.*資料暫定・実機未確認/);
 assert.ok(lanes(calc).every(x=>Math.abs(x.value-50.19552)<1e-8));
 for(const lane of ['normal','maximum']){
  const p=calc.pipeline.channels[lane], src=p.diagnostics.lsGroundRisingSlash;
  assert.equal(src.sourceBlob,'1e28405b6098b31ca08929bd28f2a0a1e444ac9f');
  assert.equal(src.sourceRowId,3);assert.equal(src.sourceTable,'Wp03_Attack');
  assert.equal(src.precedingAction,'NOT_INCLUDED');
  assert.equal(p.components.filter(x=>x.id==='LS_RISING_SLASH:physical:0').length,1);
  assert.deepEqual(Array.from(p.execution.executed),['0:0']);
 }
 el('buildName').value='plain ls';el('saveBuild').click();
 const saved=read('savedBuildMap()');assert.deepEqual(saved['plain ls'].combo.moves,[{techniqueId:id}]);
 const change=value=>{el('comboLSSpiritGauge').value=value;el('comboLSSpiritGauge').dispatchEvent(new w.Event('change',{bubbles:true}));};
 change('RED');assert.ok(lanes(run()).every(x=>x.value===null&&x.reason.includes('LS_RISING_SLASH:GAUGE')));
 const matchSaved=()=>{const check=el('compareBuilds').querySelector('[data-compare-name="plain ls"]');check.checked=true;check.dispatchEvent(new w.Event('change',{bubbles:true}));el('runCompare').click();return read('lastBuildComparisonRows[0]');};
 const compared=matchSaved();assert.deepEqual(lanes({pipeline:compared.oneHitPipeline}),lanes(calc));
 assert.equal(compared.referenceCombo.damage,calc.damage);
 assert.equal(el('comboLSSpiritGauge').value,'RED');assert.deepEqual(read('savedBuildMap()'),saved);
 const rejectedSaved=JSON.parse(JSON.stringify(saved));
 rejectedSaved['plain ls'].combo.longSwordState={spiritGauge:'RED'};
 w.__changed=JSON.stringify(rejectedSaved);w.eval('storageSet(BUILDS_KEY,__changed)');
 change('NONE');
 assert.ok(lanes({pipeline:matchSaved().oneHitPipeline}).every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:GAUGE')));
 rejectedSaved['plain ls'].combo.longSwordState={spiritGauge:'NONE'};
 rejectedSaved['plain ls'].combo.explicitAffinityState={criticalDrawHits:{maximum:{LS_RISING_SLASH:[true]}}};
 w.__changed=JSON.stringify(rejectedSaved);w.eval('storageSet(BUILDS_KEY,__changed)');
 assert.ok(lanes({pipeline:matchSaved().oneHitPipeline}).every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:INPUT_STATE')));
 assert.deepEqual(read('savedBuildMap()'),rejectedSaved);
 assert.deepEqual(lanes(run()),lanes(calc));
 const blocks=(moves,conditions,reason)=>{
  const r=w.evaluateP0DamageRoute(moves,{currentCustom:true,evaluationConditions:conditions});
  assert.ok(lanes(r).every(x=>x.value===null&&x.reason?.includes(reason)),JSON.stringify(lanes(r)));
 };
 const c=read('compareStep5Snapshot()'), moves=[{techniqueId:id}];
 blocks(moves,{...c,longSwordState:{spiritGauge:'UNKNOWN'}},'LS_RISING_SLASH:GAUGE');
 blocks(moves,{...c,spiritGauge:'RED'},'LS_RISING_SLASH:GAUGE');
 blocks(moves,{...c,mounted:true},'LS_RISING_SLASH:SINGLE_GROUND');
 blocks(moves,{...c,previousAction:'SPIRIT_THRUST'},'LS_RISING_SLASH:INPUT_STATE');
 blocks(moves,{...c,criticalDrawHits:{maximum:{LS_RISING_SLASH:[true]}}},'LS_RISING_SLASH:INPUT_STATE');
 blocks([...moves,...moves],c,'LS_RISING_SLASH:SINGLE_GROUND');
 blocks([{techniqueId:'ls_base2'},...moves],c,'LS_RISING_SLASH:SINGLE_GROUND');
 blocks(moves,{...c,mantleState:'CORRUPTED'},'LS_RISING_SLASH:INPUT_STATE');
 blocks(moves,{...c,drawAttack:true},'LS_RISING_SLASH:INPUT_STATE');
 const airborne=w.evaluateP0DamageRoute([{techniqueId:'canonical:LS_JUMP_RISING_SLASH'}],{currentCustom:true,evaluationConditions:c});
 assert.ok(lanes(airborne).every(x=>x.value===null));
 assert.notEqual(airborne.pipeline.evaluationPlan?.techniqueIds?.[0],'LS_RISING_SLASH');
 const thrust=w.evaluateP0DamageRoute([{techniqueId:'ls_base2'}],{currentCustom:true,evaluationConditions:c});
 assert.deepEqual(lanes(thrust),lanes(calc));assert.deepEqual(Array.from(thrust.pipeline.evaluationPlan.techniqueIds),['LS_THRUST']);
 assert.ok(thrust.pipeline.channels.normal.diagnostics.lsGroundThrust);
 assert.equal(thrust.pipeline.channels.normal.diagnostics.lsGroundRisingSlash,undefined);
 blocks([{techniqueId:id,repeat:2}],c,'LS_RISING_SLASH:SINGLE_GROUND');
 const spirit=w.evaluateP0DamageRoute([{techniqueId:tag}],{currentCustom:true,evaluationConditions:c});
 assert.deepEqual(Array.from(spirit.pipeline.evaluationPlan.techniqueIds),['LS_SPIRIT_THRUST']);
 assert.ok(lanes(spirit).every(x=>x.value===null));
 const future=JSON.parse(JSON.stringify(saved));
 future['plain ls'].combo.longSwordState={spiritGauge:'WHITE'};
 w.__changed=JSON.stringify(future);w.eval('storageSet(BUILDS_KEY,__changed);renderSavedBuilds()');
 assert.ok(lanes({pipeline:matchSaved().oneHitPipeline}).every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:GAUGE')));
 for(const b of el('combo').querySelectorAll('.del'))b.click();
 assert.deepEqual(read('App.state.combo.moves'),[]);
 const savedPicker=el('savedBuildSelect');savedPicker.value='plain ls';savedPicker.dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
 const immediate=lanes({pipeline:read('calcState.realOneHit')});
 assert.ok(immediate.every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:GAUGE')),JSON.stringify(immediate));
 assert.deepEqual(lanes({pipeline:read('currentConsumerCalculation()')}),immediate);
 assert.ok(lanes(run()).every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:GAUGE')));
 assert.deepEqual(read('buildSnapshot().combo.longSwordState'),{spiritGauge:'WHITE'});
 assert.deepEqual(read('savedBuildMap()'),future);
 change('NONE');assert.deepEqual(lanes(run()),lanes(calc));
 assert.deepEqual(read('savedBuildMap()'),future);
 // Ordinary comparison must retain opaque editor state even with no combo row.
 apply({...snapshot,combo:{moves:[],longSwordState:{spiritGauge:'WHITE'}}});
 assert.equal(el('comboLSSpiritGauge').dataset.lsUnresolvedState,'{"spiritGauge":"WHITE"}');
 const attempts=[];
 for(const exact of [id,'ls_base2']){
   el('comboMovePicker').value=exact;
   attempts.push(['before comparison',exact,lanes(w.calcSelectedTechniqueDamage())]);
 }
 matchSaved();
 const afterComparison=el('comboLSSpiritGauge').dataset.lsUnresolvedState;
 for(const exact of [id,'ls_base2']){
   el('comboMovePicker').value=exact;
   attempts.push(['after comparison',exact,lanes(w.calcSelectedTechniqueDamage())]);
   el('addCombo').click();
   attempts.push(['after comparison Add→Calculate',exact,lanes(run())]);
   for(const button of el('combo').querySelectorAll('.del'))button.click();
 }
 t.diagnostic('opaque gauge guards '+JSON.stringify({afterComparison,attempts}));
 assert.ok(attempts.every(([,exact,result])=>result.every(x=>x.value===null&&x.reason?.includes((exact===id?'LS_RISING_SLASH':'LS_THRUST')+':GAUGE'))),JSON.stringify(attempts));
 assert.equal(afterComparison,'{"spiritGauge":"WHITE"}');
 assert.deepEqual(read('savedBuildMap()'),future);
 change('');
 assert.equal(el('comboLSSpiritGauge').dataset.lsUnresolvedState,'{"spiritGauge":"WHITE"}');
 el('comboMovePicker').value=id;
 assert.ok(lanes(w.calcSelectedTechniqueDamage()).every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:GAUGE')));
 change('NONE');
 el('comboMovePicker').value=id;el('addCombo').click();
 assert.deepEqual(lanes(run()),lanes(calc));
 apply({...snapshot,combo:{moves:[],longSwordState:false}});
 matchSaved();
 assert.equal(el('comboLSSpiritGauge').dataset.lsUnresolvedState,'false');
 el('comboMovePicker').value=id;
 assert.ok(lanes(w.calcSelectedTechniqueDamage()).every(x=>x.value===null&&x.reason?.includes('LS_RISING_SLASH:GAUGE')));
 change('NONE');
 const engine=w.TechniqueDBEngine;
 try{
   for(const [field,value] of [['mv',20],['elementModifier',1.2],['partModifier',0.5]]){
    w.TechniqueDBEngine={...engine,get(kind,key){
     const raw=engine.get(kind,key);
     return kind==='long-sword'&&key==='LS_RISING_SLASH'?{...raw,hits:[{...raw.hits[0],[field]:value}]}:raw;
    }};
    blocks(moves,c,'LS_RISING_SLASH:SOURCE');
   }
 }finally{w.TechniqueDBEngine=engine;}
 const improved={...snapshot,charmCustom:{...snapshot.charmCustom,skills:[{name:'攻撃',level:1,type:'weapon'}]},combo:{moves,longSwordState:{spiritGauge:'NONE'}}};
 apply(improved);assert.equal(read("calcState.total['攻撃']"),1);
 const attack=run();assert.ok(lanes(attack).every((x,i)=>x.value>lanes(calc)[i].value),JSON.stringify(lanes(attack)));
 for(const ch of ['normal','maximum'])assert.deepEqual(Array.from(attack.pipeline.channels[ch].diagnostics?.ignoredSkillEffects||[]),[]);
 const bad=profiles.find(x=>x.kind==='great-sword').input;
 apply({...snapshot,weaponId:bad.weaponId});assert.notEqual(read('comboKind()'),'long-sword');
 blocks(moves,read('compareStep5Snapshot()'),'TECHNIQUE_NOT_FOUND');
});
