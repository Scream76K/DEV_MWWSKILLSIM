'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('../tools/dom-test-setup.cjs');
const {profiles}=require('./fixtures/selected-hp-inputs.json'),{data}=require('./fixtures/offset-maximum-inputs.json');
test('ground single GS draw propagates explicit sheathed state, consumes it, and isolates real equipped skills in current and saved builds',t=>{
 const vc=new VirtualConsole(),errors=[];vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{virtualConsole:vc,url:'https://gs-sheathed.invalid/',runScripts:'dangerously',beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>{w.close();assert.deepEqual(errors,[]);});
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')')),el=id=>w.document.getElementById(id);
 const clone=x=>JSON.parse(JSON.stringify(x));
 const normal=p=>p.channels?.normal, maximum=p=>p.channels?.maximum;
 const extract=p=>['normal','maximum'].map(ch=>{
  const {value,reason}=w.consumerDamageMetric({oneHitPipeline:p},ch), c=p.channels?.[ch];
  return {value,reason,final:c?.finalState?.greatSword?.weaponDrawState??null,draw:c?.diagnostics?.drawHitPolicy??[]};
 });
 w.__dbText=JSON.stringify(data);
 w.eval('const source=JSON.parse(__dbText);DB=normalizeDB({...source,weapons:consolidateArtiaFixedVariantRows(source.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const apply=(weaponId,kind='great-sword')=>{
  w.__build=JSON.stringify({...profiles.find(p=>p.kind===kind).input,weaponId:String(weaponId),armor:{},decos:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}});
  w.eval('applyBuildSnapshot(JSON.parse(__build))');assert.equal(read('String(selectedWeapon().id)'),String(weaponId));
 };

 const click=(id='gs_draw')=>{
  for(const b of el('combo').querySelectorAll('.del'))b.click();
  assert.ok([...el('comboMovePicker').options].some(x=>x.value===id&&!x.disabled),id);
  el('comboMovePicker').value=id;el('addCombo').click();
  assert.deepEqual(read('App.state.combo.moves.map(x=>x.techniqueId)'),[id]);
  const prev=read('compareStep5Snapshot()');
  let result; const run=w.calcUserComboDamage;
  w.calcUserComboDamage=(...args)=>(result=run.apply(w,args));
  try{el('calcUserComboDamage').click();}finally{w.calcUserComboDamage=run;}
  assert.equal(el('compareOut').dataset.resultMode,'current-custom');
  assert.deepEqual(read('compareStep5Snapshot()'),prev);
  return result;
 };
 apply(1148);
 const control=click();
 assert.ok(extract(control.pipeline).every(x=>x.value>0&&x.final==='DRAWN'),JSON.stringify(control.pipeline));
 assert.match(el('combo').querySelector('.comboMeta').textContent,/納刀開始.*資料暫定/);
 assert.doesNotMatch(el('combo').querySelector('.comboMeta').textContent,/77|1\.20/);
 assert.equal(el('comboGSDrawOpening'),null,'a fresh exact picker item must not need a global setting');
 assert.equal(control.stages[0].result.total,extract(control.pipeline)[0].value);
 for(const ch of [normal(control.pipeline),maximum(control.pipeline)]) {
   assert.deepEqual(Array.from(ch.execution.executed),['0:0','0:1']);
   assert.ok(ch.components.every(c=>c.eventId==='0:1'));
   assert.equal(ch.diagnostics.gsGroundDraw.drawSkillsActiveInPower,false);
 }
 assert.match(el('compareOut').textContent,/抜刀斬り.*納刀.*最大.*実機未確認/);
 assert.match(el('compareOut').querySelector('[data-used-combo]').textContent,/通常：抜刀斬り最大：抜刀斬り/);
 const markedMoves=read('App.state.combo.moves'),marker=markedMoves[0].greatSwordDrawIntent;
 assert.equal(typeof marker,'string');assert.equal(markedMoves[0].techniqueId,'gs_draw');
 for(const b of el('combo').querySelectorAll('.del'))b.click();
 el('comboMovePicker').value='';el('addCombo').click();
 assert.ok(read('App.state.combo.moves').every(x=>!x.greatSwordDrawIntent));
 const distinct=click('gs_charge3');assert.notEqual(extract(distinct.pipeline)[0].value,extract(control.pipeline)[0].value);assert.notEqual(normal(distinct.pipeline)?.finalState?.greatSword?.weaponDrawState,'DRAWN');
 const replayAmbiguous=()=>{
  const tag='canonical:GS_DRAW_VERTICAL_SLASH',snapshot=read('buildSnapshot()');
  assert.ok(![...el('comboMovePicker').options].some(x=>x.value===tag));
  snapshot.combo.moves=[{techniqueId:tag}];w.__ambiguous=snapshot;w.eval('applyBuildSnapshot(__ambiguous)');
  assert.deepEqual(read('App.state.combo.moves'),[{techniqueId:tag}]);
  assert.match(el('combo').querySelector('.comboMeta').textContent,/開始状態を判定しません/);
  return w.calcUserComboDamage();
 };
 const ambiguous=extract(replayAmbiguous().pipeline);
 assert.ok(ambiguous.every(x=>x.value===null&&x.reason.includes('SHEATHED_OPENING_REQUIRED')),JSON.stringify(ambiguous));
 const repeat=w.evaluateP0DamageRoute([...markedMoves,...markedMoves],{currentCustom:true});assert.match(repeat.blocked[0].reason,/SINGLE_ACTION/);
 const packedRepeat=w.evaluateP0DamageRoute([{...markedMoves[0],repeat:2}],{currentCustom:true});assert.equal(packedRepeat.damage,null);
 const initial=w.eval("({...compareStep5Snapshot(),greatSwordDrawOpening:'DRAWN'})");
 assert.deepEqual(clone(extract(w.evaluateP0DamageRoute(markedMoves,{currentCustom:true,evaluationConditions:initial}).pipeline)),ambiguous);
 const conflict=w.eval("({...compareStep5Snapshot(),punishingDrawHits:{maximum:{GS_DRAW_VERTICAL_SLASH:[true]}}})");
 assert.match(w.evaluateP0DamageRoute(markedMoves,{currentCustom:true,evaluationConditions:conflict}).blocked[0].reason,/EXPLICIT_DRAW_MAP_CONFLICT/);
 const mounted=w.eval("({...compareStep5Snapshot(),mounted:true})");
 assert.match(w.evaluateP0DamageRoute(markedMoves,{currentCustom:true,evaluationConditions:mounted}).blocked[0].reason,/SINGLE_ACTION/);

 const veto=read('buildSnapshot()');veto.combo.moves=markedMoves;veto.combo.greatSwordDrawOpening='DRAWN';w.__veto=veto;
 w.eval('applyBuildSnapshot(__veto)');
 assert.deepEqual(clone(extract(w.calcUserComboDamage().pipeline)),ambiguous);
 assert.equal(read('buildSnapshot().combo.moves[0].greatSwordDrawOpening'),'DRAWN');
 const old=read('buildSnapshot()');old.combo.moves=[{techniqueId:'gs_draw'}];w.__old=old;
 w.eval('applyBuildSnapshot(__old)');
 const row=el('combo').querySelector('.cmove');row.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.deepEqual(read('App.state.combo.moves'),[{techniqueId:'gs_draw'}]);
 assert.match(el('combo').querySelector('.comboMeta').textContent,/選び直してください/);
 assert.deepEqual(clone(extract(w.calcUserComboDamage().pipeline)),ambiguous);
 row.value='gs_charge3';row.dispatchEvent(new w.Event('change',{bubbles:true}));
 row.value='gs_draw';row.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.deepEqual(read('App.state.combo.moves'),markedMoves);
 assert.deepEqual(clone(extract(w.calcUserComboDamage().pipeline)),clone(extract(control.pipeline)));
  for(const [weaponId,skillId] of [[247,103],[250,8]]){
  apply(weaponId);assert.deepEqual(read('App.state.combo.moves'),[]);assert.ok(read('selectedWeapon().skills.some(s=>s.skill.id==='+skillId+')'));
  const {pipeline}=click();const lanes=clone(extract(pipeline)), n=normal(pipeline), m=maximum(pipeline);
  assert.ok(lanes[1].value>lanes[0].value&&lanes.every(x=>x.final==='DRAWN'),JSON.stringify(lanes));
  const effects=c=>c.components.find(x=>x.id==='GS_DRAW_VERTICAL_SLASH:physical:0').effectsApplied.map(x=>typeof x==='string'?x:x.id);
  const drawId=skillId===8?'punishing-draw-flat:GS_DRAW_VERTICAL_SLASH:0':'critical-draw:GS_DRAW_VERTICAL_SLASH:0';
  assert.equal(effects(n).filter(id=>id===drawId).length,0);
  assert.equal(effects(m).filter(id=>id===drawId).length,1,JSON.stringify(m.components));
  assert.deepEqual(lanes.map(x=>x.draw.map(y=>[y.skillId,y.includedInPower])),[[[skillId,false]],[[skillId,true]]]);
  t.diagnostic('weapon '+weaponId+' skill '+skillId+': '+lanes.map(x=>x.value).join(' / '));
  el('buildName').value='GS skill '+skillId;el('saveBuild').click();
  assert.equal(read('savedBuildMap()["GS skill '+skillId+'"].combo.moves[0].greatSwordDrawIntent'),marker);
  apply(1148);replayAmbiguous();
  for(const b of el('compareBuilds').querySelectorAll('input[data-compare-name]')){b.checked=b.dataset.compareName==='GS skill '+skillId;b.dispatchEvent(new w.Event('change',{bubbles:true}));}
  const saved=read('savedBuildMap()');
  el('runCompare').click();
  assert.deepEqual(read('savedBuildMap()'),saved);assert.deepEqual(read('App.state.combo.moves'),[{techniqueId:'canonical:GS_DRAW_VERTICAL_SLASH'}]);
  assert.deepEqual(clone(extract(read('lastBuildComparisonRows[0].oneHitPipeline'))),lanes);
  const loaded=read('savedBuildMap()["GS skill '+skillId+'"]');w.__saved=loaded;w.eval('applyBuildSnapshot(__saved)');
  assert.equal(read('App.state.combo.moves[0].greatSwordDrawIntent'),marker);
  assert.deepEqual(clone(extract(w.calcUserComboDamage().pipeline)),lanes);
  // A pre-field named save must not borrow spec-compliant provenance from the live editor.
  const current=read('savedBuildMap()');
  delete current['GS skill '+skillId].combo.moves[0].greatSwordDrawIntent;
  w.__legacy=JSON.stringify(current);
  w.eval('storageSet(BUILDS_KEY,__legacy)');
  el('runCompare').click();assert.deepEqual(read('savedBuildMap()'),current);
  assert.deepEqual(clone(extract(read('lastBuildComparisonRows[0].oneHitPipeline'))),ambiguous);

 }
});
