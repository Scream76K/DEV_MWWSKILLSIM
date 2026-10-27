const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const base of [50,1000]){
 const skills={'火属性攻撃強化':3,'連撃':5,'属性吸収':3,'災禍転福':3};
 const stats={...args.stats,element:base*1.2+60,elementType:'fire',elementKnown:true,typeKnown:true,elementComponents:{weaponBase:base,normalMultiplier:1.2,normalFlat:60},activeBonusEffects:[]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,skills,'great-sword',{});
 const result=adapter.evaluateCurrent({...args,weapon:{...args.weapon,specials:[{kind:'element',element:'fire',damage:{raw:base/10,display:base}}]},stats,skills:Object.entries(skills),equipmentSkillsResolved:true});
 assert.equal(result.channels.maximum.execution.status,'complete',JSON.stringify(result));
 const ec=stats.conditionalConditionPlan.maximumElementComponents;assert.ok(Math.abs(ec.normalMultiplier-1.56)<1e-9);assert.equal(ec.conditionalFlat,320);
 const expected=Math.min(base*1.56+380,Math.max(base+400,base*2.3));
 const cs=result.channels.maximum.components.filter(c=>c.coefficientUnit==='ELEMENT_MODIFIER');assert.ok(cs.length);for(const c of cs)assert.ok(Math.abs(c.details.appliedElement-expected)<1e-8);
 const ns=result.channels.normal.components.filter(c=>c.coefficientUnit==='ELEMENT_MODIFIER');for(const c of ns)assert.equal(c.details.appliedElement,base*1.2+60);
 rows.push({base,expected,uncapped:base*1.56+380,result});
}
const ammo=[];
for(const flat of [0,500]){const r=w.BowgunElementReference.firstHit({weaponKind:'heavy-bowgun',attack:100,affinity:100,criticalMultiplier:1.25,elementCriticalMultiplier:1.21,ammoLevel:1,range:'CRITICAL',physicalHitzone:50,elementalHitzone:30,elementMultiplier:1,elementFlat:flat},w.TechniqueDBEngine);assert.ok(Math.abs(r.element-Math.min(20+flat/10,46)*.3*1.21)<1e-9);ammo.push(r);}
console.log(JSON.stringify({rows,ammo,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
