const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const match=html.match(/function currentCharmSkills\(\)\{[^\n]+\}/g)||[];
test('charm skill aggregation has one definition',()=>assert.equal(match.length,1));
const currentCharmSkills=vm.runInNewContext('let build={charmCustom:{skills:[]}};'+match[0]+';currentCharmSkills');
// VM function needs access to its own build object; evaluate with each fixture.
function sum(skills){return vm.runInNewContext('let build={charmCustom:{skills:'+JSON.stringify(skills)+'}};'+match[0]+';currentCharmSkills()');}
test('two integer levels of same skill add together',()=>assert.equal(sum([{name:'攻撃',level:2},{name:'攻撃',level:'3'}])['攻撃'],5));
test('fractional levels never contribute',()=>assert.equal(sum([{name:'見切り',level:2.5},{name:'見切り',level:1}])['見切り'],1));
test('invalid numeric values never contribute',()=>assert.equal(sum([{name:'攻撃',level:'oops'},{name:'攻撃',level:-2},{name:'攻撃',level:2}])['攻撃'],2));
test('empty names never contribute',()=>assert.equal(Object.keys(sum([{name:'',level:5}])).length,0));
// Exercise the actual normalizer and validation boundary, not an obsolete source spelling.
// Fractional input must survive normalization as evidence, never become Lv1.
test('normalizer preserves fractional level for invalid-input rejection without granting a skill',()=>{
 const {createContext}=require('../tools/legacy-page-test-context.cjs');
 const ctx=createContext({});
 vm.runInContext("build.charmCustom={skills:[{name:'攻撃',level:2.5,type:'weapon'}],slots:[0,0],weaponSlots:[]};normalizeCharm();",ctx);
 assert.equal(vm.runInContext('build.charmCustom.skills[0].level',ctx),2.5);
 assert.equal(vm.runInContext('currentCharmSkills()["攻撃"]',ctx),undefined);
 assert.equal(vm.runInContext('validateCurrentCharm().status',ctx),'invalid');
 assert.match(vm.runInContext('realPipelineSkillGrantIssue()',ctx),/SAVED_SKILL_LEVEL_INVALID/);
});
