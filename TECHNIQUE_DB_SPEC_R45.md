# Technique DB Spec r44

Game baseline: Monster Hunter Wilds Ver.1.042.00.02

## Normative rule
All 14 weapon technique motion values, hit counts, per-hit elemental modifiers, part modifiers, state requirements, special components, version revisions, evidence refs, and verification status are canonical Technique DB data. StandardAttackProfile / ComboTemplate / WeaponHandler reference technique IDs and must not own duplicate normative MV data.

## r44 migration
- Great Sword, Long Sword, Sword & Shield, Dual Blades: retained canonical Technique DB migration.
- Hammer STANDARD migrated to Technique DB: 4 hits, MV 293, element-modifier sum 4.3.
- Lance STANDARD migrated to Technique DB: 6 hits, MV 179. Ver.1.021 elemental modifiers are now applied (sum 7.9); Ver.1.040 MV revision for Triple Thrust is retained.
- Switch Axe STANDARD migrated to Technique DB: 5 hits, MV 188.

## Versioning
Never overwrite historical values. A balance change creates a new revision with validFromVersion/validToVersion. Official patch notes are primary update evidence; detailed measured/reference tables are supporting evidence. Unverified required values fail closed.

## r45 migration
- Insect Glaive STANDARD numeric ownership moved to canonical Technique DB.
- Hunting Horn STANDARD body/performance/encore/echo-followup numeric ownership moved to canonical Technique DB; special component resolver remains dedicated.
- Lance and Switch Axe duplicate numeric arrays removed from Generic STANDARD profiles; profiles now reference Technique IDs only.
- Insect Glaive Kinsect damage remains explicitly excluded from STANDARD comparison power.
