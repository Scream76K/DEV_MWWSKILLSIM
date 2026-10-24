'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {createPipeline}=require('./engine.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const request=(id,raw)=>({build:{raw},conditions:{},target:{id:'training'},evaluation:{kind:'combo',techniqueIds:[id],duration:1}});
test('prepared A/B keys share fixed DB data even if provider mutates later',()=>{
 let revision=1, reads=0, builds=0,effects=0;
 const p=createPipeline({versions,openDataSnapshot:()=>({versions,
 readTechnique:(id,v)=>{reads++;return {id,dataVersion:v,revision:'r'+revision,definitionStatus:'defined',events:[{type:'hit',components:[{id:'c',kind:'raw',unit:'MV',source:'DB',coefficient:revision}]}]};},
 resolveBuild:raw=>{builds++;return {weaponType:'bow',trueAttack:raw.raw,element:0,affinity:0};},
 resolveEffects:()=>{effects++;return [];}
 }),initialState:()=>({}),handlers:{bow:()=>({emit:['c'],inactive:[],unresolved:[]})},formulae:{raw:({coefficient})=>({status:'available',value:coefficient})}});
 const s=p.session();const a=request('a',10),b=request('b',20);
 const prepared=s.prepare([a,b]);assert.equal(prepared.keys.techniques,2);
 revision=999;
 const ra=p.evaluate(a,s),rb=p.evaluate(b,s);
 assert.equal(ra.channels.normal.metrics.comboTotalDamage.value,1);
 assert.equal(rb.channels.normal.metrics.comboTotalDamage.value,1);
 assert.equal(reads,2);assert.equal(builds,2);assert.equal(effects,4);
});
test('sealed session rejects unprepared technique key without silent lookup',()=>{
 let reads=0;const p=createPipeline({versions,openDataSnapshot:()=>({versions,readTechnique:id=>{reads++;return {id,dataVersion:'t',revision:'r',definitionStatus:'defined',events:[] ,explicitNoOp:true};},resolveBuild:()=>({weaponType:'bow',trueAttack:1,element:0,affinity:0}),resolveEffects:()=>[]}),initialState:()=>({}),handlers:{bow:()=>({})},formulae:{}});
 const s=p.session();s.prepare([request('a',1)]);
 const r=p.safeEvaluate(request('unprepared',1),s);
 assert.equal(r.status,'FAILED');assert.match(r.reason,/SNAPSHOT_UNPREPARED_KEY/);assert.equal(reads,1);
});
test('prepare seals session and cannot be reused to introduce new keys',()=>{
 const p=createPipeline({versions,openDataSnapshot:()=>({versions,readTechnique:(id,v)=>({id,dataVersion:v,revision:'r',definitionStatus:'defined',events:[],explicitNoOp:true}),resolveBuild:()=>({weaponType:'bow',trueAttack:1,element:0,affinity:0}),resolveEffects:()=>[]}),initialState:()=>({}),handlers:{},formulae:{}});
 const s=p.session();s.prepare([request('a',1)]);assert.throws(()=>s.prepare([request('b',2)]),/SNAPSHOT_ALREADY_SEALED/);
});
