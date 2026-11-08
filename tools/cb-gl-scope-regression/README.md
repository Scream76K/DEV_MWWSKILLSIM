# CB ordinary H and GL noncharged scope reconstruction

This is a new reconstruction from public commit `84931ccbbd77efc6e85fe511dbbf215704b6e31c`, not a recovered unpublished candidate. Only `hope-hammer-browser-adapter.js` changes among the 44 product runtime files. Database values, saved builds, `index.html`, damage formulas, resource producers and coefficients are unchanged.

## Product scope and evidence

- CB: Partbreaker and Airborne nonapplication is bounded to the exact ordinary IMPACT H route: axe-to-sword morph, shield thrust, AED and follow-up AED. The predicate checks the frozen canonical/generated body, enhancement and phial/resource producers, confirmed zero weapon element and exact route/state. It does not widen shared no-wound or Airborne maps. The existing Omega armor bonuses, Burst and Agitator remain intact in private original-fixture integration checks. R remains unchanged.
- GL: Charge Master nonapplication is limited to the exact noncharged NORMAL/MEDIUM, six-round slam/sweep/fullburst/stake chain. It is action-based, not an assertion that the intrinsic shell fire is absent. The intrinsic fire components and all existing damage calculations remain unchanged. Applicability reports GL-specific evidence, `SOURCE_BACKED_PROVISIONAL` and `liveGameVerification: PENDING`, rather than the unrelated Bow/ranged explanation.
- Sources: [CB actions](https://kuroyonhon.com/mhwilds/memo/12.php), [Airborne](https://kuroyonhon.com/mhwilds/memo/27.php), [skill descriptions](https://kuroyonhon.com/mhwilds/program/skill.php), [GL actions](https://kuroyonhon.com/mhwilds/memo/10.php), [Charge Master](https://kuroyonhon.com/mhwilds/memo/28.php).
- Equality checks for numerical constants validate the existing adopted producer shape. They do not adopt new numbers. The current CB memo/12 versus frozen ED2/enhanced-axe resource details remain an unresolved version/provisional-model gap. Shield-thrust count/consumption and the GL target model retain their previous owner-provisional status. No current-game numerical accuracy or independent damage measurement is claimed.

## Fixture-free public tests

Node 24, no dependency installation or private data required:

    node tools/cb-gl-scope-regression/run.cjs
    node --test tools/cb-gl-scope-regression/freshness.test.cjs

The runner checks the adapter and both tracked tests against `contract.json`, executes a fresh child, checks exact counts and zero failures/skips/cancellations, and verifies the inputs again. Its default report path is unique under the OS temporary directory. `REPORT_FILE` selects a report path; an existing PASS is replaced with a fresh RUNNING before any contract, product or test input is read. Catchable failure and explicit exit become FAIL. SIGKILL may leave a fresh incomplete RUNNING, never a stale PASS. Reports include fresh parent/child IDs and output hashes.

The two tests run actual extracted production predicates, target-only pending filters, Partbreaker/Airborne gates and GL applicability branches against explicit synthetic doubles. There are 264 Node test entries: five CB entries containing 848 scenarios and 259 GL entries. These tests are not full real-UI, adapter/Pipeline, private-fixture or game-accuracy validation. The separate runner tests exercise stale output, missing/corrupt inputs, child failures/skips/count mismatches and interruption.

`CB_GL_ROOT` and `CB_GL_CONTRACT` are explicit alternate input locations for portability/failure tests; their current hashes are recorded. Child product-root/adapter overrides are pinned by the runner. `CB_GL_FAILURE_PROBE` exists only to test failure handling. None of these options grants a numerical validation status.

## Full integration reproduction with fixed private inputs

The public repository contains no new private database, saved-data or result bodies. Full integration requires separately authorized fixed inputs and a reviewed source-commit-bound dependency contract. Use the existing runner at `8c2d4c3b2756f9ded881b957c1fb8282b24ca933` and private input revision `a9b58416d6cff3441ea1ad7774670f6080d11921`, verifying all 61 runner files, the private manifest plus nine payloads, and locked dependencies before execution. Do not install or update dependencies as part of this reproduction. Do not replace the fixed oracle/classification with generated expectations.

With a full Git checkout containing the exact target commit and a separate hydrated fixed runner/private-input tree:

    NODE_PATH="$FIXED_RUNNER/dependencies/node_modules" bash "$FIXED_RUNNER/run-commit.sh" --repo "$ABS_SOURCE_GIT" --commit "$FULL_COMMIT_SHA" --output "$NEW_OUTPUT" --dependency-contract "$REVIEWED_CONTRACT_JSON"

The reviewed contract must contain the exact 44 runtime files for that full commit; the runner produces a 46-file snapshot and validates Git object provenance. Repeat against the fixed public baseline in a distinct output. Compare all 2,562 native records, including 199 non-target records, not only counts. Only the three CB target fixtures and three GL CM ranks may gain availability; every other whole record must remain unchanged. A reconstructed local candidate needs its own current results; historical counts are not evidence for it.

The fixed runner deliberately retains its known four GS failures/historical diagnostics and exit 2. The product test suite also retains existing failures. The independently executed baseline and runtime-only reconstruction both had 887 tests, 764 passes and the identical 123-name failure multiset; adding the two public test files adds passing entries, not fixes for those failures. Run the full repository suite with exactly:

    npm --offline --no-update-notifier --no-audit test

Do not describe either full suite as green.

## Inherited package and missing historical references

`tools/gl-component-regression` remains byte-for-byte unchanged from the public baseline, including every existing hash/integrity/tamper guard. Its preparation is bound to its original adapter and historical fixtures. It is not silently rebound to this new candidate. The four historical adapter objects were recovered and verified independently, but 41 immutable reference-result bodies required by that package were unavailable after scratch loss. Its reference-dependent preparation/regressions are therefore **blocked, not passed** in the reconstructed environment. Their hashes were retained, no expected bodies were regenerated and no guard was weakened. The fixture-free CI and new private-input fullscan are distinct checks, not substitutes for that missing historical evidence.
