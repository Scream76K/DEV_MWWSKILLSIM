const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const begin=html.indexOf('function applyBuildSnapshot(');
const end=html.indexOf('function renderSavedBuilds()',begin);
assert.ok(begin>0&&end>begin);
const ctx=vm.createContext({DB:{weapons:[{id:'known'}]}});
vm.runInContext(html.slice(begin,end),ctx);
test('missing saved weapon cannot reuse current build weapon',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'missing'})",ctx),/武器がDBに見つかりません/);
});
test('empty saved weapon cannot reuse current build weapon',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:''})",ctx),/武器がDBに見つかりません/);
});
test('load UI catches and reports missing weapon',()=>{
 assert.match(html,/try\{applyBuildSnapshot\(m\[name\]\);\}catch\(e\)\{alert\(/);
});
