const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const rank of [1,2])for(const state of ['BEFORE','INFECTED','OVERCOME',null]){
 const name=rank===1?'黒蝕一体Ⅰ':'黒蝕一体Ⅱ',bonus={name,bonusName:'黒蝕竜の力',source:'series',required:rank===1?2:4,count:rank===1?2:4,rankLevel:rank,bonusSkillId:106};
 const skills={[name]:rank,'無我の境地':3};
 const stats={...args.stats,activeBonusEffects:[bonus]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,skills,'great-sword',{blackEclipseState:state});
 const result=adapter.evaluateCurrent({...args,stats,skills:Object.entries(skills),equipmentSkillsResolved:true});
 const normal=result.channels.normal,maximum=result.channels.maximum;
 assert.equal(maximum.metrics.comboTotalDamage.status,'available');
 assert.equal(maximum.metrics.comboTotalDamage.value,rank===1?399.22:465.74);
 if(state){assert.equal(normal.metrics.comboTotalDamage.value,rank===1?(state==='OVERCOME'?399.22:375.73):({BEFORE:375.73,INFECTED:417.48,OVERCOME:465.74})[state]);
 assert.equal(stats.conditionalConditionPlan.normal.attackComponents.normalFlat,args.stats.attackComponents.normalFlat+(rank===2?(state==='INFECTED'?10:state==='OVERCOME'?15:0):0));
 }else{assert.equal(normal.execution.status,'incomplete');assert.match(JSON.stringify(normal),/BLACK_ECLIPSE_NORMAL_STATE_REQUIRED/);}
 const phys=maximum.effectPlan.effects.filter(x=>x.stage==='affinity'&&x.target==='physical'&&x.operation==='add');assert.equal(phys.reduce((n,x)=>n+x.amount,0),25);
 rows.push({rank,state,plan:stats.conditionalConditionPlan,result});
}

const selected=rows.find(x=>x.rank===2&&x.state==='OVERCOME');
const black={name:'黒蝕一体Ⅱ',bonusName:'黒蝕竜の力',source:'series',required:4,count:4,rankLevel:2,bonusSkillId:106};
const scorch={name:'灼熱化Ⅰ',bonusName:'火竜の力',source:'series',required:2,count:2,rankLevel:1,bonusSkillId:71};
const coexistSkills={'黒蝕一体Ⅱ':2,'無我の境地':3,'灼熱化Ⅰ':1,'鎖刃刺撃':5};
const coexistStats={...args.stats,activeBonusEffects:[black,scorch]};
coexistStats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(coexistStats,coexistSkills,'great-sword',{blackEclipseState:'OVERCOME'});
const coexist=adapter.evaluateCurrent({...args,stats:coexistStats,skills:Object.entries(coexistSkills),equipmentSkillsResolved:true});
for(const ch of ['normal','maximum']){assert.equal(coexist.channels[ch].metrics.comboTotalDamage.value,465.74);assert.equal(coexist.channels[ch].diagnostics.excludedSkillDamage.length,2);}
const badStats={...args.stats,activeBonusEffects:[{...black,count:3}]};
const bad=w.MHWStandardPowerConditionPlan(badStats,{'黒蝕一体Ⅱ':2},'great-sword',{blackEclipseState:'BEFORE'});assert.equal(bad.blackEclipse,null);assert.ok(bad.groupPlan.unresolvedEffects.length);
// Isolated origin only: ordinary load restores saved state, comparison load preserves shared conditions.
w.document.getElementById('powerBlackEclipseState').value='INFECTED';
w.eval("document.getElementById('buildName').value='black-contract';saveNamedBuild()");
const saved=w.eval("savedBuildMap()['black-contract']");assert.equal(saved.combo.blackEclipseState,'INFECTED');
w.__saved=saved;
w.document.getElementById('powerBlackEclipseState').value='OVERCOME';
w.eval('applyBuildSnapshot(window.__saved)');
assert.equal(w.document.getElementById('powerBlackEclipseState').value,'INFECTED');
w.document.getElementById('powerBlackEclipseState').value='BEFORE';
w.eval('applyBuildSnapshot(window.__saved,{preserveCombo:true})');
assert.equal(w.document.getElementById('powerBlackEclipseState').value,'BEFORE');
console.log(JSON.stringify({scope:'SYNTHETIC_ACTIVATION_CONTRACT_NOT_REAL_BUILD',base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows,coexist,invalidRank:bad,saveLoad:'PASS'},null,2));w.close();
