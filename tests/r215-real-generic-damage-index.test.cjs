const MHWElementState=require('../element-state.js');
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function extract(start,end){const a=html.indexOf(start),b=html.indexOf(end,a);assert.ok(a>=0&&b>a,start);return html.slice(a,b)}
// Use the actual production per-hit physical/element damage evaluator, not a synthetic power formula.
const source=extract('function genericExpectedCritMultiplier(','// Read-only source-state inspection.')+extract('const STANDARD_POWER_SKILL_NAMES=','// r100: evaluate whole fixed routes')+extract('function standardPowerForStats(kind,st,cond,total={}){','function comparisonPowerIndex(')+extract('function comparisonPowerIndex(','function comparisonPowerChange(');
const profile={status:'ADOPTED',hits:[{name:'test adopted hit',mv:100,elementModifier:1}]};
function setup(){
 const ctx={profile,skillLevel(t,names){return Number(names.map(n=>t[n]).find(v=>v!==undefined)||0)},standardPowerForStatsSingleHealth(kind,st,cond,total){
   const attack=st.attackTrue+3*Number(total['攻撃']||0);
   const affinity=st.affinity+5*Number(total['見切り']||0);
   const stats={baseAttack:attack,displayedElement:st.element,physicalHitzone:60,elementalHitzone:20,sharpnessPhysical:1.32,sharpnessElement:1.15,affinity,maxAffinity:affinity,criticalMultiplier:1.25};
   const normal=ctx.genericProfileDamage(profile,stats,'NORMAL');
   const maximum=ctx.genericProfileDamage(profile,stats,'MAX');
   return {profileId:'actual-generic-damage-fixture',normal,maximum};
 }};
 vm.createContext(require('../tools/element-vm-test-setup.cjs').register(ctx));vm.runInContext(source,ctx);
 return {eval(skills,st={attackTrue:200,affinity:0,element:100}){ctx.skills=skills;ctx.st=st;return vm.runInContext("standardPowerForStats('great-sword',st,{cb:0},skills)",ctx)},index(candidate,base){ctx.candidate={...MHWElementState.fromValue(100,'fire'),kind:'great-sword',power:candidate};ctx.base={...MHWElementState.fromValue(100,'fire'),kind:'great-sword',power:base};return vm.runInContext('comparisonPowerIndex(candidate,base)',ctx)}};
}
test('actual generic damage keeps utility-only changes at baseline 100',()=>{const s=setup(),base=s.eval({}),utility=s.eval({'防御':7,'ランナー':3,'体術':5,'回避性能':5});assert.equal(s.index(utility,base).normal,100);assert.equal(utility.normal.comparisonPower,base.normal.comparisonPower)});
test('actual physical hit damage increases when attack jewel is equipped',()=>{const s=setup(),base=s.eval({}),boost=s.eval({'攻撃':3});assert.ok(boost.normal.physical>base.normal.physical);assert.ok(s.index(boost,base).normal>100)});
test('actual critical expectation increases with critical eye',()=>{const s=setup(),base=s.eval({}),boost=s.eval({'見切り':2});assert.ok(boost.normal.physical>base.normal.physical);assert.ok(s.index(boost,base).normal>100)});
test('adding utility skills to an attack build does not change damage',()=>{const s=setup(),base=s.eval({'攻撃':2}),mixed=s.eval({'攻撃':2,'防御':7,'ランナー':3});assert.equal(s.index(mixed,base).normal,100);assert.equal(mixed.normal.element,base.normal.element)});
test('actual elemental damage stays separate from physical affinity',()=>{const s=setup(),base=s.eval({}),crit=s.eval({'見切り':2});assert.equal(crit.normal.element,base.normal.element);assert.ok(crit.normal.physical>base.normal.physical)});
