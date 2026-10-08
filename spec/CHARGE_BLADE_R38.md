# r38 — Bowgun ammo numeric registry / max-hit Pierce policy

- Base: r37.
- Game baseline: Ver.1.042.00.02.
- Added source-versioned bowgun numeric registry from macarongamemo bowgun bullets table.
- Added product decision: Pierce uses fixed maximum-hit evaluation in Build Comparison; no monster-specific Pierce hit DB and no hit-count UI.
- Pierce tick decay is modeled explicitly: 1.0, 1.0, 0.9, 0.8, then 0.7.
- Lv1/2/3 Pierce comparison maxima are retained as 5/7/9 hits in the adopted comparison profile; Lv3 effective raw MV fixture = 87.6.
- Normal/Spread hit structures and LBG / Rapid-Fire modifiers are stored separately.
- Source table provenance is retained as Ver.1.011.00; current Ver.1.042 continuity remains guarded and is not mislabeled as official-current verification.
- Element-ammo STANDARD resolver remains Fail-Closed until its current-version event/formula evidence is promoted.
