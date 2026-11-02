# UI Responsive Stage 2 — acceptance contract (2026-11-03)

Target: `flamme/ui-responsive-stage1-20261101`. This document does not claim the implementation has passed.

## Immutable behavior
- UI-only change. Keep L1-L6 damage pipeline, DB/skill resolution, state mutations, OCR mapping and save/compare payloads unchanged.
- Display pre-normalization actual damage as primary; comparison values to one decimal place.
- No change to the rule that normal and max evaluations are independent; do not replace unavailable with 0.
- In A/B comparisons, do not mix up A and B after layout changes.

## Responsive layout acceptance
1. Phone portrait (320, 375, 390, 430 CSS px): build section precedes support section in one column; no horizontal page overflow.
2. Phone landscape: preserve data and focus; layout may remain single-column if two readable columns cannot fit.
3. Tablet portrait (768 CSS px): choose readable stacking where needed; no obscured controls.
4. Tablet landscape (1024 CSS px): build and support sections side by side.
5. Desktop (1280, 1440, 1920 CSS px): side-by-side sections with sufficient room for input labels and comparison.
6. Prefer intrinsic layout/container sizing over device/user-agent detection. Do not split a single logical form across columns.
7. Avoid clipping native select menus, dropdowns and modal/dialog overlays; maintain keyboard focus order and visible focus ring.
8. Ensure touch controls remain usable; text does not need zoom to operate.

## Behavioral regressions to verify manually
- Choose weapon, armor, charms and decorations. Rotate/resize between phone and desktop: selection and unsaved edits remain intact.
- Switch A and B: values, badges and labels continue to belong to correct build.
- Save identical build twice vs save distinct A/B builds: tests are separate; do not confuse them.
- Open saved build: overwrite confirmation works and cancel preserves existing state.
- OCR grid remains nine rows and equipment name regions are not clipped.
- Run normal/max damage evaluation and compare: normal, max and pending reasons remain independent.
- Unavailable results render as pending rather than false zero or NaN/undefined.
- Long Japanese equipment/skill names wrap or truncate only when full name can still be accessed.
- With Safari on iPhone, verify vertical layout and avoid viewport zoom/scroll traps.

## Implementation gate
Before code changes: identify actual DOM roots and existing media queries in index.html. Modify the smallest possible selectors and avoid global overrides of display, width and overflow. Keep a before/after screenshot for phone, tablet landscape and desktop. Run current automated regression tests and manually check A/B saved compare. Do not merge without evidence.

## Status
Specification and acceptance criteria prepared; implementation verification and actual browser regression remain OPEN.
