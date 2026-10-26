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

A proposed confirmation request is: for one active bubble and the stated four-action route, provide the initial melody stock and identify the normal-echo/melody-echo/fixed-10 ticks in the same recording (with game version). This requests missing facts, not a choice between invented damage values. Existing source-only manual scenarios remain available; no gate was relaxed.

## Stage ② remaining scope

See ../r262-hbg-wyvern-pipeline/README.md for all 14 weapon Formula families. Existing body, SNS/LAN hitzone, IG decomposition, Bow element basis, GL NORMAL/CHARGED stock, HBG Wyvern and SA owner Hit-mode connections remain accepted only in their documented scopes.

- HH: arithmetic exists; automatic event generation and formal aggregation are blocked by the concrete evidence above. Further source/history retrieval can proceed autonomously; adoption of a new provisional schedule requires owner approval. No independent product defect was established here that can safely be fixed by removing guards.
- SA: approved mode transitions are connected; gauge changes and awakened followup remain separate unsupported inputs/components. Do not infer them from the Hit-mode approval.
- CB/GL/IG: broader state sequences, reload/kinsect/followup generation remain unsupported where their data/contracts are missing. This report does not reopen completed local contracts or invent a new all-technique requirement for stage ②.
- Other bowgun modes/full elemental-shot totals and unapproved scatter MV remain outside adopted scope. Stage ③ all-skill audit and stage ④ representative builds have not been performed by this research.

No CI/Safari/test pass claim. Original dirty stage ③ checkout, served files and storage were not modified.
