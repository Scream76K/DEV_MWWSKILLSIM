'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
const profiles=require('./fixtures/selected-hp-inputs.json').profiles,data=require('./fixtures/offset-maximum-inputs.json').data,clone=x=>JSON.parse(JSON.stringify(x));
test('Dark is explicitly non-target only on verified fixed non-GS Artia sources',async t=>{
 const rows=[],errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://dark-artia.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 const adapter=w.MHWRealOneHitBrowserAdapter;let captured;
 w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(x){captured=x;return adapter.evaluateCurrent(x);}};
 const run=(input,label)=>{w.applyBuildSnapshot(clone(input));w.document.getElementById('calcBuild').click();const result=JSON.parse(w.eval('JSON.stringify(currentConsumerCalculation())'));rows.push({label,input,result});return result;};
 const channels=r=>r.channels;const fingerprint=r=>Object.fromEntries(['normal','maximum'].map(ch=>[ch,{metrics:channels(r)?.[ch]?.metrics,components:channels(r)?.[ch]?.components,execution:channels(r)?.[ch]?.execution,finalState:channels(r)?.[ch]?.finalState,...(r.routes?{routes:Object.fromEntries(Object.entries(r.routes).map(([k,v])=>[k,{components:v.channels[ch].components,metrics:v.channels[ch].metrics,execution:v.channels[ch].execution,finalState:v.channels[ch].finalState}]))}:{})}]));
 const reason='DARK_FIXED_ARTIA_SOURCE_NOT_APPLICABLE';
 try{
 w.__data=data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 for(const p of profiles.filter(p=>p.kind!=='great-sword'))await t.test(p.kind,()=>{
  const input=skills=>({...clone(p.input),charmCustom:{skills,slots:[0,0,0],weaponSlots:[]}});
  const off=run(input([]),p.kind+':off'),on=run(input([{name:'暗黒',level:1}]),p.kind+':on'),direct=captured;
  const peak=run(input([{name:'フルチャージ',level:3}]),p.kind+':peak'),both=run(input([{name:'暗黒',level:1},{name:'フルチャージ',level:3}]),p.kind+':dark-peak');
  for(const result of [off,on,peak,both])for(const ch of ['normal','maximum'])assert.equal(channels(result)?.[ch]?.metrics?.comboTotalDamage?.status,'available');
  assert.deepEqual(fingerprint(on),fingerprint(off),'Dark must not change real fixed source output');
  assert.deepEqual(fingerprint(both),fingerprint(peak),'Dark must not suppress valid Peak');
  assert.ok(JSON.stringify(on).includes(reason),'explicit non-target reason');
  assert.ok(!JSON.stringify(on).includes('DARK_WEAPON_UNRESOLVED'));
  assert.ok(!JSON.stringify(on).includes('DARK_STANDARD_SEQUENCE_REQUIRED'));
  const snap=JSON.parse(w.eval('JSON.stringify(buildSnapshot())'));assert.deepEqual(run(snap,p.kind+':restore'),both);
  assert.deepEqual(run(input([]),p.kind+':off-again'),off);
  for(const change of [{id:999999},{name:'forged'},{gameId:-1},{skills:[{skill:{id:168,name:'暗黒'},level:1}]},{artiaFixedVariants:null}]){
   const bad={...direct,weapon:{...direct.weapon,...change}};
   assert.ok(!JSON.stringify(adapter.evaluateCurrent(bad)).includes(reason),'unknown source must not be excluded');
  }
  assert.ok(!JSON.stringify(adapter.evaluateCurrent({...direct,conditions:{...direct.conditions,standardEvaluation:false}})).includes(reason),'explicit not broadened');
  const stale=clone(direct.stats);stale.conditionalConditionPlan.applied.push({skill:'暗黒',skillId:168,level:1,attackMultiplier:1.1});
  assert.ok(JSON.stringify(adapter.evaluateCurrent({...direct,stats:stale})).includes('DARK_SOURCE:CONDITION_PLAN_WEAPON_MISMATCH'),'stale Dark plan rejected including both CB subroutes');
  const unrelated=clone(direct.stats);unrelated.conditionalConditionPlan.pending.push('UNRELATED_DARK_NEGATIVE_PENDING');
  assert.ok(JSON.stringify(adapter.evaluateCurrent({...direct,stats:unrelated})).includes('UNRELATED_DARK_NEGATIVE_PENDING'));
 });
 assert.deepEqual(errors,[]);
 }finally{if(process.env.DARK_FIXED_RESULTS)fs.writeFileSync(process.env.DARK_FIXED_RESULTS,JSON.stringify({rows,errors},null,2));w.close();}
});
