# SA awakened and HH attack-melody local implementation

Baseline HEAD: `059c61bdc8f2fc659926dd82440854463938e56f`. Local uncommitted work only. Owner approved the two provisional models; no stage/commit/push attempted. This supersedes pending status for these two items in the initial README/source-candidate audit, not the IG/ammo candidates. Stage II is not declared complete.

## Contract and implementation

- `index.html`: TechniqueDBEngine.eventModels.saAwakened owns the scope/event/explosion-element contract; MV12/element1/part1 remain uniquely in existing SA_AMPED_FOLLOWUP. Three allowed techniques: SA_SWORD_VERTICAL, SA_SWORD_MORPH_DOUBLE, SA_AXE_MORPH_SLASH. Fixed awakened state, each sourced sword-mode body Hit followed by one contacting explosion before the next mode transition. No gauge/time/expiration/discharge/focus model.
- `real-technique-one-hit-adapter.cjs`: emits followup physical/element components through the SAME formulas. Body excludes only explosion-element effect. Followups exclude rapid-morph-attack:<technique>; retain sword-state phial effects. No explosion for axe Hit. Unknown source/unsupported technique does not become zero.
- `hope-hammer-browser-adapter.js`: existing power1.17/element1.45 remain the sole phial effects. Newly approved explosion element factor power0.35/element1 is pre-flat, independent of phial factor. Critical Element interaction remains unadopted and explicitly rejected. Result retains OWNER_APPROVED_PROVISIONAL/UNVERIFIED/model scope.
- HH_NORMAL_MELODY_MODEL now owns attack small [1,1.03,1.05], large [1,1.05,1.10], attack/defense small [1,1.03,1.05]. One attack family only. Same-family establishment increments capped rank; no multiplying old and new ranks together. Self improvement is independent. Attack = weaponBase * otherMultipliers * selfMultiplier * selectedRankMultiplier + flat.
- `real-one-hit-pipeline.cjs`: existing HH transition accepts only selfImprovementLevel or attackMelodyLevel. Damage still occurs before the establishment transition. No new sound/fixed/echo occurrence counts; body20+75 stays two body Hits, not two melody events.
- UI offers homogeneous melody selection/count and explicit starting attack rank; ordinary condition serialization/restore retains it. Mixed API melody lists can include self plus one attack family; the simple UI does not silently collapse mixed saved lists, but rejects their count as unsupported. Different attack families reject HH_ATTACK_MELODY_FAMILY_CONFLICT. No speculative strongest-wins rule.

Sources: https://kuroyonhon.com/mhwilds/memo/11.php ; https://kuroyonhon.com/mhwilds/memo/26.php ; https://macarongamemo.com/entry/mhwilds-hunting_horn-melody ; https://kuroyonhon.com/mhwilds/memo/21.php . Owner approval retained as OWNER_SA_HH_PROVISIONAL_2026-10-26. Current game version unverified.

## Minimal evidence

`sa-hh-before.json`: HEAD Adapter rejects awakened SA and attack melodies; current DB loaded but old product entry rejects. This is an entry-boundary reproduction, not a full archived-build rerun.
`sa-hh-after-initial.json`: first implementation exposed HH transition whitelist gap; retained.
`sa-hh-after-harness-error.json`: totals available, harness wrongly required effectsApplied on confirmed-inactive zero-element components; harness corrected without altering expected damage.
`sa-hh-after-final.json`: final public evaluateCurrent contract succeeds. Synthetic stage-II inputs derived from captured MHDB weapons, not legal stage-IV builds or live-game verification.

SA double -> axe morph: physical MV30,12,50,33,12; element five components. Only body indices corresponding to sword contacts emit followups. Both channels finish SWORD. Base90, element100, maximum attack multiplier1.1+flat10, element flat20. Every component checked against independent stage expressions, including sharpness/target; element flat remains outside explosion multiplier.

| SA phial / rapid | Normal | Maximum |
|---|---:|---:|
| power / 0 |125.85|151.83|
| power / 3 |144.55|172.41|
| element / 0 |123.97|148.84|
| element / 3 |141.06|167.64|

HH performance -> just encore -> left swing; N1 B1; self starts rank2, attack rank0. Four body Hits, one sound, two melody echoes, one ordinary echo, no fixed10 at N1. Event attacks use rank0,0,1,2; normal and maximum start independently. Each component has at most one attack-rank effect.

| HH family | Normal | Maximum |
|---|---:|---:|
| small |213.0888|253.70268|
| large |216.838|257.8348|
| attack/defense small |213.0888|253.70268|

Additional minimum checks: SA vertical emits one followup; awakenedOFF emits no followups; conflicting HH families reject; isolated JSDOM condition roundtrip and provisional/UNVERIFIED DOM label. `hh-existing-model-final.json` rechecks prior N2/B1 self-only/fixed10 model; `cb-after-sa-hh-final.json` protects retained CB axe-followup work because shared compiler/bundle changed. No skips or expectation changes to old tests.

`sa-hh-final-manifest.json` fixes source/bundle hashes and evidence association. All final evidence file hashes checked against current files. git diff --check passes. No real Safari, persisted A/B, live-game, CI or stage-IV verification claimed. No existing Safari/storage/server interaction. Original Stage3 binary diff hash remains 5781b032f789a9531391ef06834e5657a2c465d0f83ed817adfcacdfa6194ed8. Remote read failed DNS github.com; no fresh remote equality claim.

Remaining stage-II decisions: IG dedicated formula/data adoption; elemental-ammo later-contact coefficient/adoption; explicit scope of other CB mixed sequences and unadopted weapon actions. SA gauges, special HH melodies/placement and heterogeneous attack-family competition are outside this adopted model, not secretly zeroed. Independent review precedes stage III.
