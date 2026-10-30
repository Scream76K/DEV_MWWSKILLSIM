# HBG Wyvern Ballistics limited connection (2026-10-30)

Owner-approved provisional: existing STANDARD two-component Wyvern, Ballistics Lv3 only, explicitly CRITICAL range. Reuse the common skill DB +5 after base/attack/artillery multipliers and alongside existing skill/external/First/Force flats, before each MV. Fire400 and second fire 200*M*S+F are unchanged. Lv1/2 remain zero HP addition. No range inference, alternate mode, new ammo or damage normalization.

Files: index.html (adoption metadata, legacy consumer forwarding, old-save range clearing), hope-hammer-browser-adapter.js (explicit range and skill level forwarding instead of unconditional Lv3 rejection), hbg-wyvern-reference.js (range validation and dedicated physical flat). Existing UI powerHbgRange and shared comparison snapshot are reused. No new input widget or coefficient copy. GL edits remain in the before snapshots; gunlance-shell-reference.js is unchanged.

## Reproduction and final public proof
Before: Lv2 calculated; Lv3 stopped at BALLISTICS_WYVERN_RANGE_SCOPE_UNRESOLVED (before.json). Final: tools/hbg-ballistics-connection-proof.cjs after, exit0, after-final.json and stderr. JSDOM invokes public calcBuild, real Pipeline and Formula. Synthetic raw200/capacity6 weapon with Attack5/Artillery3/Fire3; equipment legality and video absolute values are not claimed.

|case|physical component 1|physical component 2|fire1|fire2|
|---|---:|---:|---:|---:|
|Lv2|223.52|41.23|12|9|
|Lv3|227.52|42.18|12|9|
|Lv3 + First3, shot1|239.52|45.03|12|9.72|
|Lv3 + Force3, shot4|235.52|44.08|12|9.36|

Both normal and maximum checked. Lv2->3 deltas +4 and +0.95; fire unchanged. First/Force physical flats15/10 and second fire values324/312 use existing rules. No temporal Hit order claim.

Blank and NEAR inputs through DOM/change plus public calcBuild yield reasoned unavailable totals in both channels. INVALID contract input also rejected by the dedicated range guard. Missing old-save hbgReferenceState clears prior CRITICAL and does not silently enable +5. Two saved builds (Lv2/Lv3) load and compare under current CRITICAL; changing shared range to NEAR leaves Lv2 available and Lv3 unavailable, with current snapshot/conditions unchanged after comparison. This is two-build shared-state verification, not all saved data coverage. No F01 fault injection or full regression in this batch.

## Observation versus adopted order
Independent video readout: external-evidence/task-20261027/video-review-hbg-hm/READOUT.md and manifest.json. Two shots show 38.5+148.8 -> 39.4+152.8. These support +5 physical increments under existing MVs; unknown actual fire hitzone/base/flat were not reconstructed. Existing DB logical order80 then19 is retained. Nearby extracted frames do not isolate chronological arrival order. Formula order with artillery/First/Force remains OWNER_APPROVED_PROVISIONAL, not experimentally established by those videos.

All commands, source hashes and the exact incremental diff are in manifest.json and connection.patch. No commit/push/merge, no GL test rerun, no beta final test. ID53 classification is unchanged pending review.
