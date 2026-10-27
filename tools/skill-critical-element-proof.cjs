'use strict';
// Normal shell resource contract using captured calcBuild input and real shell DB.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const repo=path.resolve(__dirname,'..');const {JSDOM,VirtualConsole}=require('jsdom');
const d=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://routing.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}),w=d.window;
if(process.env.BASELINE)w.eval(require('child_process').execFileSync('git',['show','HEAD:hope-hammer-browser-adapter.js'],{cwd:repo,encoding:'utf8'}));
const weapon=JSON.parse(fs.readFileSync(path.join(repo,'docs/reports/r252-generic-states/evidence/mhdb-insect-glaive-hope.api.json')));
w.eval(`clearWeaponBuckets();DB.weapons=${JSON.stringify([weapon])};weaponIndexByKind['insect-glaive']=[DB.weapons[0]];weaponKind.value='insect-glaive';weapon.innerHTML='<option value="608">Hope</option>';weapon.value='608';renderComboForWeapon();App.state.combo.moves=[{techniqueId:'IG_ENHANCED_DIAGONAL_SLASH'}];DB.monsters=[{id:'training-room',name:'訓練場',parts:[{id:'training-front',name:'正面',multipliers:{slash:.4,blunt:.8,pierce:.5,fire:.2,water:.2,thunder:.2,ice:.2,dragon:.2}}]}];renderMonsters();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';`);
w.eval("document.getElementById('comboIGExtract').value='TRIPLE_EXTRACT';document.getElementById('comboIGKinsect').value='STOWED';App.combo.syncFromDOM();");
let args;const adapter=w.MHWRealOneHitBrowserAdapter;w.MHWRealOneHitBrowserAdapter={...adapter,evaluateCurrent(a){args=a;return adapter.evaluateCurrent(a)}};w.calcBuild();assert.ok(args);args={...args,trainingRoom:{...args.trainingRoom,parts:args.trainingRoom.parts.map(p=>p.id==='training-front'?{...p,multipliers:{...p.multipliers,slash:.4,blunt:.8}}:p)}};

w.eval(`DB.skills=${fs.readFileSync('docs/reports/r263-skill-audit/mhdb-skills.json','utf8')};`);

const rows=[];
for(const level of [0,1,3]){
 const input={...args,weapon:{...args.weapon,affinity:50,specials:[{kind:'element',element:'fire',damage:{raw:10,display:100}}]},stats:{...args.stats,affinity:50,element:100,elementType:'fire',elementKnown:true,typeKnown:true,elementComponents:{weaponBase:100,normalMultiplier:1,normalFlat:0}},techniqueIds:['IG_ENHANCED_DIAGONAL_SLASH'],skills:level?[['会心撃【属性】',level]]:[],equipmentSkillsResolved:true};
 input.stats.conditionalConditionPlan=w.MHWStandardPowerConditionPlan(input.stats,level?{'会心撃【属性】':level}:{},'insect-glaive',{});
 const result=adapter.evaluateCurrent(input);
 for(const ch of ['normal','maximum']){assert.equal(result.channels[ch].execution.status,'complete',JSON.stringify(result));const elements=result.channels[ch].components.filter(c=>c.id.includes(':element:'));assert.deepEqual(Array.from(elements,x=>x.value),Array(2).fill(level===0?2.4:level===1?2.46:2.58));}
 rows.push({level,result});
}
const {createSourcedElementalFormula}=require('../v10-six-layer-foundation/min8/sourced-physical-formula.cjs');
const version='test',resolve=value=>()=>({value,gameVersion:version,evidenceRef:'CONTRACT'});
const formula=createSourcedElementalFormula({calculate:w.damageFromParams,resolveElementSharpness:resolve(1),resolveHitzone:resolve(100),expectedGameVersion:version});
const groups=[];for(const kind of ['great-sword','long-sword'])for(const level of [1,3])for(const affinity of [50,-50]){
 const multiplier=w.MHResolveCriticalElement(kind,level);const result=formula({coefficient:1,coefficientUnit:'ELEMENT_MODIFIER',stats:{element:100,affinity},build:{elementType:'fire',equipment:{criticalElementLevel:level,criticalElementMultiplier:multiplier}}});
 assert.equal(result.value,affinity<0?10:Math.round(10*(1+.5*(multiplier-1))*100)/100);groups.push({kind,level,affinity,multiplier,result});
}
const oldModule={exports:{}};require('vm').runInNewContext(require('child_process').execFileSync('git',['show','HEAD:v10-six-layer-foundation/min8/sourced-physical-formula.cjs'],{encoding:'utf8'}),{module:oldModule});
const oldFormula=oldModule.exports.createSourcedElementalFormula({calculate:w.damageFromParams,resolveElementSharpness:resolve(1),resolveHitzone:resolve(100),expectedGameVersion:version});
const before=[1,3].map(level=>oldFormula({coefficient:1,coefficientUnit:'ELEMENT_MODIFIER',stats:{element:100,affinity:50},build:{elementType:'fire',equipment:{criticalElementLevel:level}}}));assert.deepEqual(before.map(x=>x.value),[11.25,11.25]);
console.log(JSON.stringify({scope:'MINIMAL_COMMON_ELEMENT_FORMULA_AND_IG_PUBLIC_PIPELINE',hashes:Object.fromEntries(['index.html','hope-hammer-browser-adapter.js','himmel-real-browser-bundle.js','v10-six-layer-foundation/min8/sourced-physical-formula.cjs'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')])),rows,groups,before},null,2));w.close();
