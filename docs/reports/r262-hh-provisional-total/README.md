# HH provisional complete-component total — stage ②

Baseline: e2c7516ba5e77823c18e030160c47d5b3317a29f. Owner approved the explicit normal-melody / preplaced-echo occurrence model on 2026-10-26. This implements a bounded self-improvement-melody route; it is not all-HH or all-stage② completion.

## Expected contracts, defined before verification

- Technique DB owns body MV/Hit count and special coefficients. Its new `eventModels.hhNormalMelody` owns replaceable occurrence assumptions and provisional adoption. No observed floating damage is promoted to MV.
- Input: selected technique order, explicit self-improvement melody list (1–3), hitting preplaced bubbles B (0–3), initial self-improvement level 0/1/2. Missing values and unknown melodies reject, never become zero. One performance block, optionally followed by encore, is supported; no inferred initial encore history or second stock refill.
- Common technique Adapter emits existing body Hits once. Performance emits one MV27 event per melody; encore emits max(N−1,0) fixed10. Ordinary echo occurs B times per supported ordinary attack, melody echo B times per melody. Encore 20+75/60 means two BODY Hits, not two sound events. The source-estimate-only standalone record is not globally unlocked.
- Establishment events evaluate sound/echo using the state before establishment, then common transition adds one self-improvement level capped at 2. Level2 applies the existing 1.2 multiplier in the attack multiplication stage, before flats. State is fresh per normal/maximum channel. Body comes before the melody-event group in this explicit provisional ordering. Encore replay uses fixed/melody-echo events, not a second copy of performance-body/sound events.
- Existing physical/element Formula handles body; existing `huntingHornSpecialSourceEstimate` handles sound/echo/fixed arithmetic. Sound has no physical hitzone/sharpness/affinity; elemental sound uses its existing element modifier and elemental hitzone. Fixed10 receives no stat effects. No arithmetic copy or engine fork.
- Public `comboTotalDamage` includes every emitted component. Diagnostics and single/comparison renderers identify OWNER_APPROVED_PROVISIONAL and UNVERIFIED occurrence/order assumptions. The legacy source-only helper remains SOURCE_ESTIMATE_ONLY for its other callers.

## Sources and adoption boundaries

Existing Technique DB records: HH_SELF_IMPROVEMENT_PERFORMANCE 35; HH_ENCORE_NORMAL 20+60; HH_ENCORE_JUST 20+75; beats 33/40 and 35/50; sound27; ordinary echo5; melody echo12; echo element modifier .3; fixed10. Unchanged numerical records.

https://kuroyonhon.com/mhwilds/memo/8.php: melody table/self-improvement, melody system, encore, fixed10, shockwave and echo sections. Self-improvement second establishment gives attack1.2 before additive attack; melody stocks and placed bubbles each have a maximum of3. The owner explicitly adopted N−1 fixed count and per-melody/per-bubble occurrence and update order as provisional, not game-verified. Source game version and game display rounding remain unverified. Common body rounding and the existing unrounded sound arithmetic are preserved.

Only SELF_IMPROVEMENT melody effects are connected in this implementation. Other normal melody effect definitions are implementation remaining, not newly adopted silently and not counted as complete. Special melodies, placement actions, arbitrary refilled/repeated performance sequences, temporal expiration and DPS are outside this contract. Old four-event video reconstruction remains independent; private video files/identifiers are not included.

## Minimal evidence

`tools/hh-provisional-events-proof.cjs` uses MHDB531 raw90 as a seed and explicit stage② contract inputs. This is not stage④ equipment coverage. Offline isolated JSDOM only; no Safari interaction or user storage changes.

| Contract input | Normal | Maximum |
|---|---:|---:|
| N2 / B1 / initial level0; performance→just encore→left swing | 254.1 | 254.1 |
| Same, synthetic maximum attack multiplier1.1 and flat10 | 254.1 | 302.902 |
| N1 / B0 / initial level0 | 152.52 | 152.52 |
| Synthetic fire100 variant of N2/B1 | 276.6 | 276.6 |

The N2 route has four body Hits, two performance-sound events, four melody-echo events, one fixed event and one ordinary echo. First two melody groups use attack90; later body/echo use108. Maximum contrast uses90×1.1×1.2+10=128.8, not130.8. Fixed remains10. Fire variant keeps physical unchanged and checks each special elemental contribution (sound3, echo.9, fixed0). Null B and unknown melody reject. The total and provisional label are checked through calcBuild→public Pipeline→DOM; condition control roundtrip and legacy model-off restoration are checked.

Before implementation the public input failed SPECIAL_ROUTE_PENDING. Interim development failures REFERENCE_STATE_REQUIRED and HH_EVENT_INPUT_UNRESOLVED were corrected by separating HH reference input and confirmed-none element from missing elemental hitzone. Initial TRAINING_ROOM_FRONT_REQUIRED was a harness setup error, not a product defect. Failure logs retained; no tests removed/skipped.

Relevant existing source-helper regression: tests/r61-horn-source-estimate.test.cjs, 6 passed. No broad suite, game verification, Safari, CI or saved A/B runtime was executed. Shared save/load and comparison-condition serialization was statically traced; this is not an A/B execution claim. Original stage③ six-file diff SHA256 remains 5781b032f789a9531391ef06834e5657a2c465d0f83ed817adfcacdfa6194ed8; original checkout and server untouched.

Execution base SHA and exact working-tree source/bundle/harness hashes are in evidence/after-working-tree.json; they match the current files. At the initial blocked snapshot there was no new product commit SHA: the staging/commit command was rejected by automatic approval review as conflicting with the earlier commit prohibition. Read-only checks confirmed an empty staged diff and unchanged HEAD e2c7516. No retry, indirect commit or push was performed. evidence/execution-manifest.json records this distinction. The last read remote development SHA was e2c7516; origin/develop was 8ba21ea (0 remote-only / 334 local-only commits at baseline, 380 differing paths). That paragraph records the initial blocked state; the later authorized retry outcome follows below.


## Read-only review finding and bounded correction before publication

The direct API rejects non-SELF_IMPROVEMENT melodies, but initial restoreHHStoredState restored only their array length; comboHHStoredState then rebuilt SELF_IMPROVEMENT entries. This could silently change an imported unsupported melody into a supported one. The restored count is now populated only for an array entirely containing SELF_IMPROVEMENT. Unsupported melody definitions keep the count unresolved and the model enabled, producing HH_MELODY_DEFINITION_UNRESOLVED; original imported objects are unchanged. The prior successful run is preserved as after-working-tree.initial.json. The updated existing harness verifies the unsupported-save roundtrip and the same bounded contract cases in after-working-tree.json. No Safari or actual user save was touched.

The owner supplied new explicit authorization for the previously rejected staging/commit/push. A single retry is authorized; its actual outcome is recorded separately.

## Exact occurrence and order for N2/B1, initial self level0

1. Performance body MV35:26.46 at attack90. Melody1 sound24.3 + echo10.8, then state0→1. Melody2 sound24.3 + echo10.8, then state1→2. Performance subtotal96.66.
2. Just encore body MV20:18.14 and MV75:68.04 at attack108. Fixed10 once (no effects). Replay1 echo12.96 then state2→2; replay2 echo12.96 then state2→2. No MV27 sound is generated for encore in the current explicit model. Encore subtotal122.10.
3. Left swing body29.94 plus ordinary echo5.4 at attack108:35.34. Total254.10 in each channel; elemental components are explicitly0 for this no-element weapon.

The HH compiler first recursively adapts a local body-only projection with hhModel:null and specialComponents:[], producing body physical/element events only, then appends each DB-backed special event once and immediately returns. The source DB is not mutated; specialTechniqueIds are not recursively expanded anywhere in this compiler. The public plan rejects standalone special-record IDs with this model, preventing explicit plus automatic duplicate special components.


## Authorized retry outcome

Product commit: f20a88aa2d40e5ba86b915b1b1fb81f55784926d. The new explicit owner authorization allowed the single staging/commit retry. All source/bundle/harness hashes in after-working-tree.json match the committed blobs. The execution itself used the earlier base HEAD with these uncommitted sources; it is not mislabeled as a post-commit rerun. This documentation-only follow-up records the correspondence. Normal push and remote HEAD confirmation are reported in the final task result. No additional product tests, CI, Safari or saved A/B execution were added.
