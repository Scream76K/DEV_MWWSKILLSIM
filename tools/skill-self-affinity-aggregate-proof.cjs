const fs=require('fs'),assert=require('node:assert/strict'),cp=require('node:child_process'),crypto=require('node:crypto');
const {JSDOM,VirtualConsole}=require('/Users/scream/Documents/Codex/2026-10-18/task/himmel-db-route-pqr4v6qt/dependencies/node_modules/jsdom');
const f=JSON.parse(fs.readFileSync('docs/reports/r259-hbg-element-skill/fixture.json'));assert.equal(f.weapon.id,467);assert.equal(f.weapon.slots[0],2);assert.equal(f.decoration.id,35);assert.equal(f.decoration.kind,'weapon');assert.ok(f.decoration.slot<=f.weapon.slots[0]);assert.ok(f.decoration.skills.some(x=>x.skill.id===127&&x.level===2));assert.ok(f.weapon.ammo.some(x=>x.kind==='thunder'&&x.level===1&&x.capacity===7));
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('offline'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));w.confirm=()=>true;}}),w=dom.window;
w.eval(`clearWeaponBuckets();DB.weapons=[${JSON.stringify(f.weapon)}];DB.skills=${JSON.stringify(f.skills)};DB.decorations=[${JSON.stringify(f.decoration)}];weaponIndexByKind['heavy-bowgun']=DB.weapons;weaponKind.value='heavy-bowgun';weapon.innerHTML='<option value="467">ホープキャノンⅣ</option>';weapon.value='467';App.build.setWeapon(DB.weapons[0]);build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[]};renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';renderComboForWeapon();App.state.combo.moves=[];restoreComboRows();addCombo('canonical:HBG_ELEMENT_FIRST_HIT_REFERENCE');powerHbgElementType.value='thunder';powerHbgAmmoLevel.value='1';powerHbgNormalMode.value='0';powerHbgRange.value='CRITICAL';calcBuild();`);

let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

if(process.env.BEFORE)w.eval(fs.readFileSync('hope-hammer-browser-adapter.js','utf8').replace("id:'self-affinity:'+e.skillId+(target==='element'?'-element':'')","id:'self-affinity:'+e.skillId+':'+target"));
const current=w.MHWRealOneHitBrowserAdapter,skills=[['連携プログラム',1]];
const conditions={...args.conditions,selfSkillState:{normal:{cooperation:false},maximum:{cooperation:true}}};
const stats={...args.stats};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,Object.fromEntries(skills),'heavy-bowgun',conditions);
const result=current.evaluateCurrent({...args,conditions,stats,skills,equipmentSkillsResolved:true});
for(const ch of ['normal','maximum'])assert.equal(result.channels[ch].execution.status,'complete',JSON.stringify(result));
const n=result.channels.normal.components[0].details,m=result.channels.maximum.components[0].details;
assert.ok(Math.abs((m.physical-n.physical)-160*.08*.8*.15*.25)<1e-8,JSON.stringify({normal:n.physical,maximum:m.physical,ratio:m.physical/n.physical}));
const self=conditions.selfSkillState;w.document.getElementById('powerSelfSkillState').value=JSON.stringify(self);const saved=w.buildSnapshot();w.document.getElementById('powerSelfSkillState').value='null';w.applyBuildSnapshot(saved,{preserveCombo:true});assert.equal(w.document.getElementById('powerSelfSkillState').value,'null');w.applyBuildSnapshot(saved);assert.deepEqual(JSON.parse(w.document.getElementById('powerSelfSkillState').value),self);
console.log(JSON.stringify({result,saveRestore:true,sharedComparisonPreserved:true},null,2));w.close();
