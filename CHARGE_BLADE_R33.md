# r33 — Hunting Horn Handler boundary

Baseline: Monster Hunter Wilds Ver.1.042.00.02.

- HuntingHornHandler promoted from SCAFFOLD to EVIDENCE_GATED.
- STANDARD sequence retained: 左ぶん回し → 前方攻撃 → 自分強化旋律 → 重ね掛け.
- Components separated into BODY, PERFORMANCE_SHOCKWAVE, ECHO_BUBBLE.
- Candidate values are stored only as evidence; they do not enter comparisonPower.
- Echo Bubble event count, self-improvement buff scope, encore normal/just variant, and opening body motion values remain fail-closed.
- Router now dispatches Hunting Horn to its dedicated handler.
- Generic engine and existing production comparison UI remain untouched.
