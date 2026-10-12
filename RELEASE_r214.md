# r214 — STANDARD comparison skill scope integration

- Added integration regression tests executing the actual `standardPowerForStats` wrapper and `comparisonPowerIndex` together.
- Isolated the numerical damage evaluator as a deterministic fixture: tests verify skill filtering and baseline-100 comparison wiring, not actual damage formula accuracy.
- Non-damage skills (Defense, Runner, Constitution, Evade Window) do not affect the power index or cause errors.
- Attack and affinity skills still flow to the calculation; profile mismatch is still rejected.
- No production runtime, technique DB, saved-build or UI changes.
