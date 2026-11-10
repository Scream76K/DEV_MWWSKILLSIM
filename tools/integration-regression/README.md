# Integrated regression entry point

Run `node tools/integration-regression/run.cjs` under Node 24. This combines the unchanged 1,258 GL/HH predicate checks and 232 input-guard checks into one 1,490-test contract. It hashes all runtime and harness inputs before and after execution, using the unchanged input-guard runner. The historical per-branch contracts are intentionally untouched and reject the integrated adapter hash. This is synthetic ingress and predicate coverage, not live-game numeric accuracy or a substitute for UI and full-suite testing.

The integrated workflow also runs all four original freshness suites. No dependencies or private data are required for this entry point.
