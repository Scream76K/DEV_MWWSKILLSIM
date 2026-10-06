# r28 — Generic STANDARD Profile Engine phase 1

Baseline: Ver.1.042.00.02 / r27.

## Added
- Evidence-backed Generic STANDARD profile registry for Sword & Shield, Hammer, Lance, Switch Axe.
- Hit-level physical MV and elemental modifier representation; multi-hit moves are not flattened.
- Generic NORMAL/MAX comparisonPower resolver with A NORMAL as the sole baseline.
- Common component result contract: physical / element / special.
- Router now opens GenericWeaponHandler only for adopted profiles; every other weapon remains Fail-Closed.
- No fallback to legacy one-hit expected damage or DPS.

## Regression fixtures
- SnS 4 hits.
- Switch Axe 5 hits / total MV 188.
- Lance total MV 179.
- MAX uses maxAffinity.
- Bow remains Fail-Closed until its profile data is formally adopted.
- Legacy comparison UI remains untouched.
