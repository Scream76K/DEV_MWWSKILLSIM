# Series and group boundary integration

Product/harness/fixture commit: 04c424bb7e5c2f6fa5aad146bf7db0b52df6cf35. Executed files were hashed before commit, then verified against that snapshot without another run. Sources were fetched successfully from MHDB with a User-Agent; source-meta.json records endpoints, response hashes and acquisition timestamps. Selected records are exact copies; game patch alignment remains unverified.

Input and expectation: MHDB236 Hope Blade I, raw90, no weapon skills, no decorations or custom charm. Use the existing public default GS three-technique profile (MV176/187/134, green1.05, slashHZ0.8); no fake single-technique selection. Initial harness attempted a picker ID absent from that UI and therefore fell back to this profile. It was corrected to deliberately use the existing profile and expectations were derived for all three actual hits before the product fix. Every physical component receives applicable effects once, not once per whole combo. DPS is excluded.

| Snapshot | Original armor IDs | Normal | Maximum | Bonus boundary |
|---|---|---:|---:|---|
| S1 | 349 | 375.73 | 425.83 | No series bonus; ordinary Burst2 +12 only at maximum |
| S2 | 349,350 | 375.73 | 459.23 | Burst Boost I +8; max flat12+8 |
| S4 | 349,350,351,352 | 375.73 | 517.67 | Burst Boost II +18 only; ordinary Burst4 +16; max flat34 |
| G2 | 614,649 | 375.73 | 463.40 | No group bonus; max Peak Performance2 +6 and Counterstrike2 +15 |
| G3 | 614,649,330 | 394.52 | 482.20 | Group131 three pieces; BEFORE state base90*1.05, maximum then +21 |

Armor kinds are original head/chest/arms/waist and never occupy duplicate slots. Parents are not summed as ordinary skill levels. Active bonus outputs retain original IDs, count, required count and selected rank. Highest series rank replaces the lower one. The maximum plan retains evidence references and each physical component records one conditional flat and, for G3, one group multiplier. Series snapshots use one saved comparison, group snapshots another (within the UI three-row limit). Both comparisons use runBuildCompare, preserveCombo:true unchanged, match single calcBuild numbers, render them and restore the original G3 equipment and common conditions.

Confirmed blockers and minimal fixes: the series/group counters themselves were correct. MHDB80 Earplugs,122 Divine Blessing and102 Evade Extender were unclassified and blocked the entire Pipeline. Added outgoing-HP-non-damage policies restricted to their original IDs, Japanese names and levels1..3. The simultaneously activated group4 Guardian's Protection reduces incoming elemental/special damage in Ruins of Wyveria; added an exact rank1/required3/group identity policy so it does not block maximum HP calculation. Malformed or duplicate guard activations remain gated. No damage coefficients were added or changed.

Before failures and original harness are retained in before.log.json and before-harness.cjs. Final harness uses tools/dom-test-setup.cjs for production script order. Only raw equipment/skills and UI state are supplied; no stats, totals, condition plan, effects or Pipeline result overrides. HBG, SA and completed bow cases were not rerun. No full regression, push, merge or publication.

## Artia: static only, unchanged

index.html:1034 isArtia recognizes the named giant-mutated weapons or explicit giant-mutated wording, not the generic Artia name. Raw examples303/304 (ordinary Artia Blade I/II) do not match;1139 (giant-mutated bow) matches the whitelist. calcSetSkills:2015 adds one selected series/group count only behind isArtia; artiaSkillActivation:1907 uses the same gate. No normal I/II execution was performed.

Existing discrepancy with the owner-fixed material premise: renderArtia:1454-1455 still exposes same-element material count and three production-bonus selectors; build initialization:550 uses none/none/none; templateArtiaFromSource:8366 can preserve arbitrary supplied parts. The template normalization near8454 forces attack/attack/attack for templates, but does not make all interactive paths fixed. Thus universal same-element attack-materials x3 is NOT confirmed. This task did not alter it. artiaFixedVariantStats:1694 consumes mutation-specific completed values; restoreStats:1715 separately adds restoration bonuses. Weapon element/type handling remains unchanged. The material-policy discrepancy needs a separate narrowly scoped follow-up, not silent expansion here.
