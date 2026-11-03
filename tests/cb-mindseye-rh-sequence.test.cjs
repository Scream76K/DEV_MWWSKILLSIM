'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','hope-hammer-browser-adapter.js'),'utf8');
const start=source.indexOf('  // CB extra-hit Mind\'s Eye is source-adopted');
const end=source.indexOf('  const contextAttackEntries=',start);
assert.ok(start>=0&&end>start,'CB Mind\'s Eye rule boundary missing');
const segment=source.slice(start,end);
const R=['CB_ELEMENT_DISCHARGE_1','CB_ELEMENT_DISCHARGE_2','CB_AED','CB_FOLLOWUP_AED'];
const H=['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST','CB_AED','CB_FOLLOWUP_AED'];
const root={
  MHCbAedMindsEyeRule:{status:'OWNER_APPROVED_PROVISIONAL',techniqueId:'CB_AED',damageType:'slash',source:'adopted'},
  ChargeBladeEngine:{profiles:{RELEASE_ROUTE:{techniqueIds:R},AED_ROUTE:{techniqueIds:H}},
    techniques:{CB_AED:{axeBoostHits:{count:1,mv:12,elementModifier:0.2}}}}
};
const techniqueDb={get:()=>({hits:[{mv:68,elementModifier:1}]})};
const hit={mv:12,elementModifier:0.2,shieldBoostAxeBody:false,componentSource:'index.html:CHARGE_BLADE_TECHNIQUES.CB_AED.axeBoostHits'};
const t={techniqueId:'CB_AED',hits:[{mv:68,elementModifier:1},hit]};
const run=Function('root','resolvedTechniqueIds','weapon','chargeBladeState','techniqueDb','t',
  'const cbMindRuleFor=t=>[root.MHCbAedMindsEyeRule].find(r=>r?.techniqueId===t?.techniqueId);'+segment+';return cbMindEligible(t);');
test('ID136 adopted CB extra-hit allowed for R/H and isolated technique',()=>{
  for(const ids of [R,H,['CB_AED']])
    assert.equal(run(root,ids,{kind:'charge-blade'},{axeBoosted:true},techniqueDb,t),true);
});
test('ID136 extra-hit remains gated for unadopted sequence, wrong weapon, missing axe boost or malformed source',()=>{
  assert.equal(run(root,['CB_AED','CB_AED'],{kind:'charge-blade'},{axeBoosted:true},techniqueDb,t),false);
  assert.equal(run(root,R,{kind:'long-sword'},{axeBoosted:true},techniqueDb,t),false);
  assert.equal(run(root,R,{kind:'charge-blade'},{axeBoosted:false},techniqueDb,t),false);
  assert.equal(run(root,R,{kind:'charge-blade'},{axeBoosted:true},techniqueDb,{...t,hits:[t.hits[0],{...hit,componentSource:'unapproved'}]}),false);
});
