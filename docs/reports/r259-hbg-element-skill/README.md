# Actual elemental-attack skill on HBG first-Hit reference

Executed code SHA 2bf46bce96e227575e8926c26e3831fb8a29be01, clean product tree. Implementation remains2b7bbdf140652076c9efa912a5c9132964d7a6b9; no product edits needed. result.json records five product hashes checked against execution SHA, and fixture/harness hashes. One paired real-input execution only; no broad regression.

## Expected then observed
Original MHDB467 ホープキャノンⅣ, true attack160/display240, base affinity0, weapon slots[2,1], thunderLv1 capacity7. Innate Critical Eye1 (MHDB3) yields4% affinity; Ballistics2 (MHDB53) extends critical range, no damage multiplier adopted. Explicit CRITICAL, normal mode0. Original weapon deco35 雷光珠Ⅱ【2】 is kind weapon, slot2, Thunder Attack2 (MHDB127), placed w0 legally. No armor, charm, synthetic skills, calculated-stat or result overwrites. Original records/ranks and cache origin retained in fixture; old acquisition timestamp unknown, not newly fetched MHDB.

A no deco: physical160*.08*.8*1.01=10.3424; element160/100*200/10*.3=9.6; firstHit19.9424.
B deco35: physical10.3424 unchanged; attack-dependent element160/100*200*1.1/10*.3=10.56; flat50/10*.3=1.5; element12.06; firstHit22.4024.
These exact values pass both normal/maximum; DOM19.9/22.4 with explicit first-Hit-only scope. An incorrect attack-scaled flat would be2.4, distinguished by this input. Incorrect double multiplier/add would also fail numeric assertions.

## Source/units/application
index.html calcElementSkill (shared MHWElementSkillResolver) gives Lv2 mult1.1/add50, matching original deco rank. evaluateCurrent referenceFormula obtains skillTotal from actual calcBuild aggregation and resolves for selected ammo elementType, not weapon specials (empty). BowgunElementReference.firstHit consumes these once; Technique DB alone owns Lv1 physicalMV8/displayElement200. The display-unit flat is divided by10 and multiplied by elemental hitzone, outside attack scaling. Existing bowgun-element-reference.js is unchanged. Source https://kuroyonhon.com/mhwilds/memo/25.php ; Technique DB HBG_R118_FORMULA_SOURCE and HBG_R118_PHYSICAL_SOURCE retained.

The reference path passes final L3 attack/affinity but deliberately does not take aggregate weapon stats.element as ammo element. Element skill coefficients are consumed directly in the reference Formula via shared resolver; they are recorded under component.details.elementRule, attackDependentElement and flatElement. They are NOT represented as an extra L3 effectsApplied entry; that trace contains only critical-eye-affinity here. This is no claim that an elemental effect entry was emitted by L3. Actual total skill Lv and numeric result prove the equipped skill's single application in this existing reference path.

## Real save/compare/restore
Actual saveNamedBuild A/B, actual ordinary load A then B, each channel object equals its original standalone result. runBuildCompare under common CRITICAL settings preserves each row's own deco/skill level: A19.9424, B22.4024 both channels. Full before/after equipment/conditions/result snapshot equal; B's deco restored. Both row.power.normal null; comboTotalDamage and comboDps unavailable, firstHitReference only available, FIRST_HIT_ONLY_NOT_WHOLE_SHOT/source/UNVERIFIED preserved. Comparison DOM shows19.9 and22.4 plus scope note. Renderer and calculator unmocked; offline transport and realm-compatible JSON clone only.

No new coefficients/Hit count, no Critical Element/First Shot/Force Shot/conversion extension. No other elements/Lv/weapon tests, asymmetric-channel new run, Safari, CI or game measurement. No main/develop merge/deployment. Old r259 first-Hit fixture/logs preserved.
