'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const {readSimulatorHtml}=require('./dom-test-setup.cjs');
const {data}=require('../tests/fixtures/offset-maximum-inputs.json');
const {profiles}=require('../tests/fixtures/selected-hp-inputs.json');
function setup(t){
 const errors=[],v=new VirtualConsole();v.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(readSimulatorHtml(),{url:'https://craft-parity.invalid/',runScripts:'dangerously',virtualConsole:v,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 t.after(()=>w.close());t.after(()=>assert.deepEqual(errors,[]));w.__pack=data;
 w.eval('DB=normalizeDB({...__pack,weapons:consolidateArtiaFixedVariantRows(__pack.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 return {w,d:w.document,read:s=>JSON.parse(w.eval('JSON.stringify('+s+')'))};
}
function input(id,kind,type,count=3,restore=false){
 const p=structuredClone(profiles.find(x=>x.kind===kind).input);
 return {...p,weaponId:String(id),weaponKind:kind,artia:{production:'attack',element:type,sameElementPartCount:count,parts:['attack','attack','attack'],baseStage:restore?'II':'I',restores:[restore?'atk:I':'none','none','none','none','none']},armor:{},charmCustom:{skills:[],slots:[0,0,0],weaponSlots:[]},decos:{},selectedHp:'FULL_HP',target:{monsterId:'training-room',partId:'training-front'},combo:{moves:[]}};
}
function evaluate({w,d,read},snap){
 w.applyBuildSnapshot(snap); const stats=read('calcState.stats'), s=read('realPipelineWeapon(selectedWeapon())');
 d.querySelector('#buildName').value='QA';d.querySelector('#saveBuild').click();
 d.querySelector('#compareBuilds [data-compare-name="QA"]').checked=true;d.querySelector('#runCompare').click();
 const row=read('createBuildComparisonReport()')?.results[0];
 assert.ok(row,d.querySelector('#compareOut').textContent);
 return {stats,s,row};
}
test('R8 Argenesis fixed three matching parts: sourced shell and display element feed the real saved comparison',t=>{
 const h=setup(t), original=h.read('DB.weapons.find(w=>w.id===380)');
 for(const [type,shown,shell,total] of [['fire',400,'normal',1385.04042],['thunder',400,'long',1370.77242],['blast',250,'wide',1035.49542]]){
  const {stats,s,row}=evaluate(h,input(380,'gunlance',type));
  assert.equal(stats.element,shown);assert.equal(s.shell,shell);assert.equal(s.artiaShellEvidence?.shellPower,'HIGH');
  if(shell==='long')assert.equal(s.shellLevel,null,'never fabricate an MHDB numeric shellLevel for long HIGH');
  for(const ch of ['normal','maximum']) assert.ok(Math.abs(row[ch==='normal'?'powerIndex':'maxPowerIndex']-total)<1e-6,JSON.stringify({type,p:row.oneHitPipeline?.reason,ch,value:row[ch==='normal'?'powerIndex':'maxPowerIndex'],channel:row.oneHitPipeline?.channels?.[ch]?.execution}));
 }
 assert.deepEqual(h.read('DB.weapons.find(w=>w.id===380)'),original);
});
test('R8 ordinary switch axe uses the crafted element or power phial, not uninfused dragon metadata',t=>{
 const h=setup(t),original=h.read('DB.weapons.find(w=>w.id===977)');
 for(const [type,shown,phial,total] of [['fire',280,'element',635.5716],['thunder',280,'element',635.5716],['blast',130,'power',644.40684]]){
  const {stats,s,row}=evaluate(h,input(977,'switch-axe',type));
  assert.equal(stats.element,shown);assert.equal(s.phial.kind,phial);assert.equal(s.artiaPhialEvidence?.sourceId,977);
  for(const ch of ['normal','maximum'])assert.ok(Math.abs(row[ch==='normal'?'powerIndex':'maxPowerIndex']-total)<1e-6,JSON.stringify({type,p:row.oneHitPipeline?.reason,ch,value:row[ch==='normal'?'powerIndex':'maxPowerIndex'],channel:row.oneHitPipeline?.channels?.[ch]?.execution}));
 }
 const stageTwo=evaluate(h,input(977,'switch-axe','fire',3,true));
 assert.ok(Math.abs(stageTwo.row.powerIndex-649.4712)<1e-6);
 assert.deepEqual(h.read('DB.weapons.find(w=>w.id===977)'),original);
});
test('owner-sourced completion refuses off-scope/forged records and does not claim live verification',t=>{
 const {w,read}=setup(t);
 const results=read(`(()=>{
 const gl=DB.weapons.find(w=>w.id===380),sa=DB.weapons.find(w=>w.id===977),a={element:'thunder',sameElementPartCount:3};
 const rules=TechniqueDBEngine.get('gunlance','GL_SHELL_NORMAL_MEDIUM').specialSourceValues.p0ReferenceRules;
 const ref=argenesisCraftedPremise(gl,a);
 return [
  ref.liveGameVerification, argenesisCraftedPremise(gl,{...a,sameElementPartCount:2}),argenesisCraftedPremise({...gl,name:'fake'},a),
  ordinaryArtiaSwitchAxePhial(sa,{...a,element:'unknown'}),ordinaryArtiaSwitchAxePhial({...sa,id:380},a),
  GunlanceShellReference.resolveWeaponPower({id:380,shell:'long',shellLevel:null,artiaShellEvidence:ref},rules),
  GunlanceShellReference.resolveWeaponPower({id:381,shell:'long',shellLevel:null,artiaShellEvidence:ref},rules),
  GunlanceShellReference.resolveWeaponPower({id:380,shell:'long',shellLevel:null,artiaShellEvidence:{...ref,elementType:'fire'}},rules),
 ];
 })()`);
 assert.deepEqual(results,['PENDING',null,null,null,null,'HIGH',null,null]);
});
