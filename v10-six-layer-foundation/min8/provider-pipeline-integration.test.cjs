'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createImmutableProvider}=require('./immutable-provider.cjs');
const {createPipeline}=require('./pipeline.cjs');
const {datum}=require('./min2-contract.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const request=raw=>({schemaVersion:'v10-min2',build:{raw},target:{id:'training',hitZoneKey:'head'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'cosmetic',techniqueIds:['move'],duration:2}});
function setup(){
 const mutable={versions:{...versions},equipment:{attack:10},techniques:{move:{id:'move',revision:'r1',dataVersion:'t',definitionStatus:'defined',events:[{type:'hit',components:[{id:'hit0',kind:'physical',unit:'MV',source:'Technique DB',coefficient:4}]}]}},effects:{bonus:2}};
 let captureCount=0;
 const open=createImmutableProvider({
  capture:()=>{captureCount++;return mutable},
  resolveBuild:(input,db)=>({weaponType:'charge-blade',dbVersion:'e',source:'MHDB',equipment:{ids:['weapon1'],trueAttack:datum('known',input.raw+db.attack),displayElement:datum('known',0),baseAffinity:datum('known',0)},skills:{entries:[]},extensions:{phials:3},issues:[]}),
  resolveEffects:(_build,_conditions,_channel,db)=>[{id:'boost',target:'physical',stage:'coefficient',unit:'MV',operation:'add',amount:db.bonus,order:1,source:'effects',condition:{type:'always'}}]
 });
 const pipeline=createPipeline({versions,openDataSnapshot:open,initialState:()=>({phials:3}),handlers:{'charge-blade':()=>({emit:['hit0'],inactive:[],unresolved:[]})},formulae:{physical:({coefficient})=>({status:'available',value:coefficient})}});
 return {mutable,pipeline,count:()=>captureCount};
}
test('single snapshot shared across A/B, including equipment, technique and effects',()=>{
 const {pipeline,count}=setup(),r=pipeline.compare(request(1),request(2));
 assert.equal(count(),1);
 assert.equal(r.a.channels.normal.metrics.comboTotalDamage.value,6);
 assert.equal(r.b.channels.maximum.metrics.comboTotalDamage.value,6);
 assert.equal(r.a.channels.normal.metrics.comboTotalDamage.status,'available');
});
test('A invalid input still allows B calculation with one captured source view',()=>{
 const {pipeline,count}=setup(),r=pipeline.compare({},request(2));
 assert.equal(count(),1);
 assert.equal(r.a.status,'FAILED');
 assert.equal(r.b.channels.normal.metrics.comboTotalDamage.value,6);
});
test('different durations preserve damage comparison and reject DPS comparison',()=>{
 const {pipeline}=setup(),a=request(1),b=request(2);b.evaluation.duration=5;
 const r=pipeline.compare(a,b);
 assert.equal(r.relative.normal.comboTotalDamage.status,'available');
 assert.equal(r.relative.normal.comboDps.reason,'NOT_COMPARABLE');
});
