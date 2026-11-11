const test=require('node:test'),assert=require('node:assert/strict');
const api=require('../bowgun-normal-reference.js');
const rule={status:'OWNER_APPROVED_PROVISIONAL',sourceTechniqueId:'LBG_NORMAL_AMMO_1',hitCount:5,consumedRounds:1,physicalModifier:.7,rangeModifier:1,skillLevel:1,skillMultiplier:1.05,source:'adopted-source',scope:'LBG_NORMAL_LV1_SINGLE_RAPID_TRIGGER'};
const shotSkills={firstAttack:[0,5,10,15],forceAttack:[0,3,6,10],forceAffinity:[0,8,10,12],forceAttackOrdinals:[4,6],forceAffinityStart:4,firstElement:[1,1.1,1.1,1.1],forceElement:[1,1.05,1.05,1.05]};
const engine={get(kind,id){if(id==='LBG_NORMAL_RAPID_1')return {rapidRule:rule};if(id==='LBG_NORMAL_AMMO_1')return {specialSourceValues:{mvPerHit:17}};if(id==='LBG_NORMAL_REFERENCE_RULES'||id==='HBG_NORMAL_REFERENCE_RULES')return {specialSourceValues:{status:'SOURCE_CONFIRMED',scope:'EXPLICIT_COMMON_NORMAL_AMMO_SCENARIO',normalUp:{0:1,1:1.05},shotSkills}};}};
function options(){return {techniqueId:'LBG_NORMAL_RAPID_1',attack:200,affinity:20,criticalMultiplier:1.25,physicalHitzone:65,rapidUp:1,normalUp:1,firstShot:3,forceShot:3,state:{shotMode:'RAPID',rapidReady:true,ammoType:'NORMAL',ammoLevel:1,range:'CRITICAL',contactPolicy:'ALL_FIVE',normalModeLevel:0,weaponAmmoEntry:{kind:'normal',level:1,rapid:true,capacity:2}}};}
test('five consumed rounds apply First to shot 1 and Force attack to shot 4, affinity to shots 4 and 5',()=>{
 const o=options(),before=JSON.stringify(o),r=api.rapidFiveShot(o,engine);
 assert.equal(r.trace.length,25);assert.equal(r.sequence.consumedRounds,5);assert.equal(r.sequence.triggerCount,5);
 const ordinals=Array.from({length:25},(_,i)=>Math.floor(i/5)+1);
 for(const key of ['shotOrdinal','roundOrdinal','triggerOrdinal'])assert.deepEqual(r.trace.map(x=>x[key]),ordinals);
 const attacks=[215,200,200,210,200],affinities=[20,20,20,32,32];let total=0;
 for(let i=0;i<25;i++){
  const ordinal=Math.floor(i/5),t=r.trace[i],hit=attacks[ordinal]*.17*.65*(1+affinities[ordinal]/100*.25)*.7*1.05*1.05;
  assert.equal(t.attack,attacks[ordinal]);assert.equal(t.affinity,affinities[ordinal]);assert.equal(t.effectiveAffinity,affinities[ordinal]);assert.equal(t.shotAttackAdd,[15,0,0,10,0][ordinal]);assert.equal(t.shotAffinityAdd,[0,0,0,12,12][ordinal]);assert.ok(Math.abs(t.physical-hit)<1e-8);total+=hit;
 }
 assert.ok(Math.abs(r.physical-total)<1e-8);assert.equal(r.status,'SOURCE_REFERENCE');assert.deepEqual(r.unappliedEffects,[]);assert.equal(r.liveGameVerification,'PENDING');assert.equal(r.sourceGameVersion,'NOT_ESTABLISHED');assert.equal(JSON.stringify(o),before);
});
test('capacity and stored ordinal do not reset the five-round sequence',()=>{const o=options(),expected=api.rapidFiveShot(o,engine).physical;for(const capacity of [1,2,5,99]){o.state.weaponAmmoEntry.capacity=capacity;o.state.loadedRounds=0;o.state.shotOrdinal=99;assert.equal(api.rapidFiveShot(o,engine).physical,expected);}});
test('unsupported ammo or mode is not silently replaced',()=>{for(const change of [o=>o.state.weaponAmmoEntry.rapid=false,o=>o.state.weaponAmmoEntry.level=2,o=>o.state.ammoLevel=2,o=>o.state.contactPolicy='ALL_THREE',o=>o.forceShot=4]){const o=options();change(o);assert.throws(()=>api.rapidFiveShot(o,engine));}});
test('standard ammo uses sole weapon level and refuses ambiguity',()=>{assert.equal(api.selectStandardAmmo({kind:'heavy-bowgun',ammo:[{kind:'normal',level:3}]}).ammoLevel,3);assert.equal(api.selectStandardAmmo({kind:'light-bowgun',ammo:[{kind:'normal',level:1,rapid:true}]}).contactCount,25);assert.equal(api.selectStandardAmmo({kind:'light-bowgun',ammo:[{kind:'normal',level:1,rapid:false}]}).contactCount,15);assert.ok(api.selectStandardAmmo({kind:'heavy-bowgun',ammo:[{kind:'normal',level:1},{kind:'normal',level:2}]}).reason);assert.equal(api.selectStandardAmmo({kind:'light-bowgun',ammo:[{kind:'normal',level:2,rapid:true}]}).techniqueId,'LBG_NORMAL_RAPID_2');});

test('malformed ammo containers fail closed without throwing',()=>{for(const ammo of [undefined,null,{},'normal',4]){let r;assert.doesNotThrow(()=>{r=api.selectStandardAmmo({kind:'light-bowgun',ammo});});assert.ok(r.reason);}});

test('native Lv3 is separate from explicit Lv2 powder upgrade',()=>{assert.equal(api.selectStandardAmmo({kind:'light-bowgun',ammo:[{kind:'normal',level:3,rapid:true}]}).techniqueId,'LBG_NORMAL_RAPID_NATIVE_3');assert.equal(api.selectStandardAmmo({kind:'light-bowgun',ammo:[{kind:'normal',level:2,rapid:true}]},{normalPowder:'LEVEL_PLUS_ONE'}).techniqueId,'LBG_NORMAL_RAPID_3');});
