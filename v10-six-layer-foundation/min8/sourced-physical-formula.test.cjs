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
 a.equal(setup(known(1),known(40),known(1.1))(args).reason,'PHYSICAL_PART_MODIFIER_UNSUPPORTED');
});
test('unsupported affinity and skill states fail closed',()=>{
 a.equal(setup()({...args,stats:{...args.stats,affinity:15}}).reason,'PHYSICAL_AFFINITY_UNSUPPORTED');
 a.equal(setup()({...args,build:{skills:{entries:[{id:'some-skill'}]}}}).reason,'PHYSICAL_SKILLS_UNSUPPORTED');
});
