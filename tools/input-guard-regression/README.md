# Standalone V3 input guard regression

This package applies exactly one product-file change to public parent `77dc3e0e6518b8313407249885f7b0f8447deccf`: `hope-hammer-browser-adapter.js`, SHA256 `56e60ffb5eccb3eca394e14b99267ac600ade219587fd4899413d5cd4c80b792`. The other 43 runtime files are unchanged. It does not include the separate GL/HH scope candidate, change database coefficients, or modify saved builds.

## Bounded validation and assumptions

The adapter checks JSON-like input record/container shapes, skill identity and source rank, per-source duplicate skills, and set/group activation provenance against the already loaded MHDB. Caller-provided effect metadata does not authorize an unknown skill. The loaded MHDB itself is trusted; this is not a general security boundary against compromised databases, arbitrary JavaScript objects, accessors, proxies, prototype tampering or a hostile process. It does not prove numeric game accuracy or claim that every malformed input is rejected.

Skill IDs accept positive safe integers or their canonical decimal strings. Levels accept numeric/string primitives that resolve to a supported integer rank. The existing 53 aliases support identity checks only: aliases do not acquire new effect adoption or coefficients, and name-only aliases retain the adapter's existing classification behavior. A valid raw weapon skill and its aggregate build view can overlap, including a higher aggregate rank. Duplicates within either source are refused.

## Fixture-free public checks

Use Node 24. No install, private MHDB payload, real equipment selection, saved build export or private result body is required:

    node tools/input-guard-regression/run.cjs
    node --test tools/input-guard-regression/freshness.test.cjs
    node --test tools/sa-hh-scope-regression/freshness.test.cjs
    node --test tools/cb-gl-scope-regression/freshness.test.cjs

The new contract executes 998 tests: 232 new synthetic ingress/classifier controls and the unchanged 766 public CB/GL/SA/HH predicate entries. The new runner freshness suite has 30 tests; inherited freshness suites retain 24 and 16 tests. Handwritten synthetic records reuse public policy names/IDs only where identity matching requires them. The invented equipment identifiers and set/group data are not copied private DB records or numerical game expectations.

The real, unmodified adapter executes in a VM with dependency sentinels. Positive ingress controls must reach the deliberate downstream training-target refusal, while malformed cases must return their specific earlier refusal without throwing. No positive ingress control claims numeric OK, a full UI/Pipeline run, or effect adoption. Two metadata tests separately execute the unmodified classifier extracted from unique source boundaries. The inherited predicate tests likewise remain bounded component checks, not full integration.

A new RUNNING summary replaces any old PASS before root, contract, product, test or dependency loading. The runner hashes the contract, runner and every declared input before and after a fresh child, enforces the exact test count with no failures/skips/cancellations, and records parent/child IDs and output hashes. Exceptions and explicit exits produce FAIL; SIGKILL can leave a fresh incomplete RUNNING, never the old PASS. `REPORT_FILE` selects a report path; its default is unique in the temporary directory. `INPUT_GUARD_ROOT` and `INPUT_GUARD_CONTRACT` are explicit reproduction/test overrides, not an immutable external trust authority. Review the committed runner and contract together. The shell/Node process and its environment are trusted.

The existing workflow now routes this candidate through the new contract. All inherited regression directories, source expectations, old contracts and guards remain unchanged. Their old runners intentionally reject this later adapter identity; their original boundary tests are executed under the new contract instead. Do not rewrite old hashes to make historical runs appear current.

## Separate fixed integration scan

The preserved adapter-only validation used 135 focused checks, 243 valid controls, six source-overlap cases and 12 freshness/failure checks. Its fixed 2,562-record scan matched the public parent in every whole record: 2,313 calculated-but-unverified, 50 unavailable and 199 non-target. The 199 classification records are not new effect-leakage proof. These earlier results do not substitute for a fresh scan of a newly published full commit.

Authorized private integration uses fixed runner `8c2d4c3b2756f9ded881b957c1fb8282b24ca933` and private input revision `a9b58416d6cff3441ea1ad7774670f6080d11921`, all 61 runner files, the immutable private manifest/nine payloads, and verified locked dependencies. Do not install or update dependencies. Verify the exact target commit and all 44 runtime files independently before running:

    NODE_PATH="$FIXED_RUNNER/dependencies/node_modules" bash "$FIXED_RUNNER/run-commit.sh" --repo "$ABS_SOURCE_GIT" --commit "$FULL_COMMIT_SHA" --output "$NEW_OUTPUT" --dependency-contract "$REVIEWED_CONTRACT_JSON"

Use a genuinely new output directory; verify all 46 snapshot inputs and protected files before/after. All 2,562 whole records must equal the parent and the exact reviewed adapter-only candidate. Preserve the same four GS failures, all 87 diagnostic records apart from run IDs, and all 54 REVIEW_REQUIRED cases. The fixed runner's exit 2 is existing findings, not a green suite.

Run the official suite separately with the pinned dependencies:

    npm --offline --no-update-notifier --no-audit test

The known baseline is 1,151 tests, 1,028 pass and the same 123-failure multiset, zero skipped/cancelled. Public tests here live outside its glob and do not inflate that suite. Compare complete failure names; report actual exact-commit CI outcomes separately. Neither game accuracy nor timing is independently verified.

## Preserved missing evidence

The 41 historical reference-result bodies remain LOST, search closed, NOT EXECUTED. They were not regenerated from current output, substituted or promoted. Historical component contracts/tamper guards are unchanged. A partial source object store can preserve every tracked identity while lacking file bodies: validation requires all runtime bodies and does not imply a complete checkout or arbitrary-suite reproducibility. Public synthetic CI and the fixed integration scan do not replace lost historical evidence.
