# SNS follow-up: wiring repaired, source configuration unresolved

## Product vs harness
The first two-Hit run used four canonical-prefixed IDs, but the adopted public preset intentionally uses sns_slash / canonical:SNS_SIDE_SLASH / sns_horizontal / canonical:SNS_RETURN_SLASH. Missing two was harness misuse, not missing catalog. Harness now uses the actual existing preset and asserts exact canonical IDs and four one-Hit records.
The four official records omitted damageType. Existing adopted source https://kuroyonhon.com/mhwilds/memo/5.php explicitly labels all four cutting; added source-backed slash metadata only, no MV/element change. Weapon-wide slash fallback is not added; shield/mixed moves unchanged.
Public calcBuild and saved-comparison separately forwarded sns_slash/sns_horizontal to the DB. Shared resolveAdoptedSnsPresetId now resolves only these two SNS IDs using existing MATCHED identity/adoption tables. Saved raw settings remain unchanged; other weapons and unknown IDs untouched.

## Execution
JSDOM, recovered real normalized MHDB. Corrected preset RED: DAMAGE_TYPE_UNRESOLVED. After Hit metadata: TECHNIQUE_NOT_FOUND:sns_slash. After public mapping: normal/max complete, saved comparison still TECHNIQUE_NOT_FOUND (exit1 assertion retained). Shared comparison mapping then produced four ordered physical + four elemental components, normal345.80/max538.72, both save rows equal current results. Reload and shared conditions/current snapshot/saved map invariant. Raw final exits2 because template equipment source remains BLOCKED. These values describe loader-resolved equipment only, NOT the complete intended template.
No Safari/game/F01 injection/full regression. Unknown moves not newly accepted. Exact output assertions recorded in manifest; product hashes separate prior runs.

## Arm source investigation
Recovered MHDB68 rarity6 raw slots[2,1,1]. Existing limitBreakSlots maps rarity6/211 to [3,2,1] (always maximum); test fixture tests/r250-template-limit-break.test.cjs and r250-stage3/REPORT.md agree. No second limitBreakSlots field in recovered record. This is not a raw-slot-only rejection.
Original mhwilds_expert_build_db_v14.json KOTATU_SNS_01 has four independent objects: 痛撃珠3 / 渾身珠2 / 耐術珠1 / 耐術珠1. normalized_template and simulator_sync repeat four. Metadata source_consistency=source_confirmed_revised_2026-09-30 but armor/deco compatibility pending. Current embedded template has four objects too, with 耐術 replaced by 耐衝. Recovered decoration DB contains 耐衝珠【１】ID131 single skill, no 耐術珠 match. Nothing documents these four objects as one compound decoration; two repeated level1 entries are not a compound name.
SOURCE_RULES_R9 requires max3, one slot one deco, post-limit-break validation, no relocation. SOURCE_CONFIRMATIONS_R10 lists other corrected templates but no SNS arm correction. Thus mismatch predates loading/normalization in source dataset; whether original video transcription/name/ownership was wrong cannot be settled from saved text. Original video https://youtu.be/1KLm0lGgmJo?si=YYfQy6FeO6aZ-78P not visually verified this turn. Need arm detail showing actual three decorations/names/ownership; do not request changed equipment. No decoration deleted/moved or template edited.

## Reconciliation
Earlier SNS_REPORT wording about a public catalog gap is superseded: catalog exists via legacy aliases. Earlier unresolved damageType is now repaired. Equipment feasibility remains unpassed; user-side source confirmation is still needed before a representative-build PASS. Attribute320 already also appears in original v14 weapon.attribute and agrees source260+20+40, no fallback30.

Independent review accepted: turn01a19115-a67c-772e-a4f1-df63c4c6a409. Wiring accepted; representative equipment remains BLOCKED. R7 耐衝×2 naming evidence and unresolved ownership are recorded in SNS_SOURCE_AND_NEXT.md.
