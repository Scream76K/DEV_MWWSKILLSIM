# Nonrapid LBG owner standard: five discharges

Base: published797961d742c3159621d4d79e8d9f262e99afab3c. Owner explicitly chose five NORMAL discharges for LBG weapons whose normal ammo is not rapid capable. Rapid-capable LBG stays five consumed rounds /25 hits; HBG stays ten discharges /30 contacts. Weapon-supported normal level is selected from the unique MHDB record. Nonrapid LBG produces15 physical contacts, with no reload or magazine-count limitation. No alternate ammo substitution.

Implementation reuses the existing nonrapid three-contact formula and adopted First/Force rules. First applies at sequence ordinal1, Force attack at4, Force affinity at4 and5. Shot6 is outside the five-round scope. Stored ordinal/full-magazine/capacity is not rewritten. Both modes display their names and shot/hit counts. Same-kind owner-standard comparisons can mix rapid/nonrapid, with each row's premise and partial-effect warnings visible. Explicit saved combos keep the legacy route.

First/Force on rapid remains NOT_APPLIED / PARTIAL_REFERENCE. Its per-hit mask has not been established by current-version measurements. Existing coefficients are supported by Kiranico GameVer1.040 (opening-shot/tetrad-shot), https://note.com/kehaar6/n/n71765756ee8c PS5Ver1.010.01.00, and the existing adopted skill source. These do not independently verify the rapid25-hit mask or current live game.

## Variant ammunition correction
The raw DB has80 LBG records:50 nonrapid (49 Lv1 and id1171 Lv2),30 rapid. UI consolidation groups three same-name Gogma Artia records. Id1169 is the attack variant,1171 element,1170 affinity. The old grouping retained scalar values/sourceIds but only the representative ammo. This could incorrectly treat the element variant as normal-rapid capable.

The selected variant's original normalAmmo is now retained and resolved by the same sourceId used for completed stats, only for Gogma LBG. Other ammo and other weapon calculations are not replaced. No rate, capacity or level is invented. Missing variant evidence refuses a requested normal route with ARTIA_VARIANT_NORMAL_AMMO_SOURCE_UNRESOLVED; a legacy elemental route does not newly require this normal-ammo field. Older consolidated cache missing the original field may require reloading the source DB; saved builds are not rewritten. Raw id1171 is not a separate selectable UI weapon: test it as canonical1169 + production=element.

## Verification and limitations
- Four new pure-source tests first failed on797961d, then passed: exact level/mode selection, independent five-round First/Force arithmetic, capacity independence, malformed/rapid/HBG rejection.
- Focused286 tests passed. HBG legacy16 and selected elemental5 passed.
- Public JSDOM nine cases cover native rapid Lv1/2/3, HBG Lv1/2/3, nonrapid773/817 and Gogma element1171. All15 nonrapid contacts and totals use independent arithmetic, including negative affinity817, sourceId1171, First/Force four equipment variants, source-missing negatives, input/save preservation and mixed-mode comparison with each baseline switch.
- Existing CI comparison-session-reload-browser tests15 pass locally, covering all14 saved-build reloads and legacy/current cache boundaries. This is a bounded CI job check, not the full integration suite.
- Disposable Chromium nine cases cover standard calculation, save/load and comparison nonmutation. Old explicit rapid three cases retained. Nonbowgun12 weapons48 rows96 channels match797961d-stage saved evidence.
- Census80 tests selection only, not full public numeric coverage of all80. Current-game measurements, all skill combinations and Safari/iOS are unverified. Full repository/integration suite remains locally unrun. Three previously identified LBG DOM failures were already present on58bf and are not claimed fixed.
- No new branch or publication. Independent review and final evidence are recorded separately with exact runtime hashes.
