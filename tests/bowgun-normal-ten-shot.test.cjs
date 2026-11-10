'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const api=require('../bowgun-normal-reference.js');
const shotSkills={firstAttack:[0,5,10,15],forceAttack:[0,3,6,10],forceAffinity:[0,8,10,12],forceAttackOrdinals:[4,6],forceAffinityStart:4,firstElement:[1,1.1,1.1,1.1],forceElement:[1,1.05,1.05,1.05]};
const engine={get(kind,id){
 if(id.endsWith('_NORMAL_REFERENCE_RULES'))return {evidenceRefs:['adopted-normal-test-fixture'],specialSourceValues:{status:'SOURCE_CONFIRMED',scope:'EXPLICIT_COMMON_NORMAL_AMMO_SCENARIO',supportedLevels:[1,2],hitCount:3,physicalRange:{CRITICAL:1},normalMode:{0:1},normalUp:{0:1,1:1.05},weaponPhysicalModifier:.8,shotSkills}};
 const level=Number(id.at(-1));return {techniqueId:id,evidenceRefs:['adopted-normal-test-fixture'],specialSourceValues:{hitCount:3,mvPerHit:{1:17,2:23.8,3:32.3}[level]}};
}};
const input=(kind='heavy-bowgun',level=3)=>({weaponKind:kind,attack:200,affinity:20,criticalMultiplier:1.25,physicalHitzone:65,normalUp:1,firstShot:3,forceShot:3,state:{ammoType:'NORMAL',ammoLevel:level,shotMode:'NORMAL',range:'CRITICAL',normalModeLevel:0,contactPolicy:'ALL_THREE',magazineCapacity:2,shotOrdinal:2,fullMagazine:false}});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,JSON.stringify({actual:a,expected:b}));
test('ten-shot path evaluates each discharge and three contacts with independent arithmetic',()=>{
 assert.equal(typeof api.tenShot,'function');
 for(const kind of ['heavy-bowgun','light-bowgun'])for(const level of kind==='light-bowgun'?[1,2]:[1,2,3]){
  const o=input(kind,level),before=structuredClone(o),r=api.tenShot(o,engine),mv={1:17,2:23.8,3:32.3}[level];
  assert.equal(r.shots.length,10);assert.equal(r.trace.length,30);assert.equal(r.element,0);
  let expected=0;
  for(let i=1;i<=10;i++){const add=i===1?15:[4,6].includes(i)?10:0,aff=Math.min(100,20+(i>=4?12:0)),value=(200+add)*mv/100*.65*(1+aff/100*.25)*1.05*(kind==='light-bowgun'?.8:1)*3;
   close(r.shots[i-1].physical,value);expected+=value;
   assert.ok(r.shots[i-1].trace.every(x=>x.shotOrdinal===i&&x.shotAttackAdd===add&&x.shotAffinityAdd===(i>=4?12:0)));
  }
  close(r.physical,expected);assert.deepEqual(o,before);assert.equal(r.sequence.magazinePolicy,'IGNORED_NO_RELOAD');assert.equal(r.liveGameVerification,'PENDING');
 }
});
test('ten-shot sequence is capacity independent without rewriting supplied magazine state',()=>{
 const o=input(),before=structuredClone(o),expected=api.tenShot(o,engine).physical;
 for(const capacity of [null,0,1,2,6,99])for(const fullMagazine of [false,true,null]){const x={...o,state:{...o.state,magazineCapacity:capacity,fullMagazine,shotOrdinal:1}};close(api.tenShot(x,engine).physical,expected);assert.equal(x.state.magazineCapacity,capacity);assert.equal(x.state.fullMagazine,fullMagazine);}
 assert.deepEqual(o,before);
});
test('ten-shot source uses per-shot positive cap and negative-affinity rule',()=>{
 for(const affinity of [-100,-5,95,100]){const o={...input(),affinity,normalUp:0,criticalMultiplier:1.4};const r=api.tenShot(o,engine);let expected=0;for(let i=1;i<=10;i++){const aff=Math.min(100,affinity+(i>=4?12:0)),crit=aff>=0?1+aff/100*.4:1+aff/100*.25,add=i===1?15:[4,6].includes(i)?10:0;expected+=(200+add)*.323*.65*crit*3;}close(r.physical,expected);}
});
test('unknown ammo decisions and unsupported scopes are rejected, not inferred',()=>{
 const o=input();
 for(const state of [{...o.state,ammoLevel:null},{...o.state,ammoLevel:'3'},{...o.state,ammoType:'ELEMENT'},{...o.state,range:'FAR'},{...o.state,normalModeLevel:1},{...o.state,contactPolicy:null}])assert.throws(()=>api.tenShot({...o,state},engine));
 for(const patch of [{weaponKind:null},{weaponKind:'bow'},{firstShot:4},{forceShot:-1},{attack:NaN},{hitAttackAdds:[3,0,0]},{hitAffinityAdds:[0,20,0]}])assert.throws(()=>api.tenShot({...o,...patch},engine));
 for(const mode of [null,'RAPID','CHASE','MOUNTED'])assert.throws(()=>api.tenShot({...input('light-bowgun',1),state:{...input('light-bowgun',1).state,shotMode:mode}},engine));
 assert.throws(()=>api.tenShot(input('light-bowgun',3),engine));
});
test('legacy shot retains magazine guards and does not accidentally become ten-shot',()=>{
 const o=input();assert.throws(()=>api.shot({...o,state:{...o.state,shotOrdinal:3}},engine),/SHOT_POSITION_PENDING/);
 const r=api.shot({...o,state:{...o.state,shotOrdinal:1,fullMagazine:true}},engine);assert.equal(r.trace.length,3);assert.equal(r.sequence,undefined);assert.equal(r.trace[0].shotAttackAdd,15);
});

test('HBG sequence rejects an explicitly incompatible rapid mode',()=>{const o=input();assert.throws(()=>api.tenShot({...o,state:{...o.state,shotMode:'RAPID'}},engine),/BOWGUN_TEN_SHOT:/);});
