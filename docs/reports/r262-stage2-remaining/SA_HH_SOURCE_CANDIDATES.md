# SA / HH adoption candidates — 2026-10-26

Read-only product investigation at HEAD 059c61bdc8f2fc659926dd82440854463938e56f. Previous CB local product diff retained (binary diff SHA256 c60d1c9d6b98646745247ed3cbd874475c3928133021ae729a88001e5d8a53ed). No new product changes, tests, commit or push. Web retrieval succeeded through the web tool; this does not establish that shell Git DNS recovered. No retry of the denied PID inspection.

## SA: data now located, not adopted automatically

- [Macaron SA motion table](https://macarongamemo.com/entry/mhwilds-switch_axe-motion), row 高出力状態の追撃: MV12, element modifier1, part modifier1. Matches SA_AMPED_FOLLOWUP. Page dates 2025-04-10 / 2025-08-11; current game verification absent.
- [Kuro SA](https://kuroyonhon.com/mhwilds/memo/11.php), rows 剣攻撃時の追撃(高出力), 剣縦斬り/二連斬り/三連斬り(高出力), 爆発系の仕様, ビンの種類: cutting MV12; explicit sword sequences include one extra12 per body Hit. Sharpness and affinity apply to explosions; sharpness consumption is zero. Element explosion multiplier occupies the same pre-flat location as power-element phial. After1.02, ordinary followup is1 for power-element, .35 for other phials; .8 applies to listed different explosions, not this ordinary followup. Power/phial modifiers1.17 and1.45 precede flats.
- [Rapid morph scope](https://kuroyonhon.com/mhwilds/memo/26.php): SA explosion excluded. Existing owner-approved scope already agrees.

Candidate ordinary-followup equations (fractions H and S; final rounding remains existing reference policy):

`P = (B × M × Pphial + F) × 12/100 × Sphysical × C × Hslash`

`E = (Ebase × Melement × Pelement × Xexplosion + Eflat) /10 × Selement × Helement`

Proposed Pphial=1.17 for power else1; Pelement=1.45 for power-element else1; Xexplosion=1 for power-element else.35. The extension of the general phial rules to this explosion is a **candidate interpretation**, not a new measured fact. No rapid-morph effect, no additional sharpness consumption. Element-critical scope was not separately established; initial candidate should exclude active element-critical pending that contract.

Occurrence candidate: initially restrict to the already adopted sword vertical and owner-defined morph Hit modes, explicitly awakened throughout, every designated sword body Hit contacts the target and triggers one contacting followup, axe Hits trigger none. Insert after its triggering Hit and before the next mode transition, never recursively from an explosion. General sword multi-Hit rows support one-per-Hit, but precise delayed explosion timing/contact, mid-action awakening/expiry and overlapping triggers are not confirmed. The existing owner mode answer identifies eligible sword Hits; it did not adopt this full occurrence model. Current Kuro body MVs differ from old adopted DB for some moves; retain old body values and record that version limitation rather than silently replace them.

**One SA adoption question:** adopt the above formula and one-contacting-followup-per-designated-sword-Hit model provisionally for the existing three-technique subset, with awakening fixed ON, no discharge/focus/expiry/gauge simulation and no element-critical? The uncertain point is the occurrence/timing/contact assumption and extension of phial rules, not MV12 itself. This needs explicit adoption because .35 and the generator are not in the current approved public route.

## HH: multiplication order supported; cross-song competition not established

[Macaron melody table](https://macarongamemo.com/entry/mhwilds-hunting_horn-melody), dated2025-05-19, and [Kuro melody table/system](https://kuroyonhon.com/mhwilds/memo/8.php) agree: attack-small1.03 then1.05, attack-large1.05 then1.10, attack+defense-small uses the small attack values; self-improvement upgraded1.2. Repeating the same effect upgrades it; encore replays performed melodies. These are rank replacements, not multiplying both ranks together. Kuro says multiplier effects precede flat additions.

[Kuro verification notes](https://kuroyonhon.com/mhwilds/memo/21.php), sections 旋律 and 狩猟笛の自分強化: the former includes explicitly beta-era ambiguity; the latter distinguishes multiplicative self-improvement before flat from +20 or multiplication after flat using a sourced video observation. The video was NOT watched in this task. Supports candidate `A=B×M×self×attackSong+F`, consistent with the existing self-improvement stage. This does not prove the current version or exact game rounding.

Candidate contract: one explicitly selected attack-song family (small OR large OR attack-defense-small), rank0/1/2, cap2; repeated same song replaces the rank multiplier rather than stacking. Self-improvement state remains separate. Use current adopted damage-before-effect-update rule. Next events (body and sound) receive the new attack state; fixed10 remains unchanged. Current event compiler and special formulas can be reused; new melody coefficient/state definitions are needed. No final-damage multiplication or duplicated attack inside the sound helper.

The inspected primary tables do NOT establish competition between small/large/attack-defense from multiple instruments, downgrade behavior, or mixed-song duration refresh. Search results about older World/Rise were not used. A strongest-only rule is not asserted as fact.

**One HH adoption question:** provisionally add those three mutually exclusive song-family selections, with the sourced two ranks, separate self1.2, pre-flat product and same-song rank cap; exclude cross-family/multi-player competition for this initial contract? This avoids inventing a strongest-wins rule. If simultaneous different families are required now, their precedence/refresh rule is the specific missing premise.

## Implementation readiness

No new implementation is within already adopted scope: SA explosion multiplier/occurrence and HH non-self song coefficients remain new adoptions. This is not a network or permission blocker, and not a statement that formulas cannot be built. The proposed contracts identify the exact data additions; after approval they can use existing per-Hit events/L3 state effects/shared physical-element formulas without a new engine. Current CB work remains intact and locally verified; these proposals do not alter its evidence.
