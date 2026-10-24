'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {createPipeline}=require('./pipeline.cjs');
const {datum}=require('./min2-contract.cjs');
const versions={game:'g',equipment:'e',technique:'t',effects:'fx'};
const request=()=>({schemaVersion:'v10-min2',build:{raw:10},target:{id:'training',hitZoneKey:'head'},conditions:{},evaluation:{mode:'combo',kind:'combo',signature:'review',techniqueIds:['m'],duration:2}});
const resolved=s=>({weaponType:'great-sword',dbVersion:'e',source:'MHDB',equipment:{ids:['w'],trueAttack:datum('known',s.raw),displayElement:datum('known',0),baseAffinity:datum('known',0)},skills:{entries:[]}});
const hit={type:'hit',components:[{id:'c',kind:'physical',unit:'MV',source:'Technique DB',coefficient:2}]};
function setup({events=[hit],state={gauge:0,flag:null},handler=()=>({emit:['c'],inactive:[],unresolved:[]}),effects=[],snapshotVersions={effects:'fx',game:'g',technique:'t',equipment:'e'},formulaValue=2}={}){
 return createPipeline({versions,openDataSnapshot:()=>({versions:snapshotVersions,resolveBuild:resolved,resolveEffects:()=>effects,
 readTechnique:(id,v)=>({id,dataVersion:v,revision:'r',definitionStatus:'defined',events})}),
 initialState:()=>structuredClone(state),handlers:{'great-sword':handler},
 formulae:{physical:()=>({status:'available',value:formulaValue})}});
}
const transition=operations=>[{type:'transition',operations},hit];
test('public single evaluation and A/B comparison accept reordered equal versions',()=>{
 const p=setup(),single=p.evaluate(request()),comp=p.compare(request(),request());
 a.equal(single.channels.normal.execution.status,'complete');
 a.equal(comp.a.channels.normal.execution.status,'complete');
 a.equal(comp.b.channels.maximum.execution.status,'complete');
 const rejected=setup({snapshotVersions:{game:'other',equipment:'e',technique:'t',effects:'fx'}}).compare(request(),request());
 a.equal(rejected.a.status,'FAILED');a.equal(rejected.b.status,'FAILED');
});
test('public comparison rejects self transfer aliases without mutating other channels',()=>{
 for(const [from,to] of [[0,'0'],['0',0]]){
  const p=setup({state:{stock:[3]},events:transition([{op:'transfer',path:['stock',from],to:['stock',to],amount:'all'}]),
   handler:({event})=>event.type==='transition'?{nextState:{stock:[6]}}:{emit:['c'],inactive:[],unresolved:[]}});
  const r=p.compare(request(),request());
  for(const build of [r.a,r.b])for(const channel of ['normal','maximum']){
   const result=build.channels[channel];a.equal(result.execution.reason,'TRANSFER_TARGET_INVALID');
   a.deepEqual(result.finalState,{stock:[3]});a.equal(result.metrics.comboTotalDamage.status,'unavailable');
  }
 }
});
test('public channels preserve state when handler changes unrelated fields',()=>{
 const p=setup({events:transition([{op:'add',path:['gauge'],amount:1}]),
 handler:({channel,event})=>event.type==='hit'?{emit:['c'],inactive:[],unresolved:[]}:
 {nextState:channel==='normal'?{gauge:1,flag:NaN}:{gauge:1,flag:null}}});
 const r=p.evaluate(request());
 a.equal(r.channels.normal.execution.status,'incomplete');
 a.deepEqual(r.channels.normal.finalState,{gauge:0,flag:null});
 a.equal(r.channels.maximum.execution.status,'complete');
 a.deepEqual(r.channels.maximum.finalState,{gauge:1,flag:null});
});
test('public damage effects refuse overflow before later cap',()=>{
 const effects=[{id:'mul',target:'physical',stage:'damage',operation:'multiply',amount:1e308,unit:'dimensionless',order:1,source:'DB',condition:{type:'always'}},
 {id:'cap',target:'physical',stage:'damage',operation:'cap',amount:100,unit:'damage',order:2,source:'DB',condition:{type:'always'}}];
 const p=setup({effects,formulaValue:1e308});const r=p.evaluate(request());
 for(const channel of ['normal','maximum']){a.equal(r.channels[channel].execution.reason,'POST_DAMAGE_NON_FINITE');a.equal(r.channels[channel].metrics.comboDps.status,'unavailable');}
});

test('public evaluation rejects undefined property addition and omission while preserving initial state',()=>{
 for(const after of [{gauge:1,flag:null,extra:undefined},{gauge:1}]){
  const p=setup({events:transition([{op:'add',path:['gauge'],amount:1}]),
   handler:({event})=>event.type==='hit'?{emit:['c'],inactive:[],unresolved:[]}:{nextState:after}});
  const result=p.evaluate(request());
  for(const ch of ['normal','maximum']){
   a.equal(result.channels[ch].execution.status,'incomplete');
   a.deepEqual(result.channels[ch].finalState,{gauge:0,flag:null});
   a.equal(result.channels[ch].metrics.comboTotalDamage.status,'unavailable');
  }
 }
});
test('public evaluation rejects duplicate transfer destination aliases atomically',()=>{
 const p=setup({state:{stock:[3,1]},events:transition([
  {op:'transfer',path:['stock',0],to:['stock',1],amount:1},
  {op:'set',path:['stock','1'],value:5}
 ]),handler:({event})=>event.type==='hit'?{emit:['c'],inactive:[],unresolved:[]}:
  {nextState:{stock:[2,5]}}});
 const r=p.evaluate(request());
 for(const ch of ['normal','maximum']){
  a.equal(r.channels[ch].execution.reason,'TRANSITION_DUPLICATE_PATH');
  a.deepEqual(r.channels[ch].finalState,{stock:[3,1]});
 }
});

test('legacy transition updates cannot mutate unrelated state',()=>{
 const p=setup({events:[{type:'transition',updates:{gauge:1}},hit],
 handler:({event})=>event.type==='hit'?{emit:['c'],inactive:[],unresolved:[]}:{nextState:{gauge:1,flag:NaN}}});
 const r=p.evaluate(request());
 for(const ch of ['normal','maximum']){
  a.equal(r.channels[ch].execution.status,'incomplete');
  a.deepEqual(r.channels[ch].finalState,{gauge:0,flag:null});
 }
});
