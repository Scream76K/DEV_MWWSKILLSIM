# Source Lock / Decoration Rules — r9

Status: CANDIDATE
Baseline: Monster Hunter Wilds Ver.1.042.00.02

## User-confirmed normative rules
1. Every equipment object (weapon / each armor part / talisman) can hold at most 3 decorations.
2. Slot count is the number of decorations that can be installed: [3,2,1] = 3, [3,2] = 2, [3] = 1.
3. One slot holds exactly one decoration. A higher-level slot can hold one lower-level decoration, never multiple decorations.
4. Talisman slots preserve kind. Example 武1-防1-防1 = one weapon-decoration slot + two armor-decoration slots.
5. All build-template equipment is validated using post-limit-break slot data.
6. Screenshot/source equipment and decoration ownership is authoritative. The simulator must never move a decoration to another equipment part merely to make a build fit. If it does not fit, audit DB/limit-break slots/deco master/template transcription.

## r9 engineering change
- Added `templateSourceRuleAudit()` before template application and to static audit.
- Any source record with >3 decorations or more decorations than post-limit-break slots is surfaced as `SOURCE_RULE`; no automatic relocation is performed.
- Restored r7 source-locked ownership baseline instead of carrying r8's speculative relocation edits.
- Applied only the user-confirmed Dual Blades typo correction: 連芸珠【3】 -> 達芸珠【3】.

## Important
r9 is an audit/guardrail candidate, not a declaration that every remaining template record is corrected. Records failing SOURCE_RULE require source screenshot re-verification; they are not auto-repaired.
