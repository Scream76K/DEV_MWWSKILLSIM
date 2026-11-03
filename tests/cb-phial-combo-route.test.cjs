'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
function extractBetween(start, end) {
  const a = html.indexOf(start), b = html.indexOf(end, a);
  assert.ok(a >= 0 && b > a, 'missing CB function boundary: ' + start);
  return html.slice(a, b).trim();
}
const registrationSource = extractBetween('function directCanonicalComboTechnique(', 'function readCanonicalComboHits(');
const calculationSource = extractBetween('function chargeBladeComboDamage(', 'function comboBlockedMessage(');
test('adopted CB phial counts reach the combo calculation handler; missing counts still stop', () => {
  let count = {count: 2, status: 'PROVISIONAL', source: 'existing-evidence'};
  const record = {techniqueName: '高出力', verificationStatus: 'PARTIALLY_VERIFIED', hits: [{mv: 68, elementModifier: 1}]};
  const fn = vm.runInNewContext('(' + registrationSource + ')', {
    techniqueDbGet: () => record,
    Technique: class { constructor(data) { Object.assign(this, data); } },
    CHARGE_BLADE_TECHNIQUES: {CB_AED: {phial: {impactCoefficient: 0.15}}},
    chargeBladePhialCountEvidence: () => count,
    readCanonicalComboHits: () => record.hits
  });
  const available = fn('charge-blade', 'CB_AED');
  assert.notEqual(available.calculationBlocked, true);
  assert.equal(available.handler, 'ChargeBladeHandler');
  count = null;
  const unavailable = fn('charge-blade', 'CB_AED');
  assert.equal(unavailable.calculationBlocked, true);
  assert.match(unavailable.blockedReason, /PHIAL_EXPLOSION_COUNT_UNVERIFIED/);
});
test('CB phial combo uses existing resolver, preserves all components and rejects unsupported elemental critical', () => {
  const existing = {physical: 120, element: 35, special: 42, total: 197, components: {}};
  let calls = 0;
  const fn = vm.runInNewContext('(' + calculationSource + ')', {
    CHARGE_BLADE_TECHNIQUES: {CB_AED: {phial: {impactCoefficient: 0.15}}},
    calcState: {stats: {attackComponents: {}}},
    chargeBladeResolveTechniqueDamage: () => { calls += 1; return existing; }
  });
  const move = {canonicalKind: 'charge-blade', canonicalTechniqueId: 'CB_AED'};
  const ctx = {attack: 100, element: 200, hz: 45, ehz: 20, sharp: 1.3, esharp: 1.1,
    affinity: 10, critBonus: 2, elementCrit: false, chargeBladeState: {phialType: 'IMPACT'}};
  const result = fn(move, ctx);
  assert.equal(result.total, 197);
  assert.equal(result.hits[0].total, 197);
  assert.equal(result.hits[0].special, 42);
  assert.equal(result.handler, 'ChargeBladeHandler');
  assert.equal(calls, 1);
  assert.throws(() => fn(move, {...ctx, elementCrit: true}), /ELEMENT_CRITICAL_CONNECTION_PENDING/);
  assert.equal(calls, 1);
});
