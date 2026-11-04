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

test('public build entrypoint remains fail closed for POWER_ELEMENT H route', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const source = fs.readFileSync(path.join(__dirname,'..','hope-hammer-browser-adapter.js'),'utf8');
  assert.ok(source.includes("if(officialPhialType!=='IMPACT'||chargeBladeState.phialType!=='IMPACT')return fail('REAL_SLICE:CB_H_IMPACT_ONLY')"));
  assert.ok(!source.includes('CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH'),
    'this isolation branch must not secretly contain PR #1 production wiring');
});

test('shared adapter and both browser aliases validate approved shield without enabling full H', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(__dirname,'..');
  const product = fs.readFileSync(path.join(root,'hope-hammer-browser-adapter.js'),'utf8');
  const bundle = fs.readFileSync(path.join(root,'himmel-real-browser-bundle.js'),'utf8');
  assert.ok(product.includes('CB_H_IMPACT_ONLY'));
  const shared = fs.readFileSync(path.join(root,'v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs'),'utf8');
  assert.ok(shared.includes('validateApprovedPowerHShield({weaponType'));
  assert.equal((bundle.match(/validateApprovedPowerHShield\(\{weaponType/g)||[]).length,2);
  assert.equal((bundle.match(/define\("[./]+cb-approved-shield-contract\.cjs"/g)||[]).length,2);
  assert.equal((bundle.match(/require\('\.\/cb-approved-shield-contract\.cjs'\)/g)||[]).length,2);
  assert.equal((bundle.match(/r\.status==='OWNER_APPROVED'&&techniqueId==='CB_SHIELD_THRUST'/g)||[]).length,2);
  assert.ok(!product.includes('validateApprovedPowerHShield({weaponType'),
    'do not accidentally enable unreviewed POWER_ELEMENT H at product calcBuild entrypoint');
});
