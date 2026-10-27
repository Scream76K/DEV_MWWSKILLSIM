# Pass22 read-only source reconciliation / owner decision packet
2026-10-27. Product/evidence checkpoint pass21 unchanged. No tests, product edit, stage, commit or push.

## Wyvern: facts versus candidate model
Existing adopted two-Hit formula (display element units):
P1=.80*(B*M*Artillery+F+external); E1=400/10*fireHZ/100.
P2=.19*(B*M+F+external); E2=(200*FireMultiplier+FireFlat)/10*fireHZ/100.
No critical, no sharpness, no physical hitzone. Dedicated fire basis is 400/200, not weapon element0 and not attack-dependent elemental-ammo basis.

Sources read:
S https://kuroyonhon.com/mhwilds/program/skill.php : First full-magazine first shot physical+5/10/15; second Wyvern fire1.1. Force shot4/6 physical+3/6/10, second fire1.05; added attack excluded from attribute calculation.
H https://kuroyonhon.com/mhwilds/memo/15.php : fixed80/fire40, fixed19/fire20 (internal element units, corresponding display400/200).
C https://kuroyonhon.com/mhwilds/memo/31.php : weapon cap max(B+400,2.3B), specific HH/SA bases, elemental-ammo attack-dependent cap. No explicit Wyvern dedicated-fire cap.
T https://note.com/kehaar6/n/n71765756ee8c : author tests PS5 1.010.01.00, normal ammunition and elemental ammunition; supports First/Force separation but NOT a Wyvern fire-flat/cap experiment.
Bounded search performed once; no direct Wyvern combined FireAttack-flat/FirstForce/cap experiment located. No current-game verification claimed.

### Narrow proposed connection
P1/P2 receive shot attack flat after attack multipliers/artillery, before MV. E1 unchanged. E2=(200*FireMultiplier*ShotMultiplier+FireFlat)/10*fireHZ/100. ShotMultiplier1.1 for First or1.05 for Force4/6, otherwise1. Two triggers cannot overlap at one shot ordinal. Force affinity has no effect on these noncritical Hits. Explicit shot ordinal must fit actual capacity; never infer four shots from two damage Hits.
The multiplication-before-flat placement is a PROPOSED extrapolation of existing element stages, not a directly demonstrated Wyvern fact. Existing FireAttack-only E2 is at most300; with First it is324, Force312. These lie below both plausible caps460 (200*2.3) and600 (max(200+400,200*2.3)). Thus this limited scope can avoid a cap decision rather than pretending to prove one.
One owner choice can unlock this narrow scope: provisionally use the above second-Hit multiplication-before-flat model for First/Force+FireAttack only, retain first-Hit fire400 and existing physical formula. Conditional element effects remain separate.

### General conditional-element proposal requires additional unsupported assumptions
Candidate E2=min(C2,200*FireMultiplier*ConditionalMultiplier*ShotMultiplier+FireFlat+ConditionalFlat)/10*fireHZ/100; E1 unchanged. This needs both (a) conditional effects target Hit2 only and (b) C2 rule. C2=600 is an analogy with fixed special-element base; C2=460 is an analogy with ammo cap. Neither is directly stated for Wyvern. Do NOT call either adopted. Conditional effects may not share FireAttack target flags. Recommend do not bundle this as a fact into narrow First/Force connection; obtain specific scope/cap decision or direct measurement/source.

## Residual categories (not execution counts)
1. Explicit approval pending:62 freeze25/50;107 self roar3/6;167II1.05;34/161/170/180 festivalII1.09; GL47 charged/fullburst artillery extension. Prior questions remain outstanding; no duplicate request required.
2. Source/model decision needed: Wyvern narrow ordering and separate conditional-element target/cap above;159 fire+3 unit/action coverage;163 physical versus elemental special sharpness;178 declaration prior adopted numbers but unit/component contract unlocated;83 HAM_MIGHTY_CHARGE_UPPERCUT versus excluded charged-uppercut identity;53 Wyvern ballistics applicability. Candidate numeric adoption not yet approved:89,164,171,174,181. Details/questions below.
3. Existing-spec implementation work:129 Partbreaker distinguish durability-only ordinary Hit from explicit wound-destruction damage; normal wounded hitzone is not proof of wound destruction.86 Airborne finish adopted-technique Hit eligibility (DB dance fixed, other IDs need mapping);103 Critical Draw latest aggregate mapping fixed but UI typed targeting beyond current JSON remains usability work, not formula defect. Audit supplementary fields for25/70/106/144 and nonfire elemental skills still cite pre-pass16 Wyvern gates; reconcile these against current consumer before classification promotion. No new all-weapon tests required for that static closure. Existing ordinary/element-ammo weapon-cap paths must not be held partial solely because live-game execution is absent.
4. Adopted-target expansion:23 rapid-fire routes (current LBG scope explicitly nonrapid);69 special-ammo routes not present in adopted list;94 piercing-ammo/dragon-piercer routes not present. New techniques, arbitrary timing loops, party damage and event timeline simulation remain outside. If a currently adopted technique is found to use one, reclassify as required implementation, not blanket exemption.
Missing15 identity reconciliation: category1=62,107; category2=83,89,159,163,164,171,174,178,181; category3=129; category4=23,69,94. Partial63 contain other approval/scope branches above; do not claim all63 resolved by this packet.

## Consolidated morning questions (proposal text, NOT approvals)
A. Wyvern First/Force: may we provisionally use second fire `(200*fire multiplier*shot multiplier+fire flat)`, preserving first fire400 and no attack-flat leakage? Existing allowed FireAttack levels never reach either candidate cap, so conditional element/cap remains separate.
B. For broader Wyvern conditional attribute: can you provide a dedicated source/test for target Hit(s) and cap? If choosing a provisional model instead, please explicitly choose target (Hit2 only or both) and cap (fixed-special base rule or other supported rule). Current sources do not justify a recommended universal cap; do not ask user to reconfirm known1.1/1.05.
C. 159焼き砲モロコシ: does fire+3 mean internal fire+3/display+30, and which shell actions? 163刃鱗研装: is1.4 physical sharpness replacement only; what elemental sharpness applies? Without these, do not multiply both channels1.4.
D. 178宣戦呼応: prior I1.2+20/II1.3+40 retained. Is+20/+40 display-element flat for weapon element, and does scope include ammo/dedicated fire? Request the original unit/scope record rather than renewed approval of the same numbers.
E. Source-backed provisional input models:89 sliding-active affinity30;164 explicit ore-derived attackflat10/15/30 capped90;171 latest cooking result (affinity/elementflat) raw10/100,well10/300,burnt0/300;174 preactivated self affinity15, resonanceII25 replacement;181 LS/Bow nonnegative water-resistance R gives display-waterflat4R on water weapon. May these limited self-effect models be adopted? No automatic ore counts/timers, allies, negative-resistance clamp or universal weapon extension.
F.83: does the source exclusion 溜めたアッパー include adopted HAM_MIGHTY_CHARGE_UPPERCUT (渾身溜めアッパー)? Need exact move correspondence, not a new multiplier.
Sources for C/E: S above. Declaration source candidate https://mhw.fuguai-online.com/2025/12/19/sennsen/ ; existing candidate tables retain scope limitations. No original-history search repeated.
