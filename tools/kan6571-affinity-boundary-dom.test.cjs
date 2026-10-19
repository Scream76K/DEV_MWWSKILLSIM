'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom'),{db,seed}=require('./kan108-fixture.cjs');
// Catches missing official Gore activation, duplicate recovery, unknown->0,
// and missing actionable prerequisites. All modules and MHDB rows are real;
// archived DB injection is this offline fixture, not a normal user flow.
test('KAN65/71 official activated Gore and UNKNOWN boundaries keep normal distinct from reachable maximum',t=>{
 const dom=new JSDOM(require('./dom-test-setup.cjs').readSimulatorHtml(),{url:'https://simulator.test/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));}});t.after(()=>dom.window.close());const w=dom.window;w.__db=JSON.parse(JSON.stringify(db));w.eval('('+seed.toString()+')(__db)');
 const got=w.eval(`(()=>{
 const rows=[],put=(id,actual,expected)=>rows.push({id,actual,expected});
 for(const count of [0,1,2,4]){
  build.armor=Object.fromEntries(['head','chest','arms','waist'].slice(0,count).map(kind=>[kind,DB.armor.find(x=>x.kind===kind&&x.name.includes('ゴア')&&x.name.endsWith('α'))]));calcBuild();
  put('equipment'+count,[calcState.stats.affinity,calcState.stats.maxAffinity],{0:[0,0],1:[0,0],2:[0,18],4:[0,21]}[count]);
  if(count>=2){const effects=calcState.stats.activeBonusEffects.filter(e=>e.bonusSkillId===106);
   for(const lv of [0,1,2,3])put('rank'+count+'_antivirus'+lv,calcMaxAffinity({'無我の境地':lv},0,selectedWeapon(),{},effects),[15,18,21,25][lv]);
   put('same-activation-once'+count,calcMaxAffinity({'無我の境地':3},0,null,{},[...effects,...effects]),25);
   put('insufficient-count'+count,calcMaxAffinity({},0,null,{},effects.map(e=>({...e,count:1}))),null);
   put('invalid-rank'+count,calcMaxAffinity({},0,null,{},effects.map(e=>({...e,rankId:999}))),null);
   put('name-only'+count,calcMaxAffinity({},0,null,{},[{name:effects[0].name,rankLevel:effects[0].rankLevel,count}]),null);
  }
 }
 for(const [id,total,expected]of [['normal0',{},0],['conditional5',{'挑戦者':2},5],['conditional8',{'弱点特効':1},8],['combined13',{'挑戦者':2,'弱点特効':1},13],['no-source-antivirus',{'無我の境地':3},0],['bare-name-no-activation',{'黒蝕竜の力':1},0]])put(id,calcMaxAffinity(total,0,null,{},[]),expected);
 for(const base of [null,undefined,'',NaN,Infinity])put('unknown:'+String(base),calcMaxAffinity({},base,null,{},[]),null);
 build.armor={};const weapon=selectedWeapon(),old=weapon.affinity;weapon.affinity=null;calcBuild();
 put('unknown-build',[calcState.stats.affinity,calcState.stats.maxAffinity],[null,null]);put('unknown-summary',/会心率[\\s\\S]*未算出/.test(document.getElementById('buildSummary').textContent),true);
 put('unknown-step-input',document.getElementById('dAff').value,'');
 buildName.value='KAN6571 unknown';saveNamedBuild();const snapshot=buildSnapshot();applyBuildSnapshot(snapshot);selectAllCompare.click();runBuildCompare();const row=createBuildComparisonReport().results[0];put('unknown-comparison',[row.affinity,row.maxAffinity],[null,null]);weapon.affinity=old;
 return rows;
 })()`);
 a.deepEqual(JSON.parse(JSON.stringify(got.map(x=>({id:x.id,value:x.actual})))),JSON.parse(JSON.stringify(got.map(x=>({id:x.id,value:x.expected})))));
});
