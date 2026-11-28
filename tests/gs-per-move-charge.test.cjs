'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('independently selected great sword charge levels keep exact HP, order and identity after saved replay', t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://gs-charge.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 const change=(e,v)=>{assert.ok(e);e.value=v;assert.equal(e.value,v);e.dispatchEvent(new w.Event('change',{bubbles:true}));};
 const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,a+' != '+b);
 const base=profiles.find(p=>p.kind==='great-sword').input;
 w.__dbText=JSON.stringify(data);
 w.__snap=JSON.stringify({...base,weaponId:'1148',armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
 const equip=()=>w.eval('applyBuildSnapshot(JSON.parse(__snap))');
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 equip();const standard=read('calcState.realOneHit');
 const run=()=>{let result;const original=w.calcUserComboDamage;w.calcUserComboDamage=()=>result=original();try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}assert.equal(el('compareOut').dataset.resultMode,'current-custom');return result;};
 const add=id=>{change(el('comboMovePicker'),id);el('addCombo').click();};
 const levels=()=>Array.from(el('combo').querySelectorAll('[data-gs-charge-level]'));
 const names=()=>Array.from(el('combo').querySelectorAll('.cmove'),x=>x.value);
 const rows=()=>read('App.state.combo.moves.map(x=>x.techniqueId)');
 const expected=['GS_CHARGED_SLASH_1','GS_STRONG_CHARGED_SLASH_2'],stored=expected.map(id=>'canonical:'+id);
 for(const id of ['gs_charge3','gs_strong3'])add(id);
 assert.equal(levels().length,2,'two independently selectable charge levels');
 assert.deepEqual(levels().map(x=>x.value),['3','3']);
 assert.ok(!Array.from(el('comboMovePicker').options,x=>x.value).includes(stored[0]));
 change(levels()[0],'1');change(levels()[1],'2');
 assert.deepEqual(levels().map(x=>x.value),['1','2']);assert.deepEqual(rows(),stored);assert.deepEqual(names(),stored);
 const r=run(),p=r.pipeline;assert.deepEqual(Array.from(p.evaluationPlan.techniqueIds),expected);
 assert.match(el('compareOut').querySelector('[data-used-combo]').textContent,/通常：溜め斬りⅠ → 強溜め斬りⅡ最大：溜め斬りⅠ → 強溜め斬りⅡ/);
 const raw=[106,144],element=[1.1,1.6],stat=read('({attack:calcState.stats.attackTrue,element:calcState.stats.element,affinity:calcState.stats.affinity})');
 for(const ch of ['normal','maximum']){
  const lane=p.channels[ch];assert.equal(lane.execution.status,'complete',JSON.stringify(lane.issues));
  assert.deepEqual(Array.from(lane.execution.executed),['0:0','1:0']);
  for(const [i,id] of expected.entries()){
   const ph=lane.components.find(c=>c.id===id+':physical:0'&&c.eventId===i+':0');
   const el=lane.components.find(c=>c.id===id+':element:0'&&c.eventId===i+':0');
   const crit=1+stat.affinity/100*.25;
   close(ph.value,stat.attack*raw[i]/100*1.32*.8*crit);
   close(el.value,stat.element/10*element[i]*1.15*.3);
  }
 }
 for(const [id,mv,e,rsid] of [['GS_CHARGED_SLASH_1',106,1.1,1],['GS_CHARGED_SLASH_2',135,1.3,2],['GS_STRONG_CHARGED_SLASH_1',111,1.4,7],['GS_STRONG_CHARGED_SLASH_2',144,1.6,8]]){
  const record=w.TechniqueDBEngine.getExplicitGroundCharge(id);
  assert.equal(w.TechniqueDBEngine.audit('great-sword',id).calculable,false,'historical record remains separate');
  assert.deepEqual([record.hits[0].mv,record.hits[0].elementModifier,record.hits[0].damageType,record.groundChargeReference.sourceRowId],[mv,e,'slash',rsid]);
  assert.equal(record.groundChargeReference.liveGameVerification,'PENDING');
 }
 el('buildName').value='charged';el('saveBuild').click();
 assert.deepEqual(read('savedBuildMap().charged.combo.moves.map(x=>x.techniqueId)'),stored);
 const before=read('savedBuildMap()');
 change(levels()[0],'3');
 const checked=el('compareBuilds').querySelector('[data-compare-name="charged"]');checked.checked=true;checked.dispatchEvent(new w.Event('change',{bubbles:true}));el('runCompare').click();
 const compared=read('lastBuildComparisonRows[0]');
 assert.deepEqual(compared.oneHitPipeline.evaluationPlan.techniqueIds,expected);
 close(compared.referenceCombo.damage,r.damage);
 assert.equal(levels()[0].value,'3');
 const selector=el('savedBuildSelect');change(selector,'charged');el('savedBuildLoad').click();
 assert.deepEqual(levels().map(x=>x.value),['1','2']);assert.deepEqual(rows(),stored);
 close(run().damage,r.damage);
 el('combo').firstElementChild.querySelector('.combo-down').click();
 assert.deepEqual(rows(),[stored[1],stored[0]]);
 assert.deepEqual(Array.from(run().pipeline.evaluationPlan.techniqueIds),[expected[1],expected[0]]);
 assert.deepEqual(read('savedBuildMap()'),before);
 const cond=read('compareStep5Snapshot()');
 for(const flags of [{mounted:true},{greatSwordDrawOpening:'SHEATHED'},{offsetSuccess:true},{mantleState:'CORRUPTED'}]){
  w.__flags=JSON.stringify({...cond,...flags});w.__rows=JSON.stringify(stored.map(techniqueId=>({techniqueId})));
  assert.equal(w.eval('evaluateP0DamageRoute(JSON.parse(__rows),{currentCustom:true,evaluationConditions:JSON.parse(__flags)}).damage'),null);
 }
 equip();const after=read('calcState.realOneHit');assert.deepEqual(after.evaluationPlan,standard.evaluationPlan);assert.deepEqual(after.channels,standard.channels);
});
