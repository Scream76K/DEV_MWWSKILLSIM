# Integrated CI bounded budget correction

Base dba6a0173372084a6eece5fccf93fc22f13d3a3b is published. Its integrated CI failed, not passed: https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/42968339030 . The shared child runner timed out at180000ms after verifying all145 inputs. Failure artifact13831444273 has299 completed ok TAP rows, no not-ok row, empty stderr and no final summary. It does not prove1558 successes. Previous e53dffd completed1557 checks in162.9s. Current data55, comparison reload15 and the separate other13-weapon audit succeeded.

## Correction

The integration contract now explicitly sets childTimeoutMs600000. The shared runner retains180000 when omitted and accepts only integers1..600000. It records the chosen value in the report. The integrated job is bounded to12 minutes. No timeout comes from an environment override; no unbounded wait, retry, continue-on-error, test skip or count reduction is added. The existing26 test entries, order and expected1558 remain identical. Three changed contract input hashes are refreshed: workflow, shared runner and its freshness tests.

All pre/post-run hash checks, fresh run IDs, child exit/signal/error checks, exact count checks and zero failed/skipped/cancelled requirements remain. A deadline error still writes FAIL and preserves stdout/stderr evidence. Existing historical contracts have no new budget field and keep the old default.

The alternative of splitting expensive source-reference proofs into separate CI jobs could improve scheduling but requires broader aggregate/evidence design changes. It is deferred. Re-running the unmodified180-second job alone would not address its known low margin; no remote rerun was requested.

## Evidence and limits

Evidence directory: ../evidence/integration-ci-budget-20261111 relative to repository.

- red.log: all12 added budget cases failed before runner changes.
- freshness-green.log: four historical/current freshness suites plus CI dependency checks,111 passed, fail/skip/cancel0. Includes real short-deadline failure, malformed budgets, historical default and exact successful child counts.
- selected-rapid.json / .tap / .stderr: 23 real non-CB rapid/bowgun checks all passed under the finite600-second cap in71048ms, exit0, no signal/error.
- Independent reviewer found no blockers, independently reran42 synthetic freshness cases successfully, and confirmed145 hashes, unchanged1558 count/order and all failure handling. save-receipt.json identifies the final local commit and bundle restoration.

The entire1558-test aggregate is NOT run locally because the earlier CB-operation boundary remains unresolved. Local synthetic and selected-source results do not substitute for that aggregate. Following approved publication, the exact new commit must pass the integrated1558 checks, freshness106, data55, reload15 and other13-weapon workflow. Until then, full integrated success is unconfirmed. No GitHub update, rerun, branch creation or combat coefficient change is part of this local correction.
