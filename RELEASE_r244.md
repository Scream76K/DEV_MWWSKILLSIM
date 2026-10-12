# r244 — Comparison report completeness

- Exports normal and maximum baseline-100 relative indices as explicit JSON fields (`relativePowerIndex`, `relativeMaximumPowerIndex`).
- Preserves legacy absolute `powerIndex`, `maxPowerIndex`, `powerChange` and DPS fields for consumers.
- Unavailable indices are `null`, not zero or fabricated values.
- Updates report release marker to r244; adds three regression tests.
- No claim of 14-weapon browser end-to-end verification or Charge Blade five unresolved phial counts.
