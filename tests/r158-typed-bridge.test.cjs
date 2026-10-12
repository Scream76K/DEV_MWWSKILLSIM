const test=require('node:test');
const assert=require('node:assert/strict');
const bridge=require('../gunlance-generic-bridge.js');
function typed(damage=68){return {weaponType:'gunlance',source:'VERIFIED_TYPED_COMPONENTS',contextId:'training-room',evidenceId:'video-1',durationSeconds:2,durationVerified:true,components:{physicalBody:0,elementalBody:0,shelling:damage,wyrmstake:0},componentEvidence:{physicalBody:{verified:true,evidenceRef:'p',hits:0},elementalBody:{verified:true,evidenceRef:'e',hits:0},shelling:{verified:true,evidenceRef:'shell-video',hits:2},wyrmstake:{verified:true,evidenceRef:'w',hits:0}}};}
test('typed verified records connect to DPS comparison',()=>{const r=bridge.compareGeneric(typed(),typed(80));assert.equal(r.a.dps,34);assert.equal(r.b.dps,40);assert.equal(r.calculationScope,'VERIFIED_COMPONENTS_ONLY');});
test('typed numeric totals alone do not qualify',()=>{const a=typed();delete a.componentEvidence;assert.throws(()=>bridge.compareGeneric(a,typed()),/evidence required/);});
test('rejects unverified individual component',()=>{const a=typed();a.componentEvidence.shelling.verified=false;assert.throws(()=>bridge.compareGeneric(a,typed()),/unverified typed component/);});
test('rejects missing typed component',()=>{const a=typed();delete a.components.wyrmstake;assert.throws(()=>bridge.compareGeneric(a,typed()),/missing typed component/);});
test('rejects mismatched context',()=>{const b=typed();b.contextId='different';assert.throws(()=>bridge.compareGeneric(typed(),b),/same verified context/);});
test('rejects unverified duration',()=>{const a=typed();a.durationVerified=false;assert.throws(()=>bridge.compareGeneric(a,typed()),/verified duration/);});
