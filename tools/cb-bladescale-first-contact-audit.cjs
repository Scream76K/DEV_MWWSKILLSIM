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
  assert.equal(obj.channels.maximum.status,'blocked','maximum unapproved multi-hit must not silently complete '+id);
  assert.match(obj.channels.maximum.reason,/BLADESCALE_FIRST_HIT_SCOPE_PENDING/);
  for(const route of ['R','H']){
   const channel=r?.routes?.[route]?.channels?.normal;
   const components=channel?.components||[];
   const direct=components.filter(c=>/(physical|element|phial)/i.test(String(c.id||''))).map(c=>({id:c.id,kind:c.kind,value:c.value}));
   const physical=direct.filter(c=>String(c.id).includes(':physical:'));
   obj.routes[route]={total:channel?.metrics?.comboTotalDamage?.value,physicalHitCount:physical.length,firstPhysicalHit:physical[0]??null,physicalIds:physical.map(c=>c.id),componentCount:components.length};
   assert.ok(physical.length>1,route+' has more than one physical hit: cannot use the one-hit-only rule wholesale');
  }
  out.cases.push(obj);
 }
 assert.deepEqual(errors,[]);
 out.outcome='BLADESCALE_FIRST_CONTACT_AUDIT_PASS_NO_ADOPTION';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();}
