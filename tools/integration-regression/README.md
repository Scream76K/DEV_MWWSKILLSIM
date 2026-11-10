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
