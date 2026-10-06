# Technique DB Expansion Phase 3 — r49

Based on r48. Project baseline remains Ver.1.042.00.02.

| Weapon | r48 | r49 | Added |
|---|---:|---:|---:|
| Switch Axe | 4 | 42 | 38 |
| Charge Blade | 6 | 35 | 29 |
| Insect Glaive | 4 | 37 | 33 |
| Gunlance | 4 | 50 | 46 |
| Bow | 3 | 35 | 32 |
| Light Bowgun | 1 | 31 | 30 |
| Heavy Bowgun | 1 | 31 | 30 |
| Other 7 weapons | 261 | 261 | 0 |
| Total | 284 | 522 | 238 |

All 14 referenced source scopes are now catalogued. This means the selected authors' motion/ammo tables have been registered, including their missing/conflicting entries. It does **not** mean every technique/state variant in the game is verified, or Technique DB COMPLETE. All complete flags remain false. All 238 additions stay EVIDENCE_GATED. No new moves are promoted into the combo picker.

## Numerical ownership

Source facts, per-hit data, historical alternatives, fixed/bracketed coefficients, and variable-hit source values remain inside Technique DB. Normal Charge Blade body hit arrays have been removed from handler metadata; its calculations already read the canonical DB. Special axe-boost/phial mechanics remain handler metadata as specified by r46.

Bowgun's existing normal/pierce/spread source-inspection API now obtains motion values and supplied hit counts from canonical DB records. Its maximum-pierce-hit numbers remain the earlier adopted comparison policy, not a claim of measured source counts. This source-inspection adapter does not bypass the ammo calculation evidence guard. Existing pierce inspection remains 86.4 effective MV for level 3 under that policy.

## State and component handling

- Switch Axe discharges expand all source ticks, retaining element .7 and part .1 where supplied. Focus morph attacks with blank source values stay unresolved. Phial/amped component interpretation is pending rather than inferred.
- Charge Blade source lacks a part-modifier column, so added records omit that field. Weak/return slash and SAED table/history discrepancies are retained. The source's axe-boost value14 differs from the existing independent evidence value12; the new source identity remains blocked. Existing discharge I/II values53 and35/58 were independently corroborated at KUROYONHON; they are not replaced by Macaron history51 and25/58.
- Insect Glaive's supplied part-modifier cells are blank, so new records omit them. Charge-specific descending/spiral values include documented state multipliers. Spiral body and kinsect contributions remain separate; no kinsect damage is silently added to STANDARD. Mixed mounted sequences and Focus Thrust remain unresolved where element/component values are missing.
- Gunlance ordinary body hits are distinct from shelling, Wyvern Fire, stake ticks and explosions. Parenthesized/unparenthesized source values are retained without guessing their final formula/event interpretation. Blank low-power Long/Wide rows remain explicitly missing.
- Bow charge/guided/airborne variants retain supplied arrow counts and per-arrow element modifiers. Variable piercers have no assumed hit count. Arc explosions and lingering bursts retain special source coefficients, not fabricated normal MVs. Coating/range/current-version audits remain separate.
- Bowguns use the shared ammo table. Most weapon/ammo applicability remains UNVERIFIED because a common table does not establish which weapon can execute each action. The four jump actions explicitly labeled Light/Heavy in the source retain that explicit scope. Normal/spread counts are supplied by the source; pierce/dragon counts remain variable. Element coefficients absent from the source are not invented. Sticky table/history explosion conflicts stay unresolved.

## Important readiness change

**Insect Glaive STANDARD now fails closed**, in addition to the Dual Blades gate introduced in r48. Its earlier aggregate-hit entries and several element modifiers were not validated at hit/state level. The original numerical records remain archived; audit revision2 records source alternatives and blockers. Independent current-source rows specify .8 element for three-color movement/spiral body, while the earlier entries used1. The old aggregate descending value100 also lacks the supplied six-hit/state mapping.

Availability checks return EVIDENCE_GATED; calculation reads reject these records. User-confirmed six spiral body hits remain preserved in the historical record; source disagreement is recorded rather than used to silently change them to five. This release does not choose a replacement STANDARD route/value.

## Sources

Retrieved 2026-10-06 Japan time, author measurement sources:

- https://macarongamemo.com/entry/mhwilds-switch_axe-motion
- https://macarongamemo.com/entry/mhwilds-charge_blade-motion
- https://macarongamemo.com/entry/mhwilds-insect_glaive-motion
- https://macarongamemo.com/entry/mhwilds-gunlance-motion
- https://macarongamemo.com/entry/mhwilds-bow-motion
- https://macarongamemo.com/entry/mhwilds-bowgun-bullets
- https://kuroyonhon.com/mhwilds/memo/12.php (Charge Blade corroboration)
- https://kuroyonhon.com/mhwilds/memo/13.php (Insect Glaive charge/body/kinsect mapping)

Dedicated Macaron LBG/HBG motion-page URLs could not be retrieved; the shared ammo page is the actual source used. Source registry records that limited scope. These sources are not official numeric specifications. Official baseline patch audit is still pending.

## Validation and review

Run `node --test tests/*.test.cjs` from this package directory.

30 tests pass, none skipped. Five embedded engine Self Tests pass. Tests validate all475 added records' rejected reads, multi-hit/component mappings, absent fields, immutable inherited data, source-view compatibility, canonical ownership, and all inline JavaScript syntax. Existing unaffected generic STANDARD NORMAL/MAX outputs match original r46 golden fixtures. Dual Blades and Insect Glaive are explicitly expected to be gated.

Review found no remaining critical/important issue. Browser layout/interaction testing remains incomplete because a browser executable was unavailable. Root single-file `index.html` deployment is retained.

## Next phase

Prioritize source-conflict resolution, official baseline patch audit, and hit/state/component validation for the STANDARD routes. Registering facts and verifying calculation readiness are separate gates. Combo timing and special formula/event evidence are still required before claiming DPS or Build Comparison READY.
