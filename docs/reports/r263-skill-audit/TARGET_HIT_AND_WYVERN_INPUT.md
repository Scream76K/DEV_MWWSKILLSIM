# Target Hit / dedicated wyvern element audit (local pass17)

Base b2c590d3057c80b23927bcec3d8b3c1713f702bc. Earlier pass14–16 local changes retained. No commit/push, Safari, original Stage3, integration or publication changes.

## Implemented / narrowly executed

Skill 86 飛燕: https://kuroyonhon.com/mhwilds/memo/27.php maps DB_DEMON_DANCE_II Hits 2/3 and DB_DEMON_DANCE_III Hits 3/4/7/8/9/10. The attack multiplier 1.1 is applied before attack flat through the existing shared attack-effect consumer, only to physical component IDs. DB_DEMON_DANCE_I has no eligible Hit. The rule is source-confirmed, not live-game verified. Other technique IDs still require their own mapping.

The first contract run exposed DAMAGE_TYPE_UNRESOLVED before skill processing. https://kuroyonhon.com/mhwilds/memo/6.php explicitly lists the matching 27-MV dance sequence as 切断. The three Technique DB records now preserve that sourced classification without changing MV/element modifiers. No weapon-wide fallback was introduced.

The minimal fixture uses explicit demonMode=true and requiresDemonGauge=true, not inferred resources. Normal and maximum: neutral 297.1400000000001, skill 306.8900000000001. Exactly eight physical components receive the effect once; non-target components stay equal. This fixture has zero weapon element: positive elemental-damage execution is not claimed. Existing shared effect target/component ID logic statically excludes element. No all-weapon test.

Evidence: airborne-hit-before.json (initial setup, both variants stopped on missing damage type), airborne-hit-blocked.json (corrected weapon fixture, before damage-type repair), airborne-hit-after.json (final assertions). Intermediate assertion failures included a fixture missing requiresDemonGauge and an incorrect assumption that inactive components always contain effectsApplied. These are not passing product evidence. Final harness explicitly requires available totals as well as complete execution. Hashes: pass17-manifest.json.

## Remaining targeted skills

- 83 溜打強化: skill.php states ver1.04 physical damage ×1.03 and excludes 溜めたアッパー. HAM_SIDE_SWING/HAM_VERTICAL_II/HAM_UPPERCUT are not charged attacks. HAM_MIGHTY_CHARGE_UPPERCUT is 渾身溜めアッパー: the generic exclusion wording is insufficient to equate this with the separate 溜めアッパー unambiguously. No coefficient or non-HP exemption added.
- 129 破壊王: skill.php distinguishes part durability from damage when destroying a wound. No explicitly typed wound-destruction damage component was established in the currently adopted ordinary sequence. A wounded target hitzone is not evidence that this Hit destroys the wound. No multiplier applied to all HP or entire focus techniques; scope disposition remains to be connected once exact eligible component/no-event contracts are established.
- 86 remains partial, not fully connected across adopted weapon techniques. This batch closes only the positively sourced DB dance mapping.

## Wyvern conditional element: not a safe guard-only repair

Current HBG_WYVERN_AMMO uses Hit1 fireAttack=400/fireSkillTarget=false and Hit2 fireAttack=200/fireSkillTarget=true. HBGWyvernReference.calculate applies fire-level multiplier/flat only to Hit2. This is the KAN23 owner-fixed two-Hit provisional contract, distinct from the obsolete five-explosion source row.

The shared conditional producer's elementComponents describe weapon element; a non-elemental HBG's base is zero. Feeding its final element value as the wyvern base would lose 400/200. Reapplying fire-level effects through both the shared basis and dedicated fireLevel would double them.

Existing KAN23 records prove fire attack levels, not Coalescence/Burst/Element Absorption scope for these two fire components. memo31's explicit special cap section describes elemental ammunition's attack-dependent basis, not this fixed fireAttack field. Therefore no generic ammunition cap or weapon-base-zero cap has been added to wyvern.

Concrete outstanding contract: do conditional elemental multiplier/flat affect only Hit2 (the existing fireSkillTarget), or a different set of Hits, and what cap basis applies to the fixed 400/200 values? Once established, pass multiplier/flat as separate dedicated inputs and apply once to the affected Hit's fireAttack; preserve attackComponents and physical output. Current guard remains for these skills. This is not recorded as completed wiring.

GL charged/full-burst adoption remains pending and unchanged. Classification after this batch: complete 8, partial 63, missing 15, annotation-only 6, non-HP 87. These are static scope classifications, not execution counts.
