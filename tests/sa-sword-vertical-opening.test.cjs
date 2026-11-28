'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs'),{profiles}=require('./fixtures/selected-hp-inputs.json');
const {data}=require('./fixtures/offset-maximum-inputs.json');
test('current single sword vertical uses the adopted opening only for missing fields',t=>{
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://sa-axe.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const el=id=>w.document.getElementById(id),read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 w.__data=data;
 w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');

 const snap=profiles.find(p=>p.kind==='switch-axe').input;
 assert.equal(snap.weaponId,'1175');
 const id='canonical:SA_SWORD_VERTICAL';
 w.applyBuildSnapshot({...snap,combo:{moves:[]}});
 const add=move=>{el('comboMovePicker').value=move;assert.equal(el('comboMovePicker').value,move);el('addCombo').click();};
 const set=(control,value)=>{el(control).value=value;el(control).dispatchEvent(new w.Event('change',{bubbles:true}));};
 const calc=()=>{
  let result;const original=w.calcUserComboDamage;
  w.calcUserComboDamage=(...args)=>(result=original.apply(w,args));
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=original;}
  return result;
 };
 add(id);
 el('buildName').value='blank';el('saveBuild').click();
 const bytes=w.eval('storageGet(BUILDS_KEY)');
 const blank=calc(),hint=el('compareOut').querySelector('[data-automatic-opening]')?.textContent;
 set('comboSAMode','SWORD');set('comboSAAwakened','0');
 const explicit=calc();
 assert.ok(Math.abs(explicit.damage-113.258352)<1e-8,String(explicit.damage));
 assert.equal(blank.damage,explicit.damage,JSON.stringify(blank.blocked));
 assert.deepEqual(blank.pipeline.channels,explicit.pipeline.channels);
 assert.match(hint,/剣モード.*高出力なし/);
 set('comboSAMode','AXE');
 assert.match(calc().blocked[0].reason,/MISMATCH:mode/);
 set('comboSAMode','SWORD');set('comboSAAwakened','1');
 const awakened=calc();
 assert.ok(awakened.damage>explicit.damage);
 set('comboSAMode','');
 assert.deepEqual(calc().pipeline.channels,awakened.pipeline.channels);
 set('comboSAAwakened','');
 add(id);assert.match(calc().blocked[0].reason,/UNRESOLVED:mode/);
 for(const move of ['sa_vertical','canonical:SA_SWORD_RIGHT_RISING']){
  if(move==='sa_vertical')w.applyBuildSnapshot({...snap,combo:{moves:[{techniqueId:move}]}});
  else{w.applyBuildSnapshot({...snap,combo:{moves:[]}});add(move);}
  if(move==='sa_vertical')assert.equal(calc().damage,null,move);
  else assert.ok(Math.abs(calc().damage-159.8776104)<1e-8,move);
 }
 el('savedBuildSelect').value='blank';el('savedBuildSelect').dispatchEvent(new w.Event('change'));el('savedBuildLoad').click();
 assert.equal(el('comboSAMode').value,'');assert.equal(el('comboSAAwakened').value,'');
 const check=el('compareBuilds').querySelector('[data-compare-name="blank"]');check.checked=true;el('runCompare').click();
 const saved=read('lastBuildComparisonRows[0]');
 assert.deepEqual(saved.oneHitPipeline.channels,JSON.parse(JSON.stringify(explicit.pipeline.channels)));
 assert.equal(saved.referenceCombo.damage,explicit.damage);
 assert.equal(saved.referenceCombo.stages.length,1);
 const components=saved.oneHitPipeline.channels.normal.components.filter(c=>c.status==='available'&&c.eventId.startsWith('0:'));
 assert.equal(saved.referenceCombo.stages[0].damage,components.reduce((sum,c)=>sum+c.value,0));
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),bytes);
 for(const state of [{mode:'BAD'},{awakened:'0'},{axeBoosted:'ON'},{unknown:true},'SWORD']){
  w.applyBuildSnapshot({...snap,combo:{moves:[{techniqueId:id}],switchAxeState:state}});
  assert.equal(calc().damage,null,JSON.stringify(state));
 }
 const first='canonical:SA_ELEMENT_DISCHARGE_FIRST_CONTACT';
 w.applyBuildSnapshot({...snap,combo:{moves:[]}});add(first);
 assert.equal(calc().damage,null);
 set('comboSAMode','SWORD');set('comboSAAwakened','0');
 const body=calc();assert.ok(body.damage>0,JSON.stringify(body.blocked));
 for(const lane of ['normal','maximum']){
  const c=body.pipeline.channels[lane].components,control=explicit.pipeline.channels[lane].components;
  assert.deepEqual(Array.from(c,x=>x.id),['SA_ELEMENT_DISCHARGE_FIRST_CONTACT:physical:0','SA_ELEMENT_DISCHARGE_FIRST_CONTACT:element:0']);
  const mv=w.TechniqueDBEngine.get('switch-axe','SA_SWORD_VERTICAL').hits[0].mv;
  assert.ok(Math.abs(c[0].value-control[0].value*25/mv)<1e-8);
  assert.equal(c[1].value,control[1].value);
 }
 el('buildName').value='first';el('saveBuild').click();
 const savedBytes=w.eval('storageGet(BUILDS_KEY)');
 set('comboSAAwakened','1');assert.equal(calc().damage,null);
 set('comboSAAwakened','0');set('comboSAMode','AXE');assert.equal(calc().damage,null);
 for(const b of el('compareBuilds').querySelectorAll('input[data-compare-name]'))if(b.checked!==(b.dataset.compareName==='first'))b.click();
 el('runCompare').click();
 const comparison=read('lastBuildComparisonRows[0]');
 for(const lane of ['normal','maximum'])assert.equal(w.consumerDamageMetric(comparison,lane).value,body.pipeline.channels[lane].metrics.comboTotalDamage.value);
 assert.equal(comparison.referenceCombo.damage,body.damage);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),savedBytes);
 for(const moves of [[{techniqueId:first,repeat:2}],[{techniqueId:first},{techniqueId:id}],[{techniqueId:'sa_element'}]]){
  w.applyBuildSnapshot({...snap,combo:{moves,switchAxeState:{mode:'SWORD',awakened:false}}});assert.equal(calc().damage,null);
 }
 const buildFirst=(weaponId,state)=>w.applyBuildSnapshot({...snap,weaponId,combo:{moves:[{techniqueId:first}],switchAxeState:state}});
 const start={mode:'SWORD',awakened:false};
 buildFirst('1175',{...start,axeBoosted:true});assert.equal(calc().damage,body.damage);
 buildFirst('1175',{...start,unknown:true});assert.equal(calc().damage,null);
 buildFirst('939',start);assert.equal(calc().damage,null);
 assert.equal(w.eval('storageGet(BUILDS_KEY)'),savedBytes);
 t.diagnostic('weapon 1175 first contact '+body.damage+' / '+body.maximumDamage);
});
