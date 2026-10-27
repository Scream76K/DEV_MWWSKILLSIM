const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const id of [34,161,170,180,167])for(const rank of [1,2]){
 const def=w.__getBetaDB().skills.find(x=>x.id===id),r=def.ranks.find(x=>x.level===rank),e={name:r.name,bonusName:def.name,source:'series',required:r.setPiecesRequired,count:r.setPiecesRequired,rankLevel:rank,bonusSkillId:id};
 const totals={[r.name]:rank},stats={...args.stats,activeBonusEffects:[e]};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,totals,'great-sword',{});
 const result=adapter.evaluateCurrent({...args,stats,skills:Object.entries(totals),equipmentSkillsResolved:true});
 if(!process.env.BASELINE){if(rank===1){for(const c of Object.values(result.channels))assert.equal(c.metrics.comboTotalDamage.value,375.73);}else assert.notEqual(result.channels.maximum.metrics.comboTotalDamage.status,'available');}
 rows.push({id,rank,plan:stats.conditionalConditionPlan,result});
}
console.log(JSON.stringify({rows,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
