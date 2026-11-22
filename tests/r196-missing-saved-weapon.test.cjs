const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const begin=html.indexOf('function applyBuildSnapshot(');
const end=html.indexOf('function renderSavedBuilds()',begin);
assert.ok(begin>0&&end>begin);
const ctx=vm.createContext({DB:{weapons:[{id:'known'}]}});
// Include the actual production dependency, not a fixture reimplementation.
const hpBegin=html.indexOf('function normalizeSelectedHp(');
const hpEnd=html.indexOf('\n',hpBegin);
assert.ok(hpBegin>0&&hpEnd>hpBegin);
vm.runInContext(html.slice(hpBegin,hpEnd)+'\n'+html.slice(begin,end),ctx);
test('missing saved weapon cannot reuse current build weapon',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'missing'})",ctx),/武器がDBに見つかりません/);
});
test('empty saved weapon cannot reuse current build weapon',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:''})",ctx),/武器がDBに見つかりません/);
});
test('load UI catches and reports missing weapon',()=>{
 const loadSource=html.slice(html.indexOf('function renderSavedBuilds()'),html.indexOf('function renderCompareBuilds()'));
 assert.match(loadSource,/try\{applyBuildSnapshot\(saved\);\}catch\(e\)\{alert\('ビルドを読み込めませんでした：'\+String\(e\.message\|\|e\)\);\}/);
});

test('invalid saved HP is rejected before looking up weapon',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'missing',selectedHp:'INVALID'})",ctx),/SELECTED_HP_INVALID/);
});
