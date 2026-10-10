# r166 — Atomic verified A/B replacement

- Added `replacePair(a,b)` to the capture store: both candidates are validated and compared in staging before either existing slot is changed.
- Verified transfer now requires the atomic store API and commits A/B as a pair.
- Added four regression tests for replacement, failure rollback, and transfer integration.
- 303/303 unit tests passed (`npm test`).
- The equipment calculator still does not automatically generate independently verified technique evidence; this change does not enable unverified reference DPS to be captured.
