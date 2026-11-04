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

 const all=w.eval("DB.weapons.filter(x=>x.kind==='charge-blade'&&x.phial==='element').map(x=>({id:x.id,name:x.name,phial:x.phial}))");
 assert.equal(all.length,20,'actual MHDB power-element CB count drift');
 for(const entry of all){
  w.__powerId=entry.id;
  w.eval("window.__powerWeapon=DB.weapons.find(x=>x.id===window.__powerId&&x.kind==='charge-blade');if(!window.__powerWeapon)throw Error('MHDB_POWER_WEAPON_MISSING');App.build.setWeapon(window.__powerWeapon);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__powerWeapon.id+'>'+window.__powerWeapon.name+'</option>';weapon.value=String(window.__powerWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'POWER_ELEMENT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';if([145,146,147].includes(window.__powerWeapon.id))build.artia.restores=Array(5).fill('none');if([153,154].includes(window.__powerWeapon.id)){powerWetNormal.value='DRY';powerWetMaximum.value='DRY';}monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
  const result=read('calcState.realOneHit');
  const summary=Object.fromEntries(['normal','maximum'].map(ch=>{
   const c=result?.channels?.[ch];
   return[ch,{status:c?.execution?.status??'missing',reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason??result?.reason??null,value:c?.metrics?.comboTotalDamage?.value??null,
   hstatus:result?.routes?.H?.channels?.[ch]?.execution?.status??null,
   hreason:result?.routes?.H?.channels?.[ch]?.execution?.reason??null}];
  }));
  if(['normal','maximum'].every(ch=>summary[ch].status==='complete')){
   for(const ch of ['normal','maximum']){
    const a=result.routes.R.channels[ch].metrics.comboTotalDamage.value,b=result.routes.H.channels[ch].metrics.comboTotalDamage.value;
    assert.ok(Number.isFinite(a)&&Number.isFinite(b),'real R/H '+entry.id+' '+ch);
    assert.ok(Math.abs(summary[ch].value-a-b)<1e-7,'R+H raw independent '+entry.id+' '+ch);
   }
  }
  out.cases.push({...entry,channels:summary});
 }
 const success=out.cases.filter(c=>['normal','maximum'].every(ch=>c.channels[ch].status==='complete'));
 const blocked=out.cases.filter(c=>!success.includes(c));
 out.counts={total:all.length,complete:success.length,blocked:blocked.length,byReason:{}};
 for(const c of blocked){const key=['normal','maximum'].map(ch=>c.channels[ch].reason).join(' | ');out.counts.byReason[key]=(out.counts.byReason[key]||0)+1;}
 assert.equal(success.length,20,'20-source-weapon candidate complete count drift');
 assert.equal(blocked.length,0,'all MHDB power CB H candidates must complete under chosen exact conditions');
 for(const id of [118,119,120,121]){
  const row=out.cases.find(c=>c.id===id);
  assert.ok(row,'actual measured-airborne source weapon '+id);
  for(const ch of ['normal','maximum'])assert.equal(row.channels[ch].status,'complete','candidate H ground nonapp '+id+' '+ch);
 }
 assert.ok(success.some(x=>x.id===103)&&success.some(x=>x.id===104),'real weapon103/104 strong H available');
 assert.deepEqual(errors,[]);
 out.outcome='POWER_H_PRODUCTION_CANDIDATE_CENSUS_NOT_ADOPTED';
}catch(e){out.failure=e.stack;process.exitCode=1;}
finally{
 console.log(JSON.stringify({outcome:out.outcome,counts:out.counts,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();
}
