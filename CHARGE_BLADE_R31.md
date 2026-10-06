# r31 — Build Comparison Weapon Handler Registry

Baseline: Monster Hunter Wilds Ver.1.042.00.02
Parent: r30

## Added
- Explicit handler registry for all special-component weapon families.
- Gunlance, Hunting Horn, LBG, HBG and Bow now have dedicated handler boundaries in SCAFFOLD state.
- Special weapons cannot accidentally fall through to GenericWeaponHandler.
- Capability report returns handler/profile readiness for all 14 weapon types.
- Charge Blade remains on ChargeBladeHandler; existing five Generic STANDARD profiles remain unchanged.

## Fail-Closed
- Scaffold handlers throw a handler-specific reason until their component evidence/formulas are adopted.
- Cross-weapon comparison remains timing-gated.
- Candidate Great Sword / Long Sword / Dual Blades remain non-calculable.

## Regression
- 5 special handler boundaries checked.
- 5 existing Generic handlers checked.
- Capability report must cover exactly 14 weapon types.
