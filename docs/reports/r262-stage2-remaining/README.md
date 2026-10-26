# Stage ② remaining components — local audit and CB connection

Baseline `059c61bdc8f2fc659926dd82440854463938e56f`. New work is LOCAL ONLY: no stage, commit, push, merge or publish. Stage ③ preserved; stage ④ representative builds not executed. This is not stage ② completion.

## Five remaining items

| Item | Formula / connection / occurrence distinction | Current evidence and next decision |
|---|---|---|
| HH other normal melodies | Body, sound, fixed and echo formulas exist. Adopted occurrence compiler exists. The new model only resolves SELF_IMPROVEMENT; other melody definitions/effect-state producers are absent from this adopted path. | `HH_NORMAL_MELODY_MODEL`, `adaptRealTechnique`, Adapter `HH_MELODY_DEFINITION_UNRESOLVED`; `r262-hh-provisional-total`. Reuse the adopted event order after adopting exact per-melody effect/rank/stacking definitions. Memo8's other melody table is a candidate, not automatically authorized by the event-count approval. No coefficient change here. |
| SA awakened followup | A sourced MV record exists, but it is not an adopted complete explosion formula/event contract. No public awakened generator; `SA_AWAKENED_SCORCH_UNRESOLVED` remains. | `SA_AMPED_FOLLOWUP`: MV12, element1, part1, `MACARONGAMEMO_SA_R49_SOURCE`, SOURCE_CONFIRMED/EVIDENCE_GATED, official-version audit pending. R49 explicitly leaves phial/amped interpretation pending. Need the followup's attack/element/crit/sharpness/phial/rapid-morph exclusions plus triggering Hit/timing rules; cannot treat this record as an ordinary sword Hit or assume one explosion per Hit. |
| CB axe followup | Existing dedicated formula and counts were adopted in R72, but public Adapter rejected all ON morphs. This local change connects **single CB_SWORD_TO_AXE_MORPH only**. | Canonical body MV54; `ChargeBladeEngine.techniques[id].axeBoostHits` supplies 4 × MV12 / element0.2, no duplicated numeric source. R49 preserves a source value14 conflict separately and explicitly keeps independent adopted12; this change does not resolve that conflict or adopt14. Other ED/AED phial/sequence state requirements remain separate. |
| IG kinsect | Dedicated kinsect formula/input producer missing, not merely a generic body wire. Candidate data and occurrence conflicts both remain. | `docs/reports/kan-22/REPORT.md`, R49/R54. Need kinsect power/type/bonus, separate pre-skill weapon element, technique coefficients and event counts. IG_SPIRAL_CHARGE_1 still SOURCE_CONFLICT (5/6 count and extract-consumption timing). Candidate source: https://k-k-kohei.com/2026/03/26/insectglaive-kinsects/#toc17 (1.041.03 vs baseline1.042.00.02). Adoption scope cannot imply all spiral counts. |
| Full elemental-ammo shot | `BowgunElementReference.firstHit` is a real existing formula, but its scope explicitly excludes later Hits. No complete-shot event generator/later-Hit contract. | `FIRST_HIT_ONLY_NOT_WHOLE_SHOT`; public Adapter moves it to firstHitReference, not comboTotalDamage. Need actual later-Hit coefficients/attenuation and contact topology/count contract for the selected ammo. Multiplying firstHit by an arbitrary count is not an authorized extension. |

Decisions can be bundled into three packets: (1) HH normal-melody effect/rank/stacking definitions; (2) SA followup and elemental-ammo later-Hit event/formula contracts, each with its own source and scope; (3) IG dedicated data/formula adoption from the existing KAN-22 candidate, with occurrence conflicts kept explicit. No new adoption is requested for the CB morph connection. These are concrete missing contracts, not a request to accept zeroed special components.

## Local CB change and expected expression

`hope-hammer-browser-adapter.js:evaluateCurrent` preserves explicit shield/axe state checks. For ON single morph, it projects existing dedicated followup definitions into ordinary physical/element components. No phial event exists for this morph. Unknown source rejects. Multi-technique ON remains `CB_MORPH_AXE_BOOST_SEQUENCE_UNCONNECTED`; no new state/resource model.

`real-technique-one-hit-adapter.cjs:adaptRealTechnique` accepts a per-Hit shield-body flag (boolean only) and component source. Body retains existing shield physical1.1; axe followups have false and therefore do not inherit that multiplier. Element does not receive shield multiplier. Existing CB hitzone routing is unchanged. Physical rapid morph applies through existing L3 attack-stage effect to body and eligible axe followups once; elemental components receive none. Legacy dedicated `chargeBladeTechniqueComponents` still gates rapid-morph + axe followup; it was not silently bypassed or modified. Its historical unconnected-scope label does not describe the newly connected public single-morph route.

Source evidence/status is attached to technique/component diagnostics as EXISTING_ADOPTED_REFERENCE / UNVERIFIED; channel formalStatus is PROVISIONAL. R72 itself calls this a reference calculation, not new live-game verification. No MV/element/count changes and no source-gate blanket removal.

## Minimal execution evidence

`tools/cb-axe-followup-contract-proof.cjs` uses existing MHDB147 fixture as a seed and **synthetic stage-II input** (fire display100, explicit condition effects). It is not legal equipment proof, live game proof, stage④, Safari, or saved-A/B validation.

Expected physical per Hit: round2(A × MV/100 × white1.32 × slash80% × affinity expectation1.0125 × body-only shield). Normal A=190×rapid; maximum A=190×1.1×rapid+10. Element per Hit: round2(100/10 × modifier × white1.15 × fire30%). UI training-front resolver supplies those hitzones; the fixture's alternative DB.monsters entry is not the canonical resolver. Sum already-rounded components without a new total rounding policy.

| Synthetic condition | Normal | Maximum |
|---|---:|---:|
| Axe OFF / shield OFF | 113.15 | 129.89 |
| Axe ON / shield OFF | 213.43 | 245.05 |
| Axe ON / shield ON | 224.40 | 257.70 |
| Above + rapid morph Lv3 | 268.01 | 305.69 |

ON has 5 physical + 5 elemental components: body54/element1, four followups12/element0.2. Element values remain [3.45,.69,.69,.69,.69] across shield and rapid contrasts. Maximum's flat10 stays outside rapid; both channels use the same formula. Missing shield and unsupported sequence reject. OFF output unchanged from before log.

Evidence: `before.json` preserves initial skill-fixture failure; `before-resolved-skill.json` reproduces the original public ON blocker after resolving MHDB skill7. `after-initial.json` preserves an implementation assertion failure caused by incorrectly requiring a normalContract entry for CB (CB already has separate existing hitzone routing). `after-source-contract.json` records that correction. `after.json` is the final passing contract with explicit independent stage equations. Each JSON has execution baseline SHA and actual product/harness SHA256; uncommitted product hashes, not HEAD alone, identify this execution. `shared-adapter-tests.txt`: 8/8 related adapter/physical-formula tests, no skip. No broad regression; no old evidence deleted.

## Fourteen-weapon review inventory (source-scoped; not all moves complete)

All rows share normal/maximum formula selection with independent condition inputs; a distinct maximum damage formula is not invented.

| Weapon | Adopted formula/component path | Explicit boundary / missing requirement |
|---|---|---|
| GS | Common physical/element; charge Hit coefficients from DB | Selected sourced charged/body techniques; unadopted technique variants separate |
| LS | Common physical/element + gauge-state inputs | Adopted gauge/body subset; broader transitions not inferred |
| SNS | Common physical/element; approved Bash Uppercut per-Hit slash/blunt | Other unclassified Hits remain data work |
| DB | Common physical/element + explicit demon state | Adopted dance/body subset; no invented special sequences |
| Hammer | Common physical/element, DB charge coefficients | Selected ordinary/charge subset; no separate formula duplication needed |
| HH | Common body + existing sound/fixed/echo formulas + adopted provisional event compiler | SELF_IMPROVEMENT/preplaced bubbles only; other normal melodies required, special melodies/placement outside selected model |
| Lance | Common physical/element + corrected sourced slash classification | Selected sourced thrusts; broader special-state actions separate |
| GL | Common body + existing shell formula; NORMAL/CHARGED consume current stock | Reload/stake/other multi-action state contracts not implied |
| SA | Common body + adopted sword-Hit phial effects, owner morph Hit/exit modes | Awakened followup required for awakened scope; gauges not fabricated |
| CB | Common body/element, phial formula, single ED I state, SAED reference; local morph axe followups | Other axe/phial mixed sequences and state/resource contracts remain |
| IG | Common body + consistent triple-extract attack components | Kinsect formula/input/events absent; extract-consuming special routes unresolved |
| Bow | Existing three-technique reference formula, resolved elementBasis/flat order | Fixed adopted sequence contract; arbitrary new sequences not implied |
| LBG | Normal-ammo formula and adopted elemental firstHit | Full elemental shot and rapid/chase modes unresolved |
| HBG | Normal-ammo, adopted full two-Hit Wyvern formula, elemental firstHit | Full elemental shot and other special/stock routes unresolved |

Mandatory missing scope for stage② review: the five rows above cannot be represented as complete when selected. Optional expansion beyond currently adopted selections includes arbitrary technique coverage, special HH melodies/placement, additional reload/rapid/chase routes, and DPS. Skill-by-skill completeness belongs to stage③; legal representative builds and real-browser/save comparison evidence belong to stage④. The parent/owner must accept an explicit adopted scope before calling stage② complete; this local result does not do so.

## Preservation and execution limits

Original stage③ binary diff SHA256 remains `5781b032f789a9531391ef06834e5657a2c465d0f83ed817adfcacdfa6194ed8`. No operations on Safari/storage/server or original files. `ps -p 16371` read-only status inspection was denied by sandbox (operation not permitted); server liveness is not freshly verified. `git ls-remote` failed DNS resolution for github.com; no fresh remote claim. No commit/push attempted per current instruction. CI/Safari/game verification not executed.
