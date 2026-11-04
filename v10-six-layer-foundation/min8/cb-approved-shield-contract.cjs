'use strict';

// Owner-approved specification only. This module does not approve the broader
// POWER_ELEMENT H route or change any product calculation on its own.
const APPROVED_SHIELD = Object.freeze({
  status: 'OWNER_APPROVED',
  decisionDate: '2026-11-04',
  scope: 'CB_H_EXACT_ROUTE_POWER_ELEMENT_SHIELD_THRUST',
  techniqueId: 'CB_SHIELD_THRUST',
  phialExplosionHits: 1,
  consumedPhials: 0,
  verificationStatus: 'OWNER_SPEC_CONFIRMED_GAME_MEASUREMENT_NOT_CLAIMED'
});

const MISMATCH = 'CB_POWER_H_SHIELD_OWNER_CONTRACT_MISMATCH';

/**
 * Fail-closed narrow approval check. Only call when the exact H shield event
 * is reached; callers must independently validate the rest of the H route.
 * No conversion of unknown values to zero, and no provisional -> approved
 * promotion for any other event.
 */
function validateApprovedPowerHShield(input) {
  if (!input || typeof input !== 'object') return {ok:false, reason:MISMATCH};
  const decision = input.ownerDecision;
  const valid = input.weaponType === 'charge-blade' &&
    input.phialType === 'POWER_ELEMENT' &&
    input.routeScope === APPROVED_SHIELD.scope &&
    input.techniqueId === APPROVED_SHIELD.techniqueId &&
    input.resourceContractId === 'CB_H_PREFIX_RESOURCE' &&
    input.phialExplosionHits === APPROVED_SHIELD.phialExplosionHits &&
    input.consumedPhials === APPROVED_SHIELD.consumedPhials &&
    decision && typeof decision === 'object' &&
    Object.keys(APPROVED_SHIELD).every(k => decision[k] === APPROVED_SHIELD[k]);
  return valid ? {ok:true, reason:null} : {ok:false, reason:MISMATCH};
}

module.exports = {APPROVED_SHIELD, MISMATCH, validateApprovedPowerHShield};
