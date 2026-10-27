const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);


const map=Object.fromEntries(args.techniqueIds.map((id,i)=>[id,[i===0]]));
const conditions={...args.conditions,criticalDrawHits:{normal:map,maximum:map}};
const result=adapter.evaluateCurrent({...args,conditions,skills:[['抜刀術【力】',3]],equipmentSkillsResolved:true});
assert.equal(result.channels.normal.execution.status,'complete',JSON.stringify(result));
for(const ch of ['normal','maximum']){const e=result.channels[ch].effectPlan.effects.filter(x=>x.id.startsWith('punishing-draw-flat'));assert.equal(e.length,1);assert.equal(e[0].amount,7);assert.deepEqual(Array.from(e[0].componentIds),[args.techniqueIds[0]+':physical:0']);}
console.log(JSON.stringify({result},null,2));w.close();
