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


 const rule=read("window.MHBladescaleFirstHitRule");
 assert.ok(rule&&rule.status==='OWNER_APPROVED_PROVISIONAL');
 assert.equal(rule.techniques['charge-blade'],undefined,'CB must not be silently added to adopted one-hit contract');
 for(const id of [1071,1072]){
  w.__bladescaleCBId=id;
  w.eval("window.__bladescaleCB=DB.weapons.find(x=>x.id===window.__bladescaleCBId&&x.kind==='charge-blade');if(!window.__bladescaleCB)throw Error('CB_BLADE_WEAPON_MISSING');App.build.setWeapon(window.__bladescaleCB);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__bladescaleCB.id+'>'+window.__bladescaleCB.name+'</option>';weapon.value=String(window.__bladescaleCB.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const r=read('calcState.realOneHit');
  const obj={id,name:read("window.__bladescaleCB.name"),ruleApproval:rule.approval,channels:{},routes:{}};
  for(const channel of ['normal','maximum']){
   const c=r?.channels?.[channel];obj.channels[channel]={status:c?.execution?.status,reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason,total:c?.metrics?.comboTotalDamage?.value??null};
  }
  assert.equal(obj.channels.normal.status,'complete','normal baseline available '+id);
  assert.equal(obj.channels.maximum.status,'complete','candidate maximum must complete on exact R/H '+id+' '+obj.channels.maximum.reason);
  assert.equal(obj.channels.maximum.reason,null);
  assert.ok(Number.isFinite(obj.channels.maximum.total));
  assert.equal(r.channels?.maximum?.diagnostics?.bladescaleFirstHit?.candidateScope,'CB_RH_FIRST_PHYSICAL_CONTACT_ONLY_OWNER_REVIEW_PENDING');
  const protectedFirst={R:'CB_ELEMENT_DISCHARGE_1:physical:0',H:'CB_AXE_TO_SWORD_MORPH:physical:0'};
  obj.maximumRouteComponents={};
  for(const route of ['R','H'])obj.maximumRouteComponents[route]=(r?.routes?.[route]?.channels?.maximum?.components||[]).filter(c=>c.status==='available').map(c=>({id:c.id,value:c.value}));
  for(const route of ['R','H']){
   const channel=r?.routes?.[route]?.channels?.normal;
   const components=channel?.components||[];
   const direct=components.filter(c=>/(physical|element|phial)/i.test(String(c.id||''))).map(c=>({id:c.id,kind:c.kind,value:c.value}));
   const physical=direct.filter(c=>String(c.id).includes(':physical:'));
   obj.routes[route]={total:channel?.metrics?.comboTotalDamage?.value,physicalHitCount:physical.length,firstPhysicalHit:physical[0]??null,physicalIds:physical.map(c=>c.id),componentCount:components.length};
   assert.ok(physical.length>1,route+' has more than one physical hit: cannot use the one-hit-only rule wholesale');
  }
  // Counterfactual test-only input removes solely the innate bladescale skill from
  // the real weapon; this is NOT an additional MHDB weapon or adopted build.
  const counterfactual={...w.__bladescaleCB,skills:w.__bladescaleCB.skills.filter(x=>x.skill?.id!==163)};
  assert.equal(counterfactual.skills.length,w.__bladescaleCB.skills.length-1,'one innate skill removed in control');
  w.__cbBladescaleCounterfactual=counterfactual;
  w.eval("DB.weapons=DB.weapons.map(x=>x.id===window.__cbBladescaleCounterfactual.id?window.__cbBladescaleCounterfactual:x);rebuildWeaponIndex(DB.weapons);App.build.setWeapon(window.__cbBladescaleCounterfactual);calcBuild();");
  const control=read('calcState.realOneHit');
  obj.control={};
  for(const ch of ['normal','maximum'])assert.equal(control?.channels?.[ch]?.execution?.status,'complete','counterfactual '+id+' '+ch);
  for(const route of ['R','H']){
   const actual=r?.routes?.[route]?.channels?.maximum?.components||[];
   const reference=control?.routes?.[route]?.channels?.maximum?.components||[];
   assert.equal(actual.length,reference.length,route+' component cardinality');
   const refMap=new Map(reference.map(c=>[c.id,c]));
   const protectedId=protectedFirst[route];
   let firstFound=0,otherDifferences=[];
   for(const c of actual){
    const baseline=refMap.get(c.id);
    assert.ok(baseline,'component id present in control '+c.id);
    if(c.id===protectedId){
     assert.equal(c.status,'available',protectedId+' candidate available');
     assert.equal(baseline.status,'available',protectedId+' control available');
     assert.ok(c.value>baseline.value,protectedId+' only first hit gets improved sharpness');
     firstFound++;obj.control[route]={id:c.id,withBlade:c.value,withoutBlade:baseline.value};
    }else if(c.status==='available'&&baseline.status==='available'&&Math.abs(c.value-baseline.value)>1e-9){
     otherDifferences.push({id:c.id,actual:c.value,control:baseline.value});
    }else{
     assert.equal(c.status,baseline.status,c.id+' disposition unchanged');
    }
   }
   assert.equal(firstFound,1,route+' exactly one first contact');
   assert.deepEqual(otherDifferences,[],route+' all other physical/element/phial components unchanged');
  }
  // Restore MHDB source record, not the counterfactual, before the next weapon.
  w.eval("DB.weapons=DB.weapons.map(x=>x.id===window.__bladescaleCB.id?window.__bladescaleCB:x);rebuildWeaponIndex(DB.weapons);App.build.setWeapon(window.__bladescaleCB);");
  out.cases.push(obj);
 }
 assert.deepEqual(errors,[]);
 out.outcome='BLADESCALE_CB_FIRST_CONTACT_CANDIDATE_PASS_NOT_OWNER_APPROVED';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();}
