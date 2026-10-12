# Bow Critical Element — bounded continuation

Approved scope: continue development independently within the existing simulator, preserving fail-closed data policy and agreed comparison UI.

Design: extend the canonical bow state rule to revision 3 and archive revision 2. Store bow-only level coefficients and source provenance centrally. Read actual saved-build skill levels; do not apply a manually selected generic melee coefficient to bow. Apply positive critical probability to the elemental damage after Charge Master base multiplication and all established flats. Leave physical critical expectation independent. Preserve unsupported conditional stacking gates and unresolved bow skills.

Verification plan: first demonstrate failures for level coefficients, negative affinity, Charge Master flats, invalid levels and status elements; implement; rerun these tests; test actual saved-build comparison in Chromium mobile; run all unit, DOM and browser regressions. Keep full precision in reports and one decimal in visible comparison.

Not in scope: game verification, additional bow routes, pierce, First Shot, Force Shot, Bladescale Loading, or inferred timings. Reference game version remains 1.042.00.02, not a claim about the currently latest game release.
