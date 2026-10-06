# Charge Blade r22

- Base: v7.2.2 chargeblade-evidence-gate-r21
- Game baseline: Ver.1.042.00.02
- Added Evidence Adapter for phial event counts.
- Technique master no longer needs to be mutated when video evidence is promoted to VERIFIED.
- `chargeBladeEvidencePhialCount()` is the only gate from Evidence Registry to runtime phial count.
- CANDIDATE / null remains Fail-Closed.
- Route timing remains Evidence-gated; no provisional duration is inserted.
- Existing Generic Engine remains disconnected from ChargeBladeEngine.

## Promotion rule
A phial event becomes runtime-usable only when its evidence entry has `status:'VERIFIED'` and integer `count >= 1`.
Route weighting becomes runtime-usable only when both route timings are VERIFIED and have positive `durationFrames`.
