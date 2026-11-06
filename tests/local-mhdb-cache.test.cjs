'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const cache=require('../ui/local-mhdb-cache.js');
function fixture(){return {skills:[{id:1,name:'Skill',gameId:1}],armor:[{id:1,name:'Armor',kind:'head',skills:[{skill:{id:1,name:'Skill'},level:1}]}],decorations:[{id:1,name:'Jewel',gameId:2,skills:[]}],charms:[{id:1,ranks:[{id:1,name:'Charm',skills:[]}]}],sets:[{id:1,name:'Set'}],monsters:[{id:1,name:'Monster'}],weapons:cache.WEAPON_KINDS.map((kind,i)=>({id:i+1,gameId:1,name:kind,kind,damage:{raw:100},skills:[]})),motionValues:[]};}
test('valid snapshot verifies counts, version and digest; tampering is rejected',async()=>{const p=await cache.create(fixture(),'2026-04-15T01:28:18+00:00');await cache.verify(p);p.data.armor[0].name='tampered';await assert.rejects(cache.verify(p),/HASH/);});
test('missing dataset, duplicate ID, missing kind and dangling skill fail closed',()=>{for(const mutate of [d=>d.armor=[],d=>d.armor.push({...d.armor[0]}),d=>d.weapons.pop(),d=>d.armor[0].skills[0].skill.id=999]){const d=fixture();mutate(d);assert.throws(()=>cache.validateData(d));}});
test('ID reassignment, missing old records and charm rank reassignment are rejected',()=>{const old=fixture();for(const mutate of [d=>d.weapons[0].gameId=999,d=>d.armor[0].name='Different armor',d=>d.charms[0].ranks[0].name='Other charm',d=>d.monsters=[]]){const d=fixture();mutate(d);assert.throws(()=>cache.assertCompatible(old,d),/IDENTITY|MISSING/);}});
test('data updates preserve identities and do not mutate the input',async()=>{const d=fixture(),original=JSON.stringify(d),next=fixture();next.weapons[0].damage.raw=101;cache.assertCompatible(d,next);await cache.create(d,'2026-04-15T01:28:18Z');assert.equal(JSON.stringify(d),original);});
test('invalid import version and mismatched stored counts are rejected',async()=>{await assert.rejects(cache.create(fixture(),'game-1.042'),/VERSION/);const p=await cache.create(fixture(),'2026-04-15T01:28:18Z');p.counts.armor=2;await assert.rejects(cache.verify(p),/COUNT/);});
test('incomplete or inconsistent equipped skill ranks are rejected',()=>{
 for(const edit of [r=>delete r.level,r=>r.level=0,r=>r.level=1.5,r=>r.skill.name='Other skill']){
  const d=fixture();d.armor[0].skills[0]={skill:{id:1,name:'Skill'},level:1};edit(d.armor[0].skills[0]);
  assert.throws(()=>cache.validateData(d),/SKILL/);
 }
});
test('required equipment skill arrays distinguish missing/null/wrong type from empty',()=>{
 for(const kind of ['weapons','armor','decorations','charms'])for(const value of [undefined,null,{},'']){
  const d=fixture(),row=kind==='charms'?d.charms[0].ranks[0]:d[kind][0];row.skills=value;
  assert.throws(()=>cache.validateData(d),/SKILL/);
 }
 const d=fixture();for(const row of [...d.weapons,...d.armor,...d.decorations,...d.charms.flatMap(c=>c.ranks)])row.skills=[];
 assert.doesNotThrow(()=>cache.validateData(d));
});
