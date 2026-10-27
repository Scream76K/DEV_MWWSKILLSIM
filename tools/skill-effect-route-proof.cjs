const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const known={name:'根性【果敢】',bonusName:'ヌシの魂',source:'group',required:3,count:3,rankLevel:1,bonusSkillId:131};
const unknown={name:'黒蝕一体Ⅱ',bonusName:'黒蝕竜の力',source:'series',required:4,count:4,rankLevel:2,bonusSkillId:106};
const st={attackTrue:100,attackComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0},element:0,elementType:null,elementKnown:true,typeKnown:true,affinity:0,maxAffinity:0,activeBonusEffects:[known,unknown]};w.__st=st;
const out={base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),indexHash:crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex')};
try{out.plan=JSON.parse(w.eval('JSON.stringify(standardPowerConditionPlan(window.__st,{},"great-sword",{gutsState:"BEFORE"}))'));assert.equal(out.plan.normal.attackTrue,105);assert.ok(out.plan.pending.some(x=>x.includes('黒蝕一体Ⅱ')));assert.ok(out.plan.normal.activeBonusEffects.some(x=>x.name==='黒蝕一体Ⅱ'));assert.ok(!out.plan.normal.activeBonusEffects.some(x=>x.name==='根性【果敢】'));assert.deepEqual(st.activeBonusEffects,[known,unknown]);out.pass=true;}catch(e){out.pass=false;out.error=e.stack;}
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
const cases=[];
for(const unknownBonus of [false,true]){
 const stats={...args.stats,activeBonusEffects:unknownBonus?[known,unknown]:[known]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,{},'great-sword',{gutsState:'BEFORE'});
 const result=adapter.evaluateCurrent({...args,stats,skills:unknownBonus?[['根性【果敢】',1],['黒蝕一体Ⅱ',1]]:[['根性【果敢】',1]],equipmentSkillsResolved:true});
 cases.push({unknownBonus,result});
}
const stats={...args.stats,activeBonusEffects:[known]};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,{},'great-sword',{gutsState:'BEFORE'});
stats.conditionalConditionPlan.pending.push('TEST_MAXIMUM_CONDITION_UNKNOWN');stats.conditionalConditionPlan.status='PARTIAL';
const isolated=adapter.evaluateCurrent({...args,stats,skills:[['根性【果敢】',1]],equipmentSkillsResolved:true});
out.maximumOnly=isolated;
assert.equal(cases[0].result.channels.normal.metrics.comboTotalDamage.status,'available');
for(const ch of ['normal','maximum']){const r=cases[1].result.channels[ch];assert.equal(r.metrics.comboTotalDamage.status,'unavailable');assert.equal(r.execution.executed.length,0);assert.ok(r.effectPlan.effects.some(x=>x.id==='set-group-attack-multiply'&&x.amount===1.05));assert.ok(r.effectPlan.unresolved.some(x=>x.reason.includes('黒蝕一体Ⅱ')));assert.equal(r.components.length,0);}
assert.equal(isolated.channels.normal.metrics.comboTotalDamage.value,cases[0].result.channels.normal.metrics.comboTotalDamage.value);
assert.equal(isolated.channels.maximum.metrics.comboTotalDamage.status,'unavailable');assert.equal(isolated.channels.maximum.execution.executed.length,0);
assert.deepEqual(st.activeBonusEffects,[known,unknown]);
out.hashes=Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/engine.cjs','v10-six-layer-foundation/min8/pipeline.cjs','v10-six-layer-foundation/min8/real-one-hit-pipeline.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
out.routes=cases;
console.log(JSON.stringify(out,null,2));w.close();process.exitCode=out.pass?0:1;
