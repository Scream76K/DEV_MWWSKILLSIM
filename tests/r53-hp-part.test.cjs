const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test');
const s=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c={window:{}};vm.createContext(require('../tools/element-vm-test-setup.cjs').register(c));vm.runInContext('const KINDS='+s.match(/const KINDS=(\[.*?\]);/)[1]+';'+s.slice(s.indexOf('const CHARGE_BLADE_ENGINE_VERSION='),s.indexOf('function compareStep5Snapshot()')),c);
const e=c.window.TechniqueDBEngine,b=c.window.BuildComparisonEngine;
// Production predicate with production names; fixture weapon is explicitly non-Artia.
vm.runInContext(require('../tools/legacy-ocr-source.cjs').functionSource(s,'isArtia')+'\n'+s.slice(s.indexOf('const ARTIA_NAMES='),s.indexOf('const WEAPON_COEFF=')),c);
const stats={baseAttack:100,displayedElement:100,physicalHitzone:100,elementalHitzone:100,sharpnessPhysical:1,sharpnessElement:1,affinity:0,maxAffinity:100};
test('part durability coefficient never scales HP, including zero and missing',()=>{
 for(const part of [0,1,1.2,undefined]){
  const hit={mv:12,elementModifier:1};if(part!==undefined)hit.partModifier=part;
  const result=b.genericProfileDamage({status:'ADOPTED',hits:[hit]},stats);
  assert.equal(result.physical,12);assert.equal(result.element,10);
  assert.equal(result.trace[0].partModifier,part??null);
  assert.equal(result.trace[0].partModifierAppliedToHp,false);
 }
});
test('missing elemental or MV data fail closed rather than using a default',()=>{
 for(const hit of [{mv:12},{elementModifier:1},{mv:null,elementModifier:1},{mv:12,elementModifier:NaN}])assert.throws(()=>b.genericProfileDamage({status:'ADOPTED',hits:[hit]},stats),/FAIL_CLOSED/);
});
test('adopted dance permits HP comparison while part and live checks stay pending',()=>{
 const p=b.genericProfiles['dual-blades'];assert.equal(b.profileAvailability('dual-blades').status,'READY');
 for(const condition of ['NORMAL','MAX']){
  const result=b.genericProfileDamage(p,stats,condition);
  assert.ok(Math.abs(result.physical-393*(condition==='MAX'?1.25:1))<1e-9);
  assert.ok(Math.abs(result.element-200)<1e-9);assert.equal(result.trace.length,27);
  assert.ok(result.trace.every(h=>h.partModifier===null&&!h.partModifierAppliedToHp));
 }
 for(const id of p.techniqueIds){
  const a=e.audit('dual-blades',id);
  assert.equal(a.calculationScope,'HP_DAMAGE_ONLY');assert.equal(a.calculable,true);
  assert.equal(a.liveGameVerification,'PENDING');assert.equal(a.fieldVerification.partModifiers.status,'UNVERIFIED');
  assert.ok(a.nonBlockingReasons.includes('PART_MODIFIER_NOT_REPORTED_IN_SOURCE'));
 }
 assert.equal(e.completion['dual-blades'].complete,false);
 assert.throws(()=>e.hits('dual-blades','DB_DEMON_DANCE'),/FAIL_CLOSED/);
 assert.equal(b.profileAvailability('insect-glaive').status,'EVIDENCE_GATED');
});
test('actual comparison router returns adopted DB A/B NORMAL/MAX without a gated result',()=>{
 // Replace only the external build lookup/stat resolver; use the actual router,
 // adapter, canonical hits, damage engine and relative comparison packing.
 vm.runInContext("const fixtureWeaponIds={'db-test':900053001};const DB={weapons:[{id:fixtureWeaponIds['db-test'],kind:'dual-blades',name:'TEST_ONLY:r53:db-test',testOnly:true}]};let selectedFixtureWeaponId=fixtureWeaponIds['db-test'];function selectedWeapon(){const record=DB.weapons.find(w=>w.id===selectedFixtureWeaponId);if(!record)throw Error('UNKNOWN_TEST_WEAPON:'+selectedFixtureWeaponId);return record;}function canonicalWeaponKind(w){return w.kind;}const calcState={total:{}};resolveSnapshotStatsForComparison=s=>{selectedFixtureWeaponId=s.weaponId;calcState.total=s.total||{};return s.stats;};",c);
 const A={weaponId:900053001,stats:{attackTrue:100,element:100,affinity:0,maxAffinity:100}};
 const B={weaponId:900053001,stats:{attackTrue:200,element:200,affinity:0,maxAffinity:100}};
 const r=b.router({snapshotA:A,snapshotB:B,cond:{hz:100,ehz:100,sharp:1,esharp:1}});
 assert.equal(r.status,'READY');assert.equal(r.handler,'GenericWeaponHandler');
 // Independent 393 MV total, displayed-element contribution200; only physical crits.
 const normal=393*1.32+200*1.15,maximum=393*1.25*1.32+200*1.15;
 for(const [entry,expected] of [[r.A.NORMAL,normal],[r.A.MAX,maximum],[r.B.NORMAL,2*normal],[r.B.MAX,2*maximum]]){
  assert.ok(Math.abs(entry.comparisonPower-expected)<1e-9);
  assert.ok(Math.abs(entry.relativePowerChange-(expected/normal-1))<1e-9);
 }
});
