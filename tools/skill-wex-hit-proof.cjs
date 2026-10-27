const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const [hz,wounded,original,expected] of [[.2,false,.2,0],[.45,false,.45,30],[.8,true,.45,50],[.8,true,.4,0]]){
 const skills={'弱点特効':5},stats={...args.stats,activeBonusEffects:[]};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,skills,'great-sword',{});
 const target={...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>({...p,multipliers:{...p.multipliers,slash:hz},originalMultipliers:{...p.multipliers,slash:original},wounded}))};
 const result=adapter.evaluateCurrent({...args,trainingRoom:target,stats,skills:Object.entries(skills),equipmentSkillsResolved:true});
 for(const ch of ['normal','maximum']){
  assert.equal(result.channels[ch].execution.status,'complete',JSON.stringify(result));
  const adds=result.channels[ch].effectPlan.effects.filter(e=>e.id.startsWith('weakness-hit:')&&e.target==='physical');assert.ok(adds.length);assert.ok(adds.every(e=>e.amount===expected));
 }
 assert.equal(result.channels.normal.metrics.comboTotalDamage.value,result.channels.maximum.metrics.comboTotalDamage.value);
 assert.equal(w.MHWMaxAffinityResolver(skills,0,null,null),50);
 rows.push({hz,wounded,original,expected,result});
}
assert.throws(()=>w.MHWWeaknessExploitForHit(5,{wounded:true,multipliers:{slash:.8}},'slash'),/ORIGINAL_HITZONE/);
assert.equal(w.MHWWeaknessExploitForHit(5,{multipliers:{slash:.2,blunt:.8}},'slash'),0);
assert.equal(w.MHWWeaknessExploitForHit(5,{multipliers:{slash:.2,blunt:.8}},'blunt'),30);
console.log(JSON.stringify({rows,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
