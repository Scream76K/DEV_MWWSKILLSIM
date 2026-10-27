const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const [id,parent,prefix,adds] of [[25,'暗器蛸の力','蛮勇の食卓',[15,30]],[70,'闢獣の力','力自慢',[10,25]]])for(const rank of [1,2]){
const name=prefix+(rank===1?'Ⅰ':'Ⅱ'),bonus={name,bonusName:parent,source:'series',required:rank===1?2:4,count:rank===1?2:4,rankLevel:rank,bonusSkillId:id};
const stats={...args.stats,activeBonusEffects:[bonus]},skills={[name]:rank};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,skills,'great-sword',{});
const result=adapter.evaluateCurrent({...args,stats,skills:Object.entries(skills),equipmentSkillsResolved:true});
if(!process.env.CAPTURE_BEFORE){assert.equal(result.channels.normal.metrics.comboTotalDamage.value,375.73);assert.equal(result.channels.maximum.execution.status,'complete');assert.equal(stats.conditionalConditionPlan.maximum.attackTrue-stats.conditionalConditionPlan.normal.attackTrue,adds[rank-1]);assert.ok(result.channels.maximum.metrics.comboTotalDamage.value>375.73);}
rows.push({id,rank,plan:stats.conditionalConditionPlan,result});
const bad={...stats,activeBonusEffects:[{...bonus,count:rank===1?1:3}]};assert.ok(w.MHWStandardPowerConditionPlan(bad,skills,'great-sword',{}).groupPlan.unresolvedEffects.length);
}
console.log(JSON.stringify({scope:'MAXIMUM_PREACTIVATED_SERIES_FLAT_NORMAL_INACTIVE',head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows},null,2));w.close();
