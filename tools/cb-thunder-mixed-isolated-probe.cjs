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


 const ids=[1073,1074];
 for(const id of ids){
  w.__candidateCBId=id;
  w.eval("window.__candidateCB=DB.weapons.find(x=>x.id===window.__candidateCBId&&x.kind==='charge-blade');if(!window.__candidateCB)throw Error('CB_WEAPON_MISSING');App.build.setWeapon(window.__candidateCB);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__candidateCB.id+'>'+window.__candidateCB.name+'</option>';weapon.value=String(window.__candidateCB.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();");
  const options=[null,418];
  for(const armorId of options){
   w.__thunderArmorId=armorId;
   w.eval("window.__thunderArmor=window.__thunderArmorId==null?null:DB.armor.find(x=>x.id===window.__thunderArmorId&&x.kind==='head');if(window.__thunderArmorId!=null&&!window.__thunderArmor)throw Error('REAL_ARMOR_418_MISSING');build.armor={head:window.__thunderArmor,chest:null,arms:null,waist:null,legs:null};calcBuild();");
   const d=read("({real:calcState.realOneHit,stats:calcState.stats})");
   const row={id,name:read("window.__candidateCB.name"),headArmor:armorId,resistance:d.stats.thunderResistanceInput,channels:{}};
   for(const ch of ['normal','maximum']){
    const c=d.real?.channels?.[ch],components=['R','H'].flatMap(route=>d.real?.routes?.[route]?.channels?.[ch]?.components||[]);
    row.channels[ch]={status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??d.real?.reason??null,total:c?.metrics?.comboTotalDamage?.value??null,physical:components.filter(x=>String(x.id||'').includes(':physical:')).map(x=>({id:x.id,value:x.value})),element:components.filter(x=>String(x.id||'').includes(':element:')).map(x=>({id:x.id,value:x.value})),phial:components.filter(x=>String(x.id||'').includes(':phial:')).map(x=>({id:x.id,value:x.value}))};
   }
   out.cases.push(row);
  }
 }
 for(const id of ids){
  const baseline=out.cases.find(c=>c.id===id&&c.headArmor===null);
  const boosted=out.cases.find(c=>c.id===id&&c.headArmor===418);
  assert.ok(baseline&&boosted,id+' two actual-equipment conditions');
  assert.equal(baseline.resistance?.total,0,id+' no armor thunder resistance');
  assert.equal(boosted.resistance?.total,1,id+' real MHDB418 thunder resistance');
  for(const ch of ['normal','maximum']){
   const a=baseline.channels[ch],b=boosted.channels[ch];
   assert.equal(a.status,'complete',id+' '+ch+' baseline');
   assert.equal(b.status,'complete',id+' '+ch+' boosted');
   assert.deepEqual(a.physical,b.physical,id+' '+ch+' physical damage unchanged');
   assert.deepEqual(a.phial,b.phial,id+' '+ch+' impact phial damage unchanged');
   assert.equal(a.element.length,b.element.length,id+' '+ch+' elemental hit cardinality');
   assert.ok(a.element.length>0,id+' '+ch+' at least one element hit');
   const deltas=a.element.map((x,i)=>{
    assert.equal(x.id,b.element[i].id,id+' '+ch+' same elemental hit');
    assert.ok(b.element[i].value>=x.value,id+' '+ch+' no negative conversion delta');
    return b.element[i].value-x.value;
   });
   assert.ok(deltas.some(x=>x>0),id+' '+ch+' conversion must change elemental hits');
   const componentDelta=deltas.reduce((a,b)=>a+b,0);
   assert.ok(Math.abs((b.total-a.total)-componentDelta)<1e-7,id+' '+ch+' all new damage must come from elemental component');
  }
 }
 assert.deepEqual(errors,[]);
 out.outcome='CANDIDATE_THUNDER_SCOPE_TESTED_NOT_MERGED';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,sourceScopeBypassInMemoryOnly:false,cases:out.cases,failure:out.failure,errors},null,2));
 dom.window.close();
}
