const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const [skills,expected] of [[{'渾身':3,'力の解放':5,'挑戦者':5},95],[{'渾身':3,'力の解放':5,'挑戦者':5,'見切り':5},100]]){
 const affinity=w.MHWAffinitySkillResolver(skills),stats={...args.stats,affinity,activeBonusEffects:[]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,skills,'great-sword',{});
 const result=adapter.evaluateCurrent({...args,stats,skills:Object.entries(skills),equipmentSkillsResolved:true});
 for(const ch of ['normal','maximum'])assert.equal(result.channels[ch].execution.status,'complete');
 const effects=result.channels.maximum.effectPlan.effects;
 const adds=effects.filter(x=>x.stage==='affinity'&&x.target==='physical'&&x.operation==='add').reduce((n,x)=>n+x.amount,0);
 assert.equal(Math.min(100,adds),expected);
 assert.equal(stats.conditionalConditionPlan.maximum.attackTrue-stats.conditionalConditionPlan.normal.attackTrue,20);
 assert.equal(effects.filter(x=>x.id==='conditional-affinity-maximum').length,1);
 rows.push({skills,expected,plan:stats.conditionalConditionPlan,result});
}
const wexObserved=[.2,.8].map(hz=>({hz,maximum:w.MHWMaxAffinityResolver({'弱点特効':5},0,{kind:'great-sword'},{multipliers:{slash:hz},wounded:false,monsterName:'訓練場'})}));
assert.equal(wexObserved[0].maximum,50);assert.equal(wexObserved[1].maximum,50);
console.log(JSON.stringify({scope:'CONDITIONAL_AFFINITY_GROUP_CONTRACT_AND_WEX_STATIC_COUNTEREXAMPLE',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows,wexObserved},null,2));w.close();
