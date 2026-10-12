# r241 — Charge Blade phial audit hardening

- Exposes `ChargeBladeEngine.phialMeasurementAudit()` as a read-only diagnostics API.
- Missing, nonnumeric, nonpositive or nonfinite required coefficients are now flagged instead of silently accepted.
- Prioritizes phial explosion count measurement and distinguishes body damage numbers from explosions.
- All five explosion counts remain unknown; no fabricated count or formula adoption.
- Does not promote any route to DPS-ready.
