'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{JSDOM,VirtualConsole}=require('jsdom');
const [candidateArg,baselineArg,fixtures]=process.argv.slice(2);if(!fixtures)throw Error('Usage: node tools/skill-continuation-body-regression.cjs CANDIDATE_ROOT BASELINE_ROOT PRIVATE_FIXTURE_ROOT');
const pack=JSON.parse(fs.readFileSync(path.join(fixtures,'mhdb-catalog-source/raw-pack.json'))),base=JSON.parse(fs.readFileSync(path.join(fixtures,'ui-public-14-strict.json'))).cases.find(x=>x.kind==='gunlance').inputSnapshots[0],clone=x=>JSON.parse(JSON.stringify(x));
function setup(root){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const w=new JSDOM(require(path.join(path.resolve(root),'tools/dom-test-setup.cjs')).readSimulatorHtml(),{url:'https://skill-body-regression.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.fetch=()=>Promise.reject(Error('OFFLINE'));w.confirm=()=>true;w.structuredClone=x=>w.JSON.parse(w.JSON.stringify(x));}}).window;
 w.__data=pack.data;w.eval('DB=normalizeDB({...__data,weapons:consolidateArtiaFixedVariantRows(__data.weapons)});weaponRows=DB.weapons.slice();rebuildWeaponIndex(weaponRows);App.data.set(DB,emptyDataState());renderAll();renderMonsters();');return {w,errors};
}
function run(env,id,armor,fly){const s=clone(base);s.weaponId=String(id);s.armor=clone(armor);s.decos={};s.charmCustom.skills=[{name:'攻撃',level:4,type:'weapon'},...(fly?[{name:'飛燕',level:1,type:'armor'}]:[])];s.artia.seriesSkill='';s.artia.groupSkill='';env.w.__snapshot=s;env.w.eval('applyBuildSnapshot(__snapshot)');env.w.document.getElementById('calcBuild').click();return JSON.parse(env.w.eval('JSON.stringify(calcState.realOneHit)'));}
const referenceEnv=setup(baselineArg),candidateEnv=setup(candidateArg),results=[];
try{
 for(const weapon of [319,1151])for(const [label,armor]of [['162I',{head:609,chest:610}],['162II',{head:609,chest:610,arms:611,waist:612}],['162I+152',{head:609,arms:611,chest:706}]]){
  const reference=run(referenceEnv,weapon,armor,false);
  for(const fly of [false,true]){const result=run(candidateEnv,weapon,armor,fly),row={weapon,label,fly};
   for(const ch of ['normal','maximum']){const actual=result.channels[ch],original=reference.channels[ch],metric=actual.metrics.comboTotalDamage,body=c=>c.components.filter(x=>/:physical:|:element:/.test(x.id));assert.equal(metric.status,'available');assert.deepEqual(body(actual),body(original));if(original.metrics.comboTotalDamage.status==='available')assert.equal(metric.value,original.metrics.comboTotalDamage.value);assert.deepEqual(actual.finalState,original.finalState);assert.deepEqual(actual.execution,original.execution);assert.equal(metric.value,actual.components.reduce((n,c)=>n+c.value,0));row[ch]={value:metric.value,bodyComponents:body(actual).length,ignored:actual.diagnostics.ignoredSkillEffects?.map(x=>[x.skillId,x.status])||[]};}results.push(row);
  }
 }
 assert.deepEqual(referenceEnv.errors,[]);assert.deepEqual(candidateEnv.errors,[]);console.log(JSON.stringify({status:'PASS',scope:'12_REAL_EQUIPMENT_CASES_24_CHANNELS;NOT_GAME_ACCURACY',supportedBodyJSONExact:true,availableReferenceTotalsExact:true,executionAndFinalStateExact:true,componentSumExact:true,results},null,2));
}finally{referenceEnv.w.close();candidateEnv.w.close();}
