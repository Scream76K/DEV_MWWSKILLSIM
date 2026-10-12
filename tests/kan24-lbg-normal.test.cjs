const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(c);vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,normal=require('../bowgun-normal-reference.js');
const input=level=>({weaponKind:'light-bowgun',attack:200,affinity:20,criticalMultiplier:1.31,physicalHitzone:45,normalUp:0,firstShot:0,forceShot:0,state:{ammoType:'NORMAL',ammoLevel:level,range:'CRITICAL',normalModeLevel:0,shotMode:'NORMAL',contactPolicy:'ALL_THREE'}});
test('LBG each of three contacts uses whole source MV and one DB-owned physical modifier',()=>{
 const rules=e.get('light-bowgun','LBG_NORMAL_REFERENCE_RULES');assert.ok(rules,'LBG DB-owned reference rules required');assert.equal(rules.specialSourceValues.weaponPhysicalModifier,.8);assert.equal(rules.verificationStatus,'UNVERIFIED');
 for(const [level,mv] of [[1,17],[2,23.8]]){const r=normal.shot(input(level),e);assert.equal(r.trace.length,3);assert.ok(r.trace.every(h=>h.mv===mv&&h.weaponPhysicalModifier===.8));assert.ok(Math.abs(r.physical-200*mv/100*.45*.8*(1+.2*.31)*3)<1e-10);assert.equal(r.weaponApplicability,'UNVERIFIED');assert.equal(r.ammoCapacityVerified,false);assert.equal(r.element,0);}
});
test('LBG rejects unresolved level mode range and shot skills instead of incomplete totals',()=>{
 for(const change of [{ammoLevel:3},{range:'NEAR'},{range:'FAR'},{normalModeLevel:1},{shotMode:'RAPID'},{shotMode:'CHASE'},{shotMode:'MOUNTED'},{shotMode:null},{contactPolicy:null}]){const o=input(1);Object.assign(o.state,change);assert.throws(()=>normal.shot(o,e),/LBG_NORMAL:/);}
 for(const skill of ['normalUp','firstShot','forceShot']){const o=input(1);o[skill]=1;assert.throws(()=>normal.shot(o,e),/LBG_NORMAL:UNREVIEWED_SKILL/);}
});
test('HBG normal formula and scoped LBG compatibility view retain original numerical results',()=>{
 const o=input(2);delete o.weaponKind;const r=normal.shot(o,e);assert.equal(r.physical,200*23.8/100*.45*(1+.2*.31)*3);assert.equal(r.trace[0].techniqueId,'HBG_NORMAL_AMMO_2');assert.equal(vm.runInContext('BOWGUN_AMMO_NUMERIC.lbg.normalPhysical',c),.8);
 assert.equal(e.get('light-bowgun','LBG_NORMAL_AMMO_3').specialSourceValues.mvPerHit,32.3);
});
