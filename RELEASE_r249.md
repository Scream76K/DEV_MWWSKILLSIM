# r249 — Saved build comparison weapon-kind regression matrix

- Added 28 automated regression scenarios covering all 14 weapon-kind identifiers with saved-build comparison flow, normal power index baseline 100, state restoration, and cross-weapon mismatch rejection.
- The fixture uses a generic stub damage profile and does **not** validate each weapon’s real Technique DB values or actual browser behavior.
- Comparison report release metadata updated to r249.
- No damage formula, Technique DB, equipment DB, or saved-build schema changed.
- Full node test suite: 725 passed, 0 failed.
- Browser end-to-end test pending: Playwright package unavailable in execution environment.
