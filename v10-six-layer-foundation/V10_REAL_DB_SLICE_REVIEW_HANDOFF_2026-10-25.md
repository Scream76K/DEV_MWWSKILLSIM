# V10 real Technique DB first-slice handoff — 2026-10-25

## Status / decision
**READY_FOR_ZERIE_REVIEW_AND_HIMMEL_CONTINUATION** for an isolated *boundary prototype only*. **NOT ACCEPTED FUNCTIONALLY**, NOT game-damage verified, NOT beta Done, NOT eligible for develop/main merge or Pages deployment. Structural acceptance remains the separate historical decision at `62c74760b31ac7c932c815c5b26be1a1251b986c` and is not reopened.

Branch: `flamme/v10-real-db-element-gate`, starting from six-layer foundation `f39bf103a`. This work intentionally does **not** edit `index.html`.

## Evidence — native Node CI
Focused workflow `.github/workflows/v10-real-db-focused.yml`, run **40117917881**, SHA `9371bc4e031b7878adb46aed622bcb99f784207c`, Node 24.21.0 requested, **12 tests PASS, 0 FAIL**, on the four dedicated test files. [CI](https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/40117917881). This is boundary/integration test evidence; several tests intentionally use a spy formula and *contract-only reference fields*, **not actual damage values or authoritative monster/weapon source records**.

## What is actually implemented
1. `min8/real-technique-one-hit-adapter.cjs`: validates real Technique ID, revision, verification status, evidence and ordinary single-Hit MV, rejects unsupported special/state paths, records excluded element modifier under a zero-element proof gate.
2. `min8/real-one-hit-pipeline.cjs`: isolated public `evaluate` route using immutable-provider and min8 L1–L5; rejects unknown/nonzero element, nonempty skills/effects, mismatched weapon type. No production UI wiring.
3. `min8/sourced-physical-formula.cjs`: requires version-tagged and evidence-tagged sharpness, hitzone, part-modifier inputs, rejects unsupported affinity/skills and delegates arithmetic to an injected `calculate`. It **does not implement the game damage formula**.
4. `min8/real-canonical-boundary.test.cjs`: confirms real `HAM_SIDE_SWING` MV 23 is forwarded to an injected spy calculation and L5; missing duration blocks DPS; missing source blocks damage.

Representative source: `docs/reports/r250-stage5/evidence/technique/runtime-records.json` `db.hammer.HAM_SIDE_SWING` revision 2, VERIFIED, evidenceRef `MACARONGAMEMO_HAMMER_VER1011`, MV 23, elemental modifier 1, part modifier 1. The source JSON `spec.gameVersion` is 1.042.00.02.

## Review observations and limitations — do NOT conceal
- The real one-hit snapshot adapter creates an `elementContext` stating no active effects before L2/L3; L2/L3 subsequently fail closed for nonzero/unknown element, any skill and any effects. Zerie should assess whether this provisional ordering is acceptable or whether the zero-element disposition must be created only after independent per-build/per-channel proofs. No acceptance claimed.
- The test uses a **spy** `calculate: ({mv}) => ({p:mv})`; any value of 23 in its total is **not game damage**, only the continuity of MV through the boundary.
- The `sourced-physical-formula` checks existence/version of evidenceRef but cannot authenticate the reference itself. The hitzone, sharpness and part modifier are test stubs, not verified live data. Source-policy enforcement belongs to the production data provider.
- The existing production physical-damage evaluator is still embedded in monolithic `index.html`; it has **not** been wired to `canonicalPhysical.calculate`. No actual training-room hitzone or equipment's sourced max-sharpness has been supplied here.
- `sourced-physical-formula` supports only zero affinity, empty skills/effects, no elemental HP component and part modifier 1. Full implementation needs the established normal/maximum effect plan and sourced modifiers, not silent defaults.
- An upstream `source.capture` must be genuinely atomic or use a published immutable version bundle. `createImmutableProvider` cannot prove capture atomicity merely by cloning. The test's `source.capture` is a detached fixture.
- Readiness should not be confused with all 14 Handler integrations, actual saved build A/B restore or iPhone/Safari UX verification.

## Zerie: review request (small, one-pass)
1. Review only the new isolated delta from `f39bf103a` to this branch (no six-layer structural re-review). Focus on zero-element proof ordering, snapshot version consistency, source/authenticity, handling of unsupported statuses, L5 failure propagation and no numbers in handlers.
2. Classify ACCEPT_PROTOTYPE or RETURN_WITH_SPECIFIC_DEFECTS; do not grant technical Done or game-accuracy acceptance from 12 boundary tests.
3. If defects are found, list minimal concrete corrections in priority order; no generic architectural restart.

## Himmel: next integration slice
1. Keep this branch separate, fetch fresh HEAD and run only the existing four focused tests once. **Do not merge to develop/main**.
2. Bind the *existing production* per-hit physical evaluator through a shared Formula API (not by copying damage constants); validate its inputs/outputs and rounding policy.
3. Obtain sourced actual weapon's true attack/max sharpness and training-room hitzone for one **same-version** normal hit. Reject unresolved/version-inconsistent sources. For real part modifiers, explicitly preserve the DB source value and revision.
4. Show one `evaluate` output with real calculated physical damage + exact source trace, normal/maximum independent and DPS unavailable if duration unknown. Obtain technical review before adding stateful/special Hits.
5. Only then expand representative state change and special component and prove real saved A/B + restore. After that plan all 14 handlers.

## Owner / publication gate
Zerie: technical boundary review. Himmel: real formula/source-data connection. Flamme: targeted defect support. Owner: product/UI/Safari acceptance and merge/deploy approval.
