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

 const ids=[1071,1072,1073,1074];
 out.contracts=read("({bladescale:window.MHBladescaleFirstHitRule||null,componentScope:window.MHConversionComponentScope||null,thunderConversion:window.MHThunderResistanceConversionRule||null,conversionMixed:window.MHAttributeConversionMixedScope||null})");
 for(const id of ids){
  w.__auditCBId=id;
  w.eval("window.__auditCB=DB.weapons.find(x=>x.id===window.__auditCBId&&x.kind==='charge-blade');if(!window.__auditCB)throw Error('MHDB_CB_AUDIT_WEAPON_MISSING');App.build.setWeapon(window.__auditCB);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__auditCB.id+'>'+window.__auditCB.name+'</option>';weapon.value=String(window.__auditCB.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const actual=read("({real:calcState.realOneHit,stats:calcState.stats,weapon:selectedWeapon()})");
  const summary=r=>Object.fromEntries(['normal','maximum'].map(ch=>{const c=r?.channels?.[ch];return[ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??r?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null}]}));
  const entry={id,name:actual.weapon.name,skills:actual.weapon.skills.map(x=>({id:x.skill?.id,name:x.skill?.name,level:x.level})),specials:actual.weapon.specials,element:actual.stats.element,elementType:actual.stats.elementType,thunderResistanceInput:actual.stats.thunderResistanceInput,real:summary(actual.real),reason:actual.real?.reason,scope:actual.real?.scope,conditional:actual.stats.conditionalConditionPlan?.pending};
  if([1073,1074].includes(id)){
   w.eval("build.armor={head:null,chest:null,arms:null,waist:null,legs:null};calcBuild()");
   const noArmor=read("({real:calcState.realOneHit,thunderResistanceInput:calcState.stats.thunderResistanceInput})");
   entry.noArmor={thunderResistanceInput:noArmor.thunderResistanceInput,real:summary(noArmor.real)};
   assert.equal(entry.noArmor.thunderResistanceInput?.status,'KNOWN_LIMITED',id+' legal no-armor resistance must resolve');
   assert.equal(entry.noArmor.thunderResistanceInput?.total,0,id+' zero thunder armor');
   for(const ch of ['normal','maximum']){
    assert.equal(entry.noArmor.real[ch].status,'complete',id+' narrow candidate must complete only with resolved inputs');
    assert.equal(entry.noArmor.real[ch].reason,null,id+' '+ch+' no scope or resistance reason');
    assert.ok(Number.isFinite(entry.noArmor.real[ch].value),id+' '+ch+' finite total');
   }
  }
  out.cases.push(entry);
 }
 assert.deepEqual(errors,[]);
 out.outcome='AUDITED_NO_SCOPE_BYPASS';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{console.log(JSON.stringify({outcome:out.outcome,contracts:out.contracts,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();}
