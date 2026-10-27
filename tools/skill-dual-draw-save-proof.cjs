'use strict';
// Separate Critical/Punishing Draw hit sets and ordinary/shared-condition restore.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon={id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:0,slots:[],skills:[],specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}],coatings:['close-range']};
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['bow']=[DB.weapons[0]];weaponKind.value='bow';weapon.innerHTML='<option value="999001">Hope</option>';weapon.value='999001';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'BOW_SHOT_3'}];DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.4,blunt:.8,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);args={...args,trainingRoom:{...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>p.id==='training-front'?{...p,multipliers:{...p.multipliers,slash:.4,blunt:.8,fire:.2}}:p)}};

w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
const ids=['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3'];
const off=Object.fromEntries(ids.map(id=>[id,w.TechniqueDBEngine.hits('bow',id).map(()=>false)]));
const on=JSON.parse(JSON.stringify(off));on[ids[0]][0]=true;on[ids[2]][1]=true;
function run(flags,power){const skills={'抜刀術【技】':1,'会心撃【属性】':3,'抜刀術【力】':3};const conditions={...args.conditions,criticalDrawHits:{normal:flags,maximum:flags},punishingDrawHits:{normal:power,maximum:power}};return adapter.evaluateCurrent({...args,conditions,skills:Object.entries(skills),equipmentSkillsResolved:true,bowState:{chargeLevel:3,range:'CRITICAL',coating:'NONE',startShot:3},techniqueIds:ids,stats:{...args.stats,conditionalConditionPlan:w.MHWStandardPowerConditionPlan(args.stats,skills,'bow',conditions)}});}

const power=JSON.parse(JSON.stringify(off));power[ids[0]][1]=true;
const baseline=run(off,off),active=run(on,power);
for(const ch of ['normal','maximum']){assert.equal(active.channels[ch].execution.status,'complete',JSON.stringify(active));const a=active.channels[ch].components.flatMap(c=>c.details.trace),b=baseline.channels[ch].components.flatMap(c=>c.details.trace);for(let i=0;i<a.length;i++){assert.equal(a[i].hitAttackAdd,i===1?7:0);assert.equal(a[i].drawAffinityAdd,i===0||i===9?50:0);assert.equal(a[i].element>b[i].element,i===0||i===9);}assert.ok(a[1].physical>b[1].physical);}
for(const suffix of ['Normal','Maximum']){w.document.getElementById('powerDrawHits'+suffix).value=JSON.stringify(on);w.document.getElementById('powerPunishingHits'+suffix).value=JSON.stringify(power);}
const saved=w.buildSnapshot();w.document.getElementById('powerPunishingHitsNormal').value=JSON.stringify(off);w.applyBuildSnapshot(saved,{preserveCombo:true});assert.deepEqual(JSON.parse(w.document.getElementById('powerPunishingHitsNormal').value),JSON.parse(JSON.stringify(off)));w.applyBuildSnapshot(saved);assert.deepEqual(JSON.parse(w.document.getElementById('powerPunishingHitsNormal').value),power);assert.deepEqual(JSON.parse(w.document.getElementById('powerDrawHitsNormal').value),on);const snapshot=w.compareStep5Snapshot();assert.deepEqual(JSON.parse(JSON.stringify(snapshot.punishingDrawHits.normal)),power);
const missing=run(on,null);assert.equal(missing.channels.normal.execution.status,'incomplete');
console.log(JSON.stringify({baseline,active,missing,restored:snapshot.punishingDrawHits},null,2));w.close();
