# r169 — Technique DB provenance read-only bridge

- Add `technique-evidence-bridge.js` with immutable per-technique provenance inspection.
- Wire `window.inspectTechniqueProvenance(weaponType, techniqueIds)` to existing `techniqueDbAudit` in index.html.
- Missing, mismatched and pending records are fail-closed.
- No fabricated component damage, verified duration, or DPS. This is not yet an automatic capture producer.
- Five tests added. `npm test`: 318 passed, 0 failed.
