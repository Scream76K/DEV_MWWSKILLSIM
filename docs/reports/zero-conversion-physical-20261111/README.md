# Zero conversion with static physical companions

Base ef114d02a8bf69e519a5c22b8b8bf103f7167a8f. Candidate reviewed and saved using the usual local development workflow; final save/contract/review status is recorded in the external evidence receipts. GitHub publication is separately gated.

## Common cause and correction

The existing empty-equipment zero-conversion proof required only one skill, the conversion itself. Attack Boost72, Critical Eye3 or Critical Boost22 therefore caused an already-proved zero conversion to be marked unsupported. The correction replaces only that skill-container restriction with exact ID/name/key/integerLv1-5 checks for these three static physical skills. Duplicate IDs within either raw weapon or aggregate build input remain rejected; legitimate entries across the two distinct sources remain permitted.

All resistance and component evidence is retained: empty armor rows, known resistance0 in normal and maximum, no absorption/contribution/bonus/conditional/self-state producer, known no element/status and zero element bases/flats in all channels, existing finite multipliers and cap validation, no alternative damage state or generated component. Existing ordinary body/Bow routes and exact non-awakened SA power-body source remain. Water181 remains LS/Bow coefficient4 only. No coefficient or positive conversion implementation is changed. The diagnostic uses EMPTY_EQUIPMENT_ZERO_ADD_WITH_STATIC_PHYSICAL_SKILLS only for the newly accepted companions; isolated old cases keep their original reason.

Sources: existing index.html MHWaterConversionRule and equipment resistance producer; MHDB skills3/22/72/165/181; docs/reports/r263-skill-audit/conversion-component-scope/REPORT.md and WATER_CONVERSION_CONNECTION.md. This verifies implementation/source contracts, not game accuracy or current game version.

## Verification

- Public RED294 rows:190 failed because the zero conversion was omitted or its preservation assertion failed. After the minimal product change,294/294 passed with bound input hashes unchanged.
- Public inputs use real MHDB Hope weapons236/836/985/155/387/685/1/914 and empty equipment. Thunder has eight weapon routes; water has LS/Bow, ten conversion routes total. Every companion rank1-5 and all three two-companion pairs is tested against the identical physical-only build. Actual skill ranks, all component IDs/values/statuses, normal/maximum totals, execution/final state and active snapshot are asserted unchanged.
- All three companions together are tested at the extracted predicate boundary. Public charm inputs use at most three total skills, respecting the UI's3-skill limit. No legal four-skill empty-equipment build is claimed. Current cached records have no zero-special weapon in these eight kinds whose intrinsic skills consist only of3/22/72, so cross-source combinations are synthetic predicate coverage.
- Actual extracted predicate test:503 assertions passed, including old negatives and new malformed ID/name/key/rank and duplicate boundaries. The first added positive failed before product changes.
- Selected30 node tests passed. Separate SA/HH synthetic boundaries502 passed; no CB execution.
- Disposable Chromium: all ten conversion routes passed actual A/B save/load and visible comparison. Screenshots and evidence preserve input/storage invariance. This is not page-reload testing and does not touch user profiles.
- Before/after single-skill catalog70 cases /140 channels: all numbers, snapshots, equipment and dispositions unchanged. The new benefit is in companion combinations; do not misrepresent this audit as190 catalog fixes.
- Charge Master24 contrast: two physical combinations on each of eight weapons (16 cases) already had no omitted24 effect and unchanged values before the fix. No24 code was changed.

Evidence: ../evidence/zero-conversion-physical-20261111. Reports include red-public.json, red-predicate.log, green-public.json, green-predicate.log, focused-tests.log, sa-hh-boundaries.log, audit-before/after, audit-comparison.json and browser/result.json. Independent review and save receipts determine final accepted bytes.

## Remaining scope

24 positive charged-element effects remain limited to existing adopted GS/Bow source consumers and prior component-specific no-op proofs. This batch does not infer multipliers for other weapons or generated components.

165 nonzero thunder conversion and previously adopted SA/HH/CB consumers remain governed by their existing contracts. HH's stricter zero model, CB, ammo, nonempty armor with cancelling resistances, unknown/negative resistance, absorption, dynamic or bonus producers and companions outside3/22/72 are not broadened here.

181 positive conversion and zero proof remain LS/Bow only. No thunder coefficient is reused for another water weapon. Non-water or unknown element and unadopted components remain visibly unresolved.

No unsupported annotation was globally removed; the original continuation still calculates supported effects and discloses unresolved ones.

## Regression registration

contract-proposal.json records one changed existing adapter hash, four new registered input files and two node-test entries. tests/conversion-zero-scope.test.cjs existed before but was not registered in this integrated contract. Existing145 inputs and26 tests retain order; counts become149 inputs and1560 expected tests. The600000ms child budget stays unchanged. Full aggregate is not run locally because the separate CB boundary remains; it requires approved publication and CI confirmation.

## Legacy checks and applied registration

Two extra legacy positive harnesses fail on both the published base and this candidate; they are not reported as successful tests. Their exact route/expectation mismatches, captured numerical invariance and targeted maintenance proposals are in [LEGACY_POSITIVE_HARNESS_FINDINGS.md](LEGACY_POSITIVE_HARNESS_FINDINGS.md). No product change was made to restore obsolete whole-calculation failure or activate standard-normal conditional effects.

The proposed limited regression registration has now been applied: one existing hash, four appended inputs, two appended test entries,149 verified file hashes and1560 aggregate expected tests. The600000ms child budget and previous metadata/order are unchanged. Contract SHA-256:37dbc322dd381efc687fe47c2591ea838d0ce03cedb1fff73ea2c94c6c17134e. contract-proposal.json remains the pre-application proposal record. Post-registration execution and independent review are recorded in the final save receipt.

Final verification: post-contract selected30 node tests passed (75.410s), fail/skip/cancel0. Independent reviewer ran334 public checks (294 plus40 malformed-source cases), runtime unchanged;557 actual-predicate checks (503 plus54 boundary cases) passed. The reviewer independently compared all70 catalog cases, ten browser results, the legacy captures and the applied contract, with no blocking issue. Full1560 aggregate, Safari/mobile and game measurements are not claimed; the aggregate remains for separately approved publication/CI.
