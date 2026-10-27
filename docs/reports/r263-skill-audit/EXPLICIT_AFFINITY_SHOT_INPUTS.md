# Explicit affinity / shot inputs — latest local integration
Base b2c590d; no commit/push. Prior local changes preserved.

## Expectations and implementation
Critical Draw103: existing50/75/100, eligible draw's3-second active window explicitly attested per canonical ordinary-body Hit. conditions.criticalDrawHits.normal/maximum maps techniqueID to boolean array; no time simulation. Arrays must cover each selected record. False means inactive, missing means unknown. Mounted/dismount/sneak true rejects activation. Reference aggregate true remains CRITICAL_DRAW_REFERENCE_HIT_MAPPING_REQUIRED, not all arrows silently enabled. Repeated same-ID occurrences use the same declared flags; no claim to support varying timing within them.
Wet39: existing3/6/9 wet +7/14/21 bubble, separate booleans each channel. Missing only fails that channel. No implicit wet/bubble from maximum display. Existing dedicated wet controls were absent; minimal controls feed compareStep5Snapshot, combo snapshot, ordinary applyBuildSnapshot and preserveCombo comparison policy. Draw JSON uses the same persistence path. No live Safari changes.
One rule object MHWExplicitAffinityRules supplies both display and effect values. Display maximum remains theoretical; actual MHWMaxAffinityResolver call zeroes Draw/Wet/WEX before separate scoped effects. Noncritical special formulae continue ignoring affinity. Per-component draw effects exclude other body Hits and separate special components.
First140 and Force137: common shotSkillBonuses reads Technique DB single source. First full-magazine shot uses5/10/15 physical add and1.1 element multiplier. Force4/6 uses3/6/10 physical add and1.05 element multiplier;4+ affinity8/10/12. Explicit position required. Same shot state for all contacts. Attack-dependent element multiplier applies before existing cap; attribute flat is not multiplied. No automatic capacity/contact inference. Wyvern-specific shot-skill route not unlocked in this batch.
Sources read2026-10-27: https://kuroyonhon.com/mhwilds/program/skill.php ; https://kuroyonhon.com/mhwilds/memo/25.php . Existing normal shot coefficients remain unchanged. No current-game VERIFIED claim.

## Correction to pass19
pass19 incorrectly left Force elemental multiplier unconnected. Its old9.6/9.6 confirms attack-add separation only and is not evidence of complete Force behavior. Retained old evidence unchanged; new integrated evidence supersedes completion interpretation. Current force-only fourth shot would be9.6*1.05 (no crit element). Prior script expectation is corrected with source, not silently relabelled.

## Minimal latest execution
explicit-input-after.json: public HBG467 thunderLv1, eye1/thunder2/critical-element3/wet3/first3/force3, explicit shot1/4/5. This is a contract fixture using real weapon data, not a legal decoration build or stage4. All required component status available and both execution channels complete. Independent expected formula checks physical add and element multiplier/flat/critical stages.
- shot1 normal P11.312 E13.2261744; max P12.152 E14.0524824.
- shot4 normal P11.3152 E13.0109568; max P12.1312 E13.8040008.
- shot5 normal P10.6496 E12.465216; max P11.4176 E13.224996.
Element flat contribution remains1.5. Normal wet/bubble off; maximum both on adds30 once. Ordinary snapshot load restores BOTH, preserveCombo retains current WET; shared current condition restored. First-hit scope remains first-hit, not full-shot.
draw-input-after.json: existing3 GS body techniques, Draw1 firstHit only, Wet3 normaldry/maxwetonly. Exactly one paired physical/element Draw effect for firstbody50; Wet0/9. Normal unknown Draw map fails only normal; maximum completes. Draw map roundtrip through buildSnapshot/applyBuildSnapshot passes.
Initial integration detected affinity double application on reference components because effect IDs used :element instead of engine logical-ID suffix -element. Fixed to existing suffix contract without engine rewrite. explicit-input-initial-double-affinity.json preserves initial output. Latest checks pass; no broad regression.

## Remaining explicit boundaries
Draw aggregate-reference per-arrow/contact mapping and first/force Wyvern consumer remain input/consumer work. UI JSON is minimal condition input, not polished UX.173/178 etc not newly adopted here.178 prior-spec/unit reconciliation remains one item; do not repeat whole history search or demand a fresh numeric approval merely because local record unavailable.
Classification remains8 complete/63 partial/15 missing/6 annotation/87 nonHP; static row closure still requires remaining adopted branches. NoCI/Safari/livegame or all14 run. No stage3 original/server/storage modification.
