const {test}=require('node:test');const assert=require('node:assert/strict');const {audit}=require('../combo-damage-context-audit.js');
const p={entries:[{techniqueId:'t'}]},m={accepted:[{stage:1,techniqueId:'t',gameVersion:'1.042.00.02',evidenceRef:'vid'}]};
const context={weaponId:'w',weaponAttack:200,weaponElement:100,sharpness:'white',affinity:0,criticalBoostLevel:0,activeSkills:[],monsterId:'m',hitZonePhysical:45,hitZoneElement:20,targetState:'normal',attackConditions:{enraged:false},gameVersion:'1.042.00.02'};
const row=(c=context)=>[{stage:1,techniqueId:'t',evidenceRef:'vid',context:c}];
test('complete observations remain unverified',()=>{const r=audit(p,m,row(),'1.042.00.02');assert.equal(r.rows[0].status,'CONTEXT_DOCUMENTED_UNVERIFIED');assert.equal(r.rows[0].damageComparable,false);assert.equal(r.verifiedDps,null)});
test('missing conditions fail closed',()=>assert.equal(audit(p,m,row({...context,monsterId:null})).rows[0].status,'CONTEXT_INCOMPLETE'));
test('wrong version is mismatch',()=>assert.equal(audit(p,m,row({...context,gameVersion:'1.0'}),'1.042.00.02').rows[0].status,'CONTEXT_MISMATCH'));
test('missing stage context',()=>assert.equal(audit(p,m,[]).rows[0].status,'CONTEXT_MISSING'));
test('duplicate stage is rejected',()=>assert.equal(audit(p,m,[...row(),...row()]).rejected[0].reason,'DUPLICATE_STAGE'));
