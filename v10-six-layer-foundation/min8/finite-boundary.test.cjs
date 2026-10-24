'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPipeline}=require('./engine.cjs');
const version={game:'g',equipment:'e',technique:'t',effects:'fx'};
function run({coefficients=[1],duration=1,value,fx=[]}={}){
 const p=createPipeline({versions:version,openDataSnapshot:()=>({versions:version,resolveBuild:()=>({weaponType:'bow',trueAttack:1,element:0,affinity:0}),resolveEffects:()=>fx,readTechnique:(id,v)=>({id,dataVersion:v,revision:'r',definitionStatus:'defined',events:[{type:'hit',components:coefficients.map((coefficient,i)=>({id:'c'+i,kind:'raw',coefficient,unit:'MV',source:'DB'}))}]})}),initialState:()=>({}),handlers:{bow:({event})=>({emit:event.components.map(c=>c.id),inactive:[],unresolved:[]})},formulae:{raw:({coefficient})=>({status:'available',value:value??coefficient})}});
 return p.evaluate({build:{},target:{},conditions:{},evaluation:{kind:'combo',techniqueIds:['move'],duration}});
}
test('finite components with overflowing sum yield unavailable total',()=>{const r=run({coefficients:[1e308,1e308]});assert.equal(r.channels.normal.metrics.comboTotalDamage.reason,'TOTAL_NON_FINITE');assert.equal(r.channels.normal.metrics.comboDps.status,'unavailable')});
test('finite total and tiny positive time yield unavailable DPS only',()=>{const r=run({coefficients:[100],duration:Number.MIN_VALUE});assert.equal(r.channels.normal.metrics.comboTotalDamage.value,100);assert.equal(r.channels.normal.metrics.comboDps.reason,'DPS_NON_FINITE')});
test('valid tiny components preserve separate channel numeric values',()=>{const r=run({coefficients:[1,2],duration:2});assert.equal(r.channels.normal.metrics.comboTotalDamage.value,3);assert.equal(r.channels.maximum.metrics.comboDps.value,1.5)});
test('nonfinite common effect result cannot be accepted',()=>{const fx=[{id:'m',target:'raw',stage:'coefficient',operation:'multiply',unit:'dimensionless',amount:1e308,source:'DB',order:1,condition:{type:'always'}}];const r=run({coefficients:[1e308],fx});assert.equal(r.channels.normal.metrics.comboTotalDamage.status,'unavailable')});
