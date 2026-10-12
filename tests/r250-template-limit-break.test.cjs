const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');const source=require('../tools/legacy-ocr-source.cjs');
const fixture=require('./fixtures/r250-salada-arm-mhdb.json');
test('SALADA arm raw MHDB slots remain unchanged while existing limit-break supplies template capacity',()=>{
 const c={};vm.createContext(c);vm.runInContext(['slotLevels','limitBreakSlots','maxBreakSlots'].map(n=>source.functionSource(source(),n)).join('\n'),c);
 const a=fixture.record,before=JSON.stringify(a);assert.equal(a.id,68);assert.equal(a.name,'護火竜アームβ');assert.deepEqual(a.slots,[2,1,1]);
 assert.deepEqual(Array.from(c.maxBreakSlots(a)),[3,2,1]);assert.equal(JSON.stringify(a),before);
});
