# Technique DB Expansion Phase 1 — r47

Baseline game version: **1.042.00.02** (project baseline; not a claim of latest release).
Source package: MHWilds_GitHub_Deploy_v7.2.2-technique-db-special-handlers-r46(1).zip.

## Result

| Weapon | r46 registered | r47 registered | Added |
|---|---:|---:|---:|
| Great Sword | 3 | 49 | 46 |
| Long Sword | 3 | 38 | 35 |
| Sword and Shield | 4 | 33 | 29 |
| Other 11 weapons | 37 | 37 | 0 |
| Total | 47 | 157 | 110 |

Counts include state variants and explicit unresolved identity records. They are not a count of verified, calculable techniques. `sourceCatalogued` means the referenced author's table was catalogued, not that every technique in the game was verified. All 14 `complete` flags remain false.

## Canonical boundary

All added numbers, per-hit modifiers, source conflicts, and change records live inside Technique DB. Combo/Profile/Handler receive no new numeric tables. The r46 baseline and r47 source expansion merge once at that boundary. Duplicate IDs and orphan history records cause startup errors rather than silent replacement.

The existing r46 STANDARD numerical records and routes are retained. Great Sword remains charged slash III → strong charged slash III → strong wide slash III. Sword and Shield remains 18 → 17 → 27 → 28.

`revisionHistory` stores documented historical changes and their source version, rather than overwriting existing values. The added history is a partial record of reviewed changes, not a complete version audit. Exact historical modifiers that were not documented are not invented.

## Separate source confirmation and readiness

- `numericStatus`: `SOURCE_CONFIRMED`, `SOURCE_CONFLICT`, or `MISSING`.
- `verificationStatus`: source-only additions are `PARTIALLY_VERIFIED`; conflict/missing records are `UNVERIFIED`.
- `calculationStatus`: every new record is `EVIDENCE_GATED`.
- `currentVersionAudit`: `PENDING`; official patch audit was not completed. The official update endpoint could not be retrieved in this run.
- `validFromVersion`: null for new source-only records. A page's update date is not evidence of a game version's effective date.
- `unresolvedReasons`: preserves source discrepancy, missing hit mapping, state/component uncertainty, and baseline audit blockers.

`TechniqueDBEngine.get()` exposes cataloguing evidence. `TechniqueDBEngine.hits()` refuses every new gated record. This release does not add these records to the combo picker, promote new STANDARD profiles, unlock special handlers, or claim Build Comparison READY.

## Reviewed source problems

Great Sword: charged slash II table/history mismatch; three offset rising slash rows and four jumping slash rows retain conflicting table/history values. Kick is bracketed fixed damage, not a fabricated normal MV. Falling thrust I/II and Focus Piercing Slash are blank; falling thrust III has incomplete hit/modifier mapping. These stay gated.

Long Sword: repeated Spirit Advancing Slash table entries map to one canonical identity. True multi-hit attacks are expanded individually, including the 15-hit Spirit Release and seven-hit Helm Breaker variants. Red Spirit Round Slash uses the separate change-section value; state-specific formula application remains pending.

Sword and Shield: shield attack and hard bash stun values disagree with change history. Non-just Perfect Rush hit/modifier grouping and variable falling-thrust hits remain unresolved. Shield element/sharpness rules are not inferred from a superficially populated table cell. Existing adopted downward/side slash values remain 18/17, despite the source's older table values.

## Evidence

Author measurements, retrieved on 2026-10-06 Japan time:

- Great Sword: https://macarongamemo.com/entry/mhwilds-great_sword-motion
- Long Sword: https://macarongamemo.com/entry/mhwilds-long_sword-motion
- Sword and Shield: https://macarongamemo.com/entry/mhwilds-sword_and_shield-motion

Source URLs, table/change-section locators, page update dates, and record-level evidence references are embedded in `TechniqueDBEngine.evidence`. These are author measurement sources, not official numeric specifications.

## Validation and review

Run from this package directory: `node --test tests/*.test.cjs`.

13 tests pass, with no skipped tests. They run five embedded engine Self Tests, parse all inline JavaScript, verify gated reads for all 110 additions, protect existing STANDARD hit immutability, and compare every generic STANDARD calculation under NORMAL/MAX against golden outputs executed from the original r46 package.

Review found shallow-frozen r46 hit objects could still be modified; traversal now freezes nested objects even when their parent was already frozen. Two inherited Self Test expectations were stale: Great Sword was still expected to be CANDIDATE, and the unchanged pierce ticks sum to 86.4 rather than 87.6. Only those expectations were corrected; handler formulas were not changed.

Browser layout/interaction testing was not completed because a browser executable was unavailable. No runtime dependencies were added. This ZIP retains single-file GitHub Pages deployment via `index.html`.

## Next work

Expand the remaining 11 weapons under the same record/readiness boundary, resolve the specific source conflicts above, and complete the official baseline patch audit before promoting added techniques into calculation. STANDARD and full Technique DB completion remain separate gates.
