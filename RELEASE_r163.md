# r163 — Gunlance capture readiness audit

- Equipment comparison audit now lists five explicit missing evidence requirements per gunlance build.
- Non-gunlance rows are marked excluded, and missing reference DPS remains pending.
- Reference values are never promoted to verified captures.
- New unit tests: five pass. Focused gunlance tests: six pass.
- Full legacy test suite could not run in this environment because playwright/jsdom dependencies are absent; this is not a claim of a complete regression pass.
- Next: connect trusted provenance and verified duration to capture, without inventing values.
