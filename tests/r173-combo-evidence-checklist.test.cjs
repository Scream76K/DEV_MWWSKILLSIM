const {test}=require('node:test');const assert=require('node:assert/strict');
const {create,format}=require('../combo-evidence-checklist.js');
test('empty combo has no work and is never capture eligible',()=>{const r=create(null);assert.equal(r.status,'NO_COMBO_STAGES');assert.equal(r.captureEligible,false)});
test('repeated technique occurrences retain independent stage numbers',()=>{const r=create({entries:[{techniqueId:'GL',pending:['VERIFIED_STAGE_TIMING_PENDING']},{techniqueId:'GL',pending:['VERIFIED_COMPONENT_DAMAGE_PENDING']}]});assert.deepEqual(r.items.map(x=>x.stage),[1,2]);assert.equal(r.items[1].code,'VERIFIED_COMPONENT_DAMAGE_PENDING')});
test('duplicate reasons within one stage are deduplicated',()=>{const r=create({entries:[{techniqueId:'A',pending:['COMBO_STAGE_BLOCKED','COMBO_STAGE_BLOCKED']}]});assert.equal(r.items.length,1)});
test('no pending references never means verified DPS',()=>{const r=create({entries:[{techniqueId:'A',pending:[]}]});assert.equal(r.captureEligible,false);assert.match(format({entries:[{techniqueId:'A',pending:[]}]}),/独立検証/)});
test('missing refs result in actionable worklist',()=>{const s=format({entries:[{techniqueId:'A',pending:['STAGE_TIMING_EVIDENCE_NOT_REGISTERED','COMPONENT_DAMAGE_EVIDENCE_NOT_REGISTERED']}]});assert.match(s,/Technique DBに登録/);assert.match(s,/自動登録：不可/)});
