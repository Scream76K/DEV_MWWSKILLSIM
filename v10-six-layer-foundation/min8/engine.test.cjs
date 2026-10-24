'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {createPipeline}=require('./engine.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const request=()=>({build:{x:1},conditions:{},target:{id:'training'},evaluation:{techniqueIds:['m'],duration:2}});
const technique=(id,v)=>({id,revision:'r',dataVersion:v,definitionStatus:'defined',events:[{type:'hit',components:[{id:'c',kind:'physical',unit:'MV',source:'Technique DB',coefficient:5}]}]});
function setup(override={}){return createPipeline({versions,openDataSnapshot:()=>({versions,readTechnique:override.readTechnique||technique,resolveBuild:()=>({weaponType:'charge-blade',trueAttack:10,element:0,affinity:0}),resolveEffects:()=>[]}),initialState:()=>({charge:0}),handlers:{'charge-blade':()=>({emit:['c'],inactive:[],unresolved:[]})},formulae:{physical:({coefficient})=>({status:'available',value:coefficient})}});}
test('single run completes and aggregates once',()=>{const r=setup().evaluate(request());a.equal(r.channels.normal.metrics.comboTotalDamage.value,5);a.equal(r.channels.maximum.metrics.comboDps.value,2.5);});
test('DB record cached within shared session',()=>{let n=0;const p=setup({readTechnique:(id,v)=>{n++;return technique(id,v)}}),s=p.session();p.evaluate(request(),s);p.evaluate(request(),s);a.equal(n,1);});
test('source and units are engine-owned',()=>{const r=setup().evaluate(request());a.equal(r.channels.normal.components[0].source,'Technique DB');a.equal(r.channels.normal.components[0].coefficientUnit,'MV');a.equal(r.channels.normal.components[0].damageUnit,'damage');});
test('missing handler prevents fake zero',()=>{const p=createPipeline({versions,openDataSnapshot:()=>({versions,readTechnique:technique,resolveBuild:()=>({weaponType:'bow',trueAttack:10,element:0,affinity:0}),resolveEffects:()=>[]}),initialState:()=>({}),handlers:{},formulae:{}});a.equal(p.evaluate(request()).channels.normal.metrics.comboTotalDamage.reason,'EXECUTION_INCOMPLETE');});
