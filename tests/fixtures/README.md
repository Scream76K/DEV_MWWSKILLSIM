# Test fixtures (r139)

These two JSON files are copies of existing golden/reference datasets from the r139 test suite.

- `r46-standard-golden.json`: baseline golden data used by `tests/r46-regression.test.cjs`.
- `r66-legacy-combo-golden.json`: legacy combo golden data retained for regression reference.

Important: The existing test runner currently reads `r46-standard-golden.json` from the root `tests/` directory. Uploading these files to `tests/fixtures/` alone does not change those test paths or migrate the test suite. Keep the originals in `tests/` until tests are updated.

These are test fixtures, not authoritative MHDB/Technique DB production data.
