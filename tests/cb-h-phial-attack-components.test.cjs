'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const segment=(from,to)=>{
 const a=html.indexOf(from),b=html.indexOf(to,a);
 assert.ok(a>=0&&b>a,'missing function boundary '+from);
 return html.slice(a,b);
};
test('H-only shield thrust phial is accepted without changing other routes',()=>{
 const source=segment('function chargeBladePhialCountEvidence(','// r240: read-only audit');
 const context={
  window:{MHCBHRouteRule:{status:'OWNER_APPROVED_PROVISIONAL',prefixIds:['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST'],shieldPhialCount:1,source:'approved-source'}},
  CHARGE_BLADE_EVIDENCE:{phialEvents:{CB_SHIELD_THRUST:{status:'CANDIDATE',count:null}}},
  CHARGE_BLADE_PROVISIONAL_PHIAL_COUNTS:{}
 };
 const f=Function('ctx','with(ctx){return ('+source+');}')(context);
 assert.equal(f('CB_SHIELD_THRUST',{profileId:'CB_STANDARD_AED_ROUTE_H',shieldBoosted:true}).count,1);
 assert.equal(f('CB_SHIELD_THRUST',{profileId:'CB_STANDARD_RELEASE_ROUTE_R',shieldBoosted:true}),null);
 assert.equal(f('CB_SHIELD_THRUST',{profileId:'CB_STANDARD_AED_ROUTE_H',shieldBoosted:false}),null);
});
test('saved CB stats carry verified attack breakdown and reject mismatched attack',()=>{
 const source=segment('function chargeBladeStatsFromCalcState(','function resolveSnapshotStatsForComparison(');
 const f=Function('bonusDamagePendingReason','equipmentHpElement',
  source+';return chargeBladeStatsFromCalcState;')(()=>null,st=>st.element);
 const st={attackTrue:203,affinity:20,maxAffinity:80,element:120,
  attackComponents:{weaponBase:200,normalMultiplier:1,normalFlat:3}};
 const cond={hz:0.45,ehz:0.2,sharp:1.32,esharp:1.15};
 assert.equal(f(st,cond).attackComponents.normalFlat,3);
 assert.throws(()=>f({...st,attackComponents:{...st.attackComponents,normalFlat:7}},cond),/CB_ATTACK_COMPONENTS_MISMATCH/);
});
test('profile passes its own scope to component resolver and checks totals',()=>{
 const source=segment('function chargeBladeResolveProfileDamage(','function chargeBladeComparisonResult(');
 const ids=['CB_AXE_TO_SWORD_MORPH','CB_SHIELD_THRUST'];
 let seen=[];
 const context={CHARGE_BLADE_STANDARD_PROFILES:{AED_ROUTE:{id:'CB_STANDARD_AED_ROUTE_H',techniqueIds:ids}},
  CHARGE_BLADE_ENGINE_VERSION:'test',chargeBladeResolveTechniqueDamage:(id,stats,state)=>{
   seen.push(state.profileId);
   return {techniqueId:id,total:10,physical:6,element:3,special:1};
  }};
 const f=Function('ctx','with(ctx){return ('+source+');}')(context);
 assert.equal(f('AED_ROUTE',{},{}).total,20);
 assert.deepEqual(seen,['CB_STANDARD_AED_ROUTE_H','CB_STANDARD_AED_ROUTE_H']);
 context.chargeBladeResolveTechniqueDamage=()=>({techniqueId:'CB_SHIELD_THRUST',total:10,physical:6,element:undefined,special:1});
 assert.throws(()=>f('AED_ROUTE',{},{}),/PROFILE_COMPONENT/);
});
