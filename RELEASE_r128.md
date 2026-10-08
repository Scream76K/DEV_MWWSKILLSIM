# r128 — Gunlance A/B body diagnostics

- The Gunlance STANDARD comparison remains evidence-gated (shelling and wyrmstake formulas/events unresolved).
- When a B snapshot is present, calculate A/B verified body components with the same existing Technique DB resolver and expose physical, elemental and total body-only deltas as `err.partial.bodyDiagnostic`.
- Zero baseline reports null percent; no B snapshot reports null diagnostic. Invalid B state fails closed.
- Does not promote body-only results to complete STANDARD DPS or weapon coverage.
- Tests: 164/164 passed (`node --test tests/*.test.cjs`); DOM/browser and in-game validation not run.
