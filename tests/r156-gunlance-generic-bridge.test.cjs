const test=require('node:test');const assert=require('node:assert/strict');
const b=require('../gunlance-generic-bridge.js');
const valid=(id,damage=68)=>({weaponType:'gunlance',source:'VERIFIED_GENERIC_COMPONENTS',evidenceId:id,contextId:'same-target',components:[{component:'shelling',damage,hits:2,verified:true}],durationSeconds:2,durationVerified:true});
test('verified generic component calculates raw DPS',()=>{const x=b.fromGeneric(valid('A'));assert.equal(x.totalDamage,68);assert.equal(x.dps,34)});
test('A/B percentage is supplementary to raw DPS',()=>{const r=b.compareGeneric(valid('A'),valid('B',80));assert.equal(r.a.dps,34);assert.equal(r.b.dps,40);assert.equal(r.relativeDpsPercent,117.6)});
test('unverified component rejected',()=>{const x=valid('A');x.components[0].verified=false;assert.throws(()=>b.fromGeneric(x),/unverified/)});
test('unverified duration rejected',()=>{const x=valid('A');x.durationVerified=false;assert.throws(()=>b.fromGeneric(x),/duration/)});
test('different monster contexts rejected',()=>{const x=valid('B');x.contextId='other';assert.throws(()=>b.compareGeneric(valid('A'),x),/context/)});
test('missing component and invalid hits rejected',()=>{const x=valid('A');x.components[0].hits=null;assert.throws(()=>b.fromGeneric(x),/hits/)});
