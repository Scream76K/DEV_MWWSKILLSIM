# HH event reconciliation — stage ②, source inspection only

Inspected product SHA: a130fad7c5c3e2ce0304126312cfdeb0f31c910b (clean isolated worktree). Research date: 2026-10-26. No product edit, new coefficient/count adoption, test execution, browser interaction or game measurement.

## Expected contract

Given independently evidenced event kinds and occurrence counts, evaluate each event once using the existing Technique DB coefficient and existing sound/fixed Formula. A four-event total alone must not determine all four event kinds. Unknown event occurrence must keep a complete total unavailable. Normal/maximum must share the same evidenced occurrence schedule, with separate stat inputs.

## Established source and implementation

- index.html:7270–7300: HUNTING_HORN_STANDARD_PROFILE selects left swing, forward attack, self-improvement performance, JUST encore. HUNTING_HORN_EVIDENCE.echoBubble records four events under USER_INGAME_CONFIRMATION_2026-10-05, but explicitly leaves eventTypeMappingStatus PENDING. Its last map key is HH_ENCORE, not the selected HH_ENCORE_JUST; it is historical evidence metadata, not a working event producer.
- index.html:7302–7329: huntingHornSpecialSourceEstimate already evaluates attack × coefficient / 100 plus displayed element × element modifier × elemental hitzone / 1000, or fixed damage × explicit count. It requires a scenario evidenceRef and returns SOURCE_ESTIMATE_ONLY, UNROUNDED_REFERENCE_ONLY, scenarioCountsAdopted:false, comparisonPower:null.
- hope-hammer-browser-adapter.js:296: hunting-horn-sound calls that helper, then returns HH_SOURCE_ESTIMATE_ONLY_FORMAL_TOTAL_EXCLUDED with component details. This is a deliberate adoption boundary, not a missing arithmetic implementation.
- Technique DB sourceFormula references KUROYONHON_HH_R56_COMPONENTS and MACARONGAMEMO_HH_R61_FORMULA. Existing ordinary echo coefficient 5 / melody echo coefficient 12 / element modifier .3 / fixed event 10 are unchanged. The separate specialSourceValues.formulaStatus PENDING and readiness checks are not authority to promote the source-only formula.
- docs/reports/r250-stage6/DPS_EVIDENCE.md identifies the internal four-event reference but does not locate the original user recording or independent decision record. Git history locates the uploaded internal record; this is not recovered game evidence.

## Original-source reconciliation

Read https://kuroyonhon.com/mhwilds/memo/8.php sections 響玉, 旋律成立時の衝撃波について, 重ね掛け時の10ダメージについて on 2026-10-26. Ordinary attacks and completed performances trigger different echo damage; multi-swing exceptions exist. Thus ordinary attacks support the FOLLOWUP category and completed performance supports MELODY_EVENT, but the old four-event route lacks the necessary event timing/coverage record. The fixed-10 paragraph describes a count based on earlier melodies excluding echo-wave melodies, while its example says three attack melodies yield two fixed hits. The count origin/terminology is therefore insufficiently precise for automatic route generation; do not infer count=N or N−1.

Read https://macarongamemo.com/entry/mhwilds-damage_calculation section 狩猟笛の音波ダメージ on 2026-10-26. Its formula agrees with the existing sound helper: no affinity, sharpness or physical hitzone; elemental hitzone applies. This source confirmation does not validate current game version, rounding or route counts.

## Missing inputs and smallest useful evidence

1. For the historical four-event route: initial active bubble count/target coverage; initial melody stock; which melody actually completes at performance and encore; a frame/order mapping of each observed echo hit to normal attack versus melody completion. Do not turn four reported events into four identical coefficient-5 events, or automatically assert 2+2.
2. For FIXED_10: a controlled encore recording with explicit melody list, count completed before encore, exclusions, and separated fixed-10 damage ticks. Resolve the source paragraph/example discrepancy before deriving count. The technique ID alone is insufficient.
3. Numeric source-only status: current-version/rounding evidence, or explicit owner authorization for a precisely bounded provisional event schedule and reference scope. No such new authorization is inferred here.

The original recordings have now been recovered and inspected by the parent-side analyst (update below); no reattachment or new recording is requested. Initial stock, event attribution and version still require examination of that existing evidence. Existing source-only manual scenarios remain available; no gate was relaxed.

## Stage ② remaining scope

See ../r262-hbg-wyvern-pipeline/README.md for all 14 weapon Formula families. Existing body, SNS/LAN hitzone, IG decomposition, Bow element basis, GL NORMAL/CHARGED stock, HBG Wyvern and SA owner Hit-mode connections remain accepted only in their documented scopes.

- HH: arithmetic exists; automatic event generation and formal aggregation are blocked by the concrete evidence above. Further source/history retrieval can proceed autonomously; adoption of a new provisional schedule requires owner approval. No independent product defect was established here that can safely be fixed by removing guards.
- SA: approved mode transitions are connected; gauge changes and awakened followup remain separate unsupported inputs/components. Do not infer them from the Hit-mode approval.
- CB/GL/IG: broader state sequences, reload/kinsect/followup generation remain unsupported where their data/contracts are missing. This report does not reopen completed local contracts or invent a new all-technique requirement for stage ②.
- Other bowgun modes/full elemental-shot totals and unapproved scatter MV remain outside adopted scope. Stage ③ all-skill audit and stage ④ representative builds have not been performed by this research.

No CI/Safari/test pass claim. Original dirty stage ③ checkout, served files and storage were not modified.


## Parent-supplied original-video observation update

Received 2026-10-26. This worker did not view the videos on Mac. The parent reports successful recovery of eight originals and pixel inspection by a separate analyst. Private Library identifiers, original videos, frames, and cloud-local paths are intentionally not included here. Short clip IDs and timestamps below identify observations, not new adopted values. No production change or new numerical/event adoption.

Five clips are HH: 1a11b1082bf29, 1a11b109e2274, 1a11b10ada974, 1a11b1249e75, 1a11b130fcd37. The other three intake clips show ranged-weapon UI. Thus the eight-file intake and five-HH user description are compatible; the exact five-label mapping is not fully established.

- Echo field / right swing: clip 1a11b10ada974 at 00:06.000 shows performance then echo-field action history. At 00:16.700 right-swing caption and a visible field; 00:16.900/17.000 shows 38/1Hit, then 00:17.100/17.500 shows 44/2Hit. This supports a second displayed contribution (+6/+1Hit) under that recorded condition. It does not determine coefficient 5, exact fractional damage, number of overlapping fields, or the historical four-event schedule.
- Performance / encore: clip 1a11b109e2274 at 00:13.000 shows three self-improvement banners and 176/7Hit. Encore history appears at 00:14.000/14.300 (198/8Hit), then 00:14.500/14.600 (264/9Hit), 00:14.700 (287/11Hit), and 00:14.800/15.000/16.000 (287/12Hit). The stable interval difference is displayed +111/+5Hit; asynchronously updated total and hit counter prohibit interpreting this as five semantic events or extracting fixed-10 count. Banner count is not yet mapped to stocked/performed melody semantics.
- Other clips: 1a11b130fcd37 at 00:02.000 shows left swing, 30/1Hit; 1a11b1249e75 at 00:11.000 shows handle attack/performance/forward attack history, 96/3Hit; 1a11b1082bf29 at 00:05/08/11 shows a mixed chain in a field. These are coarse observations, not exact user-category or component assignments.

Individual frame seek timestamps above are authoritative for the supplied observations. Parent-side contact sheets have a reported +5-second label offset and must not be used as exact event boundaries.

### Consequence for stage ②

Resolved: original-evidence availability, five-HH/eight-intake distinction, and the two targeted scene identities. Unresolved: equipment/buff-normalized attack input, fractional component attribution, initial melody/field state, fixed-10 count, old four-event mapping, current-version/rounding adoption. The existing explicit-event sound/fixed Formula contract remains valid only in its source-estimate scope; this observation neither disproves nor validates its coefficients. Do not use rounded +6 as a new coefficient or 12 displayed hits as an event model.

Autonomous next work can inspect the recovered scene evidence for state and component attribution without another download/installation on Mac. Owner judgment remains necessary for the unanswered provisional explicit-melody contract and any later formal-aggregation adoption. Event recovery is not a prerequisite for evaluating a separately explicit event-input Formula. Stage ③/④ and product enablement remain untouched.


### Additional owner observation — hypothesis only

The owner suggested that the displayed damage values 10 and 13.1 may originate from performance. This is a hypothesis, not an adoption decision or confirmed component attribution. Do not classify 10 as HH_MELODY_COMPLETION_FIXED_10 solely from its value, and do not definitively assign 13.1 to a sound event. Timing attribution is pending the parent-side video analysis. No production coefficient, occurrence count or formal total changes follow from this observation.


### Parent-side timing observations — attribution still pending

Clip 1a11b109e2274: at 00:13.300, a floating 13.1 is visible on the left; the encore action-history entry appears around 00:13.600. At 00:15.100–00:15.700, the left cluster contains 13.1/10.0, with 66.0 separately on the right; at 00:14.200, 22.0 is visible on the right. These parent-supplied observations are temporally consistent with the owner's performance/encore hypothesis. They do not establish fixed-10, sound-13.1, or body-66 component attribution. Floating numbers persist across frames and overlap: repeated visibility must not be counted as additional hits. This worker has not viewed these frames locally. No adoption, product edit or new test follows; documentation was held uncommitted after the reported commit/push denial (subsequent documentation-only authorization is recorded below).


### Owner correction — performance beat 1

The owner confirmed that normal performance beat 1 is MV33 and that the earlier MV30 statement was a typo. Existing HH_PERFORMANCE_BEAT_1 MV33 and HH_PERFORMANCE_BEAT_1_JUST MV40 remain unchanged. All values in this latest owner MV list now agree with the existing DB; the 30-versus-33 source/version discrepancy is closed. This correction does not establish event counts, floating-damage attribution, explicit-melody contract adoption, or renewed commit/push authorization.


### Confirmed MV to public Pipeline — bounded source inspection

Inspected unchanged product at 921b575 (product content a130fad); no new execution or adoption. Owner correction establishes MV agreement, not a version-gate or complete-total adoption.

| Records | Existing component/formula | Actual public-path boundary |
| --- | --- | --- |
| HH_SELF_IMPROVEMENT_PERFORMANCE | BODY 35; specialTechniqueIds includes HH_PERFORMANCE_SHOCKWAVE | real-technique-one-hit-adapter.cjs rejects nonempty specialComponents with SPECIAL_ROUTE_PENDING before ordinary events are produced. The body-only record does not mean the whole performance is complete. |
| HH_PERFORMANCE_BODY | Ordinary 35 | EVIDENCE_GATED remains; this is a distinct body record, not permission to silently substitute it for full performance. |
| HH_PERFORMANCE_BEAT_1 / _JUST, HH_PERFORMANCE_BEAT_2 / _JUST | Ordinary single Hit 33/40/35/50, element modifier 1, explicit just false/true | EVIDENCE_GATED / OFFICIAL_BASELINE_VERSION_AUDIT_PENDING. Source numeric agreement alone does not remove that adoption boundary. |
| HH_ENCORE_NORMAL | Ordinary ordered Hits 20,60 | EVIDENCE_GATED remains. No inferred fixed-10 event count. |
| HH_ENCORE_JUST | BODY ordered Hits 20,75; separate fixed-event technique | SPECIAL_ROUTE_PENDING for declared specialComponents. No body-only sum promoted to full encore. |
| HH_PERFORMANCE_SHOCKWAVE | Existing HORN_SOUND_ATTACK_AND_ELEMENT, coefficient 27 | Browser Adapter assigns hunting-horn-sound; common reference event delegates to existing helper, then returns HH_SOURCE_ESTIMATE_ONLY_FORMAL_TOTAL_EXCLUDED with component details. Arithmetic exists; formal-total promotion is not authorized. |

Call sites: browser Adapter referenceKind/referenceInput at lines151–152; common technique adapter ordinary eligibility at lines34–40 and component creation at lines55–57; source reference Formula at browser Adapter line296. Shared physical/element Formulas already provide ordinary body arithmetic, so duplicating an HH body formula is unnecessary. Existing huntingHornBodyComponents is a legacy partial-body route, not proof that the public Pipeline currently exposes those partial components.

Needed contract for a future limited connection: preserve selected full-technique identity and unresolved special components, expose only explicitly scoped body/source-reference results with incomplete-total status, and retain required just/weapon/target inputs independently for both channels. This is a proposal, not implemented or adopted here. Do not delete specialComponents, substitute HH_PERFORMANCE_BODY silently, or remove EVIDENCE_GATED solely to produce numbers. A minimal arithmetic correction within the already-adopted public scope was not established by this inspection; source-only helper operation and explicit-event arithmetic remain independent of reconstruction of the old four-event route.

No retry occurred before the subsequent explicit documentation-only authorization. The outstanding explicit-melody adoption question and any approval to promote a new public partial-result scope remain separate from numerical MV agreement.


### Documentation-only publication authorization

The owner subsequently explicitly approved commit/push. This update publishes only this research document, not product implementation, explicit-melody adoption or formal-total gate changes. The previous denied command had not staged or committed files. Video bytes, images, private Library identifiers, transfer URLs and cloud filesystem paths are excluded.


### Subsequent owner-approved occurrence model

The earlier source-only and pending-adoption statements above describe the historical inspection. The owner subsequently authorized an explicit provisional total model; implementation scope, assumptions, limitations and contract evidence are recorded in [HH provisional total](../r262-hh-provisional-total/README.md). Video-derived event attribution remains unverified; it is not the source of the new occurrence counts.
