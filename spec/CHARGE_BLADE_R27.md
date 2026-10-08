# r27 — Weapon Handler Router / Common Comparison Contract

- Base: r26.
- Added `BuildComparisonEngine` and `buildComparisonRouter()`.
- Charge Blade is routed only to `ChargeBladeHandler` / `chargeBladeBuildComparisonAdapter()`.
- Other 13 weapons do **not** reuse legacy 1-hit expected damage or DPS as `comparisonPower`; they fail closed until their STANDARD profile is registered.
- Cross-weapon comparison fails closed until verified timing exists.
- Current production comparison UI remains untouched in r27; this is a bridge layer only.
- A NORMAL remains the sole baseline through the common result contract.
