# r32 — Gunlance dedicated component boundary

- Baseline: r31 / game Ver.1.042.00.02.
- GunlanceHandler promoted from empty scaffold to EVIDENCE_GATED dedicated handler.
- STANDARD route remains: 叩きつけ → なぎ払い → 竜杭フルバースト → 連装竜杭フルバースト.
- Body components retained separately: 叩きつけ MV57 / element 1.0, なぎ払い MV40 / element 1.5.
- Shelling and Wyrmstake are never flattened into body MV and never sourced from legacy COMBO_DATA.
- Shelling formula/event counts and Wyrmstake formula remain CANDIDATE/null, therefore full comparisonPower is Fail-Closed.
- Partial verified-body trace is attached to the thrown error for development diagnostics only; it is not a user-facing comparison result.
- Existing Generic and Charge Blade handlers are unchanged.
