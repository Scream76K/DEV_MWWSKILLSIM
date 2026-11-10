# Five-round normal rapid reference (dedicated path only)
Owner premise: LBG five consumed rounds, five triggers, 25 damage hits; HBG remains ten discharges. Select weapon normal-ammo level from a unique record, never a guessed highest level. Fixed DB has80 LBG entries;50 are not normal-rapid capable. No automatic nonrapid substitute.

New source rapidFiveShot and adapter evaluateRapidFiveShot reuse adopted normal rapid Lv1 or explicit baseLv2 + normal powder effectiveLv3. Native Lv2/Lv3 are not silently substituted. Standard UI is not switched in this stage. Current and stored inputs remain untouched.

The dedicated pipeline uses a five-round evaluation resource budget independent of weapon capacity and consumes one unit after each five-hit trigger. It is explicitly not a fabricated weapon magazine. Existing single-trigger entry and capacity gates remain unchanged.

First/Force propagation across all five rapid hits is not directly confirmed. Their effects are NOT_APPLIED in diagnostics and metric completeness PARTIAL_REFERENCE. Calculable physical components are returned; full damage and live-game accuracy are not claimed. Saved skills are retained.

Sources: https://kuroyonhon.com/mhwilds/memo/14.php (five normal rapid hits and0.7 modifier; through1.03 modifier0.5); https://kuroyonhon.com/mhwilds/program/skill.php (First/Force). Exact current game version remains unverified. Source directly lists native Lv2 23.8 and Lv3 30.6; those route expansions are not included here.

Verification:11 source new/old unit tests; actual783/786 Lv1 and1169 explicit powder Lv3, both channels25 components, independent arithmetic, source/pipeline equality, First/Force presence variants, capacity/position-independent identity, save/load and comparison nonmutation, legacy five-hit entry retained. Limited281 tests pass. Independent review approved this dedicated scope. Compound skill coverage is limited; full repository/integration suites and browser-specific regression were not run for this stage.
