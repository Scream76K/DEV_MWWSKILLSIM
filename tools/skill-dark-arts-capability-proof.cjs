const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const bonus={name:'ダークアーツ',bonusName:'暗黒騎士の証',source:'series',required:2,count:2,rankLevel:1,bonusSkillId:172};
const rows=[];
for(const [peak,absorption] of [[0,0],[5,0],[0,3]]){
 const totals={'火属性攻撃強化':3,'連撃':5,'災禍転福':3,'ダークアーツ':1,...(absorption?{'属性吸収':absorption}:{}),...(peak?{'フルチャージ':peak}:{})};
 const stats={...args.stats,element:180,elementType:'fire',elementKnown:true,typeKnown:true,elementComponents:{weaponBase:100,normalMultiplier:1.2,normalFlat:60},activeBonusEffects:[bonus]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,totals,'great-sword',{});
 const input={...args,weapon:{...args.weapon,specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}]},stats,skills:Object.entries(totals),equipmentSkillsResolved:true};
 const result=adapter.evaluateCurrent(input);
 assert.equal(result.channels.maximum.execution.status,'complete');
 assert.equal(result.channels.normal.metrics.comboTotalDamage.value,405.43);
 if(!peak){for(const c of result.channels.maximum.components.filter(c=>c.coefficientUnit==='ELEMENT_MODIFIER'))assert.ok(Math.abs(c.details.appliedElement-(absorption?500:447.2))<1e-8);}
 else {const h=result.channels.maximum.diagnostics.healthBranchComparison;assert.equal(h.status,'RESOLVED');assert.equal(result.channels.maximum.metrics.comboTotalDamage.value,Math.max(...h.branches.map(b=>b.value)));for(const b of h.branches){const e=b.effectPlan.effects;const m=e.find(x=>x.id==='conditional-element-multiplier');assert.equal(e.some(x=>x.id==='dark-arts-body-element-multiplier'),b.state!=='FULL_HEALTH');assert.ok(Math.abs(m.amount-1.3)<1e-8);}}
 rows.push({peak,absorption,plan:stats.conditionalConditionPlan,result});
}
const low=w.MHWStandardPowerConditionPlan({...args.stats,element:180,elementType:'fire',elementComponents:{weaponBase:100,normalMultiplier:1.2,normalFlat:60},activeBonusEffects:[bonus]},{'ダークアーツ':1},'long-sword',{});assert.ok(Math.abs(low.maximumElementComponents.normalMultiplier-1.368)<1e-9);
console.log(JSON.stringify({rows,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))},null,2));w.close();
