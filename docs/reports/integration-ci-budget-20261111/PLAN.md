# Runtime budget implementation plan

1. Add synthetic freshness cases for explicit/default bounds and deadline failure; run RED against unchanged runner.
2. Add validated optional contract.childTimeoutMs (default180000, maximum600000) to tools/input-guard-regression/run.cjs and record it in report. Preserve failure handling and all assertions.
3. Set integration childTimeoutMs600000 and synthetic-boundaries timeout-minutes12. Keep all1558 expected tests and test order. Update only changed input hashes.
4. Run dedicated freshness, existing4 freshness suites, CI dependency tests and selected rapid proofs. Review exact diff and evidence independently. Save commit/bundle and verify restoration. Do not claim unexecuted full aggregate success.
