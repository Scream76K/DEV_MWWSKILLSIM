const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const definitions=[...html.matchAll(/function skillEntries\(obj\)\{[\s\S]*?\n\}/g)].map(x=>x[0]);
assert.equal(definitions.length,2,'both skill entry parsers should be covered');
for(const [i,source] of definitions.entries()){
  const parse=vm.runInNewContext(source+'\nskillEntries');
  test(`parser ${i+1}: valid decoration skills aggregate across equipment`,()=>{
    const slots=[[{name:'攻撃',level:1}],[{name:'攻撃',level:2}],[{name:'見切り',level:1}]];
    const total={};for(const entries of slots)for(const [name,lv] of parse(entries))total[name]=(total[name]||0)+lv;
    assert.equal(total['攻撃'],3);assert.equal(total['見切り'],1);
  });
  test(`parser ${i+1}: invalid decoration skill levels cannot modify build`,()=>{
    const entries=[{name:'攻撃',level:-2},{name:'攻撃',level:0.5},{name:'攻撃',level:'abc'},{name:'攻撃',level:Infinity},{name:'攻撃',level:1},{name:'見切り',level:2}];
    assert.equal(JSON.stringify(parse(entries)),JSON.stringify([['攻撃',1],['見切り',2]]));
  });
  test(`parser ${i+1}: skill with missing level is not granted`,()=>assert.equal(parse([{name:'攻撃'}]).length,0));
}
