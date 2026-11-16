'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const data=require('../docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json').data;
test('Dark requires native Shadowbringer source, preserves valid multiplier and Peak boundary',()=>{
 const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://dark.test',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;}}).window;
 try{
 const st={attack:300,attackTrue:300,affinity:0,maxAffinity:0,element:0,attackComponents:{weaponBase:300,normalMultiplier:1,normalFlat:0}};
 const plan=(weapon,total={'暗黒':1},stats=st)=>w.MHWStandardPowerConditionPlan(stats,total,weapon?.kind||'great-sword',{selectedHp:'FULL_HP'},weapon);
 for(const id of [1133,1134]){const weapon=data.weapons.find(x=>x.id===id),p=plan(weapon);assert.equal(p.attackComponents.conditionalMultiplier,1.1);assert.ok(plan(weapon,{'暗黒':1,'フルチャージ':5}).excluded.some(x=>x.reason==='DARK_BELOW_FULL_NO_HEALING_MAXIMUM'));assert.ok(plan(weapon,{'暗黒':1},{...st,attackComponents:null}).pending.includes('暗黒:DARK_ATTACK_COMPONENTS_UNRESOLVED'));}
 for(const weapon of [null,data.weapons.find(x=>x.id===1148),{...data.weapons.find(x=>x.id===1133),skills:[]},{...data.weapons.find(x=>x.id===1133),name:'forged'}]){const p=plan(weapon);assert.equal(p.attackComponents.conditionalMultiplier,1);assert.ok(p.excluded.some(x=>x.reason==='DARK_SOURCE_WEAPON_NOT_APPLICABLE'));assert.ok(!p.pending.some(x=>x.startsWith('暗黒:')));const peak=plan(weapon,{'暗黒':1,'フルチャージ':5});assert.ok(!peak.excluded.some(x=>x.reason==='DARK_BELOW_FULL_NO_HEALING_MAXIMUM'));assert.ok(peak.applied.some(x=>x.skill==='フルチャージ'));}
 for(const kind of ['long-sword','sword-and-shield','dual-blades','hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade','insect-glaive','light-bowgun','heavy-bowgun','bow']){const p=plan({kind},{'暗黒':1,'フルチャージ':5});assert.ok(p.pending.includes('暗黒:DARK_WEAPON_UNRESOLVED'));assert.ok(p.pending.includes('暗黒:DARK_STANDARD_SEQUENCE_REQUIRED'));assert.ok(!p.excluded.some(x=>x.reason==='DARK_SOURCE_WEAPON_NOT_APPLICABLE'));}
 }finally{w.close();}
});
test('Dark public current and restored: Artia excluded, native preserved, Peak unchanged outside source',()=>{
 const f=require('./fixtures/dark168-source-inputs.json'),errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require('../tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://dark-public.test',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 try{w.__data={...data,...require('./fixtures/offset-maximum-inputs.json').data};w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const read=s=>JSON.parse(w.eval('JSON.stringify('+s+')'));
 const run=s=>{w.applyBuildSnapshot(structuredClone(s));w.document.getElementById('calcBuild').click();return read('currentConsumerCalculation()');};
 const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
 for(const [id,dark,peak,normal,maximum] of [[1133,0,0,1197.0222,1307.23692],[1134,0,0,1268.4804,1383.94344],[1148,1,0,1191.25908,1191.25908],[1148,1,3,1242.4302,1242.4302],[1133,0,3,1197.0222,1307.23692]]){
 const s=structuredClone(f.profiles.find(p=>p.kind==='great-sword').input);s.weaponId=String(id);if(id!==1148)s.artia=null;s.charmCustom.skills=[];if(dark)s.charmCustom.skills.push({name:'暗黒',level:dark});if(peak)s.charmCustom.skills.push({name:'フルチャージ',level:peak});const r=run(s);assert.ok(r.channels,JSON.stringify({id,r}));near(r.channels.normal.metrics.comboTotalDamage.value,normal);near(r.channels.maximum.metrics.comboTotalDamage.value,maximum);const saved=read('buildSnapshot()');assert.deepEqual(run(saved),r);
 }
 // A stale native plan must never grant Dark on another source weapon.
 let captured;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(x){captured=x;return adapter.evaluateCurrent(x)}};
 const sourceInput=(id,dark)=>{const s=structuredClone(f.profiles.find(p=>p.kind==='great-sword').input);s.weaponId=String(id);if(id!==1148)s.artia=null;s.charmCustom.skills=dark?[{name:'暗黒',level:1}]:[];run(s);return {...captured,stats:JSON.parse(JSON.stringify(captured.stats))};};
 const native=sourceInput(1133,false),artia=sourceInput(1148,true);
 const unrelated=JSON.parse(JSON.stringify(artia));unrelated.stats.conditionalConditionPlan.pending.push('UNRELATED_PENDING_TEST');const before=JSON.stringify(unrelated),pendingResult=adapter.evaluateCurrent({...artia,stats:unrelated.stats});assert.ok(JSON.stringify(pendingResult).includes('UNRELATED_PENDING_TEST'));assert.equal(JSON.stringify(unrelated),before);
 for(const bad of [{...artia,stats:{...artia.stats,conditionalConditionPlan:native.stats.conditionalConditionPlan}},...[{name:'forged'},{skills:[]}].map(change=>({...native,weapon:{...native.weapon,...change}}))]){const r=adapter.evaluateCurrent(bad);assert.equal(r.status,'UNAVAILABLE');assert.equal(r.reason,'DARK_SOURCE:CONDITION_PLAN_WEAPON_MISMATCH');}
 assert.deepEqual(errors,[]);
 }finally{w.close();}
});
