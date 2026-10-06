# Technique DB Spec — r42

Baseline: Monster Hunter Wilds Ver.1.042.00.02
Status: ADOPTED

## Normative rule
All 14 weapon types shall have a canonical Technique DB covering every technique used by the simulator. Motion values, hit counts, per-hit elemental modifiers, special components, required weapon state, game-version validity, revision, evidence references, and verification status belong to Technique DB.

ComboTemplate, StandardAttackProfile and Weapon Handler must reference Technique IDs. They must not become independent normative stores of motion values or hit counts.

## Revision rule
Balance-update changes create a new revision. Do not overwrite or delete historical values. Resolution selects the revision valid for the simulator game version.

## Evidence rule
VERIFIED and deliberately adopted PARTIALLY_VERIFIED records may enter normative calculation. Required unresolved data fails closed. CANDIDATE/ASSUMED data must not silently enter comparisonPower.

## Completion rule
STANDARD_READY and TECHNIQUE_DB_COMPLETE are separate states. A weapon can have a working STANDARD while its full Technique DB remains incomplete. TECHNIQUE_DB_COMPLETE requires all in-scope techniques for that weapon to be registered and version/evidence audited.

## r42 migration
Sword & Shield STANDARD is migrated to Technique IDs. Current values are 18 / 17 / 27 / 28. The 18/17 revision is supported by the June 30 balance-change statement and the motion-data update history; the stale 19/18 display is not used as current normative data.

Great Sword STANDARD charge policy is now explicitly MAXIMUM for Charge Slash and Strong Charged Slash. Numeric migration remains fail-closed until the maximum-charge technique records are evidence-audited and inserted into Technique DB.
