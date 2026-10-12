'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const fixtures=path.join(__dirname,'fixtures');
for(const name of ['r46-standard-golden.json','r66-legacy-combo-golden.json']){
 test(`${name} is a valid canonical fixture`,()=>{
  const file=path.join(fixtures,name);
  assert.ok(fs.existsSync(file));
  assert.ok(JSON.parse(fs.readFileSync(file,'utf8')));
  assert.equal(fs.existsSync(path.join(__dirname,name)),false,'no stale duplicate');
 });
}
test('all fixture consumers point to canonical fixtures folder',()=>{
 for(const file of ['tests/r46-regression.test.cjs','tools/legacy-mapping-dom.test.cjs','tools/legacy-combo-migration-dom.test.cjs']){
  const s=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(s,/fixtures\/r(?:46-standard|66-legacy-combo)-golden\.json|['"]fixtures['"],['"]r46-standard-golden\.json['"]/);
 }
});
