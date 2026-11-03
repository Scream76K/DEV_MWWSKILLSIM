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

 const ids=[153,154],result=[];
 const controls=Array.from(w.document.querySelectorAll('input,select,button')).filter(x=>/wet|bubble|濡れ|泡/i.test(x.id+' '+x.name+' '+x.textContent)).map(x=>({tag:x.tagName,id:x.id,name:x.name,value:x.value,checked:x.checked,options:x.tagName==='SELECT'?Array.from(x.options).map(z=>({value:z.value,label:z.textContent})):undefined}));
 for(const id of ids){
   w.__probeCBId=id;
   w.eval("window.__probeCB=DB.weapons.find(x=>x.id===window.__probeCBId&&x.kind==='charge-blade');if(!window.__probeCB)throw Error('MISSING_WEAPON');App.build.setWeapon(window.__probeCB);weaponKind.value='charge-blade';weapon.innerHTML='<option value='+window.__probeCB.id+'>'+window.__probeCB.name+'</option>';weapon.value=String(window.__probeCB.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();comboPreset.value='adopted:cb_release_r';comboPreset.dispatchEvent(new Event('change'));restoreComboCBState({mode:'AXE',shieldBoosted:true,axeBoosted:true,swordBoosted:false,phialType:'IMPACT',enhancedPhial:false,previousAction:'CHARGE',normalPhials:2,enhancedPhials:0,mixMode:'R_H_INDEPENDENT',mixH:{mode:'AXE',previousAction:'AXE_NEUTRAL',normalPhials:2,enhancedPhials:0}});comboCBMode.value='AXE';comboCBMix.value='R_H_INDEPENDENT';comboCBHMode.value='AXE';comboCBHPreviousAction.value='AXE_NEUTRAL';comboCBHNormalPhials.value='2';comboCBHEnhancedPhials.value='0';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';powerBlackEclipseState.value='OVERCOME';powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';App.combo.syncFromDOM();calcBuild();");
   w.eval("powerWetNormal.value='';powerWetMaximum.value='';App.combo.syncFromDOM();calcBuild();");
   const obj=read("({real:calcState.realOneHit,stats:calcState.stats})");
   const baseline=read('calcState.realOneHit');
   w.eval("powerWetNormal.value='DRY';powerWetMaximum.value='DRY';App.combo.syncFromDOM();calcBuild()");
   const dry=read('calcState.realOneHit');
   w.eval("powerWetNormal.value='WET';powerWetMaximum.value='BOTH';App.combo.syncFromDOM();calcBuild()");
   const active=read('calcState.realOneHit');
   const summary=x=>Object.fromEntries(['normal','maximum'].map(ch=>{const c=x?.channels?.[ch];return[ch,{status:c?.execution?.status,reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason,value:c?.metrics?.comboTotalDamage?.value}]}));
   assert.equal(summary(baseline).normal.status,'blocked','blank normal must stay blocked '+id);
   for(const [label,x] of [['dry',dry],['active',active]]){
    for(const ch of ['normal','maximum']){
     assert.equal(summary(x)[ch].status,'complete',id+' '+label+' '+ch+' '+summary(x)[ch].reason);
     assert.ok(Number.isFinite(summary(x)[ch].value),id+' '+label+' '+ch+' not numeric');
     assert.equal(x?.channels?.[ch]?.metrics?.comboTotalDamage?.value,x.routes.R.channels[ch].metrics.comboTotalDamage.value+x.routes.H.channels[ch].metrics.comboTotalDamage.value);
    }
   }
   result.push({id,name:w.__probeCB?.name,blank:summary(baseline),dry:summary(dry),active:summary(active),skills:w.__probeCB?.skills?.map(x=>({id:x.skill?.id,name:x.skill?.name,level:x.level})),channels:Object.fromEntries(['normal','maximum'].map(ch=>{const c=obj.real?.channels?.[ch];return [ch,{status:c?.execution?.status,reason:c?.execution?.reason??c?.metrics?.comboTotalDamage?.reason,value:c?.metrics?.comboTotalDamage?.value}]})),conditions:read("({wetNormal:typeof powerWetNormal!=='undefined'?powerWetNormal.value:null,wetMaximum:typeof powerWetMaximum!=='undefined'?powerWetMaximum.value:null})")});
 }
 assert.deepEqual(errors,[]);
 out.outcome='DIAGNOSTIC_ONLY';
 out.controls=controls;out.cases=result;
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{console.log(JSON.stringify({outcome:out.outcome,controls:out.controls,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();}
