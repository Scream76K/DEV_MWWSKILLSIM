'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon=JSON.parse(fs.readFileSync(path.join(repo,'docs/reports/r252-generic-states/evidence/mhdb-gunlance-hope.api.json')));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['gunlance']=[DB.weapons[0]];weaponKind.value='gunlance';weapon.innerHTML='<option value="315">Hope</option>';weapon.value='315';renderComboForWeapon();comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='6';comboGLCharged.value='1';comboGLFireHz.value='20';App.combo.syncFromDOM();App.state.combo.moves=[{techniqueId:'reference:gl_NORMAL'}];`);
w.eval(`DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args,config;const adapter=w.MHWRealOneHitBrowserAdapter,create=w.HimmelRealOneHitPipeline;
w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};
w.HimmelRealOneHitPipeline=o=>{config=o;return create(o)};w.calcBuild();assert.ok(args);

w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
const ids=['GL_SLAM','reference:gl_NORMAL'];const input={...args,techniqueIds:ids,equipmentSkillsResolved:true,gunlanceState:{...args.gunlanceState,loadedRounds:3}};
const baseline=adapter.evaluateCurrent({...input,skills:[]});const mind=adapter.evaluateCurrent({...input,skills:[['心眼',3]]});const blunt=adapter.evaluateCurrent({...input,skills:[['鈍器使い',3]]});
for(const ch of ['normal','maximum']){assert.equal(mind.channels[ch].execution.status,'complete');assert.equal(mind.channels[ch].metrics.comboTotalDamage.value,baseline.channels[ch].metrics.comboTotalDamage.value);const b=blunt.channels[ch];assert.equal(b.execution.status,'incomplete');assert.equal(b.metrics.comboTotalDamage.status,'unavailable');assert.equal(b.finalState.gunlance.loadedRounds,3);assert.ok(b.components[0].value>baseline.channels[ch].components[0].value);assert.ok(b.components.some(c=>c.reason?.includes('CONTEXT_ATTACK_COMPONENT_SCOPE_PENDING')));}
assert.equal(input.gunlanceState.loadedRounds,3);
console.log(JSON.stringify({baseline,mind,blunt},null,2));w.close();
