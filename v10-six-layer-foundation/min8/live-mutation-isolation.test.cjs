'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {datum}=require('./min2-contract.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const request=raw=>({schemaVersion:'v10-min2',build:{raw},target:{id:'training',hitZoneKey:'head'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'decorative',techniqueIds:['move'],duration:2}});
test('A mutation of live DB cannot change B snapshot, units, or provenance',()=>{
 const live={versions:{...versions},equipment:{attack:10},techniques:{move:{id:'move',revision:'r1',dataVersion:'t',definitionStatus:'defined',events:[{type:'hit',components:[{id:'hit',kind:'physical',unit:'MV',source:'original',coefficient:4}]}]}},effects:{bonus:2}};
 let captures=0,formulas=0;
 const provider=createImmutableProvider({
  capture:()=>{captures++;return live},
  resolveBuild:(input,eq)=>({weaponType:'charge-blade',dbVersion:'e',source:'MHDB',equipment:{ids:['w'],trueAttack:datum('known',input.raw+eq.attack),displayElement:datum('known',0),baseAffinity:datum('known',0)},skills:{entries:[]}}),
  resolveEffects:(_build,_conditions,_channel,effectData)=>[{id:'boost',target:'physical',stage:'coefficient',unit:'MV',amount:effectData.bonus,operation:'add',order:1,source:'effects',condition:{type:'always'}}]
 });
 const pipe=createPipeline({versions,openDataSnapshot:provider,initialState:()=>({}),handlers:{'charge-blade':()=>({emit:['hit'],inactive:[],unresolved:[]})},formulae:{physical:({coefficient})=>{formulas++;if(formulas===1){live.equipment.attack=1000;live.techniques.move.events[0].components[0].coefficient=100;live.techniques.move.events[0].components[0].source='changed';live.effects.bonus=90;}return {status:'available',value:coefficient};}}});
 const r=pipe.compare(request(1),request(2));
 assert.equal(captures,1);
 assert.equal(r.a.channels.normal.metrics.comboTotalDamage.value,6);
 assert.equal(r.b.channels.normal.metrics.comboTotalDamage.value,6);
 assert.equal(r.b.channels.maximum.components[0].source,'original');
 assert.equal(r.b.channels.maximum.components[0].coefficientUnit,'MV');
 assert.equal(r.relative.normal.comboTotalDamage.status,'available');
});
