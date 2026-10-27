'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto'),cp=require('child_process');
const {JSDOM,VirtualConsole}=require('jsdom');
const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://sa-hh-contract.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=dom.window;
if(process.env.BASELINE)w.eval(cp.execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{encoding:'utf8'}));
const api=w.MHWRealOneHitBrowserAdapter;let captured;
w.MHWRealOneHitBrowserAdapter={...api,evaluateCurrent(a){captured=a;return api.evaluateCurrent(a)}};
function input(kind,file,id){const weapon=JSON.parse(fs.readFileSync(file));w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};DB.skills=[{id:7,name:'高速変形'}];weaponIndexByKind[${JSON.stringify(kind)}]=DB.weapons;weaponKind.value=${JSON.stringify(kind)};weapon.innerHTML='<option value="${weapon.id}">fixture</option>';weapon.value='${weapon.id}';renderComboForWeapon();App.state.combo.moves=[{techniqueId:${JSON.stringify(id)}}];DB.monsters=[{id:'training-room',name:'front',parts:[{id:'training-front',name:'front',multipliers:{slash:.4,blunt:.5,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);w.calcBuild();assert.ok(captured);return {...captured,stats:{...captured.stats,conditionalConditionPlan:{status:'READY',maximum:{element:0},attackComponents:{conditionalMultiplier:1.1,groupMultiplier:1,conditionalFlat:10}}}};}

w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
const a=input('switch-axe','docs/reports/r252-generic-states/evidence/mhdb-switch-axe-hope.api.json','SA_SWORD_VERTICAL');
w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);
const rows=[];for(const level of [0,3]){
 const stats={...a.stats,affinity:50,element:100,elementType:'fire',elementKnown:true,typeKnown:true,elementComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0}};
 stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(stats,level?{'会心撃【属性】':3}:{},'switch-axe',{});
 const result=api.evaluateCurrent({...a,weapon:{...a.weapon,affinity:50,phial:{kind:'element'},specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}]},stats,techniqueIds:['SA_SWORD_MORPH_DOUBLE','SA_AXE_MORPH_SLASH'],switchAxeState:{mode:'SWORD',awakened:true},skills:level?[['会心撃【属性】',level]]:[],equipmentSkillsResolved:true});
 for(const ch of ['normal','maximum'])assert.equal(result.channels[ch].execution.status,'complete',JSON.stringify(result));rows.push({level,result});}
for(const ch of ['normal','maximum']){const a=rows[0].result.channels[ch].components,b=rows[1].result.channels[ch].components;assert.equal(a.length,10);for(let i=0;i<a.length;i++){if(a[i].coefficientUnit==='MV')assert.equal(a[i].value,b[i].value);else assert.equal(b[i].value,Math.round(a[i].value*1.075*100)/100);}}
const executionEvidence={head:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),productHashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js','bowgun-element-reference.js','bow-reference.js','v10-six-layer-foundation/min8/sourced-physical-formula.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),harnessSha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex')};
console.log(JSON.stringify({executionEvidence,scope:'SA_AWAKENED_CRITICAL_ELEMENT_PUBLIC_CONTRACT',rows},null,2));w.close();
