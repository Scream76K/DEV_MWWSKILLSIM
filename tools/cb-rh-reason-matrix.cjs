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


 const kind=w.document.getElementById('buildTemplateWeaponKind');
 kind.value='charge-blade';kind.dispatchEvent(new w.Event('change'));
 const sel=w.document.getElementById('buildTemplateSelect');sel.value='KOTATU_CB_01';sel.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();
 w.eval("App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({shieldBoosted:true,axeBoosted:true,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0});monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';comboCBMode.value='AXE';comboCBSword.value='0';App.combo.syncFromDOM();calcBuild();");
 const baseline=read('comboCBStoredState()');
 const cases=[
  {name:'baseline_two_normal_each',scope:'adopted',change:()=>{}},
  {name:'enhanced_priority_R',scope:'adopted-boundary-candidate',change:()=>{w.document.getElementById('comboCBNormalPhials').value='1.5';w.document.getElementById('comboCBEnhancedPhials').value='0.5';}},
  {name:'enhanced_priority_H',scope:'candidate-enhanced-H',change:()=>{w.document.getElementById('comboCBHNormalPhials').value='0.5';w.document.getElementById('comboCBHEnhancedPhials').value='0.5';}},
  {name:'R_more_normal',scope:'adopted-boundary-candidate',change:()=>{w.document.getElementById('comboCBNormalPhials').value='3';}},
  {name:'H_more_normal',scope:'adopted-boundary-candidate',change:()=>{w.document.getElementById('comboCBHNormalPhials').value='3';}},
  {name:'H_stock_short',scope:'invalid-intentional',change:()=>{w.document.getElementById('comboCBHNormalPhials').value='0.5';}},
  {name:'H_mode_missing',scope:'invalid-intentional',change:()=>{w.document.getElementById('comboCBHMode').value='';}},
  {name:'H_axe_off_enhanced_half_normal_half',scope:'invalid-cross-type',change:()=>{w.document.getElementById('comboCBAxe').value='0';w.document.getElementById('comboCBHEnhancedPhials').value='0.5';w.document.getElementById('comboCBHNormalPhials').value='0.5';}},
  {name:'H_axe_off_enhanced_two',scope:'candidate-axe-off',change:()=>{w.document.getElementById('comboCBAxe').value='0';w.document.getElementById('comboCBHEnhancedPhials').value='2';w.document.getElementById('comboCBHNormalPhials').value='0';}},
  {name:'H_enhanced_half_no_normal',scope:'invalid-insufficient',change:()=>{w.document.getElementById('comboCBHEnhancedPhials').value='0.5';w.document.getElementById('comboCBHNormalPhials').value='0';}},
  {name:'H_shield_off_enhanced',scope:'invalid-shield',change:()=>{w.document.getElementById('comboCBShield').value='0';w.document.getElementById('comboCBHEnhancedPhials').value='1';}},
  {name:'H_sword_on_enhanced',scope:'invalid-sword',change:()=>{w.document.getElementById('comboCBSword').value='1';w.document.getElementById('comboCBHEnhancedPhials').value='1';}},
  {name:'R_stock_short',scope:'invalid-intentional',change:()=>{w.document.getElementById('comboCBNormalPhials').value='1.5';}}
 ];
 for(const testCase of cases){
  w.__cbBaseline=baseline;
  w.eval('restoreComboCBState(window.__cbBaseline)');
  testCase.change();w.eval('App.combo.syncFromDOM();calcBuild()');
  const result=read('calcState.realOneHit');
  const channels=Object.fromEntries(['normal','maximum'].map(ch=>{
   const c=result?.channels?.[ch];
   return [ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??result?.reason??null,total:c?.metrics?.comboTotalDamage?.value??null,r:c?.diagnostics?.routeTotals?.R?.value??null,h:c?.diagnostics?.routeTotals?.H?.value??null}];
  }));
  out.cases.push({name:testCase.name,scope:testCase.scope,status:result?.status,reason:result?.reason,channels});
  if(testCase.name==='baseline_two_normal_each'){
   for(const ch of ['normal','maximum']) assert.equal(channels[ch].status,'complete',JSON.stringify(channels[ch]));
  }
 }
 const expected={
  baseline_two_normal_each:['complete',null],
  enhanced_priority_R:['complete',null],
  enhanced_priority_H:['complete',null],
  R_more_normal:['complete',null],
  H_more_normal:['complete',null],
  H_stock_short:['blocked','H:REAL_SLICE:CB_ED1_PHIAL_STOCK_INSUFFICIENT'],
  H_mode_missing:['blocked','H:REAL_SLICE:CB_MIX_EXPLICIT_AXE_START_REQUIRED'],
  H_axe_off_enhanced_half_normal_half:['blocked','H:REAL_SLICE:CB_ED1_CROSS_TYPE_DAMAGE_ALLOCATION_UNRESOLVED'],
  H_axe_off_enhanced_two:['complete',null],
  H_enhanced_half_no_normal:['blocked','H:REAL_SLICE:CB_ED1_PHIAL_STOCK_INSUFFICIENT'],
  H_shield_off_enhanced:['blocked','H:REAL_SLICE:CB_H_EXPLICIT_MODE_SHIELD_SWORD_REQUIRED'],
  H_sword_on_enhanced:['blocked','H:REAL_SLICE:CB_H_EXPLICIT_MODE_SHIELD_SWORD_REQUIRED'],
  R_stock_short:['blocked','R:REAL_SLICE:CB_ED1_PHIAL_STOCK_INSUFFICIENT']
 };
 for(const item of out.cases)for(const ch of ['normal','maximum']){
  const [status,reason]=expected[item.name];
  assert.equal(item.channels[ch].status,status,item.name+' '+ch);
  assert.equal(item.channels[ch].reason,reason,item.name+' '+ch);
  assert.equal(Number.isFinite(item.channels[ch].total),status==='complete',item.name+' '+ch+' partial total');
  if(status==='complete')assert.equal(item.channels[ch].total,item.channels[ch].r+item.channels[ch].h,item.name+' '+ch+' raw sum');
 }
 assert.deepEqual(errors,[]);
 out.outcome='PASS';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));
 dom.window.close();
}
