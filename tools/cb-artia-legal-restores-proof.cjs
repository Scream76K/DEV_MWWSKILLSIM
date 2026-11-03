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
 const select=w.document.getElementById('buildTemplateSelect');select.value='KOTATU_CB_01';select.dispatchEvent(new w.Event('change'));
 w.document.getElementById('loadBuildTemplate').click();

 const ids=[145,146,147];
 for(const id of ids){
  w.__artiaId=id;
  w.eval("window.__artiaWeapon=DB.weapons.find(x=>x.id===window.__artiaId&&x.kind==='charge-blade');if(!window.__artiaWeapon)throw Error('MHDB_ARTIA_CB_MISSING');App.build.setWeapon(window.__artiaWeapon);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__artiaWeapon.id+'>'+window.__artiaWeapon.name+'</option>';weapon.value=String(window.__artiaWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();");
  const inherited=read("({restore:[...build.artia.restores],element:build.artia.element,production:build.artia.production})");
  w.calcBuild();
  const stale=read("calcState.realOneHit");
  w.eval("build.artia.restores=Array(5).fill('none');calcBuild()");
  const none=read("calcState.realOneHit");
  const emptyState=read("({restore:[...build.artia.restores],element:build.artia.element,production:build.artia.production})");
  w.eval("build.artia.restores=['atk:I','none','none','none','none'];calcBuild()");
  const attackI=read("calcState.realOneHit");
  const summary=x=>Object.fromEntries(['normal','maximum'].map(ch=>{const c=x?.channels?.[ch];return [ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??x?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null}]}));
  out.cases.push({id,name:read("window.__artiaWeapon.name"),rarity:read("window.__artiaWeapon.rarity"),inherited,stale:summary(stale),none:summary(none),attackI:summary(attackI),emptyState});
 }
 assert.equal(out.cases.length,3);
 assert.deepEqual(errors,[]);
 out.outcome='ARTIA_RESTORE_CANDIDATE_AUDITED';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();
}
