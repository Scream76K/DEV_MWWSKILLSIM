'use strict';
const fs=require('node:fs'),path=require('node:path');
require('./verify-combined.cjs').verifyCombined();
const {JSDOM,VirtualConsole}=require('jsdom');
const area=path.resolve(process.env.BOUNDED_RESULTS_DIR),root=path.join(__dirname,'work/input');
const baselineFile=path.join(__dirname,'bounded-baseline-adapter.js');
const clean=x=>JSON.parse(JSON.stringify(x));
const priorRoot=path.join(__dirname,'work/harness');
const plan=require(priorRoot+'/gl-affinity-plan.cjs').makeGlAffinityPlan(require(root+'/normalized-data.json'),require(priorRoot+'/skill-sources/classification.candidate.json'),require(priorRoot+'/skill-sources/raw-skills.json'));
const fixtures=plan.cases.filter(x=>['original:162:1:gunlance','original:162:2:gunlance'].includes(x.key));
const components=(r,ch,unit)=>r.channels?.[ch]?.components?.filter(p=>!unit||p.coefficientUnit===unit)||[];
const ready=r=>['normal','maximum'].every(ch=>components(r,ch,'SHELLING').length>0&&components(r,ch,'SHELLING').every(p=>p.status==='available'&&Number.isFinite(p.value)));
const copy=input=>{const {techniqueDb,trainingRoom,...rest}=input;return {...structuredClone(rest),techniqueDb,trainingRoom};};
async function load(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const db=fs.readFileSync(root+'/normalized-data.json');
 const dom=new JSDOM(require(root+'/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://isolated-gl-thunder.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
 const w=dom.window;if(w.__localDBReady)await w.__localDBReady;
 w.__testData=JSON.parse(db);w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const candidate=w.MHWRealOneHitBrowserAdapter;w.eval(fs.readFileSync(baselineFile,'utf8'));const baseline=w.MHWRealOneHitBrowserAdapter;let captured,uiResult,calls=0;
 w.MHWRealOneHitBrowserAdapter={...candidate,evaluateCurrent(input){captured=input;calls++;uiResult=candidate.evaluateCurrent(input);return uiResult;}};
 const saved=w.eval('JSON.stringify(savedBuildMap())');
 function capture({armorIds=[],grants=[],techniqueIds=[],glState=null,selfSkillState=null}={}){
  w.__armorIds=armorIds;w.__grants=grants.map(({id,...g})=>g);w.__ids=techniqueIds;
  w.eval("build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();weaponKind.value='gunlance';renderWeapon();weapon.value='"+plan.weapon.id+"';syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=window.__ids.map(techniqueId=>({techniqueId}));restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';for(const id of window.__armorIds){const a=DB.armor.find(a=>a.id===id);if(!a)throw Error('Missing armor');build.armor[a.kind]=a;}build.charmCustom.skills=window.__grants;normalizeCharm();");
  w.__glState=glState;w.eval('restoreComboGLState(window.__glState);');w.document.getElementById('powerSelfSkillState').value=selfSkillState?JSON.stringify(selfSkillState):'';
  w.calcBuild();w.calcBuild();return copy(captured);
 }
 function replan(input){input.stats.conditionalConditionPlan=clean(w.MHWStandardPowerConditionPlan(input.stats,Object.fromEntries(input.skills),input.weapon.kind,input.conditions));return input;}
 function without162(input){const n=copy(input);n.skills=n.skills.filter(([name])=>!['海竜の渦雷','蒼雷一閃','蒼雷一閃Ⅰ','蒼雷一閃Ⅱ'].includes(name));n.stats.activeBonusEffects=n.stats.activeBonusEffects.filter(e=>e.bonusSkillId!==162);n.stats.maxAffinity=w.MHWMaxAffinityResolver(Object.fromEntries(n.skills),n.stats.affinity,n.weapon,n.trainingRoom.parts.find(p=>p.id==='training-front'),n.conditions);return replan(n);}
 function close(){require('node:assert/strict').deepEqual(errors,[]);require('node:assert/strict').equal(w.eval('JSON.stringify(savedBuildMap())'),saved);require('node:assert/strict').deepEqual(clean(w.__testData),JSON.parse(db));require('node:assert/strict').ok(calls>0);dom.window.close();}
 const armorRows=JSON.parse(db).armor;
 const targetArmor=armorRows.filter(a=>{w.__armorCandidate=a;return w.eval("[...armorBonusSkillObjects(window.__armorCandidate,'series'),...bonusSkillObjects(groupSetData(window.__armorCandidate)||window.__armorCandidate.armorSet,'series')].some(s=>s.id===162)");}).sort((a,b)=>(a.rarity??999)-(b.rarity??999)||a.id-b.id);
 const distinct=[];for(const a of targetArmor)if(!distinct.some(b=>b.kind===a.kind))distinct.push(a);
 require('node:assert/strict').equal(distinct.length,5);
 const armorIds=distinct.map(a=>a.id),unrelatedArmor=armorRows.find(a=>a.kind===distinct[0].kind&&!targetArmor.some(b=>a.id===b.id));require('node:assert/strict').ok(unrelatedArmor);
 return {w,dom,baseline,candidate,capture,replan,without162,copy,close,armorIds,unrelatedArmorId:unrelatedArmor.id,get uiResult(){return clean(uiResult);}};
}
module.exports={load,clean,components,ready,copy,plan,fixtures,area,root,baselineFile};
