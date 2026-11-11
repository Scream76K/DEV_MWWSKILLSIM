# Integrated CI dependency repair (2026-11-11)

## Observed failure and cause

Base: `b78d6aa6a072bf7f8ae6a331be6b52ed8dc56f38`.
GitHub run: https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/42941493459
The synthetic-boundaries job reached `tools/integration-regression/run.cjs` and failed with `CHILD_FAILED` (child exit 1). Its workflow did not install dependencies. The newly registered `tests/lbg-rapid-common-skills.test.cjs` invokes a proof requiring `jsdom`, which is already pinned in package.json/package-lock.json. The runner deliberately clears NODE_PATH, so a developer's external dependency directory cannot supply this package in CI.

An unchanged, history-free archive of the exact base commit reproduced this dependency failure using only the inspected common-skills test:

- With NODE_PATH and NODE_OPTIONS empty and PRODUCT_ROOT set to the isolated archive: exit 1, `MODULE_NOT_FOUND: Cannot find module 'jsdom'`.
- In the same archive, `npm ci --ignore-scripts --offline --no-audit --no-fund` installed 39 locked packages from the existing local cache. Repeating exactly the same test returned exit 0, one Node test passing with all 109 proof checks enforced by the wrapper.
- Node: 24.22.1; npm: 11.19.1. GitHub used Node 24.22.2. This is a local dependency isolation experiment, not a replay of the entire GitHub job.

The failed remote run exposed only the runner's generic error and did not retain its temporary child logs. Therefore the missing dependency is demonstrated as a deterministic blocker in that job configuration; the experiment does not prove that no additional full-suite failure remains.

## Minimal repair

The synthetic-boundaries job now runs `npm ci --ignore-scripts` before its unchanged integration runner, matching the repository's other test jobs. No package versions, lockfile, product code, test expectations, or historical test entries are changed by this workflow repair.

The integration invocation now receives a dedicated REPORT_FILE under runner.temp. On failure, actions/upload-artifact retains only that directory's summary.json, child-*.tap and child-*.stderr for seven days. It does not collect environment dumps, credentials, the checkout, or arbitrary temporary files. Installation failures can have no runner report; missing artifact files warn without hiding the original job failure.

The shared runner remains unchanged: it already writes a fresh report and child stdout/stderr, checks input hashes before and after execution, and rejects nonzero exits, abnormal completion and unexpected test counts. No checks are bypassed or weakened. Historical freshness checks keep their existing invocation and are not included in this report artifact.

## Regression coverage

`tests/integration-ci-dependency.test.cjs` reads the workflow without executing any suite. Five checks cover:

1. Locked installation with lifecycle scripts disabled precedes integration, and the report/artifact scope is exact.
2. Missing dependency installation is rejected.
3. Lifecycle-enabled installation is rejected.
4. Broader artifact collection and success-only collection are rejected.
5. Continuing past a failing job is rejected.

These tests failed against the original workflow and pass after the repair. The final inspected subset passed all 318 tests, including the existing 109-check public proof wrapper and the five new workflow checks. The integrated contract retains all 126 prior inputs and 1,547 prior tests, updates the workflow hash, and adds the new test file: 127 hashed inputs and 1,552 expected tests. All current input hashes match. YAML parsing and git diff whitespace validation also pass. The dependency differential was executed outside the working repository, with no user save or product changes.

## Evidence and limitations

Local evidence is retained in the sibling `evidence/ci-dependency-repair-20261111` directory: missing-dependency.tap, npm-ci.log, installed-dependency.tap, workflow-red.tap, workflow-green.tap, isolated-path.txt and manifest.json. The archive is `isolated-ci-dependency-KPpAvu` and is retained for review.

The complete integration suite, restricted CB operations, and full GitHub CI were not executed locally for this repair. This repair is not a claim that all CI or game calculations pass. The isolated Counterstrike81 candidate is unrelated and excluded. Independent review, contract integration, final local save and any authorized GitHub publication are separate parent-controlled steps.
