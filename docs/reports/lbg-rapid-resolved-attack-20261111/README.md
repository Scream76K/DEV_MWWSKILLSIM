# Standard rapid resolved attack candidate

Status: independently reviewed local release based on published 516f9e8861ec4b196c2c851ed058537910bf13df. The user approved the exact contract registration and it is applied. GitHub publication remains separately gated. The external save-receipt.json records the final commit and bundle restoration; the earlier candidate-preservation receipt remains a historical pre-approval record.

## Adopted behavior

The adapter now validates the complete attack projection against the existing standardPowerConditionPlan producer for Ambush (67), Resentment (123), and associated Peak Performance (154). Only the four already adopted physical-only normal-ammo standard rapid sources qualify. Existing ID/name/rank, normal-state, ammo, zero-element, guard and 25-Hit boundaries remain.

Ambush uses the existing preactivated 30-second maximum-only multipliers 1.05/1.10/1.15. Resentment uses the existing +5/+10/+15/+20/+25. Peak uses +3/+6/+10/+15/+20. The canonical HEALTH selection chooses one, never their sum; equal values retain Peak according to producer order. The legitimately excluded row is reported as resolved exclusion, not unsupported. The producer and coefficients were not edited.

Sources: index.html STANDARD_CONDITIONAL_ATTACK_RULES and standardPowerConditionPlan; docs/reports/stage4-bow-representatives/mhdb-loaded-cache.json IDs 67/123/154; existing attackComponents decomposition. Attack Boost ID72 rank5 (1.04 and +9) supplies a nonzero static-flat regression case. This is source-reference verification, not independent live-game validation. Source game version remains unverified.

## Verification and preservation

- Before product change: dedicated proof had 668 rows, 564 expected failures (red.json).
- Final dedicated proof: 672 rows, zero failures, runtimeUnchanged true. Includes all Ambush/Peak/Resentment rank combinations across four sources, static Attack Boost flat outside Ambush multiplication, First/Force per-round arithmetic, malformed plans/identities, Heroics retained omission, legacy single-trigger guards, and different A/B snapshot loading.
- Independent reviewer executed the earlier 668 plus 28 additional checks: 696 passed. The four subsequently added static-flat cases were reviewed in green-final.json, not represented as part of that earlier execution.
- Before/after catalog: 252 non-CB standard conditions, 504 channels. All 252 normal channels unchanged; exactly eight maximum channels change (rapid Ambush ranks 1-3 and Resentment ranks 1-5). All other weapon/profile numbers, equipment, skill ranks, baselines and snapshot hashes unchanged.
- Six disposable Chromium proofs: new resolved attack plus existing nonapplicable/common/Counterstrike/Foray/First-Force. A/B save/load and visible comparison are checked without user profiles. These checks are not page-reload tests.
- Selected nine node:test files passed 22 tests. Post-contract validation adds five CI dependency checks; see post-contract-tests.log for the final result.

Evidence directory: ../evidence/lbg-rapid-resolved-attack-20261111 relative to repository. It contains red/green reports, audit-before/after, audit-comparison.json, browser results/screenshots and selected test logs. Candidate patch/tar/hash preservation is separate from a committed/bundled release; see candidate-preservation receipt.

## Scope left unresolved

Heroics87 whole-route HEALTH branching remains unsupported for rapid. In particular, Heroics+Peak must not be called complete merely because its existing generic producer is available. The existing omission is retained and the supported remaining calculation continues. Dark168/172, nonstandard rapid, elemental and other weapon expansion are not included. Existing raw/aggregate rank disagreement conservatively remains unsupported; the current four LBG source records have no intrinsic 67/123/154, so that future-source boundary is not broadened here.

No new branch, CB runtime/prototype/getter operation, user-storage write, coefficient change or broad suite execution was performed. Old unsupported-control tests now use Heroics instead of newly supported Ambush, and the common proof expects the now-resolved Resentment/Peak combination to calculate. Existing numeric assertions and test counts are retained.

## Authorized registration

contract-proposal.json preserves the exact pre-approval proposal: four changed existing hashes, three new input files and one new node:test wrapper. The user approved it and the contract now matches. Existing entries and order remain. All 142 input hashes were verified; aggregate expected count is 1557. The aggregate has not been run by this task. Final commit/bundle restoration is recorded in the external save receipt. GitHub publication still requires separate approval.
