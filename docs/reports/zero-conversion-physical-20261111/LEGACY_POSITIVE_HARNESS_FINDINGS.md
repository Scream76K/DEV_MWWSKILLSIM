# Legacy positive harness failures

Base: ef114d02a8bf69e519a5c22b8b8bf103f7167a8f. Candidate adapter: cc792cde5c0646ebfaeb89e88014d34d1a2a6d0ba351dfbc8e2d24038fb22c80.

Both original commands fail identically on the published base and candidate. They are recorded as failures, not successful regressions. The water/Charge Master combination harness passes on both. No product behavior was changed to satisfy an old assertion.

## Thunder cap

`tools/thunder-conversion-cap-connection-proof.cjs after`, line21, expects effective element850 in both channels with thunder base500 and synthetic resistance70 (coefficient5). Actual input selects the STANDARD GS three-charged-technique profile. Normal is500/add0; maximum is850/add350. Resistance150 yields normal500, maximum1150, uncapped1250, cap1150. The old assertion incorrectly assumes both channels activate conversion. Adapter standardConversion and the effect gate `!standardConversion || channel===maximum` originate in5f1f733, predating this change. `docs/reports/standard-premise-recovery-20261105.md` line21 records normal-inactive/maximum-active conditional skill models. C02 requires independent channel conditions. This is a harness-route/expectation mismatch, not evidence of a new numerical defect. Repair candidate: explicitly test standard and manual combo separately, with channel-specific element, flat, cap and component-effect expectations. Keep old manual-positive coverage rather than simply weakening the assertion.

## Water negative resistance

`tools/water-conversion-public-proof.cjs`, line18, expects normal execution not complete after synthetic armor water resistance-30 plus water resistanceLv1. Actual captured input is explicit combo, standardEvaluation=false, LS_RED_BLADE_I. The adapter rejects the conversion with WATER_RESISTANCE_UNRESOLVED:NEGATIVE_OR_FRACTIONAL_WATER_RESISTANCE_UNSUPPORTED. The current skill continuation then preserves supported components and water resistance84, omits181, marks both channels PARTIAL_SKILL_EFFECTS, completeSkillResult=false, and retains that exact ignored-effect reason. Execution complete means the retained technique executes; it does not mean all skills were calculated. This follows CURRENT_CONTRACTS C05 and the requested calculate-supported-effects policy. Repair candidate: assert execution plus partial completeness, exact181 omission/reason, retained84 and numeric equality to the same build without181; preserve direct invalid-rank rejection separately. Do not restore whole-calculation failure.

## Evidence and limitations

Evidence directory: ../evidence/zero-conversion-physical-20261111. legacy-positive-comparison.json records all six original outcomes. Synchronous memory-only logging before the unchanged assertions captured full positive thunder cases, positive LS water cases and negative LS water input/output. positive-invariance.json confirms published/candidate equality after excluding only snapshot savedAt timestamps. Original captured files retain timestamps. No source or user storage was modified for capture. One initial capture injection had a quoting syntax error and produced no diagnostic result; its stderr is retained separately from the corrected captures.

The old water harness stops at LS negative assertion, so its later Bow/outside checks were not executed and are not claimed as passes. Dedicated current zero-effect tests separately cover Bow; they do not replace positive Bow acceptance. Neither failed legacy harness is registered in the integrated regression contract. Updating these harnesses is a separate targeted test-maintenance candidate; this batch preserves them and their failure evidence.
