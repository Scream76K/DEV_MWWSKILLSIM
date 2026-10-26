# CB ED I half-unit consumption and enhanced-first selection

Local, uncommitted changes based on e357f1beae822456aa6db314c06845cd2d375b06. Earlier IG/GL/bowgun work retained. No push, user Safari/storage/server or original Stage3 changes.

Owner contracts: Sentinel_bfe9f5e3bb4c8191b47c719ce4639dc3 (axe boost halves consumption), Sentinel_eb64362a9dcc819194811fc693bdf65f (enhanced first). Existing normal base consumption1 applies only ED I here. No SAED extension, ED II/AED base consumption inference, or mixed-type damage averaging.

DB MHCBED1ResourceRule retains base1 and owns axe multiplier0.5. Adapter resolves explicit axe state, separate normalPhials/enhancedPhials, and selected resource kind. UI supports half units and saves/restores enhancedPhials via existing CB state. Legacy enhancedPhial=false with absent enhanced count is the existing normal-only contract; unspecified/true without count is rejected. Explicit stock chooses enhanced while >0, then normal. A selected enhanced remainder smaller than full cost rejects CROSS_TYPE_DAMAGE_ALLOCATION_UNRESOLVED before damage. This decision does not invent how one explosion combines two phial types.

Technique compiler reuses existing ED I axe followup source (4 hits, MV12, element0.2), not a new hit-count adoption. Body51, observed phial explosion1 unchanged. Resource amount and hit count remain different fields. Shared Handler checks stock before the first emitted hit, consumes exact0.5 or1, then updates previousAction. State is copied per channel by engine. No integer rounding. Mixed sequential combos remain outside the current single-ED-I contract.

Files: index.html (rule/UI), hope-hammer-browser-adapter.js (scope/state, existing followups, phial details), min8/real-technique-one-hit-adapter.cjs (half resource validation/path/trace), min8/real-one-hit-pipeline.cjs (half-stock validation/selected consumption), regenerated himmel-real-browser-bundle.js. No duplicate numerical phial formula.

Minimal evidence: initial.json and normal-after-priority.json: OFF start1 consumes1, ON start1 consumes0.5, ON start0.5 consumes0.5. ON start0 / OFF start0.5 emits no components, retains stock and CHARGE, total unavailable. Both channels checked. OFF total162.83, ON276.31 using same fixture.

priority.json: explicit normal1/enhanced0.5 with axeON consumes enhanced0.5 -> normal1/enhanced0, total281.23. normal1/enhanced0 consumes normal0.5 -> normal0.5/enhanced0, total276.31. Trace identifies IMPACT coefficient0.14 vs0.12, explosionHitCount1, separate consumption amount0.5/type. All non-phial components equal. AxeOFF normal1/enhanced0.5 rejects cross-type allocation. Existing coefficients and followup values are provisional, not current-game VERIFIED.

Remaining one ED I boundary question: when cost1 spans enhanced0.5 + normal0.5, which phial coefficient/component rule represents the explosion? No weighted mix assumed. ED II/AED/followup predecessor/base-consumption questions remain separate. No new tests of saved A/B, rapid morph, power-element phial or Safari were run for this extension; existing shared formulas retained, not newly certified. No all-weapon completion claim.


## Adopted four-action release route (current local result)

Owner confirmed ED II / AED / followup AED base consumption1 and axeON0.5, enhanced first. Data contract `MHCBDischargeResourceRules` retains the owner sources and predecessor source https://kuroyonhon.com/mhwilds/memo/12.php (ED I→II, ED I/II→AED, AED→followup). Scope is unique adopted discharge IDs, explicit start stocks and axe state; no loops/reload/SAED expansion. Half-unit enhanced stock plus half-unit normal stock for an axeOFF cost1 is rejected, not averaged.

Adapter plans per-technique coefficient/resource selection from the explicit stocks. L5 validates the actual predecessor and priority/stock before emitting any Hit, then uses existing consume and transition events after all Hits. Each channel gets a fresh start-state copy. No actual resource is mutated during planning. Explosion counts1/2/2/3 stay independent of resource consumption; axe followups4/8/4/4 come from the existing dedicated component DB.

`release-final.json`: public calcBuild Pipeline, existing impact fixture147, no rapid-morph decoration, CHARGE start, shieldON. ON start enhanced0.5 + normal1.5: both channels total1584.52,54 components (25 physical,25 element,4 phial); final0/0, previousAction FOLLOWUP_AED. OFF start enhanced1 + normal3: both total1017.12,14 components; same final0/0. Phial subtotals34.44/59.04/78.72/118.08 and explosion counts1/2/2/3 are identical across these two consumption modes. ON short stock enhanced0.5+normal1 stops before followup components, previousAction AED and stocks0/0 preserved, incomplete total withheld. `release-initial.json` is a test-inspection error (component field kind absent); not a product failure. Fixed assertion uses component ID.

ED I legacy OFF/ON/insufficient and enhanced-priority boundaries also pass in `half-after-release.json` / `priority-after-release.json`; these precede a metadata-only scope-label correction. Final release evidence hashes are authoritative for current product. No Safari, CI, saved A/B of this new CB route, power-element fixture, or rapid-morph AED-route execution was performed. Existing rapid-morph conditional AED origin remains explicitly rejected. SAED unchanged. No commit/push.


## AED conditional rapid morph and persistence closure

Source https://kuroyonhon.com/mhwilds/memo/26.php explicitly includes shield-thrust/guard-derived AED and their axe followup Hits, excludes phial explosions, and places the multiplier in the attack multiplication stage. Existing approved multipliers are reused, not redefined. `MHCBDischargeResourceRules.rapidMorphOrigins` is the conditional-origin data source. Initial SHIELD_THRUST or GUARD is an explicit prior action; the current slice does not simulate its damage. GUARD→AED is limited to shieldBoosted=false consistent with memo12's direct route; shield-boost guard alternatives are outside this input path. The state updates to AED before followup AED, preventing carryover. Discharge-from-ED I/II is known non-target, not unknown. Phial parameters exclude all conditional rapid-morph effect IDs; element components receive no physical effect.

`aed-origin-before.json` records prior rejection. `aed-origin-after.json` proves AED+followup with axeON and legal rapid-morph Lv3 decoration46: base/non-target731.68, shield-thrust/guard-derived782.53, both normal/maximum. Every AED physical component including four axe followups changes once; all elemental/phial components and the following technique are unchanged.

`save-element-final.json`: isolated JSDOM real public calcBuild, named save/load and actual comparison runner. Saved A stores enhanced0.5+normal1.5/no decoration, total1584.52; saved B normal2+enhanced0/rapid-morph3, total1625.24. Normal load restores original stocks and exact channel outputs. Shared-condition compare uses B's normal2/enhanced0 for both: A1579.60/B1625.24, matches corresponding single calculations, identical A/B condition keys. Full original snapshot/conditions/outputs restored after comparison. No real user storage or Safari was used.

The same proof uses existing MHDB103 fixture (water display260, POWER_ELEMENT, no armor/decorations) for four-action axeON release. Both channels1191.794, phial components24.336/42.588/85.176/127.764; independently checked display260/10 × coefficient2.4/2.1/4.2/4.2 × shield1.3 × waterHZ0.3 × explosion count1/2/2/3. This is not an impact formula or raw-attack calculation.

Latest evidence shares current product hashes. Remaining excluded boundary: axeOFF cost1 spanning enhanced0.5+normal0.5 is rejected, no guessed mixed coefficient. Shield-thrust's own explosion count, other starts/loops and automatic charge loading remain outside adopted route. No Safari/CI/game verification. Remote read via git ls-remote failed DNS resolution (github.com), not authorization denial. No commit/push.
