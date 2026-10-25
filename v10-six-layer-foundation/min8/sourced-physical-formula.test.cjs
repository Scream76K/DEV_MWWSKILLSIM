'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {createSourcedPhysicalFormula}=require('./sourced-physical-formula.cjs');
const version='1.042.00.02';
const known=value=>({value,gameVersion:version,evidenceRef:'PINNED_SOURCE'});
const args={coefficient:23,coefficientUnit:'MV',parameters:{},target:{id:'training',hitZoneKey:'head'},stats:{attack:200,element:0,affinity:0},build:{skills:{entries:[]}},state:{}};
const setup=(sharp=known(1),hitzone=known(40),part=known(1))=>createSourcedPhysicalFormula({
 expectedGameVersion:version,
 resolveSharpness:()=>sharp,resolveHitzone:()=>hitzone,resolvePartModifier:()=>part,
 // Test spy: verifies input handoff only; this is NOT a game formula.
 calculate:input=>({p:input.mv})
});
test('sourced inputs reach existing damage formula without hardcoded normative MV',()=>{
 const r=setup()(args);a.deepEqual(r,{status:'available',value:23});
});
test('missing source or version refuses calculation',()=>{
 a.equal(setup({value:1,gameVersion:version})(args).reason,'PHYSICAL_SHARPNESS_UNRESOLVED');
 a.equal(setup(known(1),{...known(40),gameVersion:'unmatched'})(args).reason,'PHYSICAL_HITZONE_UNRESOLVED');
 a.deepEqual(setup(known(1),known(40),known(1.1))(args),{status:'available',value:23});
});
test('resolved affinity is delegated to the canonical formula; unknown skills are rejected by L3',()=>{
 a.deepEqual(setup()({...args,stats:{...args.stats,affinity:15}}),{status:'available',value:23});
 // The sourced Formula receives only already-resolved stats; unknown skill IDs are not its responsibility.
 a.deepEqual(setup()({...args,build:{skills:{entries:[{id:'some-skill'}]}}}),{status:'available',value:23});
});
test('hit parameters reach the hitzone resolver unchanged',()=>{
 let received=null;
 const formula=createSourcedPhysicalFormula({
  expectedGameVersion:version,
  resolveSharpness:()=>known(1),
  resolveHitzone:input=>{received=input;return known(40);},
  resolvePartModifier:()=>known(1),
  calculate:input=>({p:input.mv})
 });
 const parameters={damageType:'pierce',hitIndex:2};
 a.deepEqual(formula({...args,parameters}),{status:'available',value:23});
 a.deepEqual(received.parameters,parameters);
});
