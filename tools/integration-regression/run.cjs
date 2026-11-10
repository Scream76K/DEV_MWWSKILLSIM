'use strict';
const path=require('node:path');
// Reuse the unchanged fail-closed runner; only this integration owns its new contract.
process.env.INPUT_GUARD_ROOT=path.resolve(__dirname,'../..');
process.env.INPUT_GUARD_CONTRACT=path.join(__dirname,'contract.json');
require('../input-guard-regression/run.cjs');
