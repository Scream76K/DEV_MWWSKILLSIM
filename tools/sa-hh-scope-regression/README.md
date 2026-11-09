# Bounded SA Thunder-zero and HH Charge Master-zero regression

The product adapter is the exact order-independent union of the reviewed SA and HH scope patches on public commit `d3ce3cd1fed005e22fd8e5278da0be5f3b26b84e`. Its SHA256 is `9153a861129c7cb92c3cb90bf64b7674cb8a0843b2b703105ec892d6e30f2e10`. Only that file changes among the 44 product runtime paths. No database, coefficient, producer model, saved build or `index.html` changes are included.

## Adopted scope, not game accuracy

- SA Thunder resistance conversion: exact ordinary non-awakened POWER phial, SWORD-start four-action sequence, isolated level 1 skill, known zero resistance and zero element in both channels, no other producers. The existing sourced physical phial multiplier remains. This does not authorize water conversion, general SA state coverage or unknown resistance/element inputs.
- HH Charge Master: levels 1–3, confirmed zero element/status in every channel, exact adopted SELF_IMPROVEMENT / one preplaced echo route and exact canonical/generated producers. Produced body, sound, echo and fixed components and final results are guarded. This does not mean every HH action is noncharged, and does not validate game damage numbers.
- Existing provisional model and source-version limitations remain: `SOURCE_BACKED_PROVISIONAL` and live-game verification `PENDING`. A zero effect within this bounded adopted model is not independent game validation.
- Public sources: [SA](https://kuroyonhon.com/mhwilds/memo/11.php), [Charge Master](https://kuroyonhon.com/mhwilds/memo/28.php), [HH](https://kuroyonhon.com/mhwilds/memo/8.php), [sound formula](https://macarongamemo.com/entry/mhwilds-damage_calculation).

## Fixture-free public execution

Use Node 24. No dependency installation, private database, equipment selection, saved-data export or raw private result is needed:

    node tools/sa-hh-scope-regression/run.cjs
    node --test tools/sa-hh-scope-regression/freshness.test.cjs
    node --test tools/cb-gl-scope-regression/freshness.test.cjs

The new contract pins the exact adapter, unchanged inherited CB/GL tests, new SA/HH tests and their public producer dependencies. Tests execute extracted production predicates, pending filters, applicability and component guards against explicitly synthetic states. There are 766 passing entries: 137 SA, 365 HH, and 264 inherited CB/GL entries. The runner freshness suite has 24 entries; the inherited freshness suite has 16. They are not a full UI/Pipeline run or an independent numeric oracle.

The runner overwrites any previous summary with a new RUNNING before loading root, contract, product, tests or dependencies. It verifies file hashes before and after the fresh child, rechecks contract and runner identity, requires the exact passing test count and zero failures/skips/cancellations, and records unique parent/child IDs and output hashes. Explicit exit and catchable failures become FAIL. SIGKILL may leave a fresh incomplete RUNNING, never the old PASS. REPORT_FILE chooses a summary destination; the default is unique in the temporary directory. SA_HH_ROOT and SA_HH_CONTRACT are explicit test/reproduction input overrides, whose hashes are reported; they do not represent an immutable external trust authority. A reviewer must verify the committed contract as well as the runner.

The existing CB/GL workflow explicitly routes current-candidate execution through this new contract. Both inherited regression directories, including their original contracts, hashes, runners and freshness tests, stay unchanged. Running the old CB/GL runner against a later adapter is expected to reject the old pinned adapter identity. Its unchanged boundary tests are separately executed here under the new candidate identity. This is not retroactive validation of historical artifacts.

## Separate fixed private-input scan

Full integration requires the authorized private inputs and fixed runner at `8c2d4c3b2756f9ded881b957c1fb8282b24ca933`, private input revision `a9b58416d6cff3441ea1ad7774670f6080d11921`, all 61 runner files, immutable private manifest and nine payloads, and verified locked dependency files. Do not install or update dependencies for that reproduction. Source checkout recovery may be partial; exact Git tree identities and all runtime bodies are required.

After independent review of the target full commit and its 44-file runtime contract:

    NODE_PATH="$FIXED_RUNNER/dependencies/node_modules" bash "$FIXED_RUNNER/run-commit.sh" --repo "$ABS_SOURCE_GIT" --commit "$FULL_COMMIT_SHA" --output "$NEW_OUTPUT" --dependency-contract "$REVIEWED_CONTRACT_JSON"

Use a genuinely new output directory. Verify all 46 snapshot inputs and protected files before/after. Compare every one of the 2,562 native whole records, not just totals, against d3ce and the reviewed adapter-only local candidate. The only permitted availability changes from d3ce are `165:1:switch-axe` and `24:1:hunting-horn`, `24:2:hunting-horn`, `24:3:hunting-horn`; the other 2,558 records must remain equal. A new full commit requires its own fresh scan, not reuse of an earlier result.

Earlier adapter-only integration produced 2,313 calculated / 50 unavailable / 199 non-target, not independently accuracy-verified. The fixed runner deliberately retains four GS failures and exit 2. Historical diagnostics retain all previous 51 REVIEW_REQUIRED cases and add exactly three HH cases because the old pending-gate expectation is no longer reproduced. This is 54 REVIEW_REQUIRED, not a green result. Keep the original expectations unchanged.

Run the full product suite separately using the pinned dependencies and this exact offline command:

    npm --offline --no-update-notifier --no-audit test

The preserved suite contains 1,151 tests, 1,028 passes and 123 known failures. Compare the complete failure-name multiset and report actual CI results. The new tests live outside its glob, so do not inflate that suite’s pass count or imply its failures were fixed.

## Missing historical evidence remains blocked

The inherited `tools/gl-component-regression` contracts and tamper/hash guards are untouched. Forty-one historical reference-result bodies were unavailable after scratch loss and remain **MISSING / BLOCKED / NOT EXECUTED** in the reconstructed environment. They were not regenerated from current output, and no expected hash was weakened. This fixture-free CI and the new fixed private-input scan are distinct checks, not replacements for the missing historical regressions.
