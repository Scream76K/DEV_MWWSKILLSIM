# CB POWER_ELEMENT H shield — isolated contract integration gate (2026-11-04)

## Frozen sources
- UI baseline: `3096b71293f22ff1835214fc941a6431cdacf8a0`
- PR #1 candidate reviewed: `cef6362f646fdd7260e8aedce1bcbdc3c8810204`
- This isolation PR #2: `flamme/cb-approved-shield-isolation-20261104`
- Owner specification only: shield thrust `CB_SHIELD_THRUST`, one explosion hit, zero consumed phials, POWER_ELEMENT H exact route.
- Evidence: owner approval, **not** a game measurement.

## Source-level gate analysis (not a runtime pass)
Baseline `hope-hammer-browser-adapter.js` has:
`if(officialPhialType!=='IMPACT'||chargeBladeState.phialType!=='IMPACT')return fail('REAL_SLICE:CB_H_IMPACT_ONLY');`

Baseline H prefix resource plan is `OWNER_APPROVED_PROVISIONAL` for both morph and shield, and existing `real-technique-one-hit-adapter.cjs` validates that provisional status. It has no owner-approved POWER_ELEMENT shield status branch.

PR #1 adds the precise owner decision, POWER_ELEMENT matching, per-technique status, and shared adapter recognition. But that same candidate has unrelated H-state and skill changes (86, 152, 163, 165), so it is NOT a safe file-level cherry-pick.

## Current PR #2
This branch adds a pure contract validator (fail closed), seven isolated tests (five contract tests plus two source isolation checks), and a minimal Actions workflow. It changes no existing production source and intentionally leaves the baseline `CB_H_IMPACT_ONLY` guard in place. The source checks ensure this narrow PR is not misrepresented as a functional POWER_ELEMENT public route.

## Preconditions before product wiring
1. Preserve the exact H route ID list and distinct R/H independent starts.
2. Validate power-element pair **and** the exact shield contract using actual Technique DB hit count and H prefix cost; avoid promoting the morph or downstream discharge to approved.
3. Add a narrowly scoped shared adapter acceptance for owner-approved shield metadata. Preserve existing provisional handling for other IDs, and fail closed for inconsistent status or cost.
4. Keep normal/maximum and distinct saved A/B on the same public `calcBuild()` pipeline. Do not silently replace blocked outcomes with 0 damage.
5. Ensure Node source and browser bundle aliases agree.
6. Compare other 13 weapons using the pinned baseline and test one genuine POWER_ELEMENT H build plus a tampered contract.
7. Verify browser UI desktop/tablet/phone, especially consumer-facing blocking reasons.

## Approval
**PREPARATION ONLY / HOLD_MERGE.** CI status of this feature branch was not confirmed by the linked GitHub workflow-run lookup; tests are authored but must not be called PASS without execution evidence. PR #1 and PR #2 remain Draft. This document does not authorize merging or beta publication.

## Shared-adapter contract wiring — update 2026-11-04
- Implemented a narrow owner-approved branch in `v10-six-layer-foundation/min8/real-technique-one-hit-adapter.cjs` and **both** embedded copies in `himmel-real-browser-bundle.js`. The branch checks exact technique ID, charge-blade type, POWER_ELEMENT phial type, H route decision metadata, explosion hit count = 1, zero consumed phials and explicit phial-reference source status (`OWNER_APPROVED_PROVISIONAL` or `OBSERVED`). Failed checks still return the existing `CB_H_PREFIX_CONTRACT_INVALID` at the shared adapter boundary.
- No changes to `hope-hammer-browser-adapter.js`; its existing `CB_H_IMPACT_ONLY` guard remains. Thus **POWER_ELEMENT H is still unavailable at the public product entrance**, and no damage values are newly certified. This stage only prepares the scoped shared adapter gate.
- Preserves provisional H prefix behavior for pre-existing input records and rejects attempts to promote other H techniques to the approved shield scope.
- Dedicated tests now contain 8 cases including the source-status negative guard, source/bundle dual-alias parity and a retained original product-entry gate assertion.
- **Execution evidence pending:** no completed GitHub Actions run was surfaced by the available workflow-run lookup. These checks are authored and source-inspected but not reported as runtime PASS. Safari, A/B and 13-weapon public regression must be rerun before acceptance.
- The previously written “four new files only / no product source change” statement describes the earlier preparatory checkpoint; it is superseded by this update. Current diff includes the shared adapter and browser bundle.

**Decision remains HOLD_MERGE** for PR #2 and PR #1. No approval of skills 86/152/163/165 or general POWER_ELEMENT H route.

## Runtime smoke evidence (2026-11-04)
The published sources were loaded and exercised in a standalone JavaScript isolate (not Safari and not GitHub Actions):
- Shared Node adapter `adaptOrdinaryPhysicalHit`: an exact synthetic owner-approved POWER_ELEMENT shield record emitted one hit event (one physical and one phial component) plus one transition; no consume event.
- Mutating consumed phials from 0 to 1, explosion hits from 1 to 2, or the owner approval scope returned `REAL_SLICE:CB_H_PREFIX_CONTRACT_INVALID`.
- Both browser-bundle module IDs `/real-technique-one-hit-adapter.cjs` and `./real-technique-one-hit-adapter.cjs` loaded and emitted the same types and phial component under identical synthetic inputs.
- Permanent test `tests/flamme-cb-approved-shield-isolation.test.cjs` now contains 11 cases, including Node adapter execution and browser module execution via a read-only test probe.
- These inputs are synthetic contract fixtures, **not** real MHDB, in-game measurements, a public `calcBuild()` test, or a Safari proof. Node test and CI job results remain unconfirmed. Work remains unmerged.

No expansion of the POWER_ELEMENT H public route or provisional skill scopes was performed.
