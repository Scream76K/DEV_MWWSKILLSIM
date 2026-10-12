const {test}=require('node:test'),assert=require('node:assert/strict');
const {compare}=require('../build-relative-comparison.js');
test('different known element types do not produce an elemental ratio',()=>{
 const a={weaponType:'bow',elementType:'fire',total:100,physical:80,elemental:20},b={...a,elementType:'dragon',elemental:30,total:110};
 const r=compare(a,b);assert.equal(r.metrics.elemental,null);assert.ok(r.warnings.some(x=>/type/i.test(x)));assert.equal(r.metrics.physical.index,100);
});
test('unknown elemental inputs cannot become numeric comparison outputs',()=>{
 const a={weaponType:'bow',elementType:'dragon',elementKnown:false,total:null,physical:80,elemental:null},b={...a};
 const r=compare(a,b);assert.equal(r.metrics.elemental,null);assert.equal(r.metrics.total,null);assert.equal(r.metrics.physical.index,100);
});
