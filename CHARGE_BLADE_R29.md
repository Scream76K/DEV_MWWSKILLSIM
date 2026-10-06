# r29 — Generic STANDARD expansion: Insect Glaive

Baseline: r28 / game Ver.1.042.00.02.

- Added Insect Glaive STANDARD profile: triple-extract sidestep slash -> sidestep slash combo -> enhanced descending slash -> rising spiral slash.
- Rising Spiral Slash is represented as six explicit hunter hits, 64 MV each (384 total), per project-confirmed hit count/current evidence.
- Triple-extract is a required start state. Rising Spiral Slash hits are tagged EXTRACT_CONSUMED because all extracts are consumed at activation.
- Kinsect damage is explicitly excluded from STANDARD comparisonPower (`includedInComparisonPower:false`).
- Generic trace now retains per-hit state tags for state-boundary regression.
- Existing unverified weapon profiles remain fail-closed; old community COMBO_DATA is not promoted into STANDARD calculation.
