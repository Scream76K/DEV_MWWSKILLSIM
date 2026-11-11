# Bounded integrated CI runtime budget

Base: published dba6a0173372084a6eece5fccf93fc22f13d3a3b. Its integrated child timed out after 180000ms; all145 input hashes passed, TAP had299 completed ok rows, no not-ok row or final summary. This is a failed incomplete run, not1558 successes. Previous e53dffd passed1557 tests in162.9s, leaving little margin for the new816-case Heroics proof.

Selected approach: explicit childTimeoutMs in the integration contract, 600000ms maximum. Historical contracts without it keep180000ms. The shared runner accepts only an integer1..600000, records the chosen budget, and preserves all freshness/hash/exact-count/zero-failure checks. An outer12-minute integration job limit bounds setup, child execution and failure evidence. No unlimited or environment-derived timeout. No test deletion, skip, count reduction, retry masking or continue-on-error.

Alternative: split expensive source-reference proofs into independent jobs and redesign aggregate counts/evidence. This offers better parallelism but expands configuration and collection changes. Deferred in favor of the bounded minimal fix. Blind rerun of the unchanged180s contract has low expected value and was not requested.

Verification: synthetic fixtures prove default180s, accepted600s and short positive budget, invalid type/range fail before child, actual deadline expiry remains fresh FAIL, and exact test counts/failed/skipped child remain enforced. Existing historical/current freshness tests plus CI dependency checks are safe bounded tests. A selected rapid regression run verifies real source proofs locally. The full aggregate is not run locally due the separate unresolved CB-operation boundary;1558 end-to-end success remains unconfirmed until an approved GitHub publication runs it.

Save same existing history and self-contained bundle after independent review. No new branch or GitHub change without approval.
