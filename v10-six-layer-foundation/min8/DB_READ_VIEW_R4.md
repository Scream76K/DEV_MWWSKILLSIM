# V10 min8 DB read-view contract R4

The new `immutable-provider.cjs` is a concrete adapter for a **detached** DB snapshot. It captures equipment, Technique and effects datasets into one private copy, and exposes only defensive-copy readers. Later mutations in the source objects do not affect the captured view.

**Required from the source:** `capture(versions)` must atomically produce a mutually consistent image. A sequential live read during capture is **not** atomic, and cloning cannot repair inconsistent source data. The adapter has no authority to verify the upstream transaction guarantee. Production integration must supply a transactional capture or an immutable published version bundle; otherwise the structure remains unverified.

Lifecycle: the parent `pipeline.compare` opens one evaluation session and `session.prepare` seals the lookup keys before A/B evaluation. Both reads use the same captured provider view. No live fallback is allowed. Version names and content consistency are distinct requirements.

Unit and state contracts remain defined in `REVIEW_AMENDMENT_R2.md` and `NESTED_STATE_AND_PROVIDER_CONTRACT.md`. Real database schemas and UI wiring are not part of this adapter's tests.

New tests: `immutable-provider.test.cjs` (4 cases). **GitHub HEAD test execution has not been observed; do not report pass.** The upstream atomicity requirement needs an integration test against the actual database provider.
