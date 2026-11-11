# Integrated regression entry point

Run `node tools/integration-regression/run.cjs` under Node 24. This combines the unchanged 1,258 GL/HH predicate checks and 232 input-guard checks into one contract preserving those 1,490 assertions. The C04/C05 revision adds 10 continuation/policy unit cases, for 1,500 total tests. It hashes all runtime and harness inputs before and after execution, using the unchanged input-guard runner. The historical per-branch contracts are intentionally untouched and reject the integrated adapter hash. This is synthetic ingress and predicate coverage, not live-game numeric accuracy or a substitute for UI and full-suite testing.

The integrated workflow also runs all four original freshness suites. No dependencies or private data are required for this entry point.

The pull-request path filter includes the new continuation/policy runtime modules, unit cases and skill-continuation harnesses. Mainline push coverage is preserved.

## Current data integrity revision

The GL identity revision adds six checks, so the dependency-free entry point now runs **1,506** tests. Its original test files and assertions remain unchanged in the saved-input/current-report repair. The current contract binds 105 runtime, harness, fixture and dependency-lock inputs. Hash-binding a harness does not imply that the dependency-free runner executes it.

A separate `current-data-integrity` CI job installs the existing locked dependencies using `npm ci --ignore-scripts`, then runs 39 focused JSDOM/behavior tests:

```sh
node --test tests/charm-saved-level-integrity.test.cjs tests/r206-charm-skill-integrity.test.cjs tests/r250-snapshot-ownership.test.cjs tests/legacy-comparison-report-contract.test.cjs tools/consumer-ai-comparison-dom.test.cjs
```

The job uses committed fixtures and offline simulated origins; it does not transmit consultation data. Chromium acceptance and full legacy suites are separate checks, with remaining failures documented in [the current repair report](../../docs/reports/current-data-integrity-20261110/README.md).

## Target and explicit ten-shot contract repair

The 58bf6a8 publication changed three pinned runtime inputs without refreshing this contract. Hash verification correctly stopped before running children. The old ingress helper also used an invalid synthetic monster and expected the removed training-front-only guard, so a hash-only update would not restore guard coverage.

The helper now supplies a valid synthetic training-front record with all eight hitzones and no selected technique. Positive skill-ingress controls must reach TECHNIQUE_NOT_SELECTED; malformed skill records still require their exact skill refusal. Invalid-target and hitzone controls separately require target refusals. Damage/pipeline remain forbidden in this fixture. No runtime guard is weakened.

The current contract binds 112 files. All original 109 pins were checked against d48aab2; only three runtime pins (exact 58bf6a8 bytes) and the helper changed. Original ten test entries and 1,506 tests are retained. Six explicit ten-shot, five target-resolution and three boundary tests bring the expected CI count to 1,520. Package/lock files and both runners remain unchanged. Historical contracts are not rewritten. This count is the contract expectation, not a claim that the integrated suite ran locally.

Local verification: 232 ingress/control + 14 target/ten-shot + 30 synthetic freshness tests = 276 passes. Freshness negatives cover changed/missing inputs, stale PASS, missing dependency, wrong counts, failed/skipped child, concurrent input/contract/runner mutation and symlinks. The full integrated runner was not executed because a prior denied CB getter/prototype operation remains unidentified. Other CI checks and game accuracy are not inferred from these limited tests.

The added target test prioritizes runner-pinned PRODUCT_ROOT over legacy MHW_PRODUCT_ROOT so inherited environment settings cannot silently redirect it. A conflicting nonexistent legacy root is explicitly tested with the pinned current root.

## Owner policy alignment candidate (2026-11-12)

This is an uncommitted copy based on38b0d0d; it is not mainline integration. Historical contracts and the prior sections above remain historical evidence. The current candidate binds161files and33test entries, with1583expected TAP tests: the prior1562plus4public owner-note tests and17existing condition DOM tests. The expectation must match a fresh runner result; editing the count is not evidence of success.

Owner policy tests distinguish ordinary IDs/valid levels (including Foray75Lv4/5), validated set/group activations, standard-only163, and unknown/unadopted effects. LBG proofs exclude75attack/affinity and67multiplier while retaining adopted companion effects. Plan-tampering negatives use an actually adopted companion (Counterstrike or Coalescence), because excluded skills must not require an applied plan row. Single-trigger cases compare the exact no-target-skill boundary; unrelated intrinsic-skill refusal remains refusal.

The new owner-note fixture contains unmodified official raw weapon-family/armor/skill records and four previously used input snapshots with source hashes. It avoids the older loaded cache's derived Artia fixed-value records (unknown element) and contains no fabricated coefficient. It is a bounded offline test fixture, not another product DB or proof of all charm legality. Tests respect PRODUCT_ROOT and ordinary locked dependency resolution.

Do not update historical freshness contracts or the protected38bsource to pass this runner. Before any future integration, preserve the complete baseline Git identity, tracked files, fixtures and old evidence in a distinct permanent bundle. Baseline replay and post-integration public verification need separate identities and output paths. An old read-only checker stays unchanged; a different baseline path would require a separately versioned checker. No baseline relocation or branch/upstream change is authorized by this candidate.

## Supplemental refusal boundaries (candidate only)

The current contract runs 1,584 tests across the same 33 entries and 161 pinned inputs. The prior 1,583 count above describes the parent candidate. One Coalescence positive/unknown-element paired test was added using the official DOM loader. The LBG nonapplicable proof now compares target-free single-trigger controls for 82/133, including totals, all traces and all diagnostics except explicitly validated owner-exclusion notes. A Coalescence companion must retain the same unsupported-combination refusal. Existing multi-weapon rapid, ammo-level and invalid-plan tests remain. Product files and historical contracts are unchanged.

### Required diagnostics assertion controls

Supported single-trigger paired results now require diagnostics on both normal and maximum channels for both baseline and active results. The same assertion function is exercised with 16 test-only clone defects (82/133 × two channels × both/baseline/active diagnostics missing or required note missing). All must throw; the valid outputs are checked before and after these controls. UNAVAILABLE results are not required to have channels and retain exact unrelated-refusal checks. These are assertion-control checks within the existing proof, not additional public calculations or TAP tests; the contract stays 1,584 tests / 33 entries / 161 inputs.
