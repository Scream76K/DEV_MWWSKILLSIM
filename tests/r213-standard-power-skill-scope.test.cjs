const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('const STANDARD_POWER_SKILL_NAMES=');
const end=html.indexOf('// r100: evaluate whole fixed routes',start);
assert.ok(start>0&&end>start);
const filter=vm.runInNewContext(html.slice(start,end)+'\nstandardPowerSkillTotals');
test('utility and defense skills never enter STANDARD damage',()=>{
 const result=filter({'防御':7,'ランナー':3,'体術':5,'回避性能':5,'攻撃':5});
 assert.deepEqual(Object.keys(result),['攻撃']);
 assert.equal(result['攻撃'],5);
});
test('direct affinity, elemental and conditional damage skills remain',()=>{
 const result=filter({'見切り':5,'弱点特効':5,'超会心':3,'火属性攻撃強化':3,'連撃':5,'挑戦者':5});
 assert.equal(Object.keys(result).length,6);
});
test('input is not mutated and unknown skills are ignored',()=>{
 const original={'防御':7,'Attack Boost':4,'Some Unknown Skill':2};
 const result=filter(original);
 assert.deepEqual(Object.keys(result),['Attack Boost']);
 assert.equal(Object.keys(original).length,3);
});
test('missing skill totals yield empty power inputs',()=>{
 assert.equal(Object.keys(filter(null)).length,0);
});
test('STANDARD wrapper filters before damage engine evaluation',()=>{
 const wrapper=html.slice(html.indexOf('function standardPowerForStats(kind,st,cond,total={}){'),html.indexOf('function comparisonPowerIndex(',html.indexOf('function standardPowerForStats(kind,st,cond,total={}){')));
 assert.match(wrapper,/total=standardPowerSkillTotals\(total\)/);
});
