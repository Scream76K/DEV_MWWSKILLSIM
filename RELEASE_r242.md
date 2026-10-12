# r242 — Relative build comparison core (foundation)

- Added `build-relative-comparison.js`, a standalone pure comparison API for validated damage-engine outputs.
- For each of 14 weapon types, compares total, physical and elemental values against a baseline index of 100, with percent change; affinity and maximum affinity are compared in percentage points.
- Rejects cross-weapon comparisons and flags invalid or zero-baseline values rather than inventing ratios.
- Added 17 tests. `node --test tests/*.test.cjs`: 682 passed, 0 failed.

## Important scope limitation
This is the comparison calculation foundation only. It is NOT yet wired into the existing UI, saved-build storage, or weapon-specific damage engine. Do not present r242 as a completed 14-weapon end-to-end comparison feature. The existing charge blade five explosion counts remain unverified.
