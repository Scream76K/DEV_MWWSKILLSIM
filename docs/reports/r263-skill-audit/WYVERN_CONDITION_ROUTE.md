# Wyvern condition input connection, local only
Base b2c590d; prior pass14/15 changes retained. No commit/push.

## Changed and verified
hope-hammer-browser-adapter.js wyvernRequested guard now accepts existing attack-only condition IDs144/154/123/120/81/75/87/66/67/138, validated attack-only series/group plan entries and black-overcome Antivirus. Unknown/unresolved effects still reach structured L3 failure; Artia and multi-shot stock scope remain guarded. Water/thunder/ice/dragon exact levels1–3 are non-applicable to the fixed fire components; their presence no longer blocks execution. Ballistics3 still rejected at its explicit range-applicability gate.
No formula coefficients changed. referenceFormula passes final stats.attackComponents to HBGWyvernReference.calculate → aggregateAttack. Hit1 physical=.8×(B×M×artillery+skillFlat+externalFlat); Hit2=.19×(B×M+skillFlat+externalFlat). Existing fire components, fire-skill target hit and noncritical contract unchanged.
Minimal synthetic proof tools/skill-wyvern-condition-proof.cjs, before/after JSON: neutral231.26000000000005; blackII infected normal241.16000000000003; maximum black overcome+Agitator5+Ambush3 gives294.614. Assertions use decomposed arithmetic, not merely these totals. Hit fire remains12 and8.1; unrelated four elements equal neutral. Unknown skill and Ballistics3 rejected. Input JSON unchanged.

## GL separation
GunlanceShellReference.calculate already consumes final attack and components for supported actions; shared components do not need another multiplier path. Artillery definition supportedActions remains NORMAL only. CHARGED/FULL_BURST fire additions and artillery applicability are not established by NORMAL's owner approval. GL_SHELL:ARTILLERY_ACTION_PENDING is retained, no coefficient extrapolation.

## Missing16: concrete closure requirements
|ID|Name|Required closure|
|---|---|---|
|23|速射強化|adopted rapid-fire component applicability/consumer; cannot apply normal non-rapid0.7 automatically|
|62|凍峰竜の反逆|flat25/50 candidate approval pending|
|69|特殊射撃強化|identify adopted special-ammo/dragon-piercer target components and Lv rule|
|83|溜打強化|adopted hammer charge Hit applicability and physical stage|
|86|飛燕|source jump Hit classification per adopted Technique ID, not name-based whole-tech buff|
|89|革細工の滑性|sliding activation → max affinity30 candidate; exact ID/3pieces and adoption needed|
|94|貫通弾・竜の矢強化|supported piercing/dragon-piercer route applicability; do not use elemental contact falloff|
|107|雪獅子の闘志|self flat3/6 approval pending, other-party scope excluded|
|129|破壊王|part-break multiplier vs actual HP effects on specific adopted focus moves; do not multiply all HP|
|159|焼き砲モロコシ|shell type/action applicability and source rule before effect routing|
|163|刃鱗研装|evade activation, eligible sharpness/weapon components and adopted effect value|
|164|パワーストーン|mined resource input and exact attack bonus/limit; no invented inventory|
|171|炎の料理人|meal activation/rank effect and attack stage, not annotation-only by name|
|174|連携プログラム|ally/action activation and self modifier/extra-damage separation|
|178|巨戟龍の黙示録|enrage element1.2+20/1.3+40 candidate, cap/ammo-base applicability adoption|
|181|耐性変換【水】|resistance aggregation, candidate conversion/cap/target condition adoption|

## Partial common blockers, not all-weapon-test count
25 numerical source discrepancy(+30 adopted versus current table+25);47 non-normal artillery;53 wyvern ballistics;85/136 special-component scope;13/95/133 conditional element portions on wyvern are still not authorized by the attack-only allowlist;5 coating capabilities only unused scope;172 rank2/action scope;103 draw condition per Hit;39 wet condition;150 Fortify flat stacking;34/161/167/170/180 rankII adoption pending. Do not turn old references into permanent exclusions.
70 and106 now static-complete within adopted conditions: previously documented ammo/GL guards resolved earlier, final wyvern guard resolved here. Static completion distinct from runtime sample counts.25 remains partial due explicit source-value conflict.

No CI/Safari/live-game/14build run; no new test injection. Original Stage3/storage/server untouched. Product hash/evidence in pass16-manifest.json. Earlier evidence retains its original hashes.
