# MH Wilds Simulator r1.1.19 UI test report

- Armor/charm remains the left-side build area; skill display is a sticky right-side panel on desktop.
- Skill panel has its own vertical scroll when needed; mobile disables sticky behavior and uses normal flow.
- Normal skills: two-line block, name + capped Lv on first line, level blocks on second line.
- Over-cap: displayed Lv stays at MHDB max; only that displayed max Lv is red and slowly blinking.
- Series/group: only active entries are shown; current/required pieces are shown as `current/required` beside the skill name.
- Normal skill order: official `Skill.kind` weapon first, armor second, then other kinds; within group, level descending then Japanese sort.
- Multiple series skills per armor from r1.1.18 remain supported.

Checks: inline JS syntax PASS; HTML parse PASS; required UI/logic markers PASS.
