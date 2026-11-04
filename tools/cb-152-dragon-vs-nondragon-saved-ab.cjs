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




 const scenarios=[
  {id:131,name:'CB_152_DRAGON_131',expectedElement:'dragon'},
  {id:79,name:'CB_152_NONE_79',expectedElement:'none'}
 ];
 const summarize=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{
  status:r?.channels?.[ch]?.execution?.status??'missing',
  reason:r?.channels?.[ch]?.execution?.reason??r?.channels?.[ch]?.metrics?.comboTotalDamage?.reason??null,
  total:r?.channels?.[ch]?.metrics?.comboTotalDamage?.value??null
 }]));
 const setState=(id,maximum)=>{
  w.__cb152Id=id;w.__cb152Max=maximum;
  w.eval("window.__cb152Weapon=DB.weapons.find(x=>x.id===window.__cb152Id&&x.kind==='charge-blade');if(!window.__cb152Weapon)throw Error('MHDB_CB_152_NOT_FOUND');App.build.setWeapon(window.__cb152Weapon);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__cb152Weapon.id+'>'+window.__cb152Weapon.name+'</option>';weapon.value=String(window.__cb152Weapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value=window.__cb152Max?'ON':'OFF';App.combo.syncFromDOM();calcBuild();");
  return read("({snapshot:buildSnapshot(),real:calcState.realOneHit,skills:calcState.stats?.skills,element:selectedWeapon()?.specials?.[0]?.element??'none'})");
 };
 for(const input of scenarios){
  const on=setState(input.id,true);
  const off=setState(input.id,false);
  assert.equal(on.element,input.expectedElement,'verified source weapon element '+input.id);
  const a=summarize(on.real),z=summarize(off.real);
  assert.equal(a.normal.status,'complete',input.id+' normal ON');
  assert.equal(z.normal.status,'complete',input.id+' normal OFF');
  assert.equal(a.normal.total,z.normal.total,input.id+' normal channel isolated from maximum state');
  assert.equal(z.maximum.status,'complete',input.id+' maximum OFF');
  if(input.id===131){
    assert.equal(a.maximum.status,'complete','dragon weapon conversion supported');
    assert.ok(a.maximum.total>z.maximum.total,'active dragon conversion should add elemental damage');
  }else{
    assert.equal(a.maximum.status,'blocked','non dragon active scope remains blocked');
    assert.match(String(a.maximum.reason),/ATTRIBUTE_CONVERSION_BODY_SCOPE_UNSUPPORTED/,'non dragon pending scope reason');
  }
  setState(input.id,true);
  w.document.getElementById('buildName').value=input.name;
  w.saveNamedBuild();
  out.cases.push({id:input.id,name:input.name,element:on.element,on:a,off:z,snapshot:on.snapshot});
 }
 const saved=read('savedBuildMap()');
 for(const item of out.cases){
  const button=w.document.querySelector('[data-build-load="'+item.name+'"]');
  assert.ok(button,'load named build '+item.name);
  button.click();w.eval('calcBuild()');
  const loaded=read('({weapon:selectedWeapon()?.id,real:calcState.realOneHit,state:compareStep5Snapshot().attributeConversionState})');
  assert.equal(loaded.weapon,item.id,'saved weapon identity '+item.name);
  assert.equal(loaded.state?.normal,false,'saved normal OFF '+item.name);
  assert.equal(loaded.state?.maximum,true,'saved maximum ON '+item.name);
  assert.deepEqual(summarize(loaded.real),item.on,'saved conversion result '+item.name);
 }
 const before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),real:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 const rows=read("lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null");
 const after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),real:calcState.realOneHit})');
 assert.equal(rows?.length,2,'saved A/B rows');
 for(const row of rows){
  const item=out.cases.find(x=>x.name===row.name);
  assert.ok(item,'unexpected row '+row.name);
  assert.deepEqual(summarize(row.pipeline),item.on,'comparison isolates per-weapon 152 scope '+row.name);
 }
 assert.deepEqual(before,after,'current build and calculation intact');
 assert.deepEqual(read('savedBuildMap()'),saved,'no comparison mutation of saved builds');
 assert.deepEqual(errors,[]);
 out.outcome='CB_152_ACTIVE_SCOPE_SAVED_AB_PASS_NO_SCOPE_EXTENSION';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{
 console.log(JSON.stringify({outcome:out.outcome,cases:out.cases.map(x=>({id:x.id,name:x.name,element:x.element,on:x.on,off:x.off})),failure:out.failure,errors},null,2));dom.window.close();
}
