const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const begin=html.indexOf('function applyBuildSnapshot(');
const end=html.indexOf('function renderSavedBuilds()',begin);
const ctx=vm.createContext({DB:{weapons:[{id:'w1'}],armor:[{id:'a1'}]}});
vm.runInContext(html.slice(begin,end),ctx);
test('missing saved head armor is rejected before mutating current build',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'w1',armor:{head:'missing'}})",ctx),/防具がDBに見つかりません：head/);
});
test('missing saved leg armor is rejected before mutating current build',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'w1',armor:{legs:'missing'}})",ctx),/防具がDBに見つかりません：legs/);
});
test('valid saved armor ID is not rejected by preflight',()=>{
 assert.doesNotMatch(html.slice(begin,end),/if\(id\)throw new Error/);
 assert.match(html.slice(begin,end),/!DB\.armor\.some\(a=>String\(a\.id\)===String\(id\)\)/);
});
test('comparison handles bad saved build and restores both states',()=>{
 const start=html.indexOf('function runBuildCompare('),end=html.indexOf('function aiBuildData(',start);
 const source=html.slice(start,end);
 assert.match(source,/catch\(e\)\{compareError=e;\}/);
 assert.match(source,/try\{applyBuildSnapshot\(current,\{preserveCombo:true,restoreExact:true\}\);\}/);
 assert.match(source,/try\{restoreStep5Snapshot\(cond\);\}/);
});
