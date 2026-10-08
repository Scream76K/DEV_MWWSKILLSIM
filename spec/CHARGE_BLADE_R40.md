# r40 — Bow weapon-specific coating resolver / Artia intensification aware

- Base: r39 Bow Handler.
- Game baseline: Ver.1.042.00.02.
- Bow STANDARD coating is no longer a global Bow constant.
- Usable coatings are resolved from the selected completed weapon record.
- For 巨戟アーティア, `snapshot.artia.production` selects the corresponding `artiaFixedVariants[attack|element|affinity]` record first; coating availability is then read from that variant.
- Artia ingest now preserves per-variant Bow coating metadata alongside fixed attack/affinity/element values.
- The resolver forbids name-only Artia coating defaults and unusable-coating fallback.
- If multiple usable coatings exist and no explicit/template STANDARD choice is evidenced, it fails closed instead of guessing a damage priority.
- r40 regression uses a synthetic Artia Bow to prove attack/element variants can resolve different coatings and that ambiguous affinity variant fails closed.
- Existing Generic/CB/GL/HH/Bowgun handlers are unchanged.
