# Standard LBG rapid Foray75 (2026-11-11)

## Source and narrow adoption

Base: published `eb12797988e1f7f1652159ae74557ae5574f3816`.
The committed `docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json` contains skill75, ranks182–186 (levels1–5). Its Japanese descriptions specify a large monster affected by poison or paralysis, attack +6/+8/+10/+12/+15, and affinity +0/+5/+10/+15/+20. This is retained DB evidence, not verification of a current game version or a new live-game measurement.

The existing `STANDARD_CONDITIONAL_ATTACK_RULES` in index.html supplies `MONSTER_POISON_OR_PARALYSIS` and these attack increments. `calcMaxAffinity` already supplies the affinity increments. This change only appends75 to the common-rule list under `rapidAmmoSequence`. Foray remains classified as conditionalAttack and requires exactly one matching applied row in a resolved plan. The global conditional-affinity classification, coefficients, producer and explicit single-trigger route are unchanged.

Normal retains the existing inactive-condition premise. Maximum is the existing hypothetical active poison-or-paralysis reference: its attack increment and capped affinity increment are supplied once, and those stats are used for each of25 contacts. No status accumulation, poison damage, paralysis duration, application success or buff uptime is simulated. Do not interpret the maximum as proof that this equipment alone inflicts the required status.

## Limited proof

The first source-reference RED run had171 checks:129 failures and42 passing control checks. Missing Foray increments were observed, but that initial run also included the fixture limitations described below, so not every failure is attributed solely to the product omission. After the one-entry product change, the initial test design exposed two fixture limitations: custom charms retain at most three skills, so a seven-skill combined expectation did not describe the actual saved input; and weapon771's intrinsic unadopted skill82 prevents using its raw adapter entry as an unfiltered boundary oracle. Neither issue was addressed by widening a product guard.

The final169-check proof uses actual weapon IDs783/763/771 and normal-ammo levels1/2/3. It verifies all five Foray levels, both channels and every one of25 traces, separately combining Foray with142,99,22,154,81 and120, plus the three-skill Foray/Latent Power/Peak Performance combination. Requested skill levels are asserted against actual calcState.total; records include actual skills, source rank IDs, producer rows and omissions. No seven-skill simultaneous result is claimed.

The source-reference arithmetic independently applies adopted motion values17/23.8/30.6, rapid0.7, target physical0.65 and critical rules. Baseline attack/affinity come from the accepted no-added-skill trace, so this is a per-contact/delta oracle, not an independent external reconstruction of all equipment stats. On weapon763, a labelled adapter-level test supplies negative/zero/high affinity inputs to verify crossing zero and the100 cap without repeated additions. A nonrapid773 contrast checks its existing15-contact results. Direct negative cases on771 may also encounter its intrinsic skill82 rejection, so individual negative causality is established by the corresponding normal-baseline763 cases rather than claimed for every771 rejection.

Public producer assertions check MONSTER_POISON_OR_PARALYSIS, exact attackAdd, unique rank and aggregate conditionalFlat. Negative cases cover missing/pending plans, wrong identity, out-of-range/fractional levels, duplicate skills and missing/duplicate/wrong-rank applied rows. Old explicit single-trigger Foray stays unavailable and the valid baseline remains five contacts. Rapid First/Force omissions remain disclosed. Save/load/comparison preserve the input and named saves.

The inherited public-producer trust boundary is unchanged: arbitrary external mutations of plan condition/aggregate flat are not independently authenticated. Do not claim adversarial plan-value resistance. The three-skill custom-charm setup is a controlled mapping probe, not proof that every tested rank combination is obtainable as a live-game charm.

## Evidence and limits

Evidence is in the sibling `evidence/lbg-rapid-foray-20261111` directory: red-proof.json, initial green-proof.json (documented fixture failures), final green-final.json and targeted-tests.tap. Final runtime and fixture hashes are bound to the proof. The final Chromium proof passed three actual-weapon cases with unchanged runtime hashes and zero page errors. The inspected regression subset passed320 tests and the existing reload suite passed15. The contract retains all130 prior inputs and1,553 tests, updates only the product adapter hash, and adds three proof/test inputs plus one wrapper:133 inputs and1,554 expected tests. Final history preservation and independent acceptance are tracked separately.

The full local suite and full6188-case matrix are not rerun. Game/source version remains UNVERIFIED and live-game accuracy PENDING. New branch creation, publication and prohibited CB accessor/prototype operations are excluded.
