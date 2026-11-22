const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const begin=html.indexOf('function applyBuildSnapshot(');
const end=html.indexOf('function renderSavedBuilds()',begin);
let uiTouches=0,refreshes=0;
const ctx=vm.createContext({DB:{weapons:[{id:'w1'}],armor:[{id:'a1'}]},p0DamageSuspend:false,refreshP0DamageResults(){refreshes++;},$(){uiTouches++;throw Error('PREFLIGHT_PASSED_UI_SENTINEL');}});
// Include the actual production dependency, not a fixture reimplementation.
const hpBegin=html.indexOf('function normalizeSelectedHp(');
const hpEnd=html.indexOf('\n',hpBegin);
assert.ok(hpBegin>0&&hpEnd>hpBegin);
vm.runInContext(html.slice(hpBegin,hpEnd)+'\n'+html.slice(begin,end),ctx);
test('missing saved head armor is rejected before mutating current build',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'w1',armor:{head:'missing'}})",ctx),/防具がDBに見つかりません：head/);assert.equal(uiTouches,0);
});
test('missing saved leg armor is rejected before mutating current build',()=>{
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'w1',armor:{legs:'missing'}})",ctx),/防具がDBに見つかりません：legs/);assert.equal(uiTouches,0);
});
test('valid saved armor ID is not rejected by preflight',()=>{
 assert.doesNotMatch(html.slice(begin,end),/if\(id\)throw new Error/);
 assert.match(html.slice(begin,end),/!DB\.armor\.some\(a=>String\(a\.id\)===String\(id\)\)/);
});
test('comparison handles bad saved build and restores both states',()=>{
 const start=html.indexOf('function runBuildCompare('),end=html.indexOf('function aiBuildData(',start);
 const source=html.slice(start,end);
 assert.match(source,/catch\(e\)\{compareError=e;\}/);
 assert.match(source,/const restoreEditor=\(\)=>\{\s*applyBuildSnapshot\(current,\{preserveCombo:true,restoreExact:true,emptyEditor\}\);/);
 assert.match(source,/finally\{[\s\S]*?try\{restoreEditor\(\);\}/);
 assert.match(source,/try\{restoreStep5Snapshot\(cond\);\}/);
});

test('known saved armor passes preflight and reaches first UI mutation',()=>{
 const before=uiTouches;
 assert.throws(()=>vm.runInContext("applyBuildSnapshot({weaponId:'w1',armor:{head:'a1'}})",ctx),/PREFLIGHT_PASSED_UI_SENTINEL/);
 assert.equal(uiTouches,before+1);assert.equal(ctx.p0DamageSuspend,false);assert.equal(refreshes,1);
});
