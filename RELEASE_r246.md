# r246 — Comparison pending-reason classification

- Separately classifies unavailable normal, maximum and DPS comparisons in the visible expandable summary and exported JSON.
- Reports mismatched weapon kinds, fixed STANDARD profile mismatch, unavailable baseline normal power, unavailable baseline DPS, and row-specific calculation reasons.
- Does not fill unknown values with estimates; existing damage formulas unchanged.
- Pending counts represent metric-level entries, not distinct builds.
- Automated tests are not a substitute for real-browser end-to-end testing on all 14 weapon types.
