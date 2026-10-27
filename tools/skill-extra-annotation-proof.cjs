const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const w=new JSDOM(require(process.cwd()+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://stage3.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
const known={name:'根性【果敢】',bonusName:'ヌシの魂',source:'group',required:3,count:3,rankLevel:1,bonusSkillId:131};
const unknown={name:'黒蝕一体Ⅱ',bonusName:'黒蝕竜の力',source:'series',required:4,count:4,rankLevel:2,bonusSkillId:106};
const st={attackTrue:100,attackComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0},element:0,elementType:null,elementKnown:true,typeKnown:true,affinity:0,maxAffinity:0,activeBonusEffects:[known,unknown]};w.__st=st;
const out={base:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),indexHash:crypto.createHash('sha256').update(fs.readFileSync('index.html')).digest('hex')};
try{out.plan=JSON.parse(w.eval('JSON.stringify(standardPowerConditionPlan(window.__st,{},"great-sword",{gutsState:"BEFORE"}))'));assert.equal(out.plan.normal.attackTrue,105);assert.ok(out.plan.pending.some(x=>x.includes('黒蝕一体Ⅱ')));assert.ok(out.plan.normal.activeBonusEffects.some(x=>x.name==='黒蝕一体Ⅱ'));assert.ok(!out.plan.normal.activeBonusEffects.some(x=>x.name==='根性【果敢】'));assert.deepEqual(st.activeBonusEffects,[known,unknown]);out.pass=true;}catch(e){out.pass=false;out.error=e.stack;}
const weapon=JSON.parse(fs.readFileSync('docs/reports/r252-generic-states/evidence/mhdb-great-sword-hope-blade-i.api.json'));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['great-sword']=DB.weapons;weaponKind.value='great-sword';weapon.innerHTML='<option value="236">Hope</option>';weapon.value='236';App.build.setWeapon(DB.weapons[0]);renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
const cases=[{id:38,name:'鎖刃刺撃',level:5},{id:96,name:'白熾の奔流',level:1},{id:182,name:'解キ放ツ鏡刃ノ破片',level:1},{id:149,name:'恨撃Ⅰ',parent:'獄焔蛸の反逆',level:1},{id:162,name:'蒼雷一閃Ⅰ',parent:'海竜の渦雷',level:1}];
for(const cfg of cases){
 const bonus={name:cfg.name,bonusName:cfg.parent,source:'series',required:2,count:2,rankLevel:1,bonusSkillId:cfg.id};
 const stats={...args.stats,activeBonusEffects:cfg.parent?[bonus]:[]};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,{[cfg.name]:cfg.level},'great-sword',{});
 const result=adapter.evaluateCurrent({...args,stats,skills:[[cfg.name,cfg.level]],equipmentSkillsResolved:true});
 for(const ch of ['normal','maximum']){
  assert.equal(result.channels[ch].metrics.comboTotalDamage.status,'available',JSON.stringify(result));
  const value=result.channels[ch].metrics.comboTotalDamage.value;
  if(cfg.id===162&&ch==='maximum')assert.ok(value>375.73);else assert.equal(value,375.73);
  const notes=result.channels[ch].diagnostics.excludedSkillDamage;
  assert.equal(notes.length,1);assert.equal(notes[0].additionalDamage.status,'unavailable');
  assert.equal(notes[0].additionalDamage.includedInPower,false);
  assert.ok(!result.channels[ch].components.some(c=>/scorch|extra|annotation/i.test(c.id)));
 }
 w.__result=result;w.eval('calcState.realOneHit=window.__result;renderSummary()');
 assert.match(w.document.getElementById('buildSummary').textContent,/追加ダメージ不明/);
 rows.push({cfg,result});
}
console.log(JSON.stringify({scope:'SYNTHETIC_SKILL_ACTIVATION_CONTRACT_NOT_REAL_BUILD',base:out.base,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows},null,2));w.close();
