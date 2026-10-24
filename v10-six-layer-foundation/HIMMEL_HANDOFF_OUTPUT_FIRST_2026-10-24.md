# V10 six-layer handoff — output-first contract (2026-10-24)

Status: **handoff / not acceptance**. Branch: `flamme/v10-six-layer-foundation`. Owner instruction: **define each layer's expected output first, then choose the smallest input that proves it**. No bulk test generation, no game damage golden table. This document is the starting contract for Himmel's return on 2026-10-25.

## Non-negotiable objective
One public Pipeline, one authoritative Technique DB numeric source, independent normal/maximum and A/B, one L5 validity decision. The boundary review of `90b413f` is **ACCEPT_WITH_SPECIFIC_GATES** only, not release approval. Four boundary fixes are in the branch; **PASS of new public tests has not been verified**, so do not merge or mark Done.

## Layer output contracts (test the output, not arbitrary combinations)
| Layer | Expected output (contract) | Minimum proving input | Failure evidence |
| --- | --- | --- | --- |
| L1 Input | Canonical request with selected technique IDs in order, build, target, conditions, evaluation kind/duration; no technique numbers | One weapon, one technique, one target and evaluation | Missing technique/invalid schema rejects before calculation |
| L2 Build/state resolution | Known or explicitly unresolved attack, element, affinity, skills and weapon state; DB/game version & diagnostics preserved | One known equipment record + one skill and one unresolved field case | Missing value carries reason, never coerces to zero |
| L3 Effect plan | Ordered sourced effect operations with stage, unit, condition and channel; no direct damage | One active add + one inactive conditional effect | Wrong unit/unknown condition rejects that channel |
| L4 Technique/event plan + executor | Pinned Technique ID/revision; ordered hit/consume/transition events, component disposition, trusted next state and trace | One hit and one state-changing event with minimal state | Illegal mutation/duplicate path/overflow rolls back event; no invented numeric data |
| L5 Aggregate | Completion validity, independent component availability, unnormalized total/duration/DPS, explicit failure reason for each channel | One valid damage+duration case and same case with duration absent | Missing time invalidates DPS only; incomplete execution invalidates total and DPS |
| L6 Presentation/compare | Normal/max and A/B independently preserved, relative comparison A(normal)=100 only in relative view; original damage values unchanged, errors visible | Two same-weapon builds with one input difference; one invalid B | Failure of B or maximum never corrupts A or normal; saved/restored conditions unchanged |

The existing `min8/pipeline.cjs` remains the public entry (`evaluate`, `compare`); `engine.cjs` executes the pinned snapshot and the L5 aggregate. These contract descriptions are intended outputs, **not claims that all have passed**.

## Minimal acceptance sequence (fail fast)
1. **Boundary gate only**: `node --test v10-six-layer-foundation/min8/review-public-gates.test.cjs`. Source/branch SHA, Node version, pass/fail and first failing assertion must be recorded. This test is committed but not yet proven green.
2. Fix only the first failing boundary, then rerun that focused test. Four required review conditions: numeric/string index alias (including duplicates); exact immutable state (null/NaN/undefined and rollback); reordered-equivalent versions via public entry; per-operation post-damage overflow rejection.
3. **One output proof per L1–L6**: reuse `min8/pipeline.test.cjs`, `min8/engine.test.cjs` and existing evidence where they cover the same output. Add a test only where a contract lacks evidence; do not count tests as progress.
4. When boundary PASS is established, request Zerie re-review. Only after gate approval connect one representative real DB + real Handler path. Choose representative components for broad reuse (ordinary hit, state transition, special hit); avoid spending the entire cycle on CB.
5. One real UI sequence: build/template -> normal+max -> save A/B -> compare -> restore, verify original state and unnormalized values; additional weapon coverage follows only after common route proven.

## Precisely unresolved
- Public boundary tests not yet executed/reported as PASS. Existing min8 CI evidence was for `90b413f`, **before** boundary patch.
- Real Technique DB/14 weapon Handler/Formula connection and real browser E2E remain not proven.
- Do not conflate six-layer *structure acceptance*, per-handler functionality, β technical Done, PO Safari/iPhone UX acceptance or publication.
- Provider owns atomic snapshot retrieval; common conversion owns presentation/display stats; DB owns event structure, coefficients, revision and evidence; Handler cannot silently invent those.
- Separate historic `flamme/v10-development` contains CB-oriented exploratory patches in monolithic HTML; **do not overwrite** current develop/index.html with it. Audit/cherry-pick only warranted changes after six-layer boundary accepted.
- User-approved DoD 2026-10-19: validate *formulas, applicability, connections*, not large golden damage datasets. No automatic whole-suite reruns on each push.

## Returning engineer protocol — Himmel
1. Fetch branch HEAD and compare against review code `90b413f`; preserve all work, no force-push/reset/clean.
2. Run exactly the public boundary gate above; report first failure and fix only that issue.
3. Produce an L1–L6 **output evidence table**: contract, smallest input, observed output, source path, result, unresolved condition. Where a layer contract is insufficient, propose contract change before coding.
4. Hand reviewed structural gate to Zerie, then implement actual DB/provider and representative Handler with strict L2/L3/L4/L5 boundaries; do not duplicate normative numbers.
5. Push incremental feature commits, never merge develop/main or deploy without review/owner gate.

## Owners and controls
Himmel: primary implementation/integration after rate-limit release. Flamme: independent scope/contract/code support, not concurrent editing same main file. Zerie: architecture and technical gate review. Owner: product rules, Mac/iPhone UX and publication approval. Jira KAN-44/47/66/40 maintain β status independently; no premature Done.
