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




 // Product-entry smoke for other 13 kinds: real MHDB weapons and the actual
 // exported HTML; no synthetic weapons or test-time formula/status bypass.
 const kinds=['great-sword','long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','insect-glaive','light-bowgun','heavy-bowgun','bow'];
 const status=x=>({status:x?.status??'missing',reason:x?.reason??null,channels:Object.fromEntries(['normal','maximum'].map(ch=>[ch,{
   status:x?.channels?.[ch]?.execution?.status??null,
   metricStatus:x?.channels?.[ch]?.metrics?.comboTotalDamage?.status??null,
   executionReason:x?.channels?.[ch]?.execution?.reason??null,
   metricReason:x?.channels?.[ch]?.metrics?.comboTotalDamage?.reason??null,
   value:x?.channels?.[ch]?.metrics?.comboTotalDamage?.value??null
 }]))});
 for(const kind of kinds){
  w.__otherKind=kind;
  w.eval("window.__otherWeapon=DB.weapons.find(x=>x.kind===(window.__otherKind==='sword-and-shield'?'sword-shield':window.__otherKind)&&x.specials?.every(y=>y.kind==='element')&&x.damage?.raw>0);if(!window.__otherWeapon)throw Error('REAL_MHDB_KIND_MISSING:'+window.__otherKind);App.build.setWeapon(window.__otherWeapon);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};build.decos={};weaponKind.value=window.__otherKind;weapon.innerHTML='<option value='+window.__otherWeapon.id+'>'+window.__otherWeapon.name+'</option>';weapon.value=String(window.__otherWeapon.id);renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();powerAttributeConversionNormal.value='OFF';powerAttributeConversionMaximum.value='OFF';monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';App.combo.syncFromDOM();calcBuild();");
  const first=read('calcState.realOneHit');
  w.eval('calcBuild()');
  const second=read('calcState.realOneHit');
  const firstS=status(first),secondS=status(second);
  out.cases.push({kind,id:read('window.__otherWeapon.id'),name:read('window.__otherWeapon.name'),result:firstS});
  assert.deepEqual(firstS,secondS,kind+' repeated public evaluation must be deterministic');
  assert.equal(typeof firstS.status,'string',kind+' must expose a status instead of crashing');
  for(const ch of ['normal','maximum']){
   const x=firstS.channels[ch];
   if(x.status===null){
    assert.notEqual(firstS.status,'OK',kind+' '+ch+' missing channel while public evaluation reported OK');
    assert.equal(x.metricStatus,null,kind+' '+ch+' absent channel must not return fake metric');
    continue;
   }
   assert.ok(['complete','incomplete','blocked'].includes(x.status),kind+' '+ch+' execution status explicit');
   if(x.metricStatus==='available'){
    assert.equal(x.status,'complete',kind+' '+ch+' available metric requires complete execution');
    assert.ok(Number.isFinite(x.value)&&x.value>=0,kind+' '+ch+' metric must be finite');
   }else{
    assert.equal(x.metricStatus,'unavailable',kind+' '+ch+' unavailable metric must not masquerade as result');
    assert.equal(x.value,null,kind+' '+ch+' no fabricated partial damage');
    assert.ok(x.metricReason||x.executionReason||firstS.reason,kind+' '+ch+' unavailable metric needs a reason');
   }
  }
  assert.ok(!JSON.stringify(firstS).includes('CB_H_PREFIX_CONTRACT_INVALID'),kind+' must not enter CB H prefix validator');
  assert.ok(!JSON.stringify(firstS).includes('CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH'),kind+' must not enter CB owner-only shield contract');
 }
 assert.equal(out.cases.length,13);
 assert.deepEqual(errors,[],'no JSDOM unhandled source exceptions');
 out.outcome='NON_CB_13_REAL_MHDB_PRODUCT_ENTRY_DETERMINISM_AUDIT';
}catch(e){out.failure=e.stack;process.exitCode=1;}finally{
 console.log(JSON.stringify({outcome:out.outcome,cases:out.cases,failure:out.failure,errors},null,2));dom.window.close();
}
