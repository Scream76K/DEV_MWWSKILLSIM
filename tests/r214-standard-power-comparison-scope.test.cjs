const MHWElementState=require('../element-state.js');
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function extract(start,end){const a=html.indexOf(start),b=html.indexOf(end,a);assert.ok(a>=0&&b>a,start);return html.slice(a,b)}
const source=extract('const STANDARD_POWER_SKILL_NAMES=', '// r100: evaluate whole fixed routes')+extract('function standardPowerForStats(kind,st,cond,total={}){','function comparisonPowerIndex(')+extract('function comparisonPowerIndex(','function comparisonPowerChange(');
function setup(){
 const seen=[];
 const ctx={seen,skillLevel(t,names){return Number(names.map(n=>t[n]).find(v=>v!==undefined)||0)},standardPowerForStatsSingleHealth(kind,st,cond,total){seen.push({...total});const attack=st.attackTrue+3*Number(total['攻撃']||0);const affinity=Number(total['見切り']||0)*5;const comparisonPower=attack*(1+affinity/400);return {profileId:'fixed-standard-fixture',normal:{comparisonPower},maximum:{comparisonPower}}}};
 vm.createContext(require('../tools/element-vm-test-setup.cjs').register(ctx));vm.runInContext(source,ctx);
 return {seen,evaluate(skills){ctx.skills=skills;return vm.runInContext("standardPowerForStats('great-sword',{...MHWElementState.fromValue(0,'none'),attackTrue:200},{cb:0},skills)",ctx)},index(row,base){ctx.row=row;ctx.base=base;return vm.runInContext('comparisonPowerIndex(row,base)',ctx)}};
}
function row(power){return {...MHWElementState.fromValue(0,'none'),kind:'great-sword',power}}
test('utility skills have no effect on baseline-100 power index',()=>{const s=setup();const base=row(s.evaluate({})),utility=row(s.evaluate({'防御':7,'ランナー':3,'体術':5,'回避性能':5}));assert.equal(s.index(utility,base).normal,100);assert.equal(Object.keys(s.seen[1]).length,0)});
test('direct attack and affinity skill inputs reach STANDARD comparison',()=>{const s=setup();const base=row(s.evaluate({}));const boosted=row(s.evaluate({'攻撃':3,'見切り':2}));assert.ok(s.index(boosted,base).normal>100);assert.equal(s.seen[1]['攻撃'],3);assert.equal(s.seen[1]['見切り'],2)});
test('utility skill additions do not change an otherwise identical attack build',()=>{const s=setup();const base=row(s.evaluate({'攻撃':2}));const mixed=row(s.evaluate({'攻撃':2,'防御':7,'ランナー':3}));assert.equal(s.index(mixed,base).normal,100);assert.deepEqual(Object.keys(s.seen[1]),['攻撃'])});
test('unrecognized skills cannot change STANDARD index',()=>{const s=setup();const base=row(s.evaluate({}));const unknown=row(s.evaluate({'架空の火力スキル':99}));assert.equal(s.index(unknown,base).normal,100)});
test('profile mismatch remains blocked after skill filtering',()=>{const s=setup();const base=row(s.evaluate({}));const changed={kind:'great-sword',power:{...s.evaluate({'攻撃':1}),profileId:'different'}};assert.equal(s.index(changed,base),null)});
