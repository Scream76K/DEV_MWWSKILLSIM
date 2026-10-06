# r39 — Bow Handler foundation

- Base: r38
- Game baseline: Ver.1.042.00.02
- Bow moved from SCAFFOLD to EVIDENCE_GATED dedicated handler.
- STANDARD: charge-level-3 Shot -> Power Shot 3 -> Power Volley 3.
- Hit model: 12x3, 12x5, 15x6; element modifiers 1.0, 0.8, 1.0.
- Total base physical MV = 186; hit count = 14; element-modifier total = 13.0.
- Arrow physical/element, charge level, range and coating are separate components.
- Critical range is the STANDARD comparison range.
- Coating STANDARD is deliberately unresolved; no guessed coating is applied.
- Legacy community COMBO_DATA bow values are not used by BowHandler.
- Current-version audit gates remain fail-closed.
