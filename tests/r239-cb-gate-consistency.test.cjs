const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
test('CB combo gate recognizes verified and provisional evidence through same accessor as CB handler',()=>{
 assert.match(html,/if\(kind==='charge-blade'&&CHARGE_BLADE_TECHNIQUES\[id\]\?\.phial\)throw new Error\(chargeBladePhialCountEvidence\(id\)===null/);
 assert.match(html,/const countEvidence=chargeBladePhialCountEvidence\(techniqueId\)/);
});
