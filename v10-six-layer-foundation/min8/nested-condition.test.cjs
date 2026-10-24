'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPipeline}=require('./engine.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
function run(path,conditionValue){
 const p=createPipeline({versions,openDataSnapshot:()=>({versions,resolveBuild:()=>({weaponType:'bow',trueAttack:1,element:0,affinity:0}),readTechnique:(id,v)=>({id,dataVersion:v,revision:'r1',definitionStatus:'defined',events:[{type:'hit',components:[{id:'c',kind:'raw',coefficient:4,unit:'MV',source:'DB'}]}]}),resolveEffects:()=>[{id:'boost',target:'raw',stage:'coefficient',operation:'add',amount:2,unit:'MV',order:1,source:'DB',condition:{type:'state-equals',path,value:conditionValue}}]}),initialState:()=>({weapon:{charged:true}}),handlers:{bow:()=>({emit:['c'],inactive:[],unresolved:[]})},formulae:{raw:({coefficient})=>({status:'available',value:coefficient})}});
 return p.evaluate({build:{},target:{},conditions:{},evaluation:{kind:'combo',techniqueIds:['move'],duration:1}});
}
test('nested effect state condition applies at hit',()=>assert.equal(run(['weapon','charged'],true).channels.normal.metrics.comboTotalDamage.value,6));
test('missing nested condition becomes unavailable, not false',()=>assert.equal(run(['weapon','absent'],true).channels.normal.metrics.comboTotalDamage.status,'unavailable'));
test('dangerous prototype condition path blocked',()=>assert.equal(run(['__proto__','x'],true).channels.normal.metrics.comboTotalDamage.status,'unavailable'));
