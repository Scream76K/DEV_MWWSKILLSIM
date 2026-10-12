# r247 — Comparison root-cause aggregation

- Added root-cause summary to the existing comparison pending-details panel.
- Counts both distinct build names and affected metrics (normal, maximum, DPS), avoiding confusion between the two.
- Sorts causes by affected metric count, with stable reason-code tie-break.
- Exports `coverage.causes` alongside the original `coverage.pending` list for downstream analysis.
- Existing damage formulas, Technique DB, and save/restore flow unchanged.
- No claim of 14-weapon real-browser verification; tests are automated checks.
