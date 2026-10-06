# Technique DB Spec R46

Baseline: Monster Hunter Wilds Ver.1.042.00.02
Status: ADOPTED

## R46 integration rule
Dedicated Weapon Handlers MUST obtain normative body/arrow motion and hit data from Technique DB. Handler-local tables may retain only special-mechanic metadata that is not a normal technique hit (shelling, wyrmstake, phial, axe-boost additional hit, ammo formula, coating/range state).

### Migrated in R46
- Gunlance body: GL_SLAM, GL_SWEEP -> Technique DB. Shelling/Wyrmstake remain evidence-gated special components.
- Charge Blade body: six STANDARD-route techniques -> Technique DB. Phial coefficients/counts and axe-boost additional hits remain dedicated components.
- Bow STANDARD: BOW_SHOT_3, BOW_POWER_SHOT_3, BOW_POWER_VOLLEY_3 -> Technique DB, 14 hits / MV186 / element-modifier sum13.0. Range/coating remain dedicated state/components.
- Light/Heavy Bowgun STANDARD elemental ammo -> Technique DB identity records. Ammo physical/element coefficients and rapid-fire rules remain Ammo Handler data, not fake motion values.

## Fail-closed
Moving a technique identity into Technique DB does not promote an unresolved special formula to VERIFIED. Gunlance shelling/stake, Charge Blade phial event counts/route timing, Bow current-version modifier/coating audit, and Bowgun current-version ammo formula audit remain gated until evidence is adopted.
