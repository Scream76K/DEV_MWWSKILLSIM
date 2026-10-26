# LBG non-rapid elemental first-Hit reference

Product 48de9508c08a4ea98173af717c3ae9c4023116a4. Owner approval Sentinel_9aa1a519cef48191adce7680723eeddb: physical and elemental0.7, non-rapid/non-chase/non-mounted, CRITICAL distance, FIRST_HIT_ONLY_NOT_WHOLE_SHOT. Source https://kuroyonhon.com/mhwilds/memo/14.php (Lv1 elemental8×0.7, Lv2 10×0.7 and elemental0.7) corroborated by https://macarongamemo.com/entry/mhwilds-bowgun-bullets (2025-06-29/sourceVersion1.011.00 table). Current1.042.00.02 is NOT live-verified. DB adoption OWNER_APPROVED_PROVISIONAL, verification UNVERIFIED / PENDING retained. NEAR0.1 is not adopted; no other mode multipliers adopted.

## Ownership and route
New LBG_ELEMENT_FIRST_HIT_REFERENCE uses shared existing source ammo base and scope objects from the HBG first-Hit record, with its own LBG weapon modifiers0.7 and CRITICAL-only range. No copied MV/attribute tables and no Handler coefficient. Legacy BOWGUN_AMMO_NUMERIC.lbg elemental getters now read the single Technique DB definition. HBG record and numbers unchanged.

BowgunElementReference.firstHit selects a DB record by weaponKind (old callers default HBG for compatibility), requires LBG owner adoption, applies DB physical modifier once to physical and elemental modifier once to both attack-dependent and flat elemental contributions. Flat remains outside attack scaling. Formula trace records weaponKind/modifiers/sourceVersion/adoption and unchanged UNROUNDED_REFERENCE scope. Formula remains shared.

Actual calcBuild -> comboLBGStoredState / compareStep5Snapshot -> real adapter -> common Pipeline reference component -> firstHit -> metrics.firstHitReference -> actual summary/comparison. Original ammo entry resolved by selected type/level; actual rapid:false required. Explicit NORMAL, CRITICAL, FIRST_HIT, normalMode0 required. Unknown/rapid/chase/mounted/noncritical are rejected, not defaulted. Unsupported skill guards inherited; no conversion/critical-element/shot-skill extension. LBG's existing state save/load and preserveCombo:true comparison contract reused, no new storage schema. Shared channel executor unchanged; no new asymmetric-channel run in this narrow proof.

## Minimal evidence
Real original MHDB763 ホープバレットⅠ raw90/display117, affinity0, no skills/armor/charm/decos, thunderLv1 capacity5 rapid:false. Cached original from /tmp/mhdb-weapons-750.json, acquisition timestamp unknown, not newly fetched. No computed stats/skills/plan/results overwritten.

Expected/observed both channels: physical90*.08*.8*.7=4.032, element90/100*200/10*.3*.7=3.78, firstHit7.812 (DOM7.8). Result diagnostics keep OWNER_APPROVED_PROVISIONAL approval/source refs. Original ammo rapid:false/capacity5 retained in Formula details. comboTotalDamage unavailable FIRST_HIT_ONLY_NOT_WHOLE_SHOT; comboDps unavailable; official row.power.normal null. Both displays explicitly exclude whole shot/combo total.

Same fixture at NEAR and RAPID returns LBG_ELEMENT:NON_RAPID_CRITICAL_FIRST_HIT_REQUIRED in both channels. Actual named saves A/B same equipment/conditions; B ordinary load after rejected RAPID restores NORMAL/CRITICAL and exact channel results. Actual runBuildCompare rows each equal standalone, both7.812 under same current shared conditions. Full before/after snapshots match. A/B is same-equipment connection proof, not different-skill contrast.

One direct synthetic common-Formula compatibility control (not an actual-equipment claim) confirms omitted weaponKind still HBG physical5.76+element5.4=11.16. HBG full UI suite not rerun. initial.json was first successful run; after.json repeats only the same tiny harness after the explanatory UI text was finalized. Logs/harness/fixture hashes retained, product hashes equal commit above, bundle8 modules match sources.

Not executed: CI, Safari, real-game measurement, broad regression, LBG Lv2/attribute skill combinations, partial-channel failure. No full-shot Hit count, near/far adoption, rapid/chase, DPS, main/develop integration or deployment.
