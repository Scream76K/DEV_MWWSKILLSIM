# r87 STANDARD power indices

Build comparison now evaluates adopted STANDARD hit profiles separately from user combo DPS. Physical HP damage and elemental damage are accumulated per hit without game display rounding. Normal uses calculated affinity; maximum uses calculated maximum affinity with the same current attack and element. Both indices divide by selected baseline NORMAL damage. Different weapon kinds or profile IDs cannot produce a ratio. A zero, missing or nonfinite baseline never switches to another build.

Ready reference profiles: great sword, long sword, sword and shield, dual blades, hammer, lance, switch axe. Super critical level comes from each build's equipment skill total. Hitzones and sharpness remain explicit common Step 5 conditions. No duration is consumed.

Pending: insect glaive state evidence; charge blade complete dedicated STANDARD components; hunting horn, gunlance, bow and bowguns dedicated components. Elemental critical with nonzero element is also withheld until its applicable formula is resolved. Pending results remain null and carry a reason in the UI and exported comparison/AI data.

Maximum scope is CURRENT_ATTACK_ELEMENT_MAX_AFFINITY. This is an initial maximum affinity reference, not a complete all-buffs maximum. Conditional attack and element maxima, weapon-state maxima and remaining dedicated handlers are next work. Food, item buffs and live game version are not captured. Existing DPS calculations and custom combo ordering are preserved.
