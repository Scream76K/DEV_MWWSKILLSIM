# Technique DB / Versioning Spec r43

Game baseline: Monster Hunter Wilds Ver.1.042.00.02

## Normative rules
- All 14 weapon types target all techniques in the canonical Technique DB.
- Motion value, hit count, hit-level elemental modifier, part modifier, state requirements and special components are technique facts, not ComboTemplate facts.
- STANDARD profiles reference Technique IDs. Weapon handlers must not duplicate normative motion values.
- Revisions are versioned; old values are never overwritten or deleted.
- Required unverified data fails closed.
- Official patch notes are the primary source for update deltas. Secondary update indexes (GameWith/Game8 etc.) are discovery/cross-check evidence, not a replacement for official notes.
- Current baseline calculations resolve the revision valid for Ver.1.042.00.02.

## r43 adopted STANDARD changes
- Great Sword: 溜め斬りⅢ -> 強溜め斬りⅢ -> 強薙ぎ払いⅢ, maximum charge. MV 176 + 187 + 134 = 497. Element modifier sum 1.5 + 1.8 + 2.2 = 5.5. Part modifier 1.2 on all three.
- Long Sword STANDARD is now Technique-ID backed: 赤刃斬りⅠ -> Ⅱ -> Ⅲ.
- Dual Blades STANDARD is now Technique-ID backed; the 27-hit 乱舞 sequence is stored as a canonical technique revision.
- Sword & Shield was already Technique-ID backed and remains 18 / 17 / 27 / 28 for the adopted STANDARD.
