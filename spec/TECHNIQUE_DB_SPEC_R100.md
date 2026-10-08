# r100 Health-State Branch Comparison

## Change

Previously, a valid Dark Arts build with Peak Performance kept its maximum index pending. The fixed STANDARD comparison now evaluates two mutually exclusive health states for the six already-adopted non-GS profiles (long sword, sword and shield, dual blades, hammer, lance, switch axe).

- Full health: Peak Performance remains; Resentment and Dark Arts body effect are removed from the candidate calculation.
- Recoverable damage: Dark Arts body effect and Resentment remain; Peak Performance is removed.

Both candidates use the same full fixed route, target and sharpness conditions and maximum affinity policy. The selected maximum is the larger whole-route comparisonPower; physical and elemental maxima are never cherry-picked from different states. Exact ties select full health deterministically. Normal comparison remains the original unboosted-normal reference.

`standardPowerForStatsSingleHealth` preserves the existing source-based computation. The public `standardPowerForStats` wrapper performs state separation only when the original metadata and normal profile are ready and a positive integer Peak Performance level is present. Candidate inputs are cloned; stored equipment, skill totals and active effects are not mutated. The maximum result includes `healthBranchComparison` with both plans, reasons, components, totals and selected state.

## Fail closed

If either candidate is unresolved or has a nonfinite/negative total, the maximum stays pending even if the other candidate calculates. Uncertain elemental multiplier stacking, Burst/Absorption interactions, missing element components, unsupported conditional skills and separate Dark weapon skill continue to gate results. Invalid/duplicate series metadata, higher series rank, GS wave and dedicated-handler weapons are not unlocked.

Absolute one-hit HP and combo DPS with Dark Arts remain gated. This is fixed STANDARD relative-power reference logic, not time-averaged DPS, live-game verification, elemental cap adoption or a claim that all conditional effects can coexist.

## UI and evidence

Comparison displays full-health and red-health candidate totals and the selected state, with an explicit whole-combo explanation. The existing Dark Arts and generic condition notices describe the state separation. Comparison column sizing and wrapping are unchanged. JSON exports carry the same branch trace and release r100; all four release exports and the badge are synchronized.

No source numbers were changed. Source policies inherited from r99: https://kuroyonhon.com/mhwilds/program/skill.php for Dark Arts and the existing MHDB/source-confirmed conditional attack policies for Peak Performance/Resentment. Existing 1.042.00.02 baseline label remains; source adoption is not live-version verification.

## Validation

Fresh suite: 127 unit, 191 DOM, 27 Chromium tests. New DOM coverage proves both state winners, no illegal physical/element mixing, immutability, uncertainty retention, six-profile adoption and UI state explanation. Browser uses MHDB-shaped actual series aggregation and saved comparison builds with Peak Performance and Resentment, checks selected-state export and mobile widths 320/390/768. Independent review found no important issue. No new iPhone Safari or game capture has been requested.
