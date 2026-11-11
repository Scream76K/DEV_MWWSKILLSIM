# Restore legacy conversion verification

Base c8e67c02d6f3fb3f171b0c4f5ce31507b2882256. This batch changes verification only. Product code, coefficients, user saves and branch structure are unchanged.

## Cause and repair

The original two harnesses fail on the published base. See ../zero-conversion-physical-20261111/LEGACY_POSITIVE_HARNESS_FINDINGS.md for captured inputs and baseline/candidate invariance.

Thunder's attempted addCombo produced an empty saved move list, so current public calculation selects STANDARD GS three charged techniques. The old both-channel850/1150 expectation conflicts with the existing normal-inactive/maximum-active model (standard-premise-recovery-20261105.md, C02). The repaired test explicitly asserts that selection and all three IDs, normal500/add0 and maximum850/1150 with uncapped850/1250 and cap1150. It also separately evaluates the selected GS_CHARGED_SLASH_3 public consumer with both-channel350/750 additions. Physical components remain identical; elemental ratio and exactly one conversion effect per active component are checked. Distinct saved A/B and input preservation remain checked. The historical `before` mode is rejected explicitly; use its preserved old revision to reproduce historical pre-implementation results.

Water's original negative-resistance assertion expected the whole calculation to stop. Current C05 instead preserves supported effects and reports181 as ignored. Both LS and Bow now assert partial completeness, exact181 reason, retained water-resistance84, component/metric/final-state equality against the same build without181, and restored negative snapshots. Original positive64/824 additions (resistance16/206 ×4), effective564/1150, physical invariance, distinct A/B comparison and invalid rank rejection remain.

The old outside-weapon case was also a false positive: it changed kind to hammer while keeping LS/Bow technique IDs, so it rejected TECHNIQUE_NOT_FOUND rather than water-conversion scope. The repaired synthetic case uses HAM_SIDE_SWING, known positive resistance and a source fixture's melee sharpness, and requires WATER_CONVERSION_SCOPE_UNSUPPORTED. Missing Bow sharpness initially stopped the strengthened case earlier; that fixture issue was resolved without changing product code. No legal-equipment or game-verification claim is made for these synthetic combinations.

## Registration and verification

The new wrapper contains two node tests. The old files were not in the integrated contract. Append-only registration adds both proof files, their two source fixtures, the MHDB skill fixture and wrapper:149→155 input hashes,1560→1562 tests, one added test-file entry. No existing hash/order/metadata/600000ms budget changes. contract-proposal.json records the exact delta.

Evidence is in ../evidence/conversion-harness-repair-20261111. red.log reproduces both old failures; green.log and thunder-green.json/water-green.json contain repaired outcomes and bound hashes. The latter now reaches Bow and the scope-specific outside case. Related regressions, independent review and save results are recorded in the final receipt. Full aggregate1562, live game and device acceptance are not claimed locally. No GitHub update is authorized by this repair task.

Final checks: post-registration9/9 tests passed, fail/skip/cancel0 (20.333s); the separate water/Charge Master combination proof passed. Independent reviewer reran the two wrappers successfully and detected all four memory-only mutations (wrong route, thunder cap, omitted181 reason, continuation metrics). All bound hashes and the exact append-only contract delta were independently verified, with no blocking issue. index.html, adapter and runtime bundle remain byte-identical to HEAD.
