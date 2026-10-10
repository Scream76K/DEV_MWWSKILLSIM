# r167 — Verified provenance transfer gate

- A/B transfer now requires exactly two rows.
- Generic component evidence must carry a nonblank evidenceRef per component.
- Duration must carry a nonblank durationEvidenceRef.
- Technique DB revision must be present; comparison context must explicitly match verifiedContextId.
- Missing or inconsistent fields fail closed before atomic pair replacement.
- No reference DPS, hits, duration, or provenance are synthesized.
- Tests: 309/309 passed (npm test). Provenance references are traceability labels, not independent authentication of their contents.
