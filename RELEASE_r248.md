# r248 — Independent DPS comparison diagnostics

- Corrected the pending-reason classifier so DPS does not incorrectly require a valid normal STANDARD power baseline.
- DPS uses its own baseline, same-weapon and fixed-profile conditions, consistent with the existing DPS index calculation.
- Normal and maximum relative power continue to require a positive normal baseline.
- No damage formulas or Technique DB values changed.
- Added three targeted executable regression tests. Browser end-to-end coverage is still pending.
