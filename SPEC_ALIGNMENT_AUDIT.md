# v7.2.2-spec-align-r1 — Spec Alignment Audit

Baseline source: uploaded v7.2.1 / OCR r1.1.19 fix12.
Normative references: S30-S33, S32 domain/event contracts, S68-S69 comparison/evaluation decisions.

## Corrected mismatches
- Talisman render no longer erases/replaces user talisman state merely because current local legality rules reject it.
- Existing invalid/current talisman values remain visible with a `要確認` projection so the user can correct them explicitly.
- Build comparison now uses an explicit baseline (current or saved build) = 100.
- Build comparison primary output is limited to: Firepower Index, Physical Change, Elemental Change, Affinity, Maximum Affinity.
- Removed “largest number = best” presentation from build comparison.
- Monster/part starts truly unselected; training-room/front is no longer silently selected.
- Target-dependent affinity uses normal affinity when target is absent; Weakness Exploit base affinity is applied only when a selected target part has physical hitzone >=45.
- Maximum Affinity remains a separate display metric.
- Monster/part changes recalculate target-dependent combo result when a combo exists.
- Combo context no longer always substitutes Maximum Affinity for actual/effective affinity.

## Intentionally not changed
- OCR engine and embedded OCR UI.
- 14-weapon Technique/Combo datasets.
- save/load storage schema.
- equipment/decorations master-data pipeline.
- talisman generation rules themselves; this patch changes render ownership, not rule truth.
- Expected Damage Index / Expected DPS Index naming and Additional Damage engine are deferred to the Combo development patch.

## Static gates
- JavaScript syntax check: PASS.
- App/version marker: PASS.
- Baseline selector present: PASS.
- Five comparison metrics present: PASS.
- Old unconditional max-affinity combo context removed: PASS.
- Silent training-room default removed: PASS.
- Target-change combo recalculation hook present: PASS.
- Old max-value/bold comparison note removed: PASS.
