# r37 — Shared Bowgun Ammo Handler foundation

Baseline: Monster Hunter Wilds Ver.1.042.00.02. Based on r36.

- Promotes LightBowgunHandler / HeavyBowgunHandler from SCAFFOLD to EVIDENCE_GATED.
- Adds shared ammo component taxonomy: NORMAL / PIERCE / SPREAD / ELEMENT.
- Separates AMMO_PHYSICAL and AMMO_ELEMENT.
- Keeps LBG RAPID_FIRE as an independent component; never derives it from a normal shot coefficient.
- Registers current STANDARD skeleton as elemental ammo for LBG/HBG, but does not invent coefficients or hit counts.
- Adds Evidence Registry for normal/pierce/spread/element ammo and rapid fire.
- Both bowgun handlers Fail-Closed until current-version formula/event evidence is VERIFIED.
- Router now dispatches LBG/HBG to their dedicated shared Ammo Handler adapter.
- Bow remains SCAFFOLD. Existing Generic, Charge Blade, Gunlance and Hunting Horn routes are unchanged.
