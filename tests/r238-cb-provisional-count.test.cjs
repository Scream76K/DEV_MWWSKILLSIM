const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('r238 provisional count requires cited evidence and is not silently guessed',()=>{
  assert.match(src,/const CHARGE_BLADE_PROVISIONAL_PHIAL_COUNTS=Object\.freeze\(\{\}\)/);
  assert.match(src,/p\?\.status==='PROVISIONAL'/);
  assert.match(src,/typeof p\.source==='string'&&p\.source\.trim\(\)/);
  assert.match(src,/verificationStatus:countEvidence\.status/);
  assert.match(src,/PHIAL_EXPLOSION_COUNT_UNVERIFIED/);
});
