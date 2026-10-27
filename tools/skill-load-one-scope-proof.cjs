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
const run=level=>adapter.evaluateCurrent({...args,skills:level?[['砲弾装填',level]]:[],equipmentSkillsResolved:true,techniqueIds:['reference:gl_NORMAL'],gunlanceState:{...args.gunlanceState,loadedRounds:2}});const zero=run(0),one=run(1);for(const ch of ['normal','maximum']){assert.equal(one.channels[ch].execution.status,'complete',JSON.stringify(one));assert.equal(one.channels[ch].metrics.comboTotalDamage.value,zero.channels[ch].metrics.comboTotalDamage.value);assert.equal(one.channels[ch].finalState.gunlance.loadedRounds,1);}console.log(JSON.stringify({zero,one},null,2));w.close();
