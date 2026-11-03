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
 const all=w.eval("DB.weapons.filter(x=>x.kind==='charge-blade').map(x=>({id:x.id,name:x.name,phial:x.phial}))");
 const impact=all.filter(x=>x.phial==='impact'),power=all.filter(x=>x.phial==='element');
 assert.ok(impact.length>=5&&power.length>=5,'actual MHDB must contain both CB phial categories');
 const picked=[...impact.slice(0,40),...power.slice(0,20)];
 for(const entry of picked){
  w.__censusWeaponId=entry.id;
  w.eval("window.__censusWeapon=DB.weapons.find(x=>x.id===window.__censusWeaponId&&x.kind==='charge-blade');if(!window.__censusWeapon)throw Error('MHDB_CB_WEAPON_NOT_FOUND');App.build.setWeapon(window.__censusWeapon);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__censusWeapon.id+'>'+window.__censusWeapon.name+'</option>';weapon.value=String(window.__censusWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:window.__censusWeapon.phial==='element'?'POWER_ELEMENT':'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='ON';App.combo.syncFromDOM();calcBuild();");
  const r=read('calcState.realOneHit');
  const channels=Object.fromEntries(['normal','maximum'].map(ch=>{const c=r?.channels?.[ch];return [ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??r?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null}]}));
  const specials=read("window.__censusWeapon.specials.map(x=>({kind:x.kind,element:x.element??null,status:x.status??null,name:x.name??null,damage:x.damage?.display??null}))");
  w.eval("powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const off=read('calcState.realOneHit');
  const without152=Object.fromEntries(['normal','maximum'].map(ch=>{const c=off?.channels?.[ch];return [ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??off?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null}]}));
  out.cases.push({id:entry.id,name:entry.name,phial:entry.phial,channels,without152,specials});
 }
 out.counts={totalAvailableInDB:{impact:impact.length,power:power.length},tested:picked.length,byPhial:{},without152:{}};
 for(const type of ['impact','element']){
  const subset=out.cases.filter(c=>c.phial===type),details={total:subset.length,complete:0,blocked:0,reasons:{}};
  for(const c of subset){
   const statuses=['normal','maximum'].map(ch=>c.channels[ch].status);
   if(statuses.every(x=>x==='complete'))details.complete++;
   else {details.blocked++;const reason=Array.from(new Set(['normal','maximum'].map(ch=>c.channels[ch].reason))).join(' | ');const g=details.reasons[reason]??{count:0,examples:[]};g.count++;if(g.examples.length<3)g.examples.push({id:c.id,name:c.name});details.reasons[reason]=g;}
  }
  out.counts.byPhial[type]=details;
  out.counts.without152[type]={total:subset.length,complete:subset.filter(c=>['normal','maximum'].every(ch=>c.without152[ch].status==='complete')).length,blocked:subset.filter(c=>['normal','maximum'].some(ch=>c.without152[ch].status!=='complete')).length};
 }
 const statusCases=out.cases.filter(c=>c.phial==='impact'&&c.specials.length===1&&c.specials[0].kind==='status'&&['poison','paralysis','sleep'].includes(c.specials[0].status));
 assert.equal(statusCases.length,16,'MHDB snapshot status cohort drift');
 for(const c of statusCases){
  assert.equal(c.channels.normal.status,'complete','status physical calculation '+c.id+' '+c.channels.normal.reason);
  assert.equal(c.without152.maximum.status,'complete','status maximum 152 OFF '+c.id+' '+c.without152.maximum.reason);
  assert.ok(Number.isFinite(c.channels.normal.value),'finite status direct hit damage '+c.id);
  assert.ok(Number.isFinite(c.without152.maximum.value),'finite status maximum 152 OFF '+c.id);
 }
 assert.deepEqual(errors,[],'unexpected JSDOM error');
 out.outcome='CENSUS_COMPLETE_NO_PRODUCTION_CHANGE';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,counts:out.counts,cases:out.cases,failure:out.failure,errors},null,2));
 dom.window.close();
}
