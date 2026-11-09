# Bounded GL ordinary-event and HH Thunder-zero regression

This package preserves the exact reviewed standalone adapter SHA256 `01b592a7cff41a54ade368a713da7e6ce0ca75cc7c284497bde800e6055061d6`, based on public commit `77dc3e0e6518b8313407249885f7b0f8447deccf`. Its adapter-only reviewed local commit is `d7096a942137c5c7f87f1d7c8b542b9cd9ce3893`. The other 43 runtime files, including `index.html`, are unchanged. No database, numerical coefficient, saved build, shared event map, input normalization or input-trust guard changes are included.

## Bounded scope and limitations

- GL: only the exact NORMAL/MEDIUM, six-round, loaded-stake four ordinary ground actions. Airborne and Partbreaker are non-damage for those HP events, not for jump, focus/wound or part-durability mechanics generally. Intrinsic shell/fire remains present. Omega additionally requires explicit INACTIVE, the exact armor/bonus interface and independently matching zero-add self-state records. Other physical coeffects are not discarded.
- HH Thunder: only skill 165 level 1, known zero resistance from empty equipment, no weapon element or other producer, exact ordinary SELF_IMPROVEMENT / echo route and exact source/generated/component contracts. It discharges only its own unsupported-body-scope issue and retains all 15 components in both channels. It does not broaden HH Charge Master or general conversion applicability.
- These checks bind the provisional source model, not current live-game damage accuracy, HP rounding, timing, device/browser behavior or all weapon states. The status remains SOURCE_BACKED_PROVISIONAL with live verification PENDING.
- Sources: [GL](https://kuroyonhon.com/mhwilds/memo/10.php), [Airborne](https://kuroyonhon.com/mhwilds/memo/27.php), [HH](https://kuroyonhon.com/mhwilds/memo/8.php), [skills](https://kuroyonhon.com/mhwilds/program/skill.php), [sound formula](https://macarongamemo.com/entry/mhwilds-damage_calculation).

## Fixture-free public checks

Use Node 24 without installing dependencies:

    node tools/gl-hh-scope-regression/run.cjs
    node --test tools/cb-gl-scope-regression/freshness.test.cjs tools/sa-hh-scope-regression/freshness.test.cjs tools/gl-hh-scope-regression/freshness.test.cjs

The current runner checks all 44 runtime hashes and the transitive public harness inputs before and after execution. It executes the unchanged 766 inherited CB/GL/SA/HH entries plus 492 new GL/HH entries, for 1,258 entries. Freshness suites are separate. Exact success requires the current child's expected count and zero failure, skip or cancellation.

The new fixtures are handwritten synthetic states, component/result shapes and intentionally fictional armor identifiers. Technique records and models are obtained from unchanged public `index.html`, not copied from the adapter's acceptance fingerprints. The small synthetic Thunder skill shape exercises the exact identity interface; it is not a published private MHDB record. Omega's armor/bonus and self-state functions are explicitly synthetic interface doubles. Public tests therefore do not claim full UI/Pipeline production, real equipment or numeric-oracle coverage. Nonzero physical and intrinsic-fire sentinels test retention, not adopted damage coefficients.

Checks execute unmodified extracted production predicates, applicability, component and result hooks. They include raw/canonical/both-copy source drift, alternate event/state inputs, wrong skill identities, unknown/nonzero resistance and elements, invalid armor/bonus interfaces, unrelated coeffects, all component kinds, both result channels and guard-removal sensitivity. The parent adapter fails the new suite because its required production gates do not exist; guard-disable tests separately establish behavioral sensitivity. The stronger full integration tests use private inputs and remain separate.

An old report is overwritten with a new RUNNING before reading contract, root, adapter, tests or dependencies. Catchable errors and explicit exit become FAIL. SIGKILL can leave only the current incomplete RUNNING, never the old PASS. A unique output location is used by default; `REPORT_FILE` selects an explicit path. `GL_HH_ROOT` and `GL_HH_CONTRACT` are deliberate reproduction/test overrides, not immutable trust authorities. Verify the committed contract and runner against the reviewed Git commit. Contract and runner hashes plus fresh parent/child identifiers and child-output hashes are recorded.

All inherited regression directories, original contracts, runners and historical guards are unchanged. The existing workflow routes current-candidate checks through this new contract. Running an inherited runner pinned to an earlier adapter directly against the new adapter is expected to fail its hash check, not silently rewrite historical expectations.

## Separate pinned private integration scan

Full integration requires separately authorized private inputs at `a9b58416d6cff3441ea1ad7774670f6080d11921` and the fixed runner at `8c2d4c3b2756f9ded881b957c1fb8282b24ca933`. Verify its 61 source files, immutable manifest and nine payloads, locked dependency inventory and every target runtime body. Do not fetch private data into public CI and do not install or update dependencies for that reproduction.

After independent review of the complete target commit and its exact 44-file dependency contract:

    NODE_PATH="$FIXED_RUNNER/dependencies/node_modules" bash "$FIXED_RUNNER/run-commit.sh" --repo "$ABS_SOURCE_GIT" --commit "$FULL_COMMIT_SHA" --output "$NEW_OUTPUT" --dependency-contract "$REVIEWED_CONTRACT_JSON"

Use a new output directory. Verify all 46 snapshot inputs and protected files before and after execution. Compare every one of the 2,562 native whole records against public parent 77dc and the reviewed adapter-only candidate, not only summary counts. The only expected availability gains from 77dc are `86:1:gunlance`, `173:1:gunlance`, `173:2:gunlance` and `165:1:hunting-horn`; 2,558 whole records must remain identical. The earlier adapter-only scan had 2,317 calculated, 46 unavailable and 199 non-target. Those non-target records were preserved, not newly verified for effect leakage. A newly published full commit needs its own fresh scan, even if its runtime bytes match.

The fixed runner deliberately retains four GS failures and exit 2. The historical diagnostics retain all 54 prior REVIEW_REQUIRED cases and add four GL stale-pending expectation mismatches, for 58. These are the three GL keys above plus the isolated Partbreaker GL diagnostic. Keep these expectations unchanged. No result in this README claims a new published-commit scan has already run.

Run the unchanged official suite separately with pinned dependencies:

    NODE_PATH="$FIXED_RUNNER/dependencies/node_modules" npm --offline --no-update-notifier --no-audit test

Its retained baseline is 1,151 tests, 1,028 passes and 123 failures. Compare the complete failure-name multiset. New tests are outside its glob and do not inflate its count. Report actual remote CI separately from local checks; do not call the official suite green.

## Missing historical evidence

The 41 historical reference bodies remain LOST / MISSING / NOT EXECUTED. Their search is closed; they were not reconstructed from current outputs or given new expected hashes. The inherited historical package and its tamper/hash guards are preserved. These public synthetic checks and the separate fixed scan are not substitutes for missing historical regressions.
