# r99 Dark Arts Body Power

## Adopted reference scope

Dark Arts body elemental strengthening is now connected to fixed STANDARD power comparisons for long sword, sword and shield, dual blades, hammer, lance and switch axe. Normal comparison assumes no recoverable-health effect; maximum comparison assumes recoverable health. These are source-based conditional reference indices, not observed DPS or live-game-verified maxima.

Adoption requires complete active series metadata: bonusName 暗黒騎士の証, source series, bonusSkillId 172, required 2, rankLevel 1, count 2 or 3. Duplicates, malformed metadata, unknown effects, higher rank and GS whole-wave calculations remain fail closed. Actual equipment aggregation and saved-build reload recalculate metadata and stats rather than trusting names alone.

Physical damage is unchanged by the body attribute effect. Hammer uses ×1.2; the other five adopted kinds use ×1.14. Poison, paralysis, sleep and blast are excluded from this elemental HP bonus. Base weapon element is recorded separately from normal elemental multipliers and flat additions in calcBuild. The adopted maximum multiplies the base and leaves flat elemental strengthening outside the multiplier. No displayed totals are multiplied blindly.

## Remaining gates

Maximum only remains pending when Dark Arts needs missing/inconsistent element components, multiple normal elemental multipliers, elemental strengthening Lv2/3, Burst/Element Absorption elemental stacking, an unknown element type, or full-health Peak Performance branch comparison. Normal indices remain available where normal formulas and profile are adopted. Dark weapon skill is a separate effect, remains pending, and is recognized in Japanese and English.

Absolute 1-hit HP and combo DPS with Dark Arts remain gated; this release changes fixed STANDARD comparison only. Great-sword wave reference panel from r98 remains available but does not unlock GS whole-build indices. Other dedicated weapon handlers have not been broadened. Conditional caps, rounding, simultaneous-state feasibility beyond adopted rules and observed-game version validation are not claimed complete.

## User-visible explanation

Comparison displays the adopted elemental multiplier, red-health maximum-only scope, normal inactive assumption, GS pending scope and unsupported combinations. Maximum blockers use Japanese descriptions instead of bare internal reason codes. Fixed comparison columns remain unchanged at item 112px/build 120px, table maximum 474px with wrapping.

## Source

https://kuroyonhon.com/mhwilds/program/skill.php — Dark Arts body effect and multiplication position, consulted 2026-10-07. Source confirmation remains distinct from live-game verification; no patch version is inferred from retrieval date. Baseline application game label stays 1.042.00.02.

## Tests

Fresh 127 unit, 185 DOM and 26 Chromium tests. New DOM tests cover all six profiles, preservation of normal/physical values, additive-element ordering, overlapping-condition gates, malformed/higher-rank/duplicate metadata, status/no-element behavior, Dark alias and visible condition explanation. Browser test uses actual equipment aggregation with MHDB-shaped two-piece series metadata, saved builds, comparison JSON, independent elemental components and widths 320/390/768. After the reviewer flagged missing visible conditions, the renderer regression was demonstrated red then green and focused browser tests were rerun. iPhone Safari not yet rerun for r99.
