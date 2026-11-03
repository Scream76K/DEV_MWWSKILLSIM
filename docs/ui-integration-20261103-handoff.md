# UI integration handoff — 2026-11-03

## Fixed base
- Base commit: `ab9c4cd54f94ff5e31def7126fe3778ecab5c8bc` (`himmel/stage3-mindseye-cb-followup`).
- New integration branch created from exactly that SHA; prior to this documentation addition GitHub reported `identical`, ahead=0, behind=0.
- The latest `index.html` blob at that base is `b9ad7af1ed827ac1f5765916726e3d4bab2a4850` (do not replace wholesale).
- Older UI source: `flamme/ui-responsive-stage1-20261101`, `index.html` blob `fefebfc21082563b28dbb72ab7e05202c7faee1b` (reference ONLY).

## Verified source inventory
- Old UI index has style IDs `flamme-ui-responsive-stage1` and `flamme-ui-workspace-stage4`, and script ID `flamme-ui-weapon-kind-placement-stage3`.
- The new base `index.html` has none of these three; hence selective transfer rather than assuming prior history carried visible UI forward.
- Old UI responsive layout: <=820 CSS px one-column for top-level Build/Support, >=821 CSS px two columns; intermediate internal armor/skill layout applies <=1120.
- Old script moves the *existing* `weaponKindSelectionBlock` between `weaponKindOriginalPosition` and `weaponKindWidePosition` at 821 px; do not duplicate the element or its events.
- Source reads do not constitute a browser pass.

## Migration boundaries
1. Do not overwrite the new base's `index.html` with old UI `index.html`.
2. Extract and adapt UI-only CSS/DOM placement behavior; confirm existing selectors/DOM structure in the new base before each patch.
3. Preserve all latest damage formulas, skill handlers, Artia completed-value logic, saved-build state/restore, OCR, and DB interfaces verbatim unless independently justified.
4. Integrate user-supplied six equipment-icon references (head, chest, arms, waist, legs, charm) with consistent visual treatment, without changing equipment IDs or stored data.
5. Keep dev diagnostics out of consumer view without removing nodes/modules that active calculations depend on.
6. Check top-level Build/Support layout separately from internal armor/skill layout. Do not assume KAN-18's internal 6:4 requirement equals top-level two-panel behavior.
7. Preserve pre-normalized calculated values as primary. Maintain independent normal/max and genuine A/B comparison semantics; distinguish same-build dual-save evidence from different-build comparison.

## Minimum verification gates (OPEN)
- Version gate: commit SHA, `index.html` blob, build banner and DB revision belong to the target integration branch.
- Representative latest Artia GS KOTATU_GS_01 / MHDB1148 through public entrance: normal 1687.68, max 2278.08, dragon 480 in the known controlled fixture reported by Serie. These are regression references, not broad acceptance.
- Normal Artia GS MHDB303: restore attack I on/off behavior and save/restore.
- 375/390/768/1024/1440 desktop/iPhone Safari: no page-wide overflow, correct panel order, inputs work after resize.
- Different A/B builds and two identical saved builds tested separately. Save/reload/cancel and pending reasons must remain safe.
- Scope-limited tests first, then browser checks; any failures remain documented.

## Acceptance/status
- Branch created. This document records scope; no production UI code migration or runtime verification is claimed.
- No merge to develop/main and no deployment. Owner UX approval and Serie technical approval remain separate.
