const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {burstFromObservedRounds,validateObservedCombo}=require('../observed-shelling.js');
const record=require('../evidence/gunlance-fullburst-observed-r150.json');
test('r150 confirmed two rounds produce 2 shelling hits and 68.0 damage',()=>{const r=burstFromObservedRounds(record.observedDamagePerRound,record.loadedRounds);assert.equal(r.hitCount,2);assert.equal(r.damageTotal,68);assert.equal(r.dpsReady,false)});
test('r150 shell count changes with actual fired rounds',()=>{assert.equal(burstFromObservedRounds([34,34,34],3).hitCount,3);assert.equal(burstFromObservedRounds([34],3).hitCount,1)});
test('r150 prevents firing more rounds than loaded',()=>assert.throws(()=>burstFromObservedRounds([34,34,34],2),/exceed/));
test('r150 does not mix shelling with slash damage',()=>{const r=validateObservedCombo({shelling:burstFromObservedRounds([34,34],2),physical:128});assert.equal(r.components.shelling,68);assert.equal(r.damageTotal,196);assert.equal(r.dpsReady,false)});
test('r150 rejects invalid/unverified inputs',()=>{assert.throws(()=>burstFromObservedRounds([NaN],1));assert.throws(()=>burstFromObservedRounds([34],0));assert.throws(()=>burstFromObservedRounds([-1],1));assert.throws(()=>validateObservedCombo({shelling:burstFromObservedRounds([34],1),physical:-1}))});
test('r150 entry point includes observed utility',()=>assert.match(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),/observed-shelling\.js/));
