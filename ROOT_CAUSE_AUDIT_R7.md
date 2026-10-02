# Template root-cause audit r7

## Root cause found
The template loader stored legacy charm `slot_levels:[1,1,1]` as three armor slots. The current charm model does not permit `防1-防1-防1`, so `charmSlotPattern()` returned an invalid pattern and `charmSlotEntries()` returned zero entries. This directly caused `記録N件 / 現行UI反映可能0枠`.

## Adopted repair in this candidate
- Canonical template charm slots now distinguish weapon vs armor slots.
- Legacy three Lv1 slots used by Kotatsu builds are represented as `武1-防1-防1` (`weapon_slot_levels:[1]`, `armor_slot_levels:[1,1]`).
- Kotatsu HBG is represented as `武1-防1`.
- `防2-防1` remains armor-only.
- Loader constructs `build.charmCustom.weaponSlots` and `build.charmCustom.slots` separately before `charmSlotEntries()`.

## Screenshot-confirmed Kotatsu DB corrections included
- GS: removed duplicated waist 防音珠 x2 (kept on legs).
- SNS/Lance: 耐術珠 -> 耐衝珠 x2 on arms.
- Dual Blades: weapon 連撃珠 -> 連芸珠; removed legs 超心珠 (charm-owned).
- Gunlance: 護児爪竜 -> 護兇爪竜 for head/arms; legs decoration ownership corrected from prior screenshot review.
- Switch Axe: waist/legs decoration ownership and levels corrected from prior screenshot review.
- LBG: waist 挑戦珠 Lv3 x2 -> 挑躍珠 Lv2 x2.

## Status
CANDIDATE until real-device template reload verification. Hunting Horn remains a known previous PASS regression control.
