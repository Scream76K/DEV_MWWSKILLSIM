# Standard rapid Heroics candidate

Status: independently reviewed local release based on published e53dffd392ee5c0e1ca6e1faa2ff7e081e64cad7. The exact contract update is applied within the requested development scope. The external save-receipt.json records final commit and bundle restoration. GitHub publication remains separately gated.

## Change and source

The standard physical-only normal rapid ingress now includes Heroics87 in the existing exact canonical attack-plan projection. The only additional admissible pending state is the canonical HEROICS_FULL_HEALTH_BRANCH_REQUIRED with valid Heroics2-5 and Peak1-5 plus no group pending. The existing whole-route comparator then evaluates full health and low health independently. It retains the original normal result and selects one complete maximum route; it never sums incompatible health bonuses or selects per-component maxima. The producer, comparator and numeric source are unchanged.

Source: index.html STANDARD_HEROICS_SOURCE / standardPowerConditionPlan and MHDB cached skill87. Existing source URL https://kuroyonhon.com/mhwilds/program/skill.php, retrieved 2026-10-07. At <=35% health the existing attack multipliers are Lv1:1, Lv2/3:1.05, Lv4:1.10, Lv5:1.30. Lv1 has defense only and does not require an attack health branch. These are source-reference checks, not live-game verification or a verified current game-version claim.

Full-health branch removes Heroics/Resentment; low-health branch removes Peak. Exact ties retain full health under the existing policy. Ambush remains a conditional multiplier; Attack Boost static +9 and First/Force per-round flats stay outside that multiplication. Existing Dark168/172 scopes remain unadopted and disclosed through continuation.

## Verification

- red.json: 800 rows before product, 736 failures due to missing Heroics connection.
- green-initial.json: 800 rows, eight test-input failures. Those cases attempted seven charm skills although the UI keeps only three. Actual-rank assertions detected truncation; product was not changed to satisfy them.
- green-final.json: 816 rows, zero failures, runtimeUnchanged true. The invalid cases were split into valid three-skill inputs for static Attack/Heroics/Peak, Ambush/Heroics/Peak and Heroics/First/Force.
- All 720 Heroics/Peak/Resentment combinations across four sources check exact actual ranks, normal and maximum 25-Hit arithmetic, full/low totals, selected whole route and snapshot/input immutability. Weapon783 base120 at Heroics2 and Peak2 supplies a real full/low tie (126).
- Fourteen malformed-plan/identity/source negatives on each source, old single-trigger rejection, retained Dark annotation and different A/B snapshot reload are included.
- Selected 10 node:test files: 23 passed, zero fail/skip/cancel.
- Seven disposable Chromium proofs: Heroics plus six existing rapid proofs, all PASS. New A has a full-health winner and B a low-health winner, checked through actual save/load, visible comparison values and screenshots. This is not a page-reload test.
- Before/after non-CB audit: 252 cases / 504 channels. All normal channels and snapshot hashes unchanged. Only rapid Heroics2-5 maximum values change; Heroics1 numerical value stays unchanged. Dispositions change only for rapid Heroics1-5. See audit-comparison.json. Independent review found no blockers and independently ran 844 checks (816 plus 28 memory-only boundary negatives), all passed with runtimeUnchanged. It also confirmed the seven browser proofs, 23 tests, source audit comparison and exact proposed contract changes.

Evidence: ../evidence/lbg-rapid-heroics-20261111 relative to repository. Candidate-preservation holds the historical pre-contract patch, tar and content hashes. The final local release is identified by the separate save receipt. No user-storage access, CB runtime/getter/prototype operation, new branch, broad aggregate execution or GitHub update.

## Regression and registration scope

Four old proofs changed only newly obsolete unsupported controls: Heroics controls become Dark168, and common Heroics Lv1 now expects success. Existing numeric assertions and counts remain. The contract proposal updates five existing hashes and adds three inputs plus one test, retaining all existing order and metadata (142 to 145 inputs; expected 1557 to 1558). The exact proposal was applied within the requested development scope; all 145 hashes and existing order were verified. Post-contract tests are recorded separately. All other source coefficients and weapon routes remain unchanged.
