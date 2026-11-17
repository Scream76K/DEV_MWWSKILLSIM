# ID172 rank1: fixed attack-Artia CB1142 native element

Base:366189b79c04c57d90a9c95de865a75c8299a254. Local candidate; not published.

Owner mechanics: ID172 applies native CB elemental attack multiplier1.14, LOW maximum only. Charged-attack extra damage is GS-only; this change creates no event. Existing coefficient source https://kuroyonhon.com/mhwilds/program/skill.php and CB native axe followups https://kuroyonhon.com/mhwilds/memo/12.php remain source-backed/provisional, not live-game verified.

## Exact scope
Canonical fixed attack-Artia CB1142, dragon300, true attack215, IMPACT, STANDARD training-front. Genuine armor rank1 count2 or3. R: ED1/ED2/AED/Follow-Up AED; H: Axe-to-Sword Morph/Shield Thrust/AED/Follow-Up AED. Independent AXE starts; R previous CHARGE, H AXE_NEUTRAL; each five normal phials, zero enhanced, shield/axe boosted, sword unboosted, enhancedPhial=false. Top-level state and condition state must agree. POWER_ELEMENT, separate SAED, custom/direct R/H and other sources are excluded.

Only existing armor skills 渾身/逆恨み/納刀術/力の解放/ダークアーツ plus tested Attack3, Artillery3 or both are admitted. Native normal multiplier1/flat0; no conditional flat. CM3, Water Conversion181, draw3 coexist keeps exact prior values and warnings. Rank0 and rank2 unchanged. Continuation preserves original admission rather than quietly dropping an excluded skill and adopting172 later.

## Component boundary
R25 native elemental parts(5 raw+20 axe), H13(5 raw+8 axe) receive1.14 only in LOW maximum. Axe follows existing0.2 element coefficient, not a new event. R/H physical38 parts and IMPACT phial7 components(14 explosions) unchanged. Component counts54/29, execution33/19, final normal phials3/4, no chaining of route end into next start. Sum route totals before display rounding, no time/DPS assertion.

Two-piece vanilla LOW2889.53352→2912.13792; R native93.15+H68.31=161.46, increase22.6044. FULL maximum2768.285808 and normal2574.030384 unchanged. Three-piece genuine LOW3054.06144→3076.66584; FULL2865.41352 unchanged. Attack3, Artillery3 and both gain the same22.6044, never physical/phial multiplication.

## Proof and fallback
Existing cbGogResolved/cbChargeRecordValid identify the adopted producer; a private lazy frozen contract additionally pins exact six raw records, engine entries and resource/source rules. No non-element predicate reuse. Compact shapes are generated from those validated records; per-channel native basis must be300(normal/FULL) or342(LOW maximum), not merely either.

Only the mixed dispatcher can issue the module-private Symbol route provenance. Caller-supplied string markers do not grant adoption. Pair start, target and all six sources are validated atomically; rejected pairs use old pending172 behavior on both routes, never one boosted half. Internal markers are stripped before pipeline condition-key serialization and absent from saved builds. This changes no continuation ordering or non-CB behavior.

Fixture records20 exact prechange public cases from official raw catalog subsets and actual public snapshots. Tests cover per-component values/provenance/state, genuine three-piece armor, rank0/2, all stated combined controls, independent/one-sided state mutation, same-ID reference/hit/phial mutation, private provenance spoof, source/target/HP/projection scope, saved A/B load/compare and unchanged saved bytes. Existing public tests are not edited.

The tracked fixture is compact: minimal raw catalog subsets, positive numeric/state projections, and SHA256 of JSON.stringify(entire unchanged channel) with readable diagnostics for fallback controls. Full baseline/candidate captures live in external durable evidence, not duplicated inside the repository.
