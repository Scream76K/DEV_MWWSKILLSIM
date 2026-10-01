# v7.2.1 Parallel Build / Combo root fix

## Build template side
- Decoration canonicalization now treats optional trailing `珠` as presentation-only, so template names such as `破龍・積弾` resolve to MHDB `破龍・積弾珠【3】` without fuzzy substring matching.
- Slot level and weapon/armor kind remain mandatory constraints.
- Added explicit Lv1 collision regression for `攻撃` vs `巧撃`.
- Template decoration `qty` is expanded into individual slots before applying. This prevents `qty:2` entries from consuming only one equipment slot.
- Regression cases include two-skill decorations such as `破龍・積弾` and `破龍・射法`.

## Combo side
- Existing 14-weapon combo engine retained.
- Multi-hit techniques remain represented as per-hit MV arrays rather than collapsing to a single total MV.
- Existing hit-level critical state / damage-type structure is preserved for later measured-data integration.
- Added `window.__comboRegression()` for static validation of weapon coverage, MV/time validity, and multi-hit entries.

## Verification
- Extracted inline JavaScript passes `node --check`.
- Decoration resolver regression passes: normalization, `攻撃`/`巧撃` Lv1 collision guard, and qty expansion.
- COMBO_DATA contains all 14 weapon kinds.

This build intentionally does not claim that current community motion values are final verified values. The next combo phase should replace/reference-check these values with measured/source-confirmed data weapon by weapon.
