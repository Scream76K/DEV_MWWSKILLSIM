# C04/C05: excluded skills and partial skill calculation

This change is based on the preserved integration at `a772e58af777bf4702237b22d4bdf39ed3d2bd99` (product identical to `5fd0882`). It changes no skill coefficient, technique record, equipment record, saved-build schema, or adapter input guard. See [spec/CURRENT_CONTRACTS.md](../../../spec/CURRENT_CONTRACTS.md) C04/C05 for the user decisions.

## Separate dispositions

- `skill-calculation-policy.js` is the single executable owner-exclusion registry. The existing six IDs (8, 85, 103, 129, 138, 160), names, rank limits, APIs, and annotations are preserved. Equipment and saves are not stripped.
- ID163 remains a separate **standard-comparison-only** boundary. Its original behavior is preserved, not promoted to a seventh global exclusion or new approved scope.
- Existing source-backed non-HP effects and excluded extra components remain in their existing policies. They are not reclassified as unsupported skills.
- `IGNORED_UNSUPPORTED_EFFECT` means this source-valid skill could not coexist in the retained subset for this channel. The reported reason belongs to that trial combination; it is not proof that the skill alone caused the failure.
- `PARTIALLY_APPLIED_UNSUPPORTED_COMPONENTS` means the existing GL162 body affinity is retained, while its unimplemented shell interaction is omitted. Component provenance is recorded explicitly.

## Calculation contract

The public calculation and saved-comparison entry evaluates the original input first. An already available normal or maximum channel is returned unchanged, including its detailed JSON. Only unavailable channels enter continuation.

Each trial is rebuilt from the captured pre-skill weapon/equipment basis and evaluated through the unchanged strict adapter. Skills are never applied on top of a previous trial's modified stats. The user's equipment, displayed skills, saved snapshots, and DB objects are not changed. Omitting ID133 from a trial also removes its resistance-side contribution without rereading it from global armor state.

The deterministic priority is existing adopted body effects (currently152/162), then source ID/name. Deferred dependencies are retried after a productive pass. Results are cached and evaluation calls are bounded by `1 + 2*n*(n+1)`. This is a computable subset, not an exhaustive maximum-damage or maximum-cardinality search. Unknown effects and their interactions are absent. The numeric result is not a lower bound or a complete skill result.

An invalid no-skill equipment/technique/resource baseline is not replaced by invented values. Source identity/rank, input shape, technique, resource, and adapter checks remain in force. Skills needing one another to establish a valid zero-skill baseline remain a coverage limit, not a claim of universal combination support.

## Existing body-effect protection

A real counterexample showed that source-ID-only order could retain Airborne86 while discarding already-adopted152/162 effects. A regression now gives existing body effects priority and records the combination nature of the reason.

For standard GL's exact four-technique target only, a source-valid162 trial may finish every event and calculate all body components while four shell components remain explicitly `GL_TARGET:UNREVIEWED_MODIFIER:<162 name>`. The continuation keeps those strict-trial physical/element components and obtains only those unsupported shell components from the fully calculable subset.

This requires complete execution, no issues/unresolved effects, identical event order and final state, identical ordered component provenance (including event ID), nonempty source fields, unique component identities, and finite values/sum. Health-branch or composite-route diagnostics are not merged. Missing coefficients, other failures, partial execution, state changes, or uncertain provenance do not enter this path. It does not alter or weaken the adapter's GL/CB predicates.

The result records each component's origin, the body-only effect plan, and the omitted component's calculation context. Old top-level/route failure reasons are cleared only on recovery; failed channels retain their own status. DPS is not derived for mixed partial-skill components.

## Reproducible verification

Private fixture inputs are required for DOM/browser checks. They are not copied into this deliverable. Their hashes are recorded in the catalog scan manifests. Use Node24 and the repository's declared jsdom/Playwright versions.

- `node tools/integration-regression/run.cjs`: original1490 assertions plus10 new continuation/policy assertions. Historical branch manifests/assertions remain unchanged. The current integration manifest includes the new modules and tests and preserves the mainline CI correction.
- `npm test`: the existing123 failure names remain unchanged; this is not a fully green legacy suite.
- `node tools/skill-continuation-public.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT`: 14 weapons ×4 skill/rank probes, source-rank rejection, UI disclosure and snapshot preservation. These input-mapping probes are not complete legal builds.
- `node tools/skill-continuation-equipment-smoke.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT`: original14 real five-armor snapshots, public calculate button, state preservation and timings.
- `node tools/skill-continuation-saved-comparison.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT`: distinct real GL1151/319, save/compare/JSON export/load. Repeat with `MHW_BODY_CASE=1` for152/162/Airborne interaction.
- `node tools/skill-continuation-partial-save-all14.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT`:14 weapons, two distinct real armor builds per weapon, partial172 results, UI omissions, save/load/compare and original-state preservation. The independent result is retained in `partial-save-all14.json`.
- `node tools/skill-continuation-browser-partbreaker.cjs PRODUCT_ROOT OUTPUT_DIR PRIVATE_FIXTURE_ROOT`: Chromium14 weapons ×3 Partbreaker levels, calculate/save/load/compare.
- `node tools/skill-continuation-browser-partial-save-all14.cjs PRODUCT_ROOT OUTPUT_DIR PRIVATE_FIXTURE_ROOT`: Chromium14 weapons, two distinct real armor builds each, omitted172 disclosure, save/load/compare, and390/1440-width checks forGL/SA/CB.
- `node tools/skill-continuation-body-regression.cjs CANDIDATE_ROOT BASELINE_ROOT PRIVATE_FIXTURE_ROOT`: 12 real GL equipment cases/24 channels, exact body-component, execution and final-state comparison against the preserved baseline.
- `node tools/skill-continuation-catalog-scan.cjs PRODUCT_ROOT PRIVATE_FIXTURE_ROOT OUTPUT_DIR`: all179 source skills/all442 valid ranks ×14 representative weapons. `HALF=first` and `HALF=second` partition the weapons into two disjoint groups. Both groups are required for complete coverage. Manifests verify product and module hashes before/after.

The fresh matching-product baseline had144 unavailable channels; all144 now calculate with omissions disclosed. All12232 previously available numeric channel values remain exactly unchanged. See `catalog-summary.json`, `unsupported-effects.json`, and `UNSUPPORTED_EFFECTS.md` for the complete scope and distinctions.

The catalog matrix does not cover every weapon record, every legal equipment combination, every activation/target/motion permutation, or game-measured numeric accuracy. A complete rank scan must not be represented as those broader claims.

## Known pre-existing difference

After saved comparison, diagnostic `conditionKey` and `comparisonContext.damage/dps` can retain the last compared build's display-input metadata. This reproduces on the preserved baseline. Current snapshot, conditions, saved map, and channel outputs remain identical in the tested flows. This change does not claim to fix that separate metadata restoration issue.

## Independent review

The reviewed product hashes and final execution results are in `verification.json`. Review covered supported+unsupported skill mixtures, ID133/152/162 real armor, original-channel exact preservation, the GL priority counterexample, component provenance/state rejection, distinct-weapon saved comparison and report JSON. The CB adapter and strict input guards are unchanged. No new branch, shared-worktree edit, push, or publication was part of this work.
