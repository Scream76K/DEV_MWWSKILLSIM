const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,normal=require('../bowgun-normal-reference.js');
const input=level=>({weaponKind:'light-bowgun',attack:200,affinity:20,criticalMultiplier:1.31,physicalHitzone:45,normalUp:0,firstShot:0,forceShot:0,state:{ammoType:'NORMAL',ammoLevel:level,range:'CRITICAL',normalModeLevel:0,shotMode:'NORMAL',contactPolicy:'ALL_THREE'}});
test('LBG each of three contacts uses whole source MV and one DB-owned physical modifier',()=>{
 const rules=e.get('light-bowgun','LBG_NORMAL_REFERENCE_RULES');assert.ok(rules,'LBG DB-owned reference rules required');assert.equal(rules.specialSourceValues.weaponPhysicalModifier,.8);assert.equal(rules.verificationStatus,'UNVERIFIED');
 for(const [level,mv] of [[1,17],[2,23.8]]){const r=normal.shot(input(level),e);assert.equal(r.trace.length,3);assert.ok(r.trace.every(h=>h.mv===mv&&h.weaponPhysicalModifier===.8));assert.ok(Math.abs(r.physical-200*mv/100*.45*.8*(1+.2*.31)*3)<1e-10);assert.equal(r.weaponApplicability,'UNVERIFIED');assert.equal(r.ammoCapacityVerified,false);assert.equal(r.element,0);}
});
test('LBG rejects unresolved level mode range and invalid or underspecified shot skills',()=>{
 for(const change of [{ammoLevel:3},{range:'NEAR'},{range:'FAR'},{normalModeLevel:1},{shotMode:'RAPID'},{shotMode:'CHASE'},{shotMode:'MOUNTED'},{shotMode:null},{contactPolicy:null}]){const o=input(1);Object.assign(o.state,change);assert.throws(()=>normal.shot(o,e),/LBG_NORMAL:/);}
 // KAN24 source now explicitly connects NormalUp and the shared First/Force rules.
 for(const skill of ['firstShot','forceShot']){const o=input(1);o[skill]=1;assert.throws(()=>normal.shot(o,e),/HBG_NORMAL:SHOT_POSITION_PENDING/);}
 for(const [skill,level] of [['normalUp',2],['firstShot',4],['forceShot',-1],['firstShot',.5]]){const o=input(1);o[skill]=level;assert.throws(()=>normal.shot(o,e),/HBG_NORMAL:SKILL_LEVEL_INVALID/);}
});
test('HBG normal formula and scoped LBG compatibility view retain original numerical results',()=>{
 const o=input(2);delete o.weaponKind;const r=normal.shot(o,e);assert.equal(r.physical,200*23.8/100*.45*(1+.2*.31)*3);assert.equal(r.trace[0].techniqueId,'HBG_NORMAL_AMMO_2');assert.equal(vm.runInContext('BOWGUN_AMMO_NUMERIC.lbg.normalPhysical',c),.8);
 assert.equal(e.get('light-bowgun','LBG_NORMAL_AMMO_3').specialSourceValues.mvPerHit,32.3);
});

test('adopted LBG shot skills retain source-confirmed native three-contact coefficients',()=>{
 const base=normal.shot(input(1),e).physical,up={...input(1),normalUp:1};
 assert.ok(Math.abs(normal.shot(up,e).physical-base*1.05)<1e-10);
 for(const [skill,ordinal,attackAdd,affinityAdd] of [['firstShot',1,5,0],['forceShot',4,3,8],['forceShot',5,0,8],['firstShot',2,0,0]]){
  const o=input(1);o[skill]=1;Object.assign(o.state,{magazineCapacity:5,shotOrdinal:ordinal,fullMagazine:ordinal===1});
  const r=normal.shot(o,e),expected=(200+attackAdd)*17/100*.45*.8*(1+(20+affinityAdd)/100*.31)*3;
  assert.ok(Math.abs(r.physical-expected)<1e-10);assert.equal(r.trace.length,3);assert.equal(r.element,0);
  for(const h of r.trace){assert.equal(h.shotAttackAdd,attackAdd);assert.equal(h.shotAffinityAdd,affinityAdd);assert.equal(h.weaponPhysicalModifier,.8);}
  assert.equal(r.liveGameVerification,'PENDING');
 }
});
