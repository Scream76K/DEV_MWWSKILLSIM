# r170 — Combo Technique DB provenance trace

- Correct r169 audit adapter: `techniqueDbAudit()` exposes `evidence:[{ref,registered}]`, not only `evidenceRefs`.
- Only registered references are exported; unregistered references trigger `UNREGISTERED_EVIDENCE_REF`.
- Add `inspectCombo` with one immutable audit entry per combo stage, including repeated techniques.
- Include `step5.comboProvenance` in build/AI export; never promote reference timing, damage or DPS to verified capture.
- Five new tests; `node --test tests/*.test.cjs`: 323 pass, 0 fail.
- Remaining: actual verified per-component damage and full combo duration with source-authenticated provenance.
