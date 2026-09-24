# MH Wilds OCR Step 1.25-C v4.6.0

- Production UI redesign: three-step workflow only
- Removed legacy diagnostic UI from the user-facing surface
- Equipment/decorations remain independently analyzable
- Physical decoration groups: main weapon, sub weapon, head, chest, arms, waist, legs, charm
- Sub weapon is alignment-only and excluded from build reflection
- Mantle has no decoration group
- Equipment decoration slot values are upper limits; equipped jewel Lv may be <= the limit
- v4.5.12 alpha/beta/gamma evidence priority is preserved
- OCR/DB logic is otherwise carried forward without experimental preprocessing changes
