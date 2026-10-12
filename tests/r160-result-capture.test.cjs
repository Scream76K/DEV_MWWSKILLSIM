const {test}=require('node:test');const assert=require('node:assert/strict');
const {createCapture}=require('../gunlance-result-capture.js');
const mk=(id,damage=60,contextId='same')=>({weaponType:'gunlance',source:'VERIFIED_GENERIC_COMPONENTS',evidenceId:id,contextId,components:[{component:'physical',damage,hits:2,verified:true}],durationSeconds:3,durationVerified:true});
test('captures and compares validated results',()=>{const c=createCapture();c.put('A',mk('a'));c.put('B',mk('b',90));assert.equal(c.compare().relativeDpsPercent,150);});
test('rejects incomplete evidence without replacing saved slot',()=>{const c=createCapture();c.put('A',mk('a'));assert.throws(()=>c.put('A',{...mk('bad'),durationVerified:false}));assert.equal(c.status().A.evidenceId,'a');});
test('rejects different comparison contexts',()=>{const c=createCapture();c.put('A',mk('a'));c.put('B',mk('b',90,'other'));assert.throws(()=>c.compare(),/context/);});
test('requires both snapshots',()=>{assert.throws(()=>createCapture().compare(),/both/);});
test('clear resets selected slot only',()=>{const c=createCapture();c.put('A',mk('a'));c.put('B',mk('b'));c.clear('A');assert.equal(c.status().A,null);assert.equal(c.status().B.evidenceId,'b');});
