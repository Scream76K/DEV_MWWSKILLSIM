const test=require('node:test');
const assert=require('node:assert/strict');
const {audit}=require('../weapon-attack-target-audit.js');
const handoff={rows:[{stage:1,status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED',context:{weaponAttack:230,monsterId:'m1',partId:'head',hitZonePhysical:45,hitZoneElement:20}}]};
const stats={attackTrue:230,attackComponents:{weaponBase:200,normalMultiplier:1.1,normalFlat:10}};
const target={monsterId:'m1',partId:'head',physical:45,element:20};
for(const [name,t] of [['blank monster ID',{...target,monsterId:' '}],['blank part ID',{...target,partId:''}],['missing monster ID',{...target,monsterId:null}],['missing part ID',{...target,partId:null}]])test(name,()=>assert.ok(audit(handoff,stats,t).rows[0].blockers.includes('TARGET_IDENTITY_REQUIRED')));
test('valid identity remains accepted',()=>assert.ok(!audit(handoff,stats,target).rows[0].blockers.includes('TARGET_IDENTITY_REQUIRED')));
