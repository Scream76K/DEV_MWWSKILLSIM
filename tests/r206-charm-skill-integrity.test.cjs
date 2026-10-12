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
test('normalizer rejects fractional level rather than rounding upward',()=>assert.match(html,/level:\(Number\.isInteger\(Number\(x\?\.level\)\)\&\&Number\(x\?\.level\)>0\?Number\(x\.level\):1\)/));
