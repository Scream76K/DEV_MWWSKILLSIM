# Weapon-level normal-ammo standard connection
Base ec0af4a. Owner standard: HBG ten discharges /30 contacts; LBG five consumed rounds /25 hits. Each weapon uses its unique normal-ammo record. Multiple records, invalid levels and rapid:false fail closed, without nonrapid substitution. Explicit saved combo routes stay explicit. Standard states are evaluation copies, not saved-data migration.

Native LBG Lv2 and nativeLv3 are connected using direct rows in https://kuroyonhon.com/mhwilds/memo/14.php : LV2 normal rapid23.8*0.7 five times; LV3 normal rapid30.6*0.7 five times. Source also states normal powder adds one level. NativeLv3 has a separate technique ID/baseAmmoLevel3; the prior explicit baseLv2+powder effectiveLv3 route is unchanged. Exact current patch is not established; native-vs-powder equality is source-level interpretation, not independent game measurement.

First/Force rapid-hit application remains NOT_APPLIED. Calculable physical damage is shown with partial-skill warnings in current summary and comparison. Other unsupported skills use the existing continuation mechanism. No full/live-game accuracy claim.

Standard comparisons may compare different supported ammo levels under the same owner sequence policy and same target. Explicit comparisons retain route matching. Normal ammo level and total shots/hits are displayed.

Verification: real weapon LBG783/763/771 (native1/2/3) and HBG469/464/517(1/2/3), plus expected refusal for LBG773 rapid:false. JSDOM and disposable Chromium cover calculation, partial labels, save/load, comparison nonmutation. Same-session three-level saved comparison and every baseline switch are checked for both kinds, with wrong target/kind and explicit-route negative controls. Legacy explicit rapid Lv1/powderLv3 checks retained. Nonbowgun12 weapons48 cases96 channels match previous output exactly. Original bridge source occurs byte-identically twice in bundle.

Limits: normalUp/rapidUp and broader skill combinations are not exhaustively exercised. Full suites are unrun. HBG normal/shot16 and elemental5 pass. Old LBG explicit UI tests have3 failures/2 passes both here and in preserved58bf; those existing failures are not claimed fixed. Browser coverage is Chromium, not Safari/iOS. No new branch or publication.

Remaining Artia limit: nativeLv3 with a positive capacity-restoration bonus is rejected by ARTIA_CAPACITY_AMMO_SCOPE_PENDING in both standard sequence and legacy single-trigger paths. Ignoring capacity for the owner sequence does not silently bypass that existing evidence guard. Only the already adopted explicit baseLv2+powder route retains its prior exception.
