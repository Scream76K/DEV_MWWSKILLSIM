'use strict';
// Synthetic routing contract, NOT adoption of the synthetic body technique.
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
// Use real DB shell record; synthetic ordinary-body record exists solely to discriminate routing.
const original=args.techniqueDb,base=original.get('gunlance','GL_SHELL_NORMAL_MEDIUM');
const body={weaponType:'gunlance',techniqueId:'CONTRACT_BODY',revision:1,verificationStatus:'VERIFIED',evidenceRefs:['SYNTHETIC_ROUTING_ONLY'],hits:[{mv:10,elementModifier:1,damageType:'slash'}]};
const techniqueDb={...original,get:(kind,id)=>id==='CONTRACT_BODY'?body:original.get(kind,id)};
const rows=[];
for(const ids of [['reference:gl_NORMAL'],['CONTRACT_BODY','reference:gl_NORMAL'],['reference:gl_NORMAL','reference:gl_NORMAL']]){config=null;const r=adapter.evaluateCurrent({...args,techniqueDb,techniqueIds:ids});rows.push({ids,formulaRegistered:typeof config?.shellingFormula==='function',result:r});}
const out={scope:'SYNTHETIC_ROUTING_CONTRACT_NOT_REAL_BUILD',sha:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),baseline:!!process.env.BASELINE,adapterHash:crypto.createHash('sha256').update(process.env.BASELINE?require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo}):fs.readFileSync(path.join(repo,'hope-hammer-browser-adapter.js'))).digest('hex'),rows};console.log(JSON.stringify(out,null,2));
if(process.env.EXPECT_AFTER){for(const row of rows){assert.equal(row.formulaRegistered,true);for(const ch of ['normal','maximum']){const r=row.result.channels[ch];if(row.ids.every(id=>id==='reference:gl_NORMAL')){assert.equal(r.metrics.comboTotalDamage.status,'available');assert.equal(r.metrics.comboTotalDamage.value,8.6*row.ids.length);}else{assert.equal(r.metrics.comboTotalDamage.status,'unavailable');assert.match(JSON.stringify(r),/GL_SEQUENCE_STATE_TRANSITION_UNRESOLVED/);assert.doesNotMatch(JSON.stringify(r),/FORMULA_MISSING/);assert.equal(r.components.length,row.ids[0]==='CONTRACT_BODY'?3:2);if(row.ids[0]==='CONTRACT_BODY'){assert.equal(r.components[0].status,'available');assert.equal(r.components[1].status,'available');assert.equal(r.components[1].value,0);}}}}}
d.window.close();
