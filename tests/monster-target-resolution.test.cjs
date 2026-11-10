'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.MHW_PRODUCT_ROOT||path.resolve(__dirname,'..');
function setup(){
 const multipliers={slash:.7,blunt:.75,pierce:.65,fire:0,water:.15,thunder:.2,ice:.15,dragon:.3};
 const part={id:2700,monster:{id:13},multipliers};
 const db={monsters:[{id:13,parts:[part]}]};
 const context={__getBetaDB:()=>db};vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'),'utf8'),context);
 return {db,part,resolve:context.MHWRealOneHitBrowserAdapter.resolveTarget};
}
test('base target resolves exact independent hitzones and honest provenance',()=>{
 const {resolve}=setup(),r=resolve({monster:'13',part:'2700'});
 assert.equal(r.part.multipliers.slash,.7);assert.equal(r.part.multipliers.blunt,.75);assert.equal(r.part.multipliers.fire,0);
 assert.equal(r.sourceRef,'MHDB_LOADED_MONSTER:13:PART:2700');
 assert.equal(r.status,'SOURCE_REFERENCE_NOT_LIVE_VERIFIED');
 assert.equal(r.sourceGameVersion,'NOT_ESTABLISHED_BY_API_IMPORT_VERSION');
});
test('variant and king never silently reuse base part',()=>{
 const {resolve}=setup();
 for(const monster of ['13:v1','13:king'])assert.equal(resolve({monster,part:'2700'}).reason,'REAL_SLICE:TARGET_VARIANT_HITZONE_SOURCE_NOT_ADOPTED');
});
test('ambiguous, missing and malformed target identities are rejected',()=>{
 const {resolve,db,part}=setup();
 for(const t of [null,{},[],{monster:'013',part:'2700'},{monster:13,part:999},{monster:12,part:2700}])assert.ok(resolve(t).reason);
 db.monsters[0].parts.push(part);assert.equal(resolve({monster:13,part:2700}).reason,'REAL_SLICE:TARGET_PART_ID_UNRESOLVED');
 db.monsters[0].parts.pop();db.monsters.push(db.monsters[0]);assert.equal(resolve({monster:13,part:2700}).reason,'REAL_SLICE:TARGET_MONSTER_ID_UNRESOLVED');
});
test('part ownership and every hitzone are validated without numeric coercion',()=>{
 const {resolve,part}=setup(),target={monster:13,part:2700};
 part.monster.id=14;assert.equal(resolve(target).reason,'REAL_SLICE:TARGET_PART_MONSTER_MISMATCH');part.monster.id=13;
 for(const key of Object.keys(part.multipliers)){const saved=part.multipliers[key];for(const value of [undefined,NaN,-.01,1.01,'0.5']){part.multipliers[key]=value;assert.equal(resolve(target).reason,'REAL_SLICE:TARGET_HITZONE_INVALID');}part.multipliers[key]=saved;}
});
test('training parts remain explicit and retain their own values',()=>{
 const {resolve}=setup(),training={parts:[{id:'training-back',multipliers:{slash:.2,blunt:.2,pierce:.2,fire:.05,water:.05,thunder:.05,ice:.05,dragon:.05}}]};
 const r=resolve({monster:'training-room',part:'training-back'},training);assert.equal(r.part.multipliers.slash,.2);assert.equal(r.status,'PRODUCT_REFERENCE');
 assert.ok(resolve({monster:'training-room',part:'missing'},training).reason);
});
