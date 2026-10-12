const test=require('node:test');
const assert=require('node:assert/strict');
const {composeObservedCombo,observedBurstEvent}=require('../gunlance-combo-observed.js');
test('r153 unknown damage with known hits preserves known hit count but blocks DPS',()=>{
 const r=composeObservedCombo({evidenceId:'clip',durationSeconds:3,events:[observedBurstEvent([34,34],2),{component:'physical',damage:null,hits:1}]});
 assert.equal(r.knownDamage,68);assert.equal(r.knownHits,3);assert.equal(r.totalHits,3);assert.equal(r.hitsComplete,true);assert.equal(r.totalDamage,null);assert.equal(r.dps,null);
});
test('r153 unknown hit count never masquerades as full hit count',()=>{
 const r=composeObservedCombo({evidenceId:'clip',events:[observedBurstEvent([34,34],2),{component:'physical',damage:20}]});
 assert.equal(r.knownHits,2);assert.equal(r.totalHits,null);assert.equal(r.hitsComplete,false);assert.equal(r.totalDamage,88);
});
test('r153 known damage stays available even when another component is unmeasured',()=>{
 const r=composeObservedCombo({evidenceId:'clip',events:[{component:'physical',damage:20,hits:1},{component:'physical',damage:null},{component:'physical',damage:5,hits:1}]});
 assert.equal(r.components.physical,null);assert.equal(r.knownDamage,25);assert.equal(r.totalDamage,null);assert.equal(r.knownHits,2);
});
test('r153 rejects invalid hit count on an unknown-damage event',()=>{
 assert.throws(()=>composeObservedCombo({evidenceId:'clip',events:[{component:'physical',damage:null,hits:-1}]}),/invalid hits/);
});
test('r153 complete observed data has complete hit and damage counts',()=>{
 const r=composeObservedCombo({evidenceId:'clip',durationSeconds:2,events:[observedBurstEvent([34,34],2),{component:'physical',damage:12,hits:1}]});
 assert.equal(r.totalHits,3);assert.equal(r.knownDamage,80);assert.equal(r.dps,40);
});
