'use strict';
// Handwritten synthetic records only. This helper never reads MHDB, saved builds,
// browser captures, private results or dependencies. It does not calculate damage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(process.env.PRODUCT_ROOT||path.join(__dirname,'../..'));
const adapter=fs.readFileSync(process.env.INPUT_GUARD_ADAPTER_FILE||path.join(root,'hope-hammer-browser-adapter.js'),'utf8');
const plain=x=>JSON.parse(JSON.stringify(x));
function section(start,end){const a=adapter.indexOf(start),b=adapter.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,start);assert.equal(adapter.indexOf(start,a+start.length),-1,'unique '+start);return adapter.slice(a,b);}
function declaration(marker){const rows=adapter.split('\n').filter(s=>s.trimStart().startsWith(marker));assert.equal(rows.length,1,marker);return rows[0].trim();}
function aliases(){const m=adapter.match(/const SKILL_IDENTITY_ALIASES=Object.freeze\((\{[\s\S]*?\})\);/);return m?vm.runInNewContext('('+m[1]+')',{}, {timeout:1000}):{};}
function syntheticSkills(){return [
 {id:6,name:'通常弾・通常矢強化',kind:'weapon',ranks:[{level:1},{level:2},{level:3}]},
 {id:14,name:'体術',kind:'armor',ranks:[{level:1},{level:2},{level:3}]},
 {id:72,name:'攻撃',kind:'weapon',ranks:[{level:1},{level:2},{level:3}]},
 {id:3,name:'見切り',kind:'weapon',ranks:[{level:1},{level:2},{level:3}]},
 {id:154,name:'フルチャージ',kind:'armor',ranks:[{level:1},{level:2},{level:3}]},
 {id:900001,name:'SYNTHETIC_SET_PARENT',kind:'set',ranks:[{level:1,name:'SYNTHETIC_BONUS_I',setPiecesRequired:2},{level:2,name:'SYNTHETIC_BONUS_II',setPiecesRequired:4}]}
];}
function input(){return {weapon:{id:900002,gameId:900003,kind:'great-sword',specials:[],skills:[]},stats:{activeBonusEffects:[]},target:{monster:'training-room',part:'training-front'},trainingRoom:{parts:[{id:'training-front',multipliers:{slash:.5,blunt:.5,pierce:.5,fire:0,water:0,thunder:0,ice:0,dragon:0}}]},techniqueIds:[],skills:[],conditions:{}};}
function load(records=syntheticSkills()){
 const db={skills:structuredClone(records)},calls={pipeline:0};
 const sandbox={__getBetaDB:()=>db,damageFromParams:()=>{throw Error('DAMAGE_MUST_NOT_RUN');},MHWWeaponMaxSharpness:{},HimmelRealOneHitPipeline:()=>{calls.pipeline++;throw Error('PIPELINE_MUST_NOT_RUN');}};
 vm.runInNewContext(adapter,sandbox,{filename:'actual-public-adapter.js',timeout:1000});
 return {db,calls,evaluate:value=>plain(sandbox.MHWRealOneHitBrowserAdapter.evaluateCurrent(value))};
}
function classify(entry,records=syntheticSkills()){
 // Unmodified production classifier, extracted with unique boundaries. This
 // observes metadata selection without exporting or changing production code.
 const code=[adapter.includes('const SKILL_IDENTITY_ALIASES=')?section(' const SKILL_IDENTITY_ALIASES=',' const CONDITIONAL_AFFINITY_SKILLS='):'',section(' const CONDITIONAL_AFFINITY_SKILLS=',' function fail('),adapter.includes('const inputRecord=')?declaration('const inputRecord='):'',section('  const classifySkill=','  const rawSkills='),'classifySkill(entry,"SYNTHETIC_SOURCE")'].join('\n');
 return vm.runInNewContext(code,{root:{__getBetaDB:()=>({skills:records})},entry},{timeout:1000});
}
function raw(a,value={skill:{id:6,name:'通常弾・通常矢強化'},level:1}){a.weapon.skills=[value];return a;}
function bonus(){return {name:'SYNTHETIC_BONUS_I',bonusSkillId:900001,bonusName:'SYNTHETIC_SET_PARENT',source:'series',rankLevel:1,level:1,required:2,count:2};}
function accepted(value,records){const h=load(records),r=h.evaluate(value);assert.equal(r.status,'UNAVAILABLE');assert.equal(r.reason,'REAL_SLICE:TECHNIQUE_NOT_SELECTED','valid ingress must reach downstream nonnumeric sentinel');assert.equal(h.calls.pipeline,0);}
function rejected(value,reason,records){const h=load(records);let r;assert.doesNotThrow(()=>{r=h.evaluate(value);});assert.equal(r.status,'UNAVAILABLE');assert.match(r.reason,reason);assert.equal(h.calls.pipeline,0);}
module.exports={adapter,root,aliases,plain,syntheticSkills,input,load,classify,raw,bonus,accepted,rejected};
