# r189 — Attack skill / target diagnostic
- Adds read-only `weapon-attack-skill-audit.js`: selected build true attack, Attack skill level, and documented combat context comparison.
- Blocks alias conflicts, invalid levels, missing live stats, and attack mismatches.
- Prevents double-counting attack skill effects already represented in live attack stat.
- Adds UI diagnostic button. Does not assert skill activation, hitzone parity or verified DPS.
- Retains maximum-sharpness-only rule. Includes r189 attack-target diagnostic already present in working tree.
