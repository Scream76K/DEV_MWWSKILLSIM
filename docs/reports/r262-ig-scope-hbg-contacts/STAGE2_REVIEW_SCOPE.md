# Stage II review scope — 2026-10-26 local work

最新の受入整理は [STAGE2_ACCEPTANCE.md](../r262-review-boundary/STAGE2_ACCEPTANCE.md)。以下は時系列調査履歴であり、過去の未接続・未commit記述を最新状態と混同しない。

Base e357f1beae822456aa6db314c06845cd2d375b06 plus uncommitted IG/body and HBG/LBG contact work. Not stage-II-wide completion. No stage III skill audit or stage IV representative-build sweep.

Both channels use the same technique/target/weapon-state contract, with independent ordinary/maximum effect input. Core physical and elemental formulas live in real-one-hit-pipeline.cjs; real-technique-one-hit-adapter.cjs compiles typed components; hope-hammer-browser-adapter.js connects equipment and dedicated references. Data acceptance remains per record. A generic Handler is not evidence that every technique is supported.

| Weapon | Existing accepted formula route / scope | Remaining boundary (not necessarily missing formula) |
|---|---|---|
| GS | Shared body physical/element; adopted charged technique element basis and CM stage | Other shockwave/special technique records require their own adoption; no all-technique claim |
| LS | Shared body with explicit red-gauge requirement for adopted red-blade route | Other gauge transitions/techniques not automatically accepted |
| SNS | Shared body; accepted BASH_UPPERCUT per-Hit slash/slam resolver, latter element0 | Other shield/falling classifications not inferred |
| DB | Shared body with adopted demon-mode requirement | Demon resource transitions and unadopted moves outside scope |
| HAM | Shared body physical/element for accepted records | Charge/state-dependent unadopted records are not covered by ordinary body success |
| HH | Shared body plus sound/fixed/echo formulas; adopted normal melody event model, self plus one attack family, establishment after damage | Special melodies, echo placement, heterogeneous attack-family competition outside adopted model |
| LAN | Shared body; adopted middle thrust I/II/III/triple slash classification | Other technique classes not inferred from weapon name |
| GL | Shared body and shell Formula coexist; adopted normal/explicit charged consumption via shared state engine | Local GL_SLAM/SWEEP + normal/explicit charged now share consumption; reload/other transitions remain scope extensions |
| SA | Per-Hit mode, existing phial effects; three accepted techniques with awakened sword-contact followup; rapid excludes explosion | Gauge amounts/expiry and other discharge/focus techniques outside adopted model |
| CB | Body/phial formulas; single morph axe followups, ED I normal-phial axeOFF consume, accepted SAED explicit load-shell state reference | ED I axeON consumption; ED II/AED/followup consumption and prerequisites; shield-thrust explosion count remain required decisions for those routes |
| IG | Shared body and triple-extract attackComponents. Kinsect damage explicitly owner-excluded | Body records still require accepted MV/element/state data; exclusion does not resolve spiral body source/state conflicts. Kinsect-only actions out of scope, not zero |
| Bow | Existing Shot3/Power3/Volley3 reference formula; separate elementBasis preserves multiplicative vs flat CM stage | Other charge/coating/techniques not implied; adopted reference scope retained |
| HBG | Normal shot, existing full two-component wyvern reference, explicit elemental contact list total | Contact editor/save UI absent; unadopted spread MV/other special modes remain outside scope |
| LBG | Normal nonrapid shot and direct-source explicit elemental contact total at critical range | Rapid/chase/mounted and noncritical contacts excluded; contact editor/save UI absent |

Common formula use is intentional: ordinary body techniques do not need duplicate per-weapon arithmetic when their actual differences are DB coefficients, per-Hit damageType, or explicit state effects. Special components continue to use dedicated formulas.

## Latest execution, not live-game verification

IG public triple body remains available with STOWED/DEPLOYED/unknown kinsect state; kinsect-only harvest rejected. Legacy stowed-only rejection reproduced then corrected. HBG/LBG explicit 6 contacts each tested with/without element skill and independent maximum attack multiplier1.1 + flat10. Physical attenuation only; element flat unchanged. Empty/7-contact rejection; LBG noncritical refusal. Existing LBG first-Hit and saved A/B compatibility proof passes. No explicit-contact saved A/B test or Safari test. Bundle-owned modules unchanged.

## Direct-source LBG contract

https://kuroyonhon.com/mhwilds/memo/14.php : normal fire/water/thunder/ice Lv1/2 rows specify physical MV8/10 times0.7 and contact multipliers1,1,.9,.8,.5,.5; every row retains attribute0.7. Dedicated model is SOURCE_BACKED_PROVISIONAL, not fabricated OWNER_APPROVED or VERIFIED. Current-version live verification pending. Only critical range connected, preserving existing accepted scope. https://macarongamemo.com/entry/mhwilds-bowgun-bullets confirms ordinary LBG0.7 but its .7 fifth-contact row is regular pierce, not elemental. Flat uses existing adopted first-Hit stage per contact; no new flat coefficient.

## Review / morning decisions

Stage II is ready for a scoped intermediate independent review, not unconditional completion. CB discharge axeON consumption/normal-enhanced handling and dependent prerequisites are the concrete unresolved contracts; do not infer consumption from explosion counts. Explicit-contact editor and persistence are product-input work remaining, separate from established formula arithmetic. All-special-technique expansion is not a completion requirement for this adopted scope. Source estimates and provisional models remain labelled; no live-game, CI, all-skill or all-build claim.

## Explicit acceptance gaps after the LBG contact connection

- Formula-contract checks are not a declaration that all selectable moves work. CB discharge axe-boost consumption/prerequisite contracts remain mandatory for the listed adopted discharge routes. Existing explosion-hit counts cannot determine resource consumption.
- GL mixed body/shell sequences still require a verified state/resource contract at the public entry. Individual shell formulas and normal/charged consumption checks do not establish arbitrary mixed sequences. This is a remaining input/state gap beyond CB, not a new numeric formula.
- IG spiral body record source/state conflicts remain record-specific; insect exclusion does not authorize that body record. If this move remains an acceptance target, its body adoption must be resolved. It is not evidence that the ordinary IG body formula is missing.
- HBG/LBG explicit-contact totals are available through the Pipeline API. Contact editing and save/load/comparison input persistence remain unconnected. Existing first-Hit saved comparison compatibility is not evidence for saved explicit-contact totals.
- Other unadopted techniques, special melodies, rapid/chase/mounted modes, resource-gauge simulation and DPS are outside the bounded implementation. They must not be silently counted as completed. Stage II overall remains incomplete pending the required state/input contracts and review of its explicit adopted scope.

## Same-input cross-weapon evidence

`lbg-cross-weapon.json` uses the current working tree on base e357f1b, the existing public-Pipeline LBG fixture plus a shared Formula input: raw90, affinity0, elemental multiplier1.1, display flat50, six critical-range contacts, physical hitzone40 and elemental30. Both ammo levels1/2 are compared directly. Every LBG physical and attack-dependent elemental contribution is exactly0.7 of HBG; flat is1.5 per contact for both weapons. This detects double0.7 and incorrect flat scaling. No new coefficients were introduced. The result model and displayed scope explicitly label later-contact flat repetition as a provisional assumption. Current-game verification remains pending.

This check does not execute Safari, CI, all-skill coverage, or saved contact-list comparison. No additional commit/push was performed.

## Follow-up GL scope decision

GL local mixed-body/shell connection is now checked; see ../r262-gl-mixed-resource/README.md. The earlier mixed-resource gap is closed only for the two explicitly classified body moves plus normal/charged shell actions. Mandatory adopted-scope gaps: CB discharge resource/prerequisite contracts; GL_SLAM attribute1 retained by owner morning decision; source2 discrepancy recorded, no longer an adoption blocker. Product input gap: explicit elemental-contact editor/persistence. IG legacy spiral is mandatory only if retaining the old four-move STANDARD profile; the current adopted single-body preset does not require it. Treat other moves, reload chains, arbitrary loops and additional weapon modes as target expansion, not newly discovered formula failures. Stage II is not declared complete.

## Current review matrix after UI connection (supersedes earlier local pending notes)

Acceptance means the existing adopted techniques and explicitly supported states, not every selectable/unregistered technique. Normal/maximum use the same formulas/technique/target/state and distinct effect inputs. Prior evidence is retained; this table is a source-based review map, not fourteen newly executed builds.

| Weapon | Formula / required input / special output | Mandatory adopted-scope gap or version decision | Explicit expansion excluded |
|---|---|---|---|
| GS | Shared physical/element; charge Hit coefficients and elementBasis; sum | No further confirmed weapon-formula disconnection in inspected scope | Other shockwaves/techniques |
| LS | Shared body; explicit RED state; sum | No further confirmed disconnection in inspected scope | Automatic gauge progression |
| SNS | Shared typed-Hit body; bash-uppercut slash/slam; element0 shield Hits | No further confirmed disconnection in inspected scope | Other shield/falling classifications |
| DB | Shared body; adopted demon state; sum | No further confirmed disconnection in inspected scope | Stamina/demon progression |
| HAM | Shared physical/element; adopted Hit and charge conditions; sum | No further confirmed disconnection in inspected scope | Unadopted charge moves |
| HH | Body/sound/fixed/echo; explicit N/B/self/one attack family; provisional total | Event count/order remains owner-approved provisional, not live verified | Special songs, placement, attack-family competition |
| LAN | Shared body; adopted middle/triple slash classification; sum | No further confirmed disconnection in inspected scope | Unclassified other techniques |
| GL | Body plus shell; explicit stock/charged consumption; mixed sum | Owner confirmed adopted element1; source2 discrepancy retained, not a blocker; not live verified | Reload, stakes, arbitrary chained transitions |
| SA | Per-Hit mode, phial and awakened sword-contact followup; sum | Existing MV version limits retained, no new coefficient adoption | Gauge simulation, expiry, other discharge moves |
| CB | Body/phial/axe-followup; adopted unique ED I→II→AED→followup route OFF1/ON0.5 enhanced-first; existing morph/SAED | Local route verified; OFF cost1 across two half-stocks remains undefined; shield-thrust/guard-derived AED rapid morph now connected in explicit supported start states | Shield-thrust unresolved explosion count, other origins/loops, arbitrary mixed-stock damage allocation |
| IG | Body-only physical/element; triple-extract attack stage; sum | None for adopted diagonal body preset; legacy spiral is explicitly not required by this preset | Old four-move STANDARD reinstatement needs body charge/attribute/consumption resolution |
| Bow | Existing three-shot reference formula; coating/range/elementBasis; bounded output | Existing reference scope remains explicit; no all-shot completion claim | Other charge/coating/shot definitions |
| HBG | Normal/wyvern plus elemental explicit1–6 contacts; P/E total | Contact UI, ordinary save/load and shared-condition comparison now minimally checked | Further contacts, unsupported modes and unadopted spread |
| LBG | Normal nonrapid plus elemental explicit1–6 critical contacts; P/E total | Contact UI/save/comparison checked; repeated flat is explicit provisional model | Rapid/chase/mounted, new distance modes, contact7+ |

Only new runtime checks in the latest step concern HBG/LBG input and saving (../r262-contact-ui/). Earlier notes saying contact UI/persistence absent are historical and superseded. Current-target sharing is visible and limited to the existing public training-room/front target contract; no claim of general monster coverage. No additional confirmed in-scope wiring defect is being held without action. CB contracts remain the morning question preventing unconditional Stage II completion. GL numeric adoption is resolved: keep1. Independent review should assess this explicitly bounded matrix before Stage III, with no substitution of representative-run success for formula coverage.

## CB owner follow-up (local, supersedes ED I pending consumption)

ED I normal base1, axeON cost0.5 and enhanced-first selection now connected with separate half-unit stocks, existing axe followups and phial coefficient trace. See ../r262-cb-ed1-half/. Single action only. Remaining ED I question is cross-type cost1 allocation when enhanced0.5 remains; no coefficient mixing inferred. Other discharge prerequisites/base consumption remain pending. GL element1 decision stays resolved. No Stage II completion/commit/push.


## Latest CB release-route closure (supersedes prior morning questions)

The four adopted discharge actions now execute through the existing resource engine, including enhanced-first0.5 switching and axe followups. Evidence: ../r262-cb-ed1-half/release-final.json. GL element1 remains adopted. Formula/state review can proceed on the bounded matrix; do not claim unrestricted Stage II completion: CB cross-kind OFF cost1 coefficient allocation remains an explicit excluded boundary. Shield-thrust and arbitrary origins/loops are extensions outside this four-action route. Current route save/A-B and a power-element real fixture are now minimally verified (r262-cb-ed1-half/save-element-final.json); live Safari/CI remain untested. All local IG/contact/GL/CB changes remain uncommitted; Stage III has not started.


## Review entry decision after AED closure

The table's bounded adopted weapon formula paths now have no further identified mandatory local wiring gap in this audit. AED conditional rapid morph, CB save/load/shared-condition comparison and power-element routing are covered by new minimal evidence. This supports beginning independent Stage II review, not declaring all fourteen weapons/all selectable techniques/all conditions verified. Provisional HH/SA/contact models, existing source-version limits, explicit CB cross-kind boundary and all expansion columns remain visible. Stage III and representative all-weapon Stage IV have not begun. Stage I browser acceptance is historical; this step did not retest Safari. All current work is local and uncommitted.
