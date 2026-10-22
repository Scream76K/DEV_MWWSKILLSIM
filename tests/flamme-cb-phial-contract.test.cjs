'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');

// Integration contract: evaluate the actual production formula declarations.
// No mock formula or generated expected damage is allowed.
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const start = source.indexOf('const CHARGE_BLADE_FORMULAS=Object.freeze({');
const end = source.indexOf('const CHARGE_BLADE_TECHNIQUES=', start);
assert.ok(start >= 0 && end > start, 'Charge Blade production formula boundaries missing');
const context = {};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + ';globalThis.cbFormulas=CHARGE_BLADE_FORMULAS;', context);
const impact = context.cbFormulas.IMPACT_PHIAL.evaluate;
const element = context.cbFormulas.POWER_ELEMENT_PHIAL.evaluate;

test('CB impact phial independent golden value', () => {
  assert.ok(Math.abs(impact({baseAttack:100,coefficient:0.12,shieldBoosted:true}) - 14.4) < 1e-9);
});
test('CB element phial independent golden value', () => {
  assert.ok(Math.abs(element({displayedElement:500,coefficient:2.1,shieldBoosted:true,elementalHitzone:25}) - 34.125) < 1e-9);
});
test('CB zero coefficient is valid but unknown coefficients must not become zero damage', () => {
  assert.equal(impact({baseAttack:100,coefficient:0}), 0);
  for (const coefficient of [null,undefined,'0.12','',NaN,Infinity,-0.12]) {
    assert.throws(() => impact({baseAttack:100,coefficient}), /CB_FAIL_CLOSED/);
    assert.throws(() => element({displayedElement:500,coefficient,elementalHitzone:25}), /CB_FAIL_CLOSED/);
  }
});
test('CB required component fields fail closed', () => {
  assert.throws(() => impact({baseAttack:null,coefficient:0.12}), /CB_FAIL_CLOSED/);
  assert.throws(() => impact({baseAttack:100,coefficient:0.12,artilleryMultiplier:null}), /CB_FAIL_CLOSED/);
  assert.throws(() => element({displayedElement:500,coefficient:2.1,elementalHitzone:null}), /CB_FAIL_CLOSED/);
});
