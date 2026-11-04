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

## Independent callback execution (2026-11-04, latest isolation branch)
The 12 authored test callbacks from `tests/flamme-cb-approved-shield-isolation.test.cjs` were loaded from GitHub and invoked in a JavaScript isolate with lightweight shims for Node `node:test`, `node:assert/strict`, `node:fs`, `node:path`, and `node:vm`. All **12/12 callbacks passed** in this isolated execution, including the newest check that the legacy provisional morph/prefix contract is not silently promoted by the approved shield scope.

This evidence **is not** native `node --test`, GitHub Actions SUCCESS, an installed browser, real MHDB, or an official public `calcBuild()` run. No CI workflow run was returned by the connector's commit-workflow lookup; that lookup is limited to PR-triggered runs and cannot by itself prove that a push-triggered workflow never ran. The correct CI status is **NOT VERIFIED** rather than FAILED or PASSED.

This branch does not modify the public `hope-hammer-browser-adapter.js` gate. POWER_ELEMENT H still remains blocked there. PR #2 remains Draft and held for independent public integration review.

## CI verification gate (2026-11-04)
- Workflow `.github/workflows/cb-approved-shield-isolation.yml` now listens for push on the isolated branch and relevant PR file changes (contract, test, shared adapter, browser bundle and workflow itself), checks JavaScript syntax for all 4 files, then runs native `node --test`.
- `workflow_dispatch` has also been declared, but GitHub normally requires the workflow file to exist on the repository default branch before its manual Run workflow control is available. The default/UI branch is deliberately unchanged, so **manual dispatch availability is not confirmed**.
- GitHub connected commit-workflow lookup returned no matching PR-triggered runs for this head; combined commit statuses were empty for the prior head. These observations do **not** establish that the push workflow failed or never ran. A job URL/conclusion from GitHub Actions is still required for a formal PASS.
- No production logic or UI source was modified in this CI-only checkpoint; PR #2 remains Draft and unmerged. The previously recorded 12/12 isolated callback result remains distinct from native `node --test`.

## Cross-runtime negative parity (2026-11-04)
- Added the thirteenth persistent test: shared Node adapter and both embedded browser aliases must reject eight tampered owner-approved shield inputs (wrong weapon, technique, phial kind, Hit count, missing source status, consumed count, decision scope, decision approval state).
- A test-only escaped-newline error in the first parity probe was identified and corrected in `4ee4a974fba3760dfe5bc59cc68d964c44f84da3`; no product file was modified in that correction.
- After the correction, **13/13 test callbacks passed** under an emulated Node test/assert/fs/vm API with GitHub-sourced adapter and bundle code. This is not native Node.js `node --test` nor an official GitHub Actions run.
- The GitHub connector did not expose a successful workflow run. An attempt to inspect browser tabs required an originating connected extension context, while the execution container could not resolve github.com for cloning, so no verified native or Actions PASS can be claimed.
- The product/public `hope-hammer-browser-adapter.js` remains unchanged and still blocks POWER_ELEMENT H; no wider skill or H route approval and no beta sign-off.

## Complete event-payload parity (2026-11-04)
- Added a fourteenth persistent test which compares JSON-normalized **complete event payloads**, not just event names, from the Node shared adapter and both browser-bundle adapter aliases for the exact approved POWER_ELEMENT shield.
- Source retrieved directly from GitHub was executed in a JavaScript isolate using shims for Node test/assert/fs/vm; **14/14 test callbacks passed** including the new full-payload comparison.
- Explicitly checked the test output contains one phial component and no `consume` event. The input is an isolated, synthetic contract fixture; not live game evidence or MHDB public calculation.
- Local container Node.js v22 is installed but repository clone was blocked by unavailable github.com DNS; no native node:test execution could be verified. GitHub Actions conclusion is also not verified.
- No change to public `calcBuild()` gate, other H states, UI or approved skill scope. Both PRs remain Draft / HOLD_MERGE.

## 2026-11-04 browser-source parity correction
- Reordered the shield-validator import and finite helper in both browser adapter aliases to match the Node source. No calculation expression changed.
- Verified byte-for-byte identity of both aliases for each of the two source modules (four embedded module bodies).
- Added permanent test #15 for exact source parity; its isolated callback passed. Prior 14-case results are historical; full native 15-test runner and GitHub Actions results remain UNVERIFIED.
- Public calcBuild POWER_ELEMENT H still blocked, both PRs remain Draft/HOLD_MERGE.

## 2026-11-04 provisional owner-metadata isolation
- Updated the shared Technique adapter and two browser aliases to reject a `CB_H_PREFIX_RESOURCE` marked `OWNER_APPROVED_PROVISIONAL` when `ownerDecision` is non-null. This prevents a provisional H prefix from carrying owner-approved shield metadata without the exact approved-state validation.
- The original provisional record with `ownerDecision:null` continues to produce its original event, while mismatched approval metadata fails with `REAL_SLICE:CB_H_PREFIX_CONTRACT_INVALID`.
- Added test #16 for all three adapter copies. GitHub-sourced callbacks were executed in a V8 JavaScript isolate with shims: 16/16 passed. This is NOT native node --test or GitHub Actions CI.
- Existing public `CB_H_IMPACT_ONLY` and unapproved candidate skill gates remain unchanged. No UI/MHDB/save behavior changes and no merge authorization.

## CI evidence capture checkpoint — 2026-11-04
- CI workflow now executes the native Node TAP test runner with `set -o pipefail` and `tee cb-approved-shield-test.tap`. A failing test remains a failing job despite the tee pipeline.
- `actions/upload-artifact@v4` runs with `if: always()` and captures the TAP log when available, including failures. This is a CI observability improvement; the workflow was not reported as executed by the available GitHub connector.
- Feature SHA at the CI change: `99cc58d08897c0cbc718d17bda08713d9ee9c9c0`. No shared adapter, UI, public calculation or MHDB source changed in this commit.
- Native CI success and artifact upload are **not yet verified**. Draft/HOLD_MERGE remains.
