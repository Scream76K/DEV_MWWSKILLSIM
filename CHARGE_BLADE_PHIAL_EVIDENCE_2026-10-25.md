# Charge Blade phial-count evidence intake (2026-10-25)

This is a conditional source intake only. It does not promote any Technique DB
record to `VERIFIED` and does not replace the missing local gameplay videos.

## Sources

- `https://www.mhchargeblade.net/mhws/guide/` (page states Patch Ver.1.020
  changes; retrieved 2026-10-25). Its Minor changes section says Amped
  Element Discharge uses 2 phial explosions and the Follow-Up uses 3.
- `https://qua-erere.hatenablog.com/entry/20250926/1758884313` (TU3-before
  author measurement; conditions differ from the simulator target). The Wilds
  table shows, in parentheses, phial damage: Shield Thrust `47+21(17)`, ED1
  `149(49)`, ED2 `100(49)+162(49)`, AED `189(71*2)`, Follow-Up AED
  `211(71*3)`, and SAED `216+268+(160*4)`.

## Candidate observations

| Technique | Candidate phial count | Evidence state | Reason not verified |
|---|---:|---|---|
| `CB_SHIELD_THRUST` | 1 | SOURCE_CANDIDATE | table reading; no local video |
| `CB_ELEMENT_DISCHARGE_1` | 1 | SOURCE_CANDIDATE | table reading; no local video |
| `CB_ELEMENT_DISCHARGE_2` | 2 | SOURCE_CANDIDATE | table reading; no local video |
| `CB_AED` | 2 | SOURCE_CANDIDATE | corroborated by guide for AED; conditions differ |
| `CB_FOLLOWUP_AED` | 3 | SOURCE_CANDIDATE | corroborated by guide for Follow-Up; conditions differ |
| `CB_SAED` | 4 observed in article row | CONFLICT_REVIEW | existing provisional model uses 5; do not infer or replace |

The article mixes weapon, skill, phial-type, and patch conditions and explicitly
contains explanatory qualifications. Therefore these values are retained as
review candidates only. No count is copied into the runtime DB, and no count is
inferred from phial consumption.

## Missing evidence

The local checkout contains filenames and capture checklists, but no matching
video files or frame-by-frame logs. A future acceptance requires the actual
video (or readable frame evidence) with technique identity, phial type/state,
shield/sword enhancement, target conditions, and separated slash/explosion
damage. Until then the existing CB pending gates remain.
