const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const skills={'抜刀術【技】':1,'濡れ刃紋':3};
const map=Object.fromEntries(args.techniqueIds.map((id,i)=>[id,[i===0]]));
const conditions={...args.conditions,wetState:{normal:{wet:false,bubble:false},maximum:{wet:true,bubble:false}},criticalDrawHits:{normal:map,maximum:map}};
const stats={...args.stats};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,skills,'great-sword',conditions);
const result=adapter.evaluateCurrent({...args,conditions,stats,skills:Object.entries(skills),equipmentSkillsResolved:true});
for(const channel of ['normal','maximum']){const c=result.channels[channel];assert.equal(c.execution.status,'complete');const draws=c.effectPlan.effects.filter(x=>x.id.startsWith('critical-draw:'));assert.equal(draws.length,2);assert.ok(draws.every(x=>x.amount===50&&x.componentIds[0].startsWith(args.techniqueIds[0])));const wet=c.effectPlan.effects.find(x=>x.id==='wet-bubble');assert.equal(wet.amount,channel==='normal'?0:9);}
const unknown=adapter.evaluateCurrent({...args,conditions:{...conditions,criticalDrawHits:{normal:null,maximum:map}},stats,skills:Object.entries(skills),equipmentSkillsResolved:true});assert.equal(unknown.channels.normal.execution.status,'incomplete');assert.equal(unknown.channels.maximum.execution.status,'complete');assert.ok(JSON.stringify(unknown.channels.normal).includes('CRITICAL_DRAW_HIT_STATE_REQUIRED'));
w.document.getElementById('powerDrawHitsNormal').value=JSON.stringify(map);const saved=w.buildSnapshot();w.document.getElementById('powerDrawHitsNormal').value='{}';w.applyBuildSnapshot(saved);assert.deepEqual(JSON.parse(w.document.getElementById('powerDrawHitsNormal').value),map);
console.log(JSON.stringify({ids:args.techniqueIds,result,unknown,restoredMap:map},null,2));w.close();
