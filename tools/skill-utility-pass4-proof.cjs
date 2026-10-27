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
for(const skills of [[],[['ＫＯ術',3]],[['ＫＯ術',4]],[['にゃんにゃんぼう',1]],[['にゃんにゃんぼう',2]],[['シールドオプション',1]]]){const result=adapter.evaluateCurrent({...args,skills,equipmentSkillsResolved:true});rows.push({skills,result});}
out.utilityRows=rows;
if(process.env.ASSERT_AFTER){for(const ch of ['normal','maximum']){assert.equal(rows[1].result.channels[ch].metrics.comboTotalDamage.value,rows[0].result.channels[ch].metrics.comboTotalDamage.value);assert.equal(rows[1].result.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(rows[2].result.channels[ch].metrics.comboTotalDamage.status,'unavailable');for(const i of [3,5])assert.equal(rows[i].result.channels[ch].metrics.comboTotalDamage.value,rows[0].result.channels[ch].metrics.comboTotalDamage.value);assert.equal(rows[4].result.channels[ch].metrics.comboTotalDamage.status,'unavailable');}}
out.hashes=Object.fromEntries(['hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
console.log(JSON.stringify(out,null,2));w.close();process.exitCode=out.pass?0:1;
