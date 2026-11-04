const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const productionHtml=require('./dom-test-setup.cjs').readSimulatorHtml();
// Run the unchanged feature-branch production HTML; no test-time gate patch.
const dom=new JSDOM(productionHtml,{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);



 const kind=w.document.getElementById('buildTemplateWeaponKind');
 kind.value='charge-blade';kind.dispatchEvent(new w.Event('change'));
 const select=w.document.getElementById('buildTemplateSelect');select.value='KOTATU_CB_01';select.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();



 // Two real MHDB weapons and real MHDB armor418, no synthetic records.
 const configurations=[
  {id:1073,name:'CB_THUNDER_A_1073',headArmorId:null},
  {id:1074,name:'CB_THUNDER_B_1074',headArmorId:418}
 ];
 const summarize=x=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{
  status:x?.channels?.[ch]?.execution?.status,
  total:x?.channels?.[ch]?.metrics?.comboTotalDamage?.value,
  reason:x?.channels?.[ch]?.execution?.reason??null
 }]));
 for(const input of configurations){
  w.__cbThunderInput=input;
  w.eval("window.__cbThunderWeapon=DB.weapons.find(x=>x.id===window.__cbThunderInput.id&&x.kind==='charge-blade');if(!window.__cbThunderWeapon)throw Error('MHDB_CB_MISSING');window.__cbThunderArmor=window.__cbThunderInput.headArmorId==null?null:DB.armor.find(x=>x.id===window.__cbThunderInput.headArmorId&&x.kind==='head');if(window.__cbThunderInput.headArmorId!=null&&!window.__cbThunderArmor)throw Error('MHDB_ARMOR_418_MISSING');App.build.setWeapon(window.__cbThunderWeapon);build.armor={head:window.__cbThunderArmor,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__cbThunderWeapon.id+'>'+window.__cbThunderWeapon.name+'</option>';weapon.value=String(window.__cbThunderWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const item=read("({snapshot:buildSnapshot(),real:calcState.realOneHit,stats:calcState.stats})");
  const expectedRes=input.headArmorId===null?0:1;
  assert.equal(item.stats?.thunderResistanceInput?.status,'KNOWN_LIMITED');
  assert.equal(item.stats.thunderResistanceInput.total,expectedRes);
  item.name=input.name;item.id=input.id;item.headArmorId=input.headArmorId;item.summary=summarize(item.real);
  for(const ch of ['normal','maximum']){
   assert.equal(item.summary[ch].status,'complete',input.name+' '+ch+' '+item.summary[ch].reason);
   const a=item.real.routes?.R?.channels?.[ch]?.metrics?.comboTotalDamage?.value;
   const b=item.real.routes?.H?.channels?.[ch]?.metrics?.comboTotalDamage?.value;
   assert.ok(Number.isFinite(a)&&Number.isFinite(b),'R/H finite '+input.name);
   assert.ok(Math.abs(item.summary[ch].total-a-b)<1e-7,'raw independent R + H '+input.name);
  }
  w.document.getElementById('buildName').value=input.name;
  w.saveNamedBuild();
  out.cases.push(item);
 }
 assert.notEqual(out.cases[0].summary.normal.total,out.cases[1].summary.normal.total);
 const savedBefore=read('savedBuildMap()');
 const semanticSnapshot=snap=>{
  const {savedAt,...rest}=snap;
  rest.charmCustom={...rest.charmCustom,weaponSlot:Boolean(rest.charmCustom?.weaponSlot),
   skills:(rest.charmCustom?.skills||[]).filter(x=>String(x.name||'').trim()!=='')};
  return rest;
 };
 for(const item of out.cases){
  const el=w.document.querySelector('[data-build-load="'+item.name+'"]');
  assert.ok(el,'named load button '+item.name);
  el.click();w.eval('calcBuild()');
  const loaded=read("({snapshot:buildSnapshot(),real:calcState.realOneHit,weaponId:selectedWeapon()?.id,resistance:calcState.stats.thunderResistanceInput})");
  assert.equal(loaded.weaponId,item.id,'weapon identity restored '+item.name);
  assert.equal(loaded.resistance?.total,item.headArmorId===null?0:1,'armor thunder resistance restored '+item.name);
  assert.deepEqual(semanticSnapshot(loaded.snapshot),semanticSnapshot(item.snapshot),'semantic snapshot restored '+item.name);
  assert.deepEqual(summarize(loaded.real),item.summary,'computed damage restored '+item.name);
 }
 const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),real:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 const rows=read("lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null");
 const after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),real:calcState.realOneHit})');
 assert.equal(rows?.length,2,'two saved rows compared');
 assert.deepEqual(before,after,'current selected build/conditions unchanged by compare');
 assert.deepEqual(read('savedBuildMap()'),savedBefore,'stored builds unchanged by compare');
 out.rows=rows.map(row=>{
  const item=out.cases.find(x=>x.name===row.name);
  assert.ok(item,'unexpected saved comparison row '+row.name);
  const summary=summarize(row.pipeline);
  for(const ch of ['normal','maximum']){
   assert.equal(summary[ch].status,'complete',row.name+' compare '+ch);
   assert.ok(Math.abs(summary[ch].total-item.summary[ch].total)<1e-7,row.name+' comparison same raw total '+ch);
  }
  return {name:row.name,summary};
 });
 assert.deepEqual(errors,[]);
 out.outcome='THUNDER_CB_SAVED_AB_CANDIDATE_PASS_NOT_APPROVED';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{
 console.log(JSON.stringify({outcome:out.outcome,cases:out.cases.map(x=>({name:x.name,id:x.id,headArmorId:x.headArmorId,resistance:x.stats.thunderResistanceInput.total,summary:x.summary})),rows:out.rows,failure:out.failure,errors},null,2));
 dom.window.close();
}
