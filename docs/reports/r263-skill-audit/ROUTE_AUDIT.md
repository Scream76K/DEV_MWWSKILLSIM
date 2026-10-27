# Stage3 shared-route audit (local, not accepted as complete)

Base product: `6c71e818919379b0b0649d2389237470cbe3802f`. Population remains the captured MHDB 179 rows / 442 ranks. No new skill coefficient was adopted. The whole 179-row, 14-weapon normal/maximum audit is **not finished**.

## Classification meaning

The matrix now records actual Adapter classifier routing for every row. 49 rows are partial, 3 have an existing exact-ID non-direct-HP disposition, 127 remain unreviewed. Partial includes entrance-only inspection; it is not a count of fully implemented skills. `implementationProof` distinguishes the downstream-reviewed shared-body routes from route-specific Formula consumers still to inspect. Unknown classifier is not by itself proof of missing damage effect: utility skills and set/group generated rank names take other paths.

Shared-body static chain inspected:

- Attack (72): `calcAttackSkill` → Adapter attack-boost-multiply (order10), flat (40) → `engine.applyEffects` attack decomposition → sourced physical Formula → canonical `MHWGenericProfileDamage`. Base×multipliers+flats, not final damage multiplication. Special phial/shelling/reference consumers require separate row closure.
- Critical Eye (3): `calcAffinityBonus` → physical/element affinity effects → engine logical-ID de-duplication → canonical expected critical. Critical Boost (22) is a separate canonical physical multiplier input.
- Five element skills (41,50,91,121,127): `calcElementSkill` → equipment.elementComponents base/mult/flat → engine → sourced elemental Formula. Bow's CM basis and bowgun attack-dependent element/flat are distinct consumers and are not automatically certified by this shared-body trace.
- Weakness Exploit (57), Maximum Might (99), Latent Power (142): `calcMaxAffinity` → maximum-minus-normal affinity delta → engine → physical/element expected critical. Target eligibility/exclusivity across all techniques remains to audit; existing maximum shortcut is not a blanket correctness proof.
- Root/group (131) and other registered group rules: `standardGroupPowerPlan` → groupAttackMultiplier / conditionalFlat → attack stage. Scope restrictions and unregistered bonuses remain explicit.

For 14 weapon columns the shared-body proof does not imply every special component consumes that same stat. No per-weapon complete label has been added.

## Confirmed defect and local correction

Producer preservation alone exposed an existing downstream hole: Adapter's `activeBonusEffectNames` marked any active set/group entry resolved; only maximum checked pending conditions. Actual public Adapter/Pipeline contract input with Root 1.05 plus unresolved Black Eclipse II returned normal **394.52 available** before the correction. This omitted a required effect and was not a valid complete total.

The existing six-layer contract now accepts either the legacy effect array or `{effects, unresolved}`. L3 validates both; Adapter marks unresolved bonus applicability explicitly. Engine stores both lists in `channel.effectPlan`, and stops that channel **before events** when required effects remain unresolved. It does not execute known components and later revoke the total. Known 1.05 remains inspectable, but is not described as applied damage when execution did not run. F-01 component-failure/consume guard remains unchanged.

Minimal public contract evidence (synthetic skill composition over captured real GS input, not a legal-build Stage4 proof):

- known Root only: normal and maximum 394.52 available, unchanged;
- Root + unresolved Black Eclipse II: before normal incorrectly394.52; after both channels unavailable with `UNRESOLVED_EFFECTS:BONUS_DAMAGE_EFFECT_PENDING:黒蝕一体Ⅱ`, zero executed events/components; known multiplier retained;
- maximum-only pending condition: normal394.52 retained; maximum unavailable before events;
- original input preserved. Existing legacy-array pipeline tests4 pass; no full regression.

`route-before.json`, `route-after.json`, `producer-before.json`, `producer-after.json`, `pipeline-check.txt`. `route-after.json.hashes` pins the executed product files. This fixes the propagation/false-completion defect; it does not implement Black Eclipse damage or close Stage3.

## Black Eclipse (MHDB106) / Antivirus (18)

MHDB ranks specify 2 pieces infection and 4 pieces infection+attack with further attack after overcoming. `TECHNIQUE_DB_SPEC_R90.md` explicitly says numeric effect implementation was not completed; parent-name maximum-affinity shortcuts are not complete implementations.

Existing `calcMaxAffinity` has overcoming +15 and Antivirus additional3/6/10, but `hasSkill` uses exact keys `黒蝕竜の力` / `黒蝕一体`. Generated rank names `黒蝕一体Ⅰ/Ⅱ` do not match these keys. There is no independent infection/overcome state contract in the producer. The root+black reproduction used zero affinity and must not be read as a damage-model proof.

Primary reference candidate: https://kuroyonhon.com/mhwilds/program/skill.php (retrieved2026-10-26 via web search text) states rankII infection attack+10, overcoming further+5. https://kuroyonhon.com/mhwilds/d/dame.php presents overcoming attack+15 and affinity variants. These corroborate candidate values, **not prior owner adoption or live verification**. No numeric change made.

Decision required to finish: adopt rankII +10 infected / +15 overcome as a provisional additive attack contract, rankI no attack add; specify the normal starting infection state and maximum overcome possibility. Existing overcoming affinity must be routed once via the same state plan, rather than adding another +15 on top of `calcMaxAffinity`. Unknown initial state is not false. Simultaneous compatibility with other conditional effects remains a separate audit item.

## Scorch (MHDB71)

Existing `ScorchReference.damage` has upper-rank fixed20/40 and fire element60/120 (internal raw element), fire skill multiplier/flat, positive fire hitzone. `observed({count})` directly multiplies explicit proc count and needs **no duration or Hit times**. `expected({eligibleHitTimes})` models 1/3 probability with2s cooldown and initially READY; this needs timing to count eligible opportunities, not to divide damage by duration. `forRoute` remains `damageIncluded:false` and is not a public-total component.

References: https://kuroyonhon.com/mhwilds/program/skill.php ; https://kuroyonhon.com/mhwilds/memo/32.php . Existing status is SOURCE_CONFIRMED_NOT_LIVE_VERIFIED. Zero-fire-hitzone minimum and White Flame combined behavior remain explicitly unresolved in this adopted implementation; current source text contains additional details, but no new adoption was performed here.

Next contract choice: explicit observed proc count per channel (no time required) versus expected proc count from eligible Hit timeline/initial cooldown. Do not infer proc count from weapon Hit count or set pieces. Either can supply a separate fixed+fire component once its input/interaction scope is agreed. A generic DPS-duration guard is not a valid reason to reject a known observed-count damage component.

## Remaining work and boundaries

127 rows still need semantic/downstream audit; 49 partial rows need remaining conditions and special consumers checked. Full rank/effect exclusions, normal/maximum feasibility, and per-weapon Formula reachability are not finished. No all-skill completion, Stage4 build validation, Safari interaction, CI, commit, push, merge, or publication occurred. Original Stage3 assets and user browsing state remain protected.
