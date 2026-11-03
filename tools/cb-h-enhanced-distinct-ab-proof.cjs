const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const input='docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json',pack=JSON.parse(fs.readFileSync(input));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(hash(input),'9491bfc1cf357aed4967418949d78c0ddd73407c6461443a7b594a2b2710c810');
for(const [k,n] of Object.entries(pack.counts))assert.equal(pack.data[k].length,n);
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage4.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('NETWORK_DISABLED'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
const out={environment:'JSDOM, actual exported application MHDB; no synthetic equipment; DOM template load button; not Safari or game',source:{...pack,data:undefined},hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js',input,__filename].map(p=>[p,hash(p)])),cases:[],errors};
try{
 w.__stage4DB=pack.data;
 w.eval(`DB=normalizeDB(window.__stage4DB);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();window.__renderBuildTemplateUI();`);


 const names=['CB_ENHANCED_A','CB_ENHANCED_B'];
 for(const [i,name] of names.entries()){
  const select=w.document.getElementById('buildTemplateWeaponKind');
  select.value='charge-blade';select.dispatchEvent(new w.Event('change'));
  w.document.getElementById('buildTemplateSelect').value='KOTATU_CB_01';
  w.document.getElementById('buildTemplateSelect').dispatchEvent(new w.Event('change'));
  w.document.getElementById('loadBuildTemplate').click();
  w.eval("App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({shieldBoosted:true,axeBoosted:true,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0});monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='0.5';comboCBHEnhancedPhials.value='0.5';comboCBMode.value='AXE';comboCBSword.value='0';App.combo.syncFromDOM();");
  if(i===1){
   w.eval("window.__changedArmorSlot=Object.keys(build.armor).find(k=>build.armor[k]&&build.armor[k].id!=null);if(!window.__changedArmorSlot)throw Error('TEMPLATE_NO_ARMOR_TO_REMOVE');build.armor[window.__changedArmorSlot]=null;");
  }
  w.calcBuild();
  const c=read("({snapshot:buildSnapshot(),stats:calcState.stats,result:calcState.realOneHit,summary:buildSummary.textContent,armor:build.armor})");
  c.name=name;out.cases.push(c);
  for(const ch of ['normal','maximum']){
   const v=c.result?.channels?.[ch]?.metrics?.comboTotalDamage;
   assert.equal(v?.status,'available',name+' '+ch+' '+JSON.stringify({status:c.result?.status,reason:c.result?.reason,execution:c.result?.channels?.[ch]?.execution}));
   assert.equal(c.result.channels[ch].execution.status,'complete');
   assert.equal(v.value,c.result.routes.R.channels[ch].metrics.comboTotalDamage.value+c.result.routes.H.channels[ch].metrics.comboTotalDamage.value);
  }
  w.document.getElementById('buildName').value=name;w.saveNamedBuild();
 }
 for(const c of out.cases)for(const ch of ['normal','maximum']) assert.equal(c.result.routes.H.channels[ch].finalState.chargeBlade.enhancedPhials,0,'enhanced H must consume the 0.5 stock');
 assert.notDeepEqual(out.cases[0].snapshot,out.cases[1].snapshot,'distinct equipment snapshots required');
 assert.notDeepEqual(out.cases[0].armor,out.cases[1].armor,'actual equipped armor must differ');
 for(const ch of ['normal','maximum']) assert.notEqual(out.cases[0].result.channels[ch].metrics.comboTotalDamage.value,out.cases[1].result.channels[ch].metrics.comboTotalDamage.value,'equipment change must alter '+ch+' actual damage');
 out.savedBefore=read('savedBuildMap()');
 for(const c of out.cases){
  const el=w.document.querySelector('[data-build-load="'+c.name+'"]');assert.ok(el,'load '+c.name);el.click();w.calcBuild();
  const loaded=read('({snapshot:buildSnapshot(),result:calcState.realOneHit})');
  assert.deepEqual(loaded.result.channels,c.result.channels,'reload '+c.name);
  assert.deepEqual((({savedAt,...rest})=>rest)(loaded.snapshot),(({savedAt,...rest})=>rest)(c.snapshot),'snapshot reload '+c.name);
 }
 out.before=read('({snapshot:buildSnapshotComparable(buildSnapshot()),result:calcState.realOneHit})');
 w.eval("document.querySelectorAll('#compareBuilds input[data-compare-name]').forEach(x=>x.checked=true);runBuildCompare();");
 out.rows=read("lastBuildComparisonRows ? lastBuildComparisonRows.map(x=>({name:x.name,pipeline:x.oneHitPipeline})) : null");
 out.comparisonText=w.document.getElementById('compareOut').textContent;
 out.after=read('({snapshot:buildSnapshotComparable(buildSnapshot()),result:calcState.realOneHit})');
 assert.deepEqual(out.before,out.after,'active build unchanged');
 assert.deepEqual(read('savedBuildMap()'),out.savedBefore,'saved builds unchanged');
 assert.equal(out.rows?.length,2,'two comparison rows');
 for(const row of out.rows){
  const c=out.cases.find(x=>x.name===row.name);assert.ok(c,'row name: '+row.name);
  for(const ch of ['normal','maximum']){
   const value=row.pipeline?.channels?.[ch]?.metrics?.comboTotalDamage;
   assert.equal(value?.status,'available','compare '+row.name+' '+ch+' '+JSON.stringify(row.pipeline?.channels?.[ch]?.execution));
   assert.equal(value.value,c.result.channels[ch].metrics.comboTotalDamage.value);
   assert.ok(out.comparisonText.includes(value.value.toFixed(1)),'comparison renders value for '+row.name);
  }
 }
 assert.deepEqual(errors,[]);
 out.outcome='PASS';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{
 console.log(JSON.stringify({outcome:out.outcome,builds:out.cases.map(c=>({name:c.name,armor:Object.fromEntries(Object.entries(c.armor||{}).map(([k,v])=>[k,v?.id??null])),attack:c.stats?.attackTrue,totals:Object.fromEntries(['normal','maximum'].map(ch=>[ch,c.result?.channels?.[ch]?.metrics?.comboTotalDamage])),reason:c.result?.reason})),comparison:out.rows?.map(r=>({name:r.name,normal:r.pipeline?.channels?.normal?.metrics?.comboTotalDamage,maximum:r.pipeline?.channels?.maximum?.metrics?.comboTotalDamage})),failure:out.failure,errors},null,2));
 dom.window.close();
}
