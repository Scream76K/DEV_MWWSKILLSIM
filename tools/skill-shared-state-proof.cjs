const fs=require('fs'),assert=require('assert/strict');
const root=process.cwd(),r=require(root+'/weapon-max-sharpness.js');
const fixture={sharpness:{red:50,orange:50,yellow:50,green:50,blue:50,white:0,purple:0},handicraft:[1,4]};
assert.equal(r.fromMHDB(fixture,0).color,'blue');assert.equal(r.fromMHDB(fixture,1).color,'blue');assert.equal(r.fromMHDB(fixture,2).color,'white');assert.equal(r.fromMHDB({...fixture,handicraft:undefined},2).reason,'HANDICRAFT_DATA_UNRESOLVED');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);


const bonus=(id,rank,source='series')=>{const d=w.__getBetaDB().skills.find(x=>x.id===id),r=d.ranks.find(x=>x.level===rank);return {name:r.name,bonusName:d.name,bonusSkillId:id,rankLevel:rank,source,required:r.setPiecesRequired,count:r.setPiecesRequired};};
const fort=bonus(150,1,'group'),omega=bonus(173,2),guts=bonus(131,1,'group'),veil=bonus(153,2);
const stats={...args.stats,attackTrue:103,attack:103,attackComponents:{weaponBase:100,normalMultiplier:1,normalFlat:3},activeBonusEffects:[fort,omega]};
const total={'攻撃':1,'毛皮の昂揚':1,'オメガレゾナンス':2};
const evaluate=mode=>{const conditions={...args.conditions,fortifyCount:1,selfSkillState:{shared:{omega:mode}}};const plan=w.MHWStandardPowerConditionPlan(stats,total,'great-sword',conditions);assert.equal(plan.pending.length,0,JSON.stringify(plan));const result=adapter.evaluateCurrent({...args,weapon:{...args.weapon,damage:{...args.weapon.damage,raw:100}},stats:{...stats,conditionalConditionPlan:plan},conditions,skills:Object.entries(total),equipmentSkillsResolved:true});for(const ch of ['normal','maximum'])assert.equal(result.channels[ch].execution.status,'complete',JSON.stringify(result));return {plan,result};};
const far=evaluate('FAR'),near=evaluate('NEAR');assert.ok(Math.abs(far.plan.maximum.attackTrue-133)<1e-8);assert.ok(Math.abs(near.plan.maximum.attackTrue-113)<1e-8);assert.equal(near.plan.selfStatePlan.normal.find(x=>x.skillId===173).affinityAdd,40);assert.equal(far.plan.selfStatePlan.maximum.find(x=>x.skillId===173).affinityAdd,0);
const resistance=w.MHWEquipmentThunderResistanceInput({status:'ARMOR_BASE_ONLY',armorBase:10},{'ヌシの魂':1,'波衣竜の守護':2},[guts,veil],{gutsState:'AFTER',selfSkillState:{shared:{veilActive:true}}});assert.equal(resistance.total,25);
const before=w.MHWEquipmentThunderResistanceInput({status:'ARMOR_BASE_ONLY',armorBase:10},{'ヌシの魂':1,'波衣竜の守護':2},[guts,veil],{gutsState:'BEFORE',selfSkillState:{shared:{veilActive:false}}});assert.equal(before.total,10);
console.log(JSON.stringify({far,near,resistance,before},null,2));w.close();
