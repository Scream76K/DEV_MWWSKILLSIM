const fs=require('fs'),assert=require('assert/strict');
const root=process.cwd(),r=require(root+'/weapon-max-sharpness.js');
const fixture={sharpness:{red:50,orange:50,yellow:50,green:50,blue:50,white:0,purple:0},handicraft:[1,4]};
assert.equal(r.fromMHDB(fixture,0).color,'blue');assert.equal(r.fromMHDB(fixture,1).color,'blue');assert.equal(r.fromMHDB(fixture,2).color,'white');assert.equal(r.fromMHDB({...fixture,handicraft:undefined},2).reason,'HANDICRAFT_DATA_UNRESOLVED');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

w.eval("build.charmCustom={skills:[{name:'匠',level:2,type:'weapon'}],slots:[0,0,0],weaponSlots:[]};calcBuild();");
const saved=w.buildSnapshot(),before=adapter.evaluateCurrent(args);assert.ok(args.skills.some(x=>x[0]==='匠'&&x[1]===2),JSON.stringify(args.skills));
w.eval("build.charmCustom.skills=[];calcBuild();");w.applyBuildSnapshot(saved);w.calcBuild();assert.ok(args.skills.some(x=>x[0]==='匠'&&x[1]===2));const after=adapter.evaluateCurrent(args);
for(const ch of ['normal','maximum']){assert.equal(after.channels[ch].execution.status,'complete',JSON.stringify(after));assert.equal(after.channels[ch].metrics.comboTotalDamage.value,before.channels[ch].metrics.comboTotalDamage.value);}
assert.equal(w.MHWWeaponMaxSharpness.fromMHDB(args.weapon,2).color,'green');console.log(JSON.stringify({weaponId:args.weapon.id,handicraft:args.weapon.handicraft,restoredSkill:args.skills,highestColor:'green',before,after},null,2));w.close();
