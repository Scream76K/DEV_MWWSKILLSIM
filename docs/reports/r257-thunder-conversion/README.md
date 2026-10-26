# Passive equipment thunder conversion — bounded provisional body scope

Owner approval Sentinel_19a114815b748191a3d00cae461280c0: thunder weapon body, armor + unconditional resistance skills, passive both channels, no food/temporary/ammo; unknown negative/cap/rounding unavailable. Product 41acebb1c54c5584a863ce1d43979d53451935a9. No new conversion coefficient: existing GS/hammer/HH5, others4 (bowgun2 remains excluded). Source https://kuroyonhon.com/mhwilds/program/skill.php lines458–463 checked2026-10-26; MHDB165 original retained. OWNER_APPROVED_PROVISIONAL / UNVERIFIED in effect and diagnostics; summary/comparison annotate scope and effective elemental value.

## Common input and guards
armorThunderResistanceInput → equipmentThunderResistanceInput uses MHDB156/118 exact rank description (NFKC normalized) to parse thunder +6/12/20 or Defense all-resistance+3/+5; no separate duplicated level table. Defense1–3 contributes0. Missing rank/value fails. Original armor sums retain negatives, final negative/noninteger total fails. Conditional resistance IDs131/133/153 or named effect counterparts reject, including those on equipped armor whose activation is not resolved. Food/temporary effects are explicitly outside this calculation scope; not silently inferred.

L3 adds conversion once to element at existing flat stage order60 on both normal/maximum, not attack or affinity. Passive effect removes only the old thunder-conversion pending item; unrelated pending skills remain. Unknown input never replaced by0. Non-thunder, reference/shelling, special-component and SA interactions excluded. SA remains gated here because phial/cap interaction has not been verified. Other body paths share the same input, not weapon-ID logic.

Cap/rounding eligibility is conservative: require integer resulting display element and strictly below original weapon element+350, no active bonus effect, no conditional maximum element change, no GS Charge Master. This is a REJECTION BOUND only, never a clipping/damage cap. Source https://kuroyonhon.com/mhwilds/memo/31.php documents old cap max(base+350,base*1.9) and1.04+ max(base+400,base*2.3). Staying below the lower additive bound avoids either documented cap; current-version verification still pending. Broader buff/CM/phial/cap combinations intentionally unavailable rather than guessed. No new game damage coefficient adopted.

## Real equipment proof
GS1081 ラギアブレイドI raw200 thunder500 affinity0 Focus2 + conversion1. MHDB418 ホープマスクα thunder+1, slot1, Divine Blessing2; decoration69 耐雷珠【1】 skill156Lv1 +6 fits armor slot. Original candidate272 has no slot: pre-run slot assertion failed, no fabricated slot; replaced with418 before actual proof. initial.json is empty stdout from this early assertion failure.

Existing GS default three-technique selection (charged3, strong charged3, strong wide3), not a single-hit-only claim:
- A no armor: total resistance0; element500; both channel totals1144.54.
- B armor418: resistance1; element505; totals1145.48.
- C armor418 +deco69: resistance7; element535; totals1151.18.
Physical hits371.71/394.94/283.01 invariant. Element hits A25.88/31.05/37.95; B26.13/31.36/38.33; C27.69/33.22/40.61. Positive conversion effect applied once per elemental component; no effect emitted at0. Public calcBuild, real summary, saveNamedBuild/runBuildCompare; per-channel full results match standalone, complete state/conditions/results restored. Summary and comparison show converted element and provisional scope; base equipment element remains separately displayed.

Pure helper contracts (explicitly NOT additional real equipment proofs): Defense4 gives+3; conditional Element Absorption unresolved; negative total unresolved. Defense full equipped build, other weapon kinds and all cap boundaries not executed. No stats/skill/plan/result overwrite. after.json exact hashes match product commit; before-display-annotation.json preserves prior successful numeric run without detailed scope text. Existing r257-thunder-resistance-input remains historical input-only proof.

Bundle8 modules exact-source match, adapter external. No broad regression, Safari or local CI execution. No claim all thunder conversion cases or all14 weapons complete.
