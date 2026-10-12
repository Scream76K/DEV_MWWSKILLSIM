const {test}=require('node:test');const assert=require('node:assert/strict');
const {compare}=require('../build-relative-comparison.js');
const types=['大剣','太刀','片手剣','双剣','ハンマー','狩猟笛','ランス','ガンランス','スラッシュアックス','チャージアックス','操虫棍','ライトボウガン','ヘビィボウガン','弓'];
for(const weaponType of types)test(`${weaponType} relative comparison`,()=>{const a={weaponType,total:100,physical:80,elemental:20,affinity:10,maxAffinity:50};const b={...a,total:110,physical:84,elemental:26,affinity:15,maxAffinity:60};const r=compare(a,b);assert.ok(Math.abs(r.metrics.total.index-110)<1e-9);assert.equal(r.critical.maxAffinity.deltaPoints,10);});
test('reject mixed weapon types',()=>assert.throws(()=>compare({weaponType:'大剣'},{weaponType:'弓'})));
test('zero baseline is not an invented infinity',()=>assert.equal(compare({weaponType:'弓',total:0},{weaponType:'弓',total:10}).metrics.total,null));
test('invalid damage is not silently coerced',()=>assert.equal(compare({weaponType:'弓',total:10},{weaponType:'弓',total:NaN}).metrics.total,null));
