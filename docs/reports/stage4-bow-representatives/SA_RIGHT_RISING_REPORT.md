# SA right rising: ordinary body connected; awakened extension held

## Basis and scope
Existing standard profile already adopts SA_SWORD_RIGHT_RISING as MV42, one body Hit, elementModifier1. No coefficient/MV was changed. Current https://kuroyonhon.com/mhwilds/memo/11.php (read2026-10-31) separately identifies sword right-rising, sword-mode chain from vertical and into morph-double, and cutting damage. Current online MV58 differs from adopted version42; do NOT call current MV verified or silently update. Only attack type/mode used here. https://kuroyonhon.com/mhwilds/memo/26.php defines Rapid Morph for transformation actions; right-rising is a separate ordinary sword action, not an added transformation target. Existing multiplier target list remains unchanged.

152/165 approval Sentinel_620e279cceec81918778e2036f65971f adopts existing SA weapon-attribute body components, not merely an exclusive list of three names. Decision document explicitly says SA body/awakened-followup as components. Existing normal right-rising body therefore uses same already-adopted element treatment. No new amount/order/cap. Expanded only conversion body scope list by one existing technique. Special awakened model has its own explicit THREE_TECHNIQUES contract; that list remains unchanged.

## Minimal changes
Technique record: declare source-backed slash and SWORD requirement. Adapter: accept DB mode requirement in its mode check/start-mode resolution, permit ordinary right-rising to coexist with Rapid Morph without generating its multiplier. Common conversion body allowlist adds that existing technique. Unknown techniques/state and other special guards unchanged.

## Public execution
Before real KOTATU_SA_01 standard four stops RAPID_MORPH_TECHNIQUE_SCOPE_UNRESOLVED (sa-public-before.json exit1 completion assert). After: exact four IDs / body Hit counts1,1,2,1; physical5+element5, normal849.03/max1050.67. Right-rising physical166.58/201.29, element9.66/17.94. No RapidMorph effect on right-rising; other three techniques exactly equal previous OFF-run component values. Existing real equipment, no skill removal. Starting SWORD, awakefalse, frenzyOVERCOME, conversion normalOFF/maximumON. JSDOM only, not source-video combo or live-game test.
Two identical saved equipment copies reload and compare against current shared conditions, results and current/saved content invariant. Exit0. Negative public cases: awaketrue retains SA_AWAKENED_MODEL_UNSUPPORTED; AXE start retains STATE_REQUIREMENT_MISMATCH:mode; unspecified awake retains SA_AWAKENED_STATE_UNRESOLVED. Boundary harness exit0.

## Remaining adoption
Four-technique awakeON is not enabled. Source broadly says sword attacks produce an explosion and current motion table shows an additional hit, but existing model explicitly adopted three techniques and its contact count/order. To extend: approve right-rising one sword contact → one existing SA_AMPED_FOLLOWUP before next move, same existing phial/element treatment, no gauge/time inference. This is distinct from completed ordinary-body wiring. No new MV proposed. Current source version discrepancy remains documented, not resolved by this task.
GS source-value waiting and SNS source-equipment waiting unchanged. No full regression/Safari/live/F01 injection, commit/push/merge. Review pending, no whole-beta completion claim.
