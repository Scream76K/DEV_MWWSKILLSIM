const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),c={window:{}};vm.createContext(require('../tools/element-vm-test-setup.cjs').register(c));vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,generic=c.window.BuildComparisonEngine.genericProfileDamage,handler=require('../gunlance-shell-reference.js');
const input=action=>({action,weaponBaseAttack:200,state:{shellingType:'NORMAL',shellingPower:'MEDIUM',loadedRounds:6,chargedRounds:2,fireHitzone:20},unreviewedSkills:[]});

// gunlance-shell-reference.js requires weaponBase * normalMultiplier + normalFlat
// to reproduce weaponBaseAttack; this fixture has 200 base attack and no bonuses.
for(const type of ['NORMAL','LONG','WIDE'])for(const level of [1,2,3])test('Artillery '+type+' Lv'+level+' normal only adds displayed fire before common conversion',()=>{const o=input('NORMAL');o.state.shellingType=type;o.state.loadedRounds={NORMAL:6,LONG:3,WIDE:2}[type];const base=handler.calculate(o,e,generic);const r=handler.calculate({...o,artilleryLevel:level,normalAttackComponents:{weaponBase:200,normalMultiplier:1,normalFlat:0}},e,generic);assert.ok(Math.abs(r.physical-base.physical*[1,1.05,1.10,1.15][level])<1e-9);assert.ok(Math.abs(r.element-base.element-level*3*.2)<1e-9);assert.equal(r.verificationStatus,'UNVERIFIED');assert.ok(r.evidenceRefs.includes('KAN23_GAMEWITH_ARTILLERY_20260601'));});
// Current Technique DB explicitly adopts CHARGED and ordinary FULL_BURST,
// not stake actions; the attack component identity is validated first.
for(const action of ['CHARGED','FULL_BURST'])test('Artillery '+action+' uses adopted per-shell physical and displayed-fire rules',()=>{
 const rule=e.get('gunlance','GL_SHELL_NORMAL_MEDIUM').specialSourceValues.p0ReferenceRules.artilleryReference;
 assert.deepEqual(Array.from(rule.supportedActions),['NORMAL','CHARGED','FULL_BURST']);assert.equal(rule.actionExtensionAdoption,'OWNER_APPROVED_PROVISIONAL');assert.equal(rule.actionExtensionScope,'ADOPTED_CHARGED_AND_ORDINARY_FULL_BURST_ONLY_NO_STAKE');
 for(const type of ['NORMAL','LONG','WIDE'])for(const level of [1,2,3]){
  const o=input(action);o.state.shellingType=type;o.state.loadedRounds={NORMAL:6,LONG:3,WIDE:2}[type];
  const before=handler.calculate(o,e,generic),r=handler.calculate({...o,artilleryLevel:level,normalAttackComponents:{weaponBase:200,normalMultiplier:1,normalFlat:0}},e,generic),count=action==='CHARGED'?2:o.state.loadedRounds;
  assert.equal(r.trace.length,count);assert.equal(r.consumedRounds,count);assert.equal(r.remainingRounds,o.state.loadedRounds-count);
  assert.ok(Math.abs(r.physical-before.physical*[1,1.05,1.10,1.15][level])<1e-9);assert.ok(Math.abs(r.element-before.element-count*level*3*.2)<1e-9);assert.equal(r.verificationStatus,'UNVERIFIED');assert.equal(r.artilleryActionAdoption,'OWNER_APPROVED_PROVISIONAL');
 }
});
test('Artillery rejects unadopted actions and invalid or mismatched attack composition',()=>{
 const valid={weaponBase:200,normalMultiplier:1,normalFlat:0};
 for(const action of ['WYRMSTAKE','UNKNOWN'])assert.throws(()=>handler.calculate({...input(action),artilleryLevel:3,normalAttackComponents:valid},e,generic),/GL_SHELL:ARTILLERY_ACTION_PENDING/);
 for(const action of ['NORMAL','CHARGED','FULL_BURST'])for(const normalAttackComponents of [null,{normalMultiplier:1,normalFlat:0},{weaponBase:200,normalMultiplier:1.02,normalFlat:0},{weaponBase:200,normalMultiplier:1,normalFlat:5},{weaponBase:NaN,normalMultiplier:1,normalFlat:0}])assert.throws(()=>handler.calculate({...input(action),artilleryLevel:1,normalAttackComponents},e,generic),/GL_SHELL:ATTACK_COMPONENTS_MISMATCH/);
 const original=e.get('gunlance','GL_SHELL_NORMAL_MEDIUM'),changed=JSON.parse(JSON.stringify(original));changed.specialSourceValues.p0ReferenceRules.artilleryReference.attackOrderAdoption='UNKNOWN';
 const unresolved={get:(kind,id)=>id==='GL_SHELL_NORMAL_MEDIUM'?changed:e.get(kind,id)};
 assert.throws(()=>handler.calculate({...input('NORMAL'),artilleryLevel:1,normalAttackComponents:valid},unresolved,generic),/GL_SHELL:ARTILLERY_ATTACK_ORDER_PENDING/);
});
test('Artillery multiplies base composition before normal flat, not the already summed attack',()=>{
 const r=handler.calculate({...input('NORMAL'),weaponBaseAttack:209,artilleryLevel:1,normalAttackComponents:{weaponBase:200,normalMultiplier:1.02,normalFlat:5}},e,generic);
 assert.ok(Math.abs(r.resolvedPhysicalAttack-(200*1.02*1.05+5))<1e-9);assert.notEqual(r.resolvedPhysicalAttack,209*1.05);assert.equal(r.attackOrder,'BASE_MULTIPLIERS_ARTILLERY_THEN_FLAT');
});
