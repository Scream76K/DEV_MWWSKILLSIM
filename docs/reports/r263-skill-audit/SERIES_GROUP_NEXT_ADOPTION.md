# Series/group reconciliation after pass14
Base b2c590d; prior Dark Arts local changes retained; no commit/push.

## Local connection completed
MHDB fixed snapshot: rank1 festival34/161/170/180 = rewards only;167 = Adrenaline Rush duration only. standardGroupPowerPlan now validates exact id/name/source/rank and 2<=piece count<4, then retains a non-damage effect. Rank2 is not silently discarded. No new coefficients.
series-numeric-scope-before/after.json: five rank1 cases normal/max375.73 unchanged; rank2 unresolved remains. Synthetic activation contract, not legal multi-set outfit or live game proof.

## Proposed numeric adoption, not implemented
All seven have rank I at2 pieces, rank II at4, highest rank replaces lower. Source read2026-10-27: https://kuroyonhon.com/mhwilds/program/skill.php ; MHDB descriptions fixed in mhdb-skills.json.
|ID|Effect|Candidate|Conditions and proposed scope|
|---|---|---|---|
|62|束縛反攻I/II|true attack flat25/50|after eligible restraint/freeze recovery or power clash; baseline inactive/max preactivated self only|
|107|ウォークライI/II|self true attack flat3/6|after Roar gesture, baseline inactive/max preactivated; exclude allies/Palico/support-hunter calculation and external overwrite timelines|
|167|千刃の身躱しII|attack multiplier1.05|Adrenaline Rush equipped and already active, another successful evasion; base attack multiplier stage before flat; baseline inactive/max condition fulfilled; rankI no damage increment|
|34/161/170/180|地の恵み respective II|attack multiplier1.09|only matching festival period, base attack multiplier stage; rankI rewards only. Explicit event-active condition needed; do not infer date or combine four festivals|

Kuro direct text now exposes all these entries (earlier name-find returned no match; that was retrieval limitation, not absence). For167 the text names the multiplier stage, while Game8 gives approximate4–5% (https://game8.jp/mhwilds/701799); do not convert that approximation into a flat.62 corroborating before/after stat images: https://game8.jp/mhwilds/673702 . Numeric values lack an existing explicit adoption record in inspected repo docs; request one grouped provisional adoption, not a second source confirmation.
Proposed owner question: adopt62 flat25/50,107 self flat3/6,167II base multiplier1.05 after repeat evasion with Adrenaline Rush, and each festivalII1.09 only under explicitly active matching festival? Baseline event skills inactive, maximum preactivated; festival should use the same explicit period condition for both channels because it is environmental availability, not a combat trigger. No event period input has been implemented. Other-party effects and overwrites stay outside this proposal.

## Partial-classification recheck
Attack72: promote static-complete within adopted component scope. calcAttackSkill→L3 attack-multiply/flat→engine B×M+F feeds canonical physical/HH/GL/CB/Bow/normal+element ammo/HBGWyvern.aggregateAttack. Prior reason GL artillery order was resolved; not running every weapon is not a remaining formula defect.
Do not promote other rows mechanically:
- Conditional flat/affinity groups25/70/106/144 etc: HBG wyvern adapter still rejects activeBonusEffects/unreviewed conditional entries before consuming otherwise-capable attackComponents.
- Element41/50/91/121/127 and13/95/133: cap and ordinary/ammo decomposition are connected. HBG wyvern only admits fire and neutral skill allowlist; irrelevant non-fire skills still need explicit disposition, conditional element buffs need component applicability review. These are real branches, not absence of all-weapon runtime tests.
-47 artillery: supportedActions gate still excludes charged/fullburst artillery coexistence.72 alone does not inherit47's unadopted action coverage.
-53 ballistics: wyvern range applicability unresolved.
-85/136: special-component context gate remains;86 flight hit eligibility still missing.

## Prior health change static isolation
Adapter.evaluateCurrentSingleHealth invoked with cloned weapon/stats and filtered new skills arrays. Original normal channel and comparisonContext/conditionKey remain from original input; only maximum channel is replaced after both full-health and red-gauge whole-route metrics are available. No component-wise max. No global UI or storage write.
index.applyBuildSnapshot preserves combo conditions when preserveCombo:true; comparison row evaluation uses that flag, finally restores exact current snapshot. Prior local diff does not edit these functions. Each A/B call builds independent health branches using its own skills. This is static tracing, not new saved-A/B runtime evidence.

## Limits
No coefficient adoption from the web yet; no time/DPS simulation, no new extra-damage terms. No CI/Safari/real game/all14 execution. Prior pass14 evidence hashes remain historical, not relabelled as this product version.
