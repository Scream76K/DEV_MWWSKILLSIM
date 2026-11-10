# Base monster target connection
Base: d48aab2a. This change preserves that commit and uses the existing local branch; it is not authorization to publish.

## Adopted scope
Resolve an exact MHDB base monster ID and its own exact part ID, validate every hitzone without coercion, and feed slash/blunt/pierce/element hitzones through existing component formulas. Training side/back are supported. Variant IDs and synthetic king targets remain unavailable, never aliased to base values. Source reference is recorded as not live verified; API import date is not a game version.

GL explicit fire hitzones inconsistent with a newly supported selected target are unavailable with GL_FIRE_HITZONE_TARGET_MISMATCH. Existing training-front reference behavior is preserved. Saved inputs are never silently rewritten.

## Verification on final runtime bytes
- 25 focused unit tests: target resolver plus r189/r190/r191 identity/state audits.
- 14 weapons, 5 consecutive target selections, 140 channels: all available; return to training front gives identical values.
- 14 weapons, 28 saved builds, 56 current and 56 compared channels: save/load/comparison passed in isolated JSDOM.
- Disposable Chromium: all 14 weapons passed calculate/save/load/compare with Partbreaker ranks 1/2/3; no page errors. Tested mobile width 390 and desktop 1440 for SA/CB as in existing harness.
- Independent arithmetic: 352 comparisons passed for GS/Hammer/Lance, mixed slash/blunt SNS, element, GL fixed/fire components. Uses adopted source coefficients and calculated equipment inputs, without calling production damage functions. This verifies hitzone routing, not independent equipment-stat accuracy or live-game agreement.
- GL stale explicit fire input: regression failed before fix and passed afterward.
- Independent read-only review found no remaining code blocker after GL/source corrections.

## Reproduction
Set NODE_PATH to the existing approved jsdom/playwright dependencies. The tools accept PRODUCT and FIXTURES paths. Browser tool also takes OUTPUT before FIXTURES.
- node --test tests/monster-target-resolution.test.cjs tests/r189-attack-target-audit.test.cjs tests/r190-target-state-identity.test.cjs tests/r191-target-identity.test.cjs
- node tools/monster-target-switch-regression.cjs PRODUCT FIXTURES
- node tools/monster-target-gl-consistency-regression.cjs PRODUCT FIXTURES
- node tools/monster-target-save-load-compare.cjs PRODUCT FIXTURES
- node tools/monster-target-browser-regression.cjs PRODUCT OUTPUT FIXTURES

## Limits
Full repository suites were not run in this continuation because the previously denied CB getter/prototype operation could not be identified reliably. Only inspected tests were run; pre-existing full-suite failures are not claimed fixed. No live MHDB retrieval, source-to-current-game-version verification, all-monster damage matrix, variant/king adoption, Safari/iOS device testing, or game measurements. Current source fixture was retrieved 2026-11-05 with API data version 2026-04-15 and unknown game version. Training-front legacy explicit-fire semantics remain unchanged.
