# Explicit normal ammo ten-shot path
Base: 46fbfba. Dedicated API implementation only; standard ammo selection is not switched.

## Implemented
- BowgunNormalReference.tenShot(options, TechniqueDBEngine) evaluates ten consecutive normal discharges (three contacts each), using existing canonical ammo and skill coefficients.
- MHWRealOneHitBrowserAdapter.evaluateNormalTenShot(input) connects explicit supported weapon/ammo/target inputs to the same normal/maximum pipeline. HBG levels 1/2/3 and non-rapid LBG levels 1/2 are supported when the weapon's ammo data supports that exact level.
- First Shot applies at sequence start. Force attack additions apply at shots 4 and 6; affinity applies at shots 4 through 10. These are the existing adopted DB rules, not new coefficients.
- Magazine size, stored shot position, loaded state and reload do not truncate or restart the sequence. No fictional capacity=10 is introduced. These ignored fields are removed from the dedicated comparison identity, not from saved inputs.
- The old shot() API and existing UI/default selection are unchanged. Old magazine validation remains active on old paths. No snapshot migration or automatic input rewrite.
- HBG legacy saved contactPolicy=null may use the already existing canonical normal-ammo hitCount=3 fallback. The direct numerical tenShot API requires ALL_THREE.
- Missing or unsupported level, rapid mode, weapon-ammo mismatch, duplicate support rows and unadopted nonzero per-hit draw/punishing additions fail closed.

## What remains unimplemented
The current standard UI still chooses the prior elemental one-contact reference. That output does not satisfy C03's adopted normal ten-shot baseline and must not be counted as completion of C03 or as verified damage. Standard ammo level and whether to adopt light-bowgun rapid fire remain undecided. No user-facing standard switch or rapid sequence has been introduced.

Suggested later presentation, subject to the standard-entry decision: label the old output as "現行参考値（通常弾10射標準は未適用）" and expose the ten-shot premise with its explicit ammo level. This report does not itself change that UI.

## Verification
- Six new unit tests cover supported levels, ten ordered shots/30 contacts, independent arithmetic, First/Force, capacity independence, negative affinity versus positive critical coefficients, unknown/rapid rejection, and legacy shot guards.
- 16 inspected existing HBG normal/shot-skill DOM tests pass.
- Five real weapon/level scenarios: HBG 469/Lv1, 464/Lv2, 517/Lv3; LBG 773/Lv1, 763/Lv2. Each normal/maximum route passes 30-contact per-shot arithmetic, capacity changes, comparison identity, invalid inputs, save/load and nonmutation checks.
- Disposable Chromium: HBG 464/Lv2 and LBG 763/Lv2 pass dedicated API evaluation, UI save/load, legacy-output stability, and comparison storage preservation.
- Existing 14-weapon / 56-case / 112-channel public output including metadata is identical to base 46fb.
- Independent read-only review: no blocking finding in the dedicated API scope.

## Reproduction
Use existing approved jsdom/playwright via NODE_PATH when necessary:
- node --test tests/bowgun-normal-ten-shot.test.cjs
- node --test tools/hbg-normal-dom.test.cjs tools/hbg-shot-skills-dom.test.cjs
- node tools/normal-ten-shot-proof.cjs PRODUCT FIXTURES
- node tools/normal-ten-shot-browser-proof.cjs PRODUCT FIXTURES OUTPUT

## Limits and source
The sequence premise is C03 in spec/CURRENT_CONTRACTS.md; source values remain in TechniqueDBEngine's normal reference rules, whose source/game-version limitations are unchanged. This is not live-game accuracy certification. Standard selection, rapid sequences, nonzero per-hit draw sequences, all skill combinations, Safari/iOS, and full repository suites remain unverified. Full suites were not run because the previously denied CB getter/prototype operation could not be identified safely; only inspected tests were executed. No new branch or GitHub publication.
