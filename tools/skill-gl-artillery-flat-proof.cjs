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
const bonus={name:'黒蝕一体Ⅱ',bonusName:'黒蝕竜の力',source:'series',required:4,count:4,rankLevel:2,bonusSkillId:106};
const rows=[];
for(const artillery of [0,1]){
const total={'黒蝕一体Ⅱ':2,'無我の境地':3,...(artillery?{'砲術':1}:{})};
const stats={...args.stats,activeBonusEffects:[bonus]};stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,total,'gunlance',{blackEclipseState:'INFECTED'});
const result=adapter.evaluateCurrent({...args,stats,skills:Object.entries(total),equipmentSkillsResolved:true,techniqueIds:['reference:gl_NORMAL']});
for(const ch of ['normal','maximum']){if(!artillery){assert.equal(result.channels[ch].metrics.comboTotalDamage.status,'available');assert.equal(result.channels[ch].metrics.comboTotalDamage.value,ch==='normal'?9.4:9.8);}else{if(!process.env.CAPTURE_BEFORE)assert.equal(result.channels[ch].metrics.comboTotalDamage.status,'available');}}
rows.push({artillery,result});}
const contrast=[];if(!process.env.CAPTURE_BEFORE){for(const flat of [0,20]){const out=w.GunlanceShellReference.calculate({action:'NORMAL',state:{shellingType:'NORMAL',shellingPower:'MEDIUM',loadedRounds:6,fireHitzone:20},weaponBaseAttack:120+flat,normalAttackComponents:{weaponBase:100,normalMultiplier:1.2,normalFlat:flat},artilleryLevel:1,loadShellsLevel:0,unreviewedSkills:[]},w.TechniqueDBEngine,w.MHWGenericProfileDamage);contrast.push(out);}assert.equal(contrast[0].hits[0].e,contrast[1].hits[0].e);assert.equal(contrast[1].resolvedPhysicalAttack-contrast[0].resolvedPhysicalAttack,20);}
console.log(JSON.stringify({scope:'GL_NORMAL_ARTILLERY_BEFORE_FLAT_OWNER_PROVISIONAL',contrast,hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','gunlance-shell-reference.js','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows},null,2));w.close();
