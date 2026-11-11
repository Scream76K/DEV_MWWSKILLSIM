# Standard LBG rapid Counterstrike integration (2026-11-11)

## Base and scope

Integrated onto published `9d0bd43dcd99c2e5f70c5bcc8f122d92496397cb`, after its dependency-repair CI passed all three jobs. The earlier isolated candidate was based on b78d6aa. Its exact four-file patch applied without conflicts; the only subsequent proof-script change is the browser default output directory, which now preserves integrated evidence separately from the isolated evidence.

The only product change is adding `{id:81,name:'逆襲',max:3}` to the common-rule list when `rapidAmmoSequence` is enabled. It does not broaden the explicit single-trigger route or any general skill guard. The existing standard producer in index.html supplies Counterstrike81, `KNOCKBACK_BUFF`, and attack increments +10/+15/+25 for ranks1/2/3. No new coefficient or condition is introduced.

Normal keeps the existing inactive-buff premise. Maximum adds the adopted increment to attack once, then uses that attack value for each of the25 contacts. This does not mean adding25 only once to the final damage total. Existing Peak Performance154 and Adrenaline Rush120 attack increments combine through the same producer; at maximum ranks their total with Counterstrike is +75 attack, not repeated attack additions per contact.

First/Force rapid effects remain unreflected and disclosed. Missing, unresolved or duplicate required plan entries and invalid skill identities/ranks remain rejected. Other conditional gates, nonrapid calculations, weapon ammo selection and magazine-independent sequence behavior are not changed.

## Evidence and interpretation

The isolated red proof recorded42 missing-increment failures and39 passing guard/legacy checks before the one-entry change. The final integrated proof has81 checks using actual weapon IDs783/763/771 and normal-ammo levels1/2/3. It checks both channels, all25 component traces, ranks1–3, combined flat bonuses, public producer condition/attackAdd/aggregate output, skill/plan negative cases, save/load/comparison preservation and the old explicit five-contact baseline.

The independent formula fixes the adopted MV, rapid0.7, target physical0.65 and critical calculation, and independently checks per-contact damage and the maximum delta. Its baseline attack and affinity come from the existing accepted trace; it is not an independent reconstruction of every equipment statistic from an external original source.

The public consumer regenerates its condition plan through the existing standard producer. The adapter checks readiness, identity/rank and applied-row uniqueness, but does not independently authenticate arbitrary externally mutated condition or aggregate-flat payloads. This inherited trust boundary is unchanged; no adversarial plan-value guarantee is claimed.

The integrated dedicated81 checks pass. The targeted run also passes the existing109-check common-skill wrapper and six rapid unit tests (eight Node test cases in total). The parent-run inspected subset passed319 tests. The integrated contract preserves the prior127 inputs and1,552 tests, updates the adapter hash, and adds three proof/test files and one wrapper test:130 inputs and1,553 expected tests. Integrated Chromium verification passed all three actual-weapon cases with zero page errors, unchanged runtime hashes, save/load/comparison and input preservation; screenshots retain the existing partial-effect warnings. The existing reload suite passed all 15 tests. Independent review accepted the final product, proof hashes, contract and narrow scope. Final history preservation is recorded separately. No integrated GitHub CI has been run or published for this candidate; the full local suite remains unexecuted.

Evidence is retained in the sibling `evidence/lbg-counterstrike-integrated-20261111` directory; prior isolated evidence remains unchanged. The integration CI dependency installation and failure-report retention from9d0bd43 are retained unchanged. No new branch, publication, full local suite, or prohibited CB accessor/prototype operation is part of this integration step.

## Limits

Source/game version remains UNVERIFIED and live-game accuracy PENDING. Maximum is the existing active-condition reference, not a guarantee of buff uptime or simultaneous real-game activation. The full6188-case skill matrix has not been repeated for this change. Previous matrix results retain their original baseline; this narrow improvement does not establish universal skill support.
