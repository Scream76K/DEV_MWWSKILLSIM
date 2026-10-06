# r34 — Bowgun Ammo Handler foundation

Baseline: Monster Hunter Wilds Ver.1.042.00.02. Derived from r33.

- Added shared Bowgun ammo component contract while retaining separate LightBowgunHandler / HeavyBowgunHandler boundaries.
- Ammo categories: NORMAL / PIERCE / SPREAD / ELEMENT.
- Components are separated into AMMO_PHYSICAL / AMMO_ELEMENT; LBG additionally owns RAPID_FIRE.
- No legacy/community shot coefficients are promoted. Physical formula, elemental formula, hit units, rapid-fire unit and critical-distance evidence remain CANDIDATE/null and therefore fail closed.
- HBG rapid-fire input is rejected by contract.
- Router now dispatches LBG/HBG to their dedicated evidence-gated adapter instead of generic fallback.
- Added regression gates for LBG elemental+rapid-fire, HBG pierce, HBG rapid-fire rejection, and Bow remaining scaffold.
- Hunting Horn r33 evidence gate is unchanged while user gathers evidence.
