# r159 — Damage/hit consistency guard

- Reject positive component damage with zero hits, and zero damage with positive hits, in verified generic and typed bridges.
- Reject negative, nonfinite, or nonnumeric typed component values before comparison.
- Six regression tests added; 279/279 `npm test` pass.
- Still pending: automatic conversion from equipped build state to verified damage components. This release does not claim that feature is complete.
