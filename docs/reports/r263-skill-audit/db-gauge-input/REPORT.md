# Dual-blades explicit gauge UI connection

Existing contract: TARGET_HIT_AND_WYVERN_INPUT.md specifies demonMode=true and requiresDemonGauge=true as independent explicit prerequisites. No quantity, duration, consumption, refill, or whole-sequence completion model is introduced.

## Incremental product change
Only index.html: add comboDBDemonGauge select (unset/no/yes), extend comboDBStoredState / restoreComboDBState, and existing change synchronization. App.combo.syncFromDOM, buildSnapshot, compareStep5Snapshot, applyBuildSnapshot and comparison already share this stored-state object. No adapter, Formula, coefficient or technique changes. Old missing key restores unset; demonMode does not infer gauge.

## Public-path evidence
Before: public calcBuild with demonMode true cannot satisfy II/III requiresDemonGauge; total unavailable (before.json, exit0 reproducer).
After: JSDOM select change event, then public calcBuild, actual shared Pipeline with no adapter input injection. Unset/null and explicit false retain requirement mismatch and total unavailable. Explicit true gives normal/maximum 297.1400000000001 without Airborne, 306.8900000000001 with Airborne Lv1. Exactly eight mapped physical components gain the existing 1.1 multiplier; every other component stays unchanged. Stored snapshot is restored with matching channels. Two named saved builds (Airborne off/on) are compared under shared true, then shared false; both use the current shared gauge state. Local storage bytes and current build/conditions remain unchanged after comparison. Legacy snapshot missing gauge remains unset and unavailable. after.json exit0, no intermediate failed run in this batch.

Fixtures use existing Hope Dagger input and declared training conditions; not actual equipment legality/game verification. No all-weapon regression, dynamic resource simulation, F01 injection or beta final test. Prior HM34 video evidence is separate and not rerun. A change event synchronizes/invalidate state using the existing UI convention; calcBuild is explicitly invoked by the harness, not falsely claimed as automatic change-event recalculation.

## Review / audit
ID86 stays partial until independent review. This closes the newly identified public gauge handoff gap; it does not alter other skills' applicability or the static-completion definition. Product hash and exact incremental patch are in manifest.json / connection.patch. No commit, push or integration.
