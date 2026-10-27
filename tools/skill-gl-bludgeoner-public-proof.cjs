'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon=JSON.parse(fs.readFileSync(path.join(repo,'docs/reports/r252-generic-states/evidence/mhdb-gunlance-hope.api.json')));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['gunlance']=[DB.weapons[0]];weaponKind.value='gunlance';weapon.innerHTML='<option value="315">Hope</option>';weapon.value='315';renderComboForWeapon();comboGLType.value='NORMAL';comboGLPower.value='MEDIUM';comboGLLoaded.value='6';comboGLCharged.value='1';comboGLFireHz.value='20';App.combo.syncFromDOM();App.state.combo.moves=[{techniqueId:'reference:gl_NORMAL'}];`);
w.eval(`DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};App.build.setWeapon(DB.weapons[0]);App.state.combo.moves=[{techniqueId:'GL_SLAM'},{techniqueId:'reference:gl_NORMAL'}];`);
let args,result,calls=[];const adapter=w.MHWRealOneHitBrowserAdapter,shell=w.GunlanceShellReference;
w.GunlanceShellReference={...shell,calculate(o,...rest){const r=shell.calculate(o,...rest);calls.push({input:JSON.parse(JSON.stringify(o)),total:r.total});return r;}};
w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;result=adapter.evaluateCurrent(a);return result;}};
function run(level){calls=[];w.eval(`build.charmCustom={skills:${level?"[{name:'鈍器使い',level:3,type:'weapon'}]":"[]"},slots:[0,0,0],weaponSlots:[]};calcBuild();`);return JSON.parse(JSON.stringify({args,result,calls}));}
const none=run(0),blunt=run(3);
fs.writeFileSync('/tmp/gl-bludgeoner-inspect.json',JSON.stringify({none,blunt},null,2));
assert.equal(w.MHWWeaponMaxSharpness.fromMHDB(args.weapon,0).color,'green');assert.ok(args.skills.some(x=>x[0]==='鈍器使い'&&x[1]===3));
for(const ch of ['normal','maximum']){const a=none.result.channels[ch],b=blunt.result.channels[ch];assert.equal(a.execution.status,'complete');assert.ok(Math.abs(b.components[0].value-a.components[0].value*1.1)<0.011);if(process.env.BEFORE){assert.equal(b.execution.status,'incomplete');assert.ok(b.components.some(c=>c.reason?.includes('CONTEXT_ATTACK_COMPONENT_SCOPE_PENDING')));}else{assert.equal(b.execution.status,'complete');assert.equal(b.components[2].value,a.components[2].value);assert.equal(b.finalState.gunlance.loadedRounds,a.finalState.gunlance.loadedRounds);}}
if(!process.env.BEFORE){assert.deepEqual(blunt.calls,none.calls);assert.equal(blunt.calls.length,2);}
console.log(JSON.stringify({source:'https://a-to-monhan.com/2025/03/31/wilds-donkitukai/',scope:'calcBuild public GL_SLAM + NORMAL, real weapon315 maximum green; no live game verification',none,blunt},null,2));w.close();
