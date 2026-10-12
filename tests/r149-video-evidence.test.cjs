const test = require('node:test');
const assert = require('node:assert/strict');
const evidence = require('../evidence/recorded_23_videos.json');
test('23 unique mapped recordings across five weapons',()=>{assert.equal(evidence.records.length,23);assert.equal(new Set(evidence.records.map(r=>r.video_id)).size,23);assert.equal(new Set(evidence.records.map(r=>r.weapon)).size,5);});
test('full burst shell count is dynamic, with user-confirmed 2-shell observation',()=>{const r=evidence.records.find(r=>r.move==='full burst');assert.equal(r.verified_observation.shell_hits,r.verified_observation.shell_count);assert.equal(r.verified_observation.shell_total_display,68);assert.equal(evidence.rule.full_burst_shell_hits,'actual shells fired; never fixed');});
test('insect glaive extract state is per recording',()=>{const r=evidence.records.filter(r=>r.weapon==='insect_glaive');assert.deepEqual(r.map(x=>x.conditions.extract),['three','red','three','three']);});
test('phial and horn mappings are complete, and enhanced state is not guessed',()=>{const cb=evidence.records.filter(r=>r.weapon==='charge_blade');assert.equal(cb.length,6);assert.ok(cb.every(r=>r.conditions.enhanced_state==='unverified'));assert.equal(evidence.records.filter(r=>r.weapon==='hunting_horn').length,5);});
