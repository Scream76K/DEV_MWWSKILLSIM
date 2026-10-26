'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon={id:999001,gameId:999001,sharpness:{},kind:'bow',name:'SYNTHETIC_CONTRACT',damage:{raw:90,display:108},affinity:0,slots:[],skills:[],specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}],coatings:['close-range']};
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['bow']=[DB.weapons[0]];weaponKind.value='bow';weapon.innerHTML='<option value="999001">Hope</option>';weapon.value='999001';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'BOW_SHOT_3'}];DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.4,blunt:.8,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);args={...args,trainingRoom:{...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>p.id==='training-front'?{...p,multipliers:{...p.multipliers,slash:.4,blunt:.8,fire:.2}}:p)}};
const rows=[];const skills=[['火属性攻撃強化',3],['チャージマスター',1]];
// Deliberate contract stats: base100 * existing element multiplier + existing flat;
// maximum adds20 through the existing conditional producer. Not a real equipped skill proof.
const rule=w.MHWElementSkillResolver(Object.fromEntries(skills),'fire'),normal=100*rule.mult+rule.add;
const input={...args,skills,equipmentSkillsResolved:true,bowState:{chargeLevel:3,range:'CRITICAL',coating:'NONE',startShot:3},techniqueIds:['BOW_SHOT_3','BOW_POWER_SHOT_3','BOW_POWER_VOLLEY_3'],stats:{...args.stats,element:normal,conditionalConditionPlan:{status:'READY',maximum:{element:normal+20},attackComponents:{conditionalMultiplier:1,groupMultiplier:1,conditionalFlat:0}}}};
const result=adapter.evaluateCurrent(input);rows.push({label:'normal-maximum',result});
if(!process.env.BASELINE){for(const channel of ['normal','maximum']){const r=result.channels?.[channel];assert.ok(r,JSON.stringify(result));assert.equal(r.metrics.comboTotalDamage.status,'available',JSON.stringify(r));const cm=w.TechniqueDBEngine.get('bow','BOW_STATE_MODIFIERS').specialSourceValues.skillRules.chargeMaster.multipliers[1];const expectedElement=100*rule.mult*cm+rule.add+(channel==='maximum'?20:0);for(const c of r.components)for(const h of c.details.trace)assert.ok(Math.abs(h.element-expectedElement/10*.2*h.elementModifier)<1e-9);}}
if(!process.env.BASELINE){
 const options={attack:90,element:normal,elementBasis:{weaponBase:100,normalMultiplier:rule.mult,normalFlat:rule.add,conditionalFlat:0},affinity:0,criticalMultiplier:1.25,physicalHitzone:50,elementalHitzone:20,state:input.bowState,skills:{chargeMaster:1}};
 const direct=w.BowReference.standard(options,w.TechniqueDBEngine,input.techniqueIds),without=w.BowReference.standard({...options,skills:{chargeMaster:0}},w.TechniqueDBEngine,input.techniqueIds);
 assert.equal(direct.physical,without.physical);
 for(const basis of [null,{...options.elementBasis,normalFlat:rule.add+1}])assert.throws(()=>w.BowReference.standard({...options,elementBasis:basis},w.TechniqueDBEngine,input.techniqueIds),/CHARGE_MASTER_ELEMENT_COMPONENTS_UNRESOLVED/);
 assert.throws(()=>w.BowReference.standard({...options,element:null},w.TechniqueDBEngine,input.techniqueIds),/INVALID_INPUT/);
 const zero=w.BowReference.standard({...options,element:0,elementBasis:null},w.TechniqueDBEngine,input.techniqueIds);assert.equal(zero.element,0);
 rows.push({label:'boundary',direct,without,zero,missingRejected:true,mismatchRejected:true,nullElementRejected:true});
}
console.log(JSON.stringify({scope:'SYNTHETIC_BOW_PUBLIC_ADAPTER_CONTRACT',executionSha:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),rule,hashes:Object.fromEntries(['hope-hammer-browser-adapter.js','v10-six-layer-foundation/min8/engine.cjs','himmel-real-browser-bundle.js'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex')])),rows},null,2));d.window.close();
