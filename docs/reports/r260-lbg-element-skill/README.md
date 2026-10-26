# LBG elemental skill: flat-order correction and actual A/B

Product c4233a834a978c4ec1fc1918340ddbe8dd94d14f. Existing approved0.7 retained; no new coefficient/mode/Hit adoption. The earlier LBG implementation incorrectly applied0.7 to flat. This correction removes that multiplication from flat only; both source metadata and reported formula updated. HBG neutral modifier1 and previous flat0 LBG proof mathematically unchanged, not rerun.

## Source distinction
https://kuroyonhon.com/mhwilds/memo/21.php was read2026-10-26. The LBG Lv2 electric test at lines2598-2604 explicitly calculates attack-dependent elemental terms with0.7 and then adds the independent flat term before hitzone. Earlier lines1182-1191 also describe the placement using an old0.65 coefficient; that old coefficient is NOT adopted. Current numeric0.7 remains owner-approved Sentinel_9aa1a519cef48191adce7680723eeddb. https://kuroyonhon.com/mhwilds/memo/25.php separately confirms flat outside attack scaling. Newly linked LBG_ELEMENT_FLAT_ORDER_SOURCE / elementFlatOrder preserve placement provenance. No current game measurement is claimed; UNVERIFIED/PENDING remains. The source's other skill/cap conclusions are not newly implemented.

## Expected before execution
Actual MHDB766 ホープバレットⅣ raw160/display208, base affinity0, innate Critical Eye1 (+4%) and Ballistics2, weapon slots[2,1]; thunderLv1 capacity5 rapid:false. Deco35 雷光珠Ⅱ【2】 weapon slot2, Thunder Attack2, legally w0. No armor/charm, synthetic skills/stats/plans/results. Original cached MHDB records and rank descriptions retained; original fetch timestamp unknown.

Explicit NORMAL / CRITICAL / FIRST_HIT / normalMode0. Physical160*.08*.8*1.01*.7=7.23968 unchanged.
A no deco: elemental160/100*200/10*.3*.7=6.72; firstHit13.95968.
B Lv2: attack-dependent160/100*200*1.1/10*.3*.7=7.392; flat50/10*.3=1.5; elemental8.892; firstHit16.13168.
The old flat0.7 produced1.05 and total15.68168; an erroneous attack-scaled flat would produce2.4. The same minimal pair distinguishes both mistakes.

before.json preserves real failure on B expected value. after.json succeeds for both normal/maximum, exact rule mult1.1/add50, physical invariant, component elemental split and source refs. Values in actual summary14.0/16.1; firstHit scope text retained. Attribute skill coefficients come from shared MHWElementSkillResolver and are consumed once by firstHit, with no separate extra L3 attribute application. Formula component details record rule and split; effectsApplied is not a fabricated attribute-effect entry.

Actual saveNamedBuild A/B, ordinary load each, runBuildCompare with common same shooting conditions: A and B channel objects equal corresponding singles. Whole before/after equipment, conditions, results equal, restoring B deco35. Comparison DOM shows14.0/16.1. comboTotalDamage/comboDps unavailable, row.power.normal null; only FIRST_HIT_ONLY_NOT_WHOLE_SHOT metric available. Scope/adoption/source unchanged.

Execution HEAD e39a162 with working edits, exact five product hashes match product above. Fixture/harness hashes in after.json. Eight bundle modules unchanged and source inclusion verified. Only this paired harness run before/after; old history/evidence kept. No broader skills/modes, partial-channel new run, CI, Safari, live-game test, main/develop integration or deployment.
