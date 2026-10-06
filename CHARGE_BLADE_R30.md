# r30 — Generic STANDARD Catalog / Evidence Gate

- Base: r29
- Game baseline: Monster Hunter Wilds Ver.1.042.00.02
- Added a versioned STANDARD profile catalog separate from calculable numeric hit data.
- Registered Great Sword, Long Sword, Dual Blades as CANDIDATE sequences only; legacy COMBO_DATA community MV values are not promoted.
- Long Sword candidate explicitly requires RED spirit gauge start state.
- Dual Blades candidate explicitly requires Demon Mode start state.
- Also catalogs pending HH, GL, LBG, HBG and Bow profiles with fail-closed reasons.
- `genericStandardProfileAvailability()` exposes READY/CANDIDATE/UNREGISTERED without fabricating comparisonPower.
- Generic adapter now includes evidence-gate status/reason in fail-closed errors.
- Regression ensures GS/LS/DB remain non-calculable until numeric evidence is adopted.
