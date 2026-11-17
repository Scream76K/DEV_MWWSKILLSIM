const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(require('../tools/element-vm-test-setup.cjs').register(c));vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,generic=c.window.BuildComparisonEngine.genericProfileDamage,handler=require('../gunlance-shell-reference.js');
const input=action=>({action,weaponBaseAttack:200,state:{shellingType:'NORMAL',shellingPower:'MEDIUM',loadedRounds:6,chargedRounds:2,fireHitzone:20},unreviewedSkills:[]});

for(const [type,base] of [['NORMAL',6],['LONG',3],['WIDE',2]])test('Load Shells Lv2 '+type+' adds capacity without filling stock or changing per-hit damage',()=>{const o=input('NORMAL');o.state.shellingType=type;o.state.loadedRounds=base;const before=handler.calculate(o,e,generic);o.loadShellsLevel=2;o.state.loadedRounds=base+1;const single=handler.calculate(o,e,generic);assert.equal(single.total,before.total);assert.equal(single.remainingRounds,base);o.action='FULL_BURST';const burst=handler.calculate(o,e,generic);assert.equal(burst.trace.length,base+1);assert.equal(burst.remainingRounds,0);o.state.loadedRounds=base+2;assert.throws(()=>handler.calculate(o,e,generic),/LOADED_ROUNDS/);o.state.loadedRounds=1;assert.equal(handler.calculate(o,e,generic).trace.length,1);});
// MHDB109 rank1 changes timing only; timing is outside this HP calculation.
test('Load Shells Lv1 preserves capacity, stock and per-hit damage',()=>{
 const rule=e.get('gunlance','GL_SHELL_NORMAL_MEDIUM').specialSourceValues.p0ReferenceRules.loadShellsReference;
 assert.deepEqual(Array.from(rule.supportedLevels),[0,1,2]);assert.equal(rule.levelOneDisposition,'TIMING_ONLY_NO_CAPACITY_OR_HP_CHANGE');assert.equal(rule.levelOneEvidenceRef,'MHDB_JA_SKILLS_20261026:109:rank1');
 for(const[type,capacity]of [['NORMAL',6],['LONG',3],['WIDE',2]])for(const action of ['NORMAL','CHARGED','FULL_BURST']){
  const o=input(action);o.state.shellingType=type;o.state.loadedRounds=capacity;
  const before=handler.calculate(o,e,generic),r=handler.calculate({...o,loadShellsLevel:1},e,generic);
  assert.equal(r.capacity,capacity);assert.equal(r.total,before.total);assert.deepEqual(r.trace,before.trace);assert.equal(r.remainingRounds,before.remainingRounds);assert.equal(r.consumedRounds,before.consumedRounds);
 }
});
test('invalid Load Shells levels remain withheld',()=>{for(const level of [-1,3,NaN,.5,'1'])assert.throws(()=>handler.calculate({...input('NORMAL'),loadShellsLevel:level},e,generic),/GL_SHELL:LOAD_SHELLS_LEVEL_PENDING/);});
test('Load Shells Lv2 and adopted artillery full burst do not auto-fill added capacity',()=>{
 const o=input('FULL_BURST'),before=handler.calculate({...o,loadShellsLevel:2},e,generic),r=handler.calculate({...o,loadShellsLevel:2,artilleryLevel:1,normalAttackComponents:{weaponBase:200,normalMultiplier:1,normalFlat:0}},e,generic);
 assert.equal(r.capacity,7);assert.equal(r.trace.length,6);assert.equal(r.consumedRounds,6);assert.equal(r.remainingRounds,0);assert.ok(Math.abs(r.physical-before.physical*1.05)<1e-9);assert.ok(Math.abs(r.element-before.element-6*3*.2)<1e-9);assert.equal(r.verificationStatus,'UNVERIFIED');
});
