'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const {JSDOM,VirtualConsole}=require('jsdom');
require('./verify-combined.cjs').verifyCombined();
const clone=x=>JSON.parse(JSON.stringify(x));
async function load(){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(require('./work/input/tools/dom-test-setup.cjs').readSimulatorHtml(),{url:'https://isolated-gl-bonus.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('TEST_NETWORK_DISABLED'));w.confirm=()=>false;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}});
 const w=dom.window;if(w.__localDBReady)await w.__localDBReady;
 w.__testData=JSON.parse(fs.readFileSync(path.join(root,'work/input/normalized-data.json')));
 w.eval('DB=normalizeDB(window.__testData);weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');
 const candidate=w.MHWRealOneHitBrowserAdapter;w.eval(fs.readFileSync(path.join(root,'baseline-adapter.js'),'utf8'));const baseline=w.MHWRealOneHitBrowserAdapter;let captured;
 w.MHWRealOneHitBrowserAdapter={...baseline,evaluateCurrent(input){captured=input;return baseline.evaluateCurrent(input);}};
 function capture({armorIds=[],grants=[],techniqueIds=[]}={}){
  w.__armorIds=armorIds;w.__grants=grants;w.__ids=techniqueIds;
  w.eval("build.armor={head:null,chest:null,arms:null,waist:null,legs:null};build.decos={};build.charmCustom={skills:[],slots:[0,0,0],weaponSlots:[],weaponSlot:false};normalizeCharm();weaponKind.value='gunlance';renderWeapon();weapon.value='315';syncWeaponStateFromUI();renderComboForWeapon();App.state.combo.moves=window.__ids.map(techniqueId=>({techniqueId}));restoreComboRows();monster.value='training-room';renderMonsterParts();monsterPart.value='training-front';for(const id of window.__armorIds){const a=DB.armor.find(a=>a.id===id);if(!a)throw Error('Missing armor');build.armor[a.kind]=a;}build.charmCustom.skills=window.__grants;normalizeCharm();");
  w.calcBuild();w.calcBuild();return copy(captured);
 }
 function copy(input){const {techniqueDb,trainingRoom,...rest}=input;return {...clone(rest),techniqueDb,trainingRoom};}
 function replan(input){input.stats.conditionalConditionPlan=clone(w.MHWStandardPowerConditionPlan(input.stats,Object.fromEntries(input.skills),input.weapon.kind,input.conditions));return input;}
 const plan=require('./work/harness/gl-affinity-plan.cjs').makeGlAffinityPlan(JSON.parse(fs.readFileSync(path.join(root,'work/input/normalized-data.json'))),require('./work/harness/skill-sources/classification.candidate.json'),require('./work/harness/skill-sources/raw-skills.json'));
 const bonusFixtures=plan.cases.filter(c=>['original:89:1:gunlance','original:153:2:gunlance','original:155:1:gunlance'].includes(c.key)).map(c=>({key:c.key.slice('original:'.length),id:c.key==='original:89:1:gunlance'?89:153,armorIds:c.armorIds}));
 return {dom,w,errors,baseline,candidate,capture,copy,replan,bonusFixtures};
}
const components=(r,ch,unit)=>r.channels?.[ch]?.components?.filter(p=>!unit||p.coefficientUnit===unit)||[];
module.exports={load,clone,components};
