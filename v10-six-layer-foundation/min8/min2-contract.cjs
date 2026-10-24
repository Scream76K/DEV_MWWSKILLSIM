'use strict';
// min8 L1/L2 use the already-committed min2 canonical implementations.
// Avoid a second copy of validation rules. Existing contract remains the source of truth.
const { inputAdapter, buildResolver, WEAPON_TYPES, datum, validateDatum } = require('../core.cjs');
module.exports = { inputAdapter, buildResolver, WEAPON_TYPES, datum, validateDatum };
