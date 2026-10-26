# HBG elemental first-Hit reference: real-build connection

Product commit: 2b7bbdf140652076c9efa912a5c9132964d7a6b9. Owner approval Sentinel_82cf2c00807c8191a0c229b63b6d95fa; existing numerical source contracts only. No whole-shot Hit count or coefficients newly adopted. Technique DB HBG_ELEMENT_FIRST_HIT_REFERENCE retains numericStatus SOURCE_CONFIRMED, verificationStatus UNVERIFIED, EVIDENCE_GATED whole-shot scope and baseline1.042.00.02. firstHit() retains FIRST_HIT_ONLY_NOT_WHOLE_SHOT, UNROUNDED_REFERENCE, liveGameVerification PENDING.

## Scope and route
Real calcBuild -> compareStep5Snapshot.hbgState -> evaluateCurrent -> shared six-layer reference component -> BowgunElementReference.firstHit -> metrics.firstHitReference. comboTotalDamage explicitly unavailable FIRST_HIT_ONLY_NOT_WHOLE_SHOT; comboDps remains unavailable DURATION_UNAVAILABLE. Official power index was not unlocked. Actual single and comparison renderers label first-Hit only, not whole shot/combo total. Only a single selected reference technique is supported; mixed/duplicate selections cannot sum first-Hit values into a combo.

The original weapon.ammo record is selected by explicit elemental type and level, and retained in component details including original capacity. No weapon element0 is interpreted as ammo element0. Physical/attribute constants remain solely in Technique DB, formula in bowgun-element-reference.js unchanged. Shared L3 attack/affinity feed formula; base weapon attribute is not used as ammo attribute. Element skill multiplier/add are resolved from existing shared element skill resolver, applied once by firstHit outside attack scaling for the flat term, not from already aggregated stats.element. Actual proof has no skills; other skill combinations are not execution-verified here.

Special mode must explicitly be0; mounted, ammo capacity restores, active set/group, conditional attack/element effects, First/Force Shot, Critical Element, Charge Master, Bladescale Loading, Ballistics3, thunder/attribute conversion remain unavailable rather than silently omitted. Unsupported source elements/ammo/levels/ranges are rejected. No LBG expansion. Failures occur within existing channel execution where possible; shared equipment validity errors remain shared. No new per-channel UI state is invented. Asymmetric channel failures were not separately executed in this narrow HBG proof; the shared executor is unchanged.

HBG reference UI states are saved with combo and restored on ordinary loading. Old saves lacking the new state clear only the new elemental selector, retaining previous legacy treatment for old normal-ammo fields. Comparison preserveCombo:true keeps current shared state for both rows, finally restores it. State changes invalidate existing combo output. No saved JSON is batch rewritten.

## Minimal actual-input evidence
Fixture original MHDB HBG464 ホープキャノンⅠ, raw90 affinity0, thunderLv1 capacity6, no armor/charm/decorations/skills. Source https://wilds.mhdb.io/ja/weapons from previously obtained /tmp/hbg-weapons.json; acquisition timestamp unknown, not a new fetch. Skill DB fixture is original cached source too. No computed stats/skills/plans/result overrides.

Expected and observed both normal/maximum:
- CRITICAL: physical5.76, element5.4, firstHit11.16 (DOM11.2).
- NEAR: physical2.88, element5.4, firstHit8.280000000000001 (DOM8.3).
- Unsupported fireLv1 on same weapon: HBG_ELEMENT:WEAPON_AMMO_UNRESOLVED, no reference value.

Save A at critical and B at near, invalidate by selecting fire, actual B load restores thunder/near and matching channel objects. runBuildCompare under common near conditions returns8.28 for both saved same-equipment rows, matching standalone under same conditions. It deliberately does not compare different saved distances. Whole before/after equipment/conditions/result snapshots equal. Both row.power.normal are null. DOM preserves scope note. No engine/renderer stubs.

initial.json preserves first passing run before the extra legacy-save and unsupported-Ballistics3 guards; after.json is final passing run. Both run same small fixture, no broad regression. after.json product hashes match product commit above; fixture and harness hashes recorded. Bundle8 modules checked byte-for-byte included, no numeric changes.

## Source readback / remaining limits
2026-10-26 read-only source check: https://kuroyonhon.com/mhwilds/memo/25.php lines107-130 describes attribute flat outside attack scaling; example205/Lv2/fire3 yields20.25 element. https://kuroyonhon.com/mhwilds/memo/15.php is the existing HBG motion/range source. These are source confirmation, not current game-version measurement. The deployed Technique DB evidenceRefs retain these URLs via HBG_R118_FORMULA_SOURCE / HBG_R118_PHYSICAL_SOURCE.

No CI/Safari/real-game run, no whole-shot penetration, no rapid fire, no DPS, no arbitrary combo support. Other elemental weapons and Lv2/elemental skill combinations are statically routed but not separately executed. No main/develop merge or deployment. Remote develop read8ba21ea9915e44421e89ae0a33fc7a4c5adcb1ae; before this product branch was0 behind/314 ahead by history, not proof of full product equivalence.
