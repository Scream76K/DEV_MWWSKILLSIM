'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {createPipeline}=require('./engine.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const request=()=>({build:{id:'b'},target:{id:'training'},conditions:{},evaluation:{techniqueIds:['move'],duration:2}});
function fixture({events,state,handler,effects=[],snapshotVersions=versions}){
 const p=createPipeline({versions,openDataSnapshot:()=>({
  versions:snapshotVersions,readTechnique:(id,v)=>({id,revision:'r1',dataVersion:v,definitionStatus:'defined',events}),
  resolveBuild:()=>({weaponType:'great-sword',trueAttack:10,element:0,affinity:0}),resolveEffects:()=>effects
 }),initialState:()=>structuredClone(state),handlers:{'great-sword':handler},formulae:{physical:()=>({status:'available',value:1e308})}});
 return p;
}
function transition(operations){return [{type:'transition',operations},{type:'hit',components:[{id:'c',kind:'physical',unit:'MV',source:'db',coefficient:1}]}]}
const hit={type:'hit',components:[{id:'c',kind:'physical',unit:'MV',source:'db',coefficient:1}]};
test('numeric/string alias self transfers reject in both directions and keep source resource unchanged',()=>{
 for(const [from,to] of [[0,'0'],['0',0]]){
  const p=fixture({state:{stock:[3]},events:transition([{op:'transfer',path:['stock',from],to:['stock',to],amount:'all'}]),handler:({event,state})=>event.type==='hit'?{emit:['c'],inactive:[],unresolved:[]}:{nextState:{stock:[6]}}});
  const r=p.evaluate(request());
  for(const ch of ['normal','maximum']){
   a.equal(r.channels[ch].execution.reason,'TRANSFER_TARGET_INVALID');
   a.deepEqual(r.channels[ch].finalState.stock,[3]);
   a.equal(r.channels[ch].metrics.comboTotalDamage.status,'unavailable');
   a.equal(r.channels[ch].metrics.comboDps.status,'unavailable');
  }
 }
});
test('duplicate alias add/set targets reject',()=>{
 const p=fixture({state:{stock:[3]},events:transition([{op:'add',path:['stock',0],amount:1},{op:'set',path:['stock','0'],value:5}]),handler:()=>({nextState:{stock:[5]}})});
 const r=p.evaluate(request());a.equal(r.channels.normal.execution.reason,'TRANSITION_DUPLICATE_PATH');a.deepEqual(r.channels.normal.finalState.stock,[3]);
});
test('unrelated null to NaN and undefined additions cannot masquerade as expected state',()=>{
 for(const flag of [NaN,undefined]){
  const p=fixture({state:{gauge:0,flag:null},events:transition([{op:'add',path:['gauge'],amount:1}]),handler:()=>({nextState:{gauge:1,flag}})});
  const r=p.evaluate(request());
  for(const ch of ['normal','maximum']){a.equal(r.channels[ch].metrics.comboTotalDamage.status,'unavailable');a.deepEqual(r.channels[ch].finalState,{gauge:0,flag:null});}
 }
});
test('semantic snapshot versions accept key reordering and reject value changes',()=>{
 const reordered={effects:'fx',technique:'t',equipment:'e',game:'g'};
 const ready=fixture({state:{gauge:0},events:[hit],snapshotVersions:reordered,handler:()=>({emit:['c'],inactive:[],unresolved:[]})});
 a.equal(ready.evaluate(request()).channels.normal.execution.status,'complete');
 const bad=fixture({state:{gauge:0},events:[hit],snapshotVersions:{...reordered,game:'different'},handler:()=>({emit:['c'],inactive:[],unresolved:[]})});
 a.match(bad.safeEvaluate(request()).reason,/SNAPSHOT_VERSION_MISMATCH/);
});
test('post damage multiplication overflow never rescued by subsequent cap',()=>{
 const effects=[{id:'multiply',target:'physical',stage:'damage',operation:'multiply',amount:1e308,unit:'dimensionless',order:1,source:'db',condition:{type:'always'}},{id:'cap',target:'physical',stage:'damage',operation:'cap',amount:100,unit:'damage',order:2,source:'db',condition:{type:'always'}}];
 const p=fixture({state:{gauge:0},events:[hit],effects,handler:()=>({emit:['c'],inactive:[],unresolved:[]})});
 const r=p.evaluate(request());
 for(const ch of ['normal','maximum']){a.equal(r.channels[ch].execution.reason,'POST_DAMAGE_NON_FINITE');a.equal(r.channels[ch].metrics.comboTotalDamage.status,'unavailable');}
});
