'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {APPROVED_SHIELD, MISMATCH, validateApprovedPowerHShield} =
  require('../v10-six-layer-foundation/min8/cb-approved-shield-contract.cjs');

const exact = () => ({
  weaponType: 'charge-blade',
  phialType: 'POWER_ELEMENT',
  routeScope: APPROVED_SHIELD.scope,
  techniqueId: 'CB_SHIELD_THRUST',
  resourceContractId: 'CB_H_PREFIX_RESOURCE',
  phialExplosionHits: 1,
  consumedPhials: 0,
  ownerDecision: {...APPROVED_SHIELD}
});

test('only the exact owner-approved shield contract passes', () => {
  assert.deepEqual(validateApprovedPowerHShield(exact()), {ok:true, reason:null});
});

test('incorrect scope, phial type, weapon type, and technique fail closed', () => {
  for (const [key, value] of [
    ['weaponType','great-sword'], ['phialType','IMPACT'],
    ['routeScope','CB_H_GENERAL'], ['techniqueId','CB_AXE_TO_SWORD_MORPH'],
    ['resourceContractId','CB_DISCHARGE_RESOURCE']
  ]) {
    assert.deepEqual(validateApprovedPowerHShield({...exact(), [key]:value}),
      {ok:false, reason:MISMATCH}, key);
  }
});

test('missing, nonzero or altered phial hits and resource cost fail closed', () => {
  for (const key of ['phialExplosionHits','consumedPhials']) {
    for (const value of [undefined, null, 2, -1, '0']) {
      assert.equal(validateApprovedPowerHShield({...exact(), [key]:value}).ok,
        false, key+':'+String(value));
    }
  }
});

test('provisional or altered decision metadata never silently promotes', () => {
  for (const [key, value] of [
    ['status','OWNER_APPROVED_PROVISIONAL'],
    ['scope','CB_H_ALL'],
    ['verificationStatus','GAME_MEASURED'],
    ['phialExplosionHits',2],
    ['consumedPhials',1],
    ['decisionDate','2026-11-05']
  ]) {
    assert.equal(validateApprovedPowerHShield({
      ...exact(), ownerDecision:{...APPROVED_SHIELD,[key]:value}
    }).ok, false, key);
  }
  assert.equal(validateApprovedPowerHShield({...exact(),ownerDecision:null}).ok,false);
  assert.equal(validateApprovedPowerHShield(null).ok,false);
});

test('approval object is immutable and not an in-game measurement claim', () => {
  assert.equal(Object.isFrozen(APPROVED_SHIELD),true);
  assert.equal(APPROVED_SHIELD.verificationStatus,
    'OWNER_SPEC_CONFIRMED_GAME_MEASUREMENT_NOT_CLAIMED');
});
