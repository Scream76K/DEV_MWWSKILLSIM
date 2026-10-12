const {test}=require('node:test');const assert=require('node:assert/strict');const B=require('../technique-physical-formula-bridge.js');
const context={weaponAttack:200,hitZonePhysical:50,activeSkills:[],criticalBoostLevel:0,affinity:0,attackConditions:{}};
const handoff={rows:[{stage:1,canonicalTechniqueId:'GS',hitCount:1,status:'ENGINE_CONTEXT_DOCUMENTED_UNVERIFIED',context,blockers:[]}]};
const engine={hits:()=>[{mv:100,partModifier:1}]};const formula=p=>({p:p.attack*p.mv/100*p.hz/100*p.sharp});const options={weaponType:'great-sword',sharpnessPhysicalMultiplier:1.32,sharpnessEvidenceRef:'reference'};
test('reference physical formula works only with explicit multipliers',()=>{const r=B.inspect(handoff,engine,formula,options);assert.equal(r.rows[0].physicalTotal,132);assert.equal(r.verifiedDps,null);assert.equal(r.rows[0].verified,false);});
test('no sharpness evidence blocks',()=>{const r=B.inspect(handoff,engine,formula,{weaponType:'great-sword'});assert.equal(r.rows[0].physicalTotal,null);});
test('skills block unsupported formula',()=>{const r=B.inspect({rows:[{...handoff.rows[0],context:{...context,activeSkills:['attack']}}]},engine,formula,options);assert.equal(r.rows[0].physicalTotal,null);});
test('non-unit part modifier blocks',()=>{const r=B.inspect(handoff,{hits:()=>[{mv:100,partModifier:1.2}]},formula,options);assert.equal(r.rows[0].physicalTotal,null);});
test('blocked handoff cannot calculate',()=>{const r=B.inspect({rows:[{...handoff.rows[0],status:'ENGINE_CONTEXT_BLOCKED'}]},engine,formula,options);assert.equal(r.rows[0].physicalTotal,null);});
