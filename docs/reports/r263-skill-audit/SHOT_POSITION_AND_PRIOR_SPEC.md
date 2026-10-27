# Shot position connection / prior-spec reconciliation
Base b2c590d, prior local work retained. No stage/commit/push.

## Implemented existing rule connection
bowgun-normal-reference.js: extract shotSkillBonuses from the existing normal-ammo consumer; no coefficient changes. It reads Technique DB shotSkills arrays and validates explicit magazineCapacity/shotOrdinal/fullMagazine.
Adapter element reference: remove only forceShot from unsupported list after routing its shared bonus; add physical-only shotAttackAdd separately from completed attack. Affinity applies through existing physical/critical-element expectations. Contact sequence repeats one shot state across contacts, not one shot ordinal per hit. LBG still keeps normal/nonrapid scope.
bowgun-element-reference.js: physical=(attack+criticalRangeAttackAdd+shotAttackAdd)*existing factors; element attack base/flat/cap unchanged. firstShot remains gated because its element-specific multiplier still needs a dedicated source contract; no blanket guard removal.

## Minimal evidence
Before: element-force-before.json, HBG_ELEMENT:SKILL_INTERACTION_UNSUPPORTED. Initial fixture used an unused heavyBowgunState key; this does not affect the prior unconditional skill gate. Corrected to actual hbgState before successful run; do not use before as evidence of shot-position validation.
After: tools/skill-element-force-proof.cjs / element-force-after.json. HBG467 thunderLv1 explicit shots4/5, forceLv3: physical11.3152/10.6496, element9.6/9.6; shot attack add10/0. Both channels complete and component available. Shared critical expectation1.04 includes fixture4% + force12%; no duplicated maximum addition. Missing position retains reason. Existing first-shot helper yields15 forLv3 first full-magazine position. This is contract evidence, not legal decoration build, Safari or all-weapon execution.

## Prior adoption search:178
Parent confirms prior same numeric specification exists. This supersedes the claim that a fresh adoption decision necessarily is required. Current working spec/*.md and KAN records contain no exact declared numeric rule found by 宣戦呼応/巨戟龍の黙示録 search. git log --all -G identifies126abf0 (build-template names),2b7bbdf (MHDB fixture descriptions),b2c590d (audit);657bda4 KAN baseline has template names and bonus-damage-dom gate test. None proves numeric formula/unit/component adoption. Source confirmation1.2+20/1.3+40 remains; exact historical spec location remains unidentified. Do not relabel this as owner reapproval waiting. Need record identifier/content to reconcile display units and special-component scope without inventing it.

## Remaining reasons, not all-weapon-test requirements
INPUT/CONSUMER: critical draw requires per-hit active-within3seconds after eligible draw, not a technique-name or global maximum flag. Existing conditions.drawAttack is the separate Punishing Draw trigger and cannot be reused as whole-column Critical Draw activation. Wet39 needs explicit wet/bubble states; existing maximum30 combines both without an input contract. First140 element path needs its attack-only bonus and element multiplier supplied separately. Conditional element13/95/133 into Wyvern needs dedicated source-element basis, not weapon base0. Non-fire skills in fire Wyvern already explicitly nonapplicable (pass16); no new change necessary.
ADOPTION/SPEC: festivalII/167II/62/107 await parent's grouped adoption; GL charged/fullburst artillery extension separate;178 is prior-spec identity reconciliation, not new numeric confirmation.
UNADOPTED TARGET EXPANSION: additional flight/charge motion IDs, selected status coatings, special/rapid/chase shots. These must not inflate current adopted-scope completion requirements. Utility status build-up never becomes HP damage.
Static classification remains8 complete/63 partial/15 missing/6 annotation/87 nonHP. The63 is not63 confirmed missing formulas; row-specific residual branches still need disposition. No global promotion based solely on one HBG run.

## Limits
No CI/Safari/live game/saved A-B run in this batch. No new technique or coefficient. Original Stage3/server/storage untouched. Next work should close explicit Critical Draw/Wet inputs and reconcile178 against the cited prior spec, then classify remaining adopted branches, not add all14 runs.
