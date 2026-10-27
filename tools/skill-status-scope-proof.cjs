const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);


const ids=[9,12,40,68,78],db=JSON.parse(fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json'));
const skills=ids.map(id=>{const s=db.find(x=>x.id===id);return [s.name,Math.max(...s.ranks.map(r=>r.level))]});
const result=adapter.evaluateCurrent({...args,skills,equipmentSkillsResolved:true});if(!process.env.CAPTURE_BEFORE)for(const ch of ['normal','maximum'])assert.equal(result.channels[ch].metrics.comboTotalDamage.value,375.73,JSON.stringify(result));
const invalid=adapter.evaluateCurrent({...args,skills:[['麻痺属性強化',4]],equipmentSkillsResolved:true});assert.ok(!Object.values(invalid.channels||{}).some(c=>c.metrics.comboTotalDamage.status==='available'));
const executionEvidence={head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),productHashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js','bowgun-element-reference.js','bow-reference.js','v10-six-layer-foundation/min8/sourced-physical-formula.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),harnessSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex')};
console.log(JSON.stringify({executionEvidence,scope:'STATUS_ACCUMULATION_NOT_HP_NO_STATUS_EVENT_SIMULATION',ids,skills,result,invalid},null,2));w.close();
