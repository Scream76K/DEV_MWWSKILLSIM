'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPipeline}=require('./pipeline.cjs'),{datum}=require('./min2-contract.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const input=raw=>({schemaVersion:'v10-min2',build:{raw},target:{id:'training',hitZoneKey:'head'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'s',techniqueIds:['m'],duration:1}});
test('failure in A maximum effect resolution preserves source reason and other channels',()=>{
 const p=createPipeline({versions,openDataSnapshot:()=>({versions,resolveBuild:s=>({weaponType:'bow',dbVersion:'e',source:'DB',equipment:{ids:['w'],trueAttack:datum('known',s.raw),displayElement:datum('known',0),baseAffinity:datum('known',0)},skills:{entries:[]},issues:[{code:'MHDB_DIAGNOSTIC'}]}),readTechnique:(id,v)=>({id,dataVersion:v,revision:'r',definitionStatus:'defined',events:[{type:'hit',components:[{id:'x',kind:'raw',source:'DB',unit:'MV',coefficient:2}]}]}),resolveEffects:(build,_conditions,ch)=>{if(build.trueAttack===10&&ch==='maximum')throw Error('A_MAX_EFFECT_SOURCE_MISSING');return []}}),initialState:()=>({}),handlers:{bow:()=>({emit:['x'],inactive:[],unresolved:[]})},formulae:{raw:({coefficient})=>({status:'available',value:coefficient})}});
 const r=p.compare(input(10),input(20));
 assert.equal(r.a.channels.normal.metrics.comboTotalDamage.value,2);
 assert.equal(r.a.channels.maximum.metrics.comboTotalDamage.status,'unavailable');
 assert.match(JSON.stringify(r.a.channels.maximum.issues),/A_MAX_EFFECT_SOURCE_MISSING/);
 assert.equal(r.b.channels.maximum.metrics.comboTotalDamage.value,2);
 assert.equal(r.a.diagnostics[0].code,'MHDB_DIAGNOSTIC');
 assert.equal(r.b.diagnostics[0].code,'MHDB_DIAGNOSTIC');
});
