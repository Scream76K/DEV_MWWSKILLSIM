# Repair legacy conversion checks

Base c8e67c0. Test-only repair requested after documented baseline failures. Preserve all positive coefficient/cap inputs, save/load comparison and negative cases. No product change is planned.

1. Add a wrapper requiring completed standard/manual thunder and LS/Bow water reports; observe original assertion failures.
2. Thunder: assert actual STANDARD selection, normal inactive and maximum active, plus explicit selected charged technique both-channel effects. Match components by ID; verify each flat once, cap and physical invariance.
3. Water: retain positive low/capped arithmetic, strict invalid/outside rejection, and assert negative resistance is disclosed as partial181 while supported components match the same build without181. Ensure Bow is reached.
4. Verify tests reject mutations to effects, cap, disclosure or route. Separate actual product defects from stale expectations. Independent review, minimal contract registration, same-history save and bundle restoration. No new branch, CB or aggregate local execution, or GitHub update.

Alternatives rejected: reverting product to all-channel activation/whole-result failure violates existing condition/continuation contracts. Merely deleting assertions loses the original checks. Use route-specific stronger assertions instead.
