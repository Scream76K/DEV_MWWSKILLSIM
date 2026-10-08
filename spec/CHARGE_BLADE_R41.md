# r41 Standard Profile Expansion
Baseline: Monster Hunter Wilds Ver.1.042.00.02

## Adopted in r41
- Long Sword STANDARD: red-gauge Red Blade I -> II -> III, hit-level profile.
  - 7 hits, total MV 185, elemental modifier sum 6.4.
  - Evidence: https://macarongamemo.com/entry/mhwilds-long_sword-motion
- Dual Blades STANDARD: Demon Mode, Demon Dance I -> II -> III represented by the current full Demon Dance hit sequence.
  - 27 hits, total MV 393, elemental modifier sum 23.2.
  - Evidence: https://macarongamemo.com/entry/mhwilds-dual_blades-motion

## Fail-Closed retained
- Great Sword STANDARD remains CANDIDATE. Current motion values are available, but the product STANDARD still does not specify charge levels for Charge Slash / Strong Charge Slash. Do not infer them.
  - Evidence: https://macarongamemo.com/entry/mhwilds-great_sword-motion

## Audit flag
- Sword & Shield source currently displays 19/18 for Downward Slash / Side Slash while its own Ver1.020 history says 19->18 and 18->17. Existing adopted 18/17 is retained pending authoritative/current-version reconciliation.
  - Evidence: https://macarongamemo.com/entry/mhwilds-sword_and_shield-motion

## Regression contract
- Long Sword is GenericWeaponHandler IMPLEMENTED.
- Dual Blades is GenericWeaponHandler IMPLEMENTED.
- Great Sword remains fail-closed / CANDIDATE.
- No special weapon falls through to GenericWeaponHandler.
