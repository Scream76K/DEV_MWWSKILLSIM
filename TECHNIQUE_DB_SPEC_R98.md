# r98 Dark Arts Wave Reference

## Behavior

Adds a collapsed manual Dark Arts wave panel below the existing reference panels. It calculates the great-sword wave separately from the hunter's body attack and requires explicit true attack, affinity, physical critical multiplier, sharpness multipliers, slash and dragon hitzones, and observed wave hit count. Dragon Attack may be selected at levels 0–3.

The canonical `GS_DARK_ARTS_WAVE` record owns motion value 30 and fixed displayed dragon element 600, plus Dragon Attack multipliers/additions. The reference module reads these values through TechniqueDBEngine. It never uses the weapon's element or weapon-element hitzone. Physical expected crit applies to physical only, with negative affinity's weak critical multiplier 0.75. Part-break corrections are excluded from HP reference values.

The record is `SOURCE_CONFIRMED`, `UNVERIFIED`, `EVIDENCE_GATED`, and `SPECIAL_SOURCE_REFERENCE_ONLY`. It is deliberately unavailable through ordinary `hits()` to prevent fixed dragon being calculated as weapon element. Audit evidence and blocking reasons remain inspectable. Registered catalogue count increases from 533 to 534; this does not increase complete or automatic-calculation coverage.

## Source and scope

Primary author-maintained source: https://kuroyonhon.com/mhwilds/program/skill.php — Dark Arts section and Dragon Attack section. Retrieved 2026-10-07. Reference game label remains 1.042.00.02; retrieval of current source does not constitute a live-game version verification.

Source states the wave is produced by maximum-charge charged slash, strong charged slash, and true charged slash second hit; the panel uses observed wave hits rather than assuming every eligible attack landed.

The calculation is unrounded, excludes other buffs and the red-health attribute multiplier, and gates dragon hitzone zero because minimum-element handling has not been adopted. No body damage, absolute combo DPS, normal power index, or maximum power index is unlocked by this panel. Dark Arts whole-build calculations remain pending until body elemental ordering, independent dragon targets and interacting effects are integrated. The separate weapon skill Dark is not treated as Dark Arts.

## Validation

Fresh runs: 127 unit tests, 178 DOM tests, 25 Chromium tests. Added calculator separation/crit/sharpness/Dragon Attack/source/invalid-input/zero-count tests, audit coverage, actual DOM controls, and browser coverage at widths 320, 390, 768. Final source-audit metadata changes received focused retesting. iPhone Safari has not been retested for this release.

No comparison width changes; inherited load confirmation and pending-reason displays are preserved.
