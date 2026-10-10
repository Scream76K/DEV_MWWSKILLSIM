# r168 — Verified capture revision consistency

- Reject A/B verified captures using different Technique DB revisions.
- When comparison context explicitly specifies `techniqueDbRevision`, require each capture to match.
- Require per-component `evidenceRef` for all four typed gunlance components, including zero-damage components.
- No source data, hit counts, damage, or duration is synthesized.
- `npm test`: 313/313 passing. References are labels, not external verification of evidence contents.
