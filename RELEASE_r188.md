# r188 — Live critical affinity / skill audit
- New read-only `weapon-critical-skill-audit.js` compares selected build's base affinity and Critical Boost level with documented combat context.
- Displays maximum conditional affinity separately; never substitutes it for guaranteed affinity.
- Skill alias ambiguity, out-of-range levels, missing stats, and mismatches block validation.
- Active skill triggers, monster state and hitzones remain unverified; no DPS verification or automatic transfer.
- Adds comparison diagnostic button. Preserves maximum-sharpness-only rule.
- Tests: 422 passed, 0 failed.
