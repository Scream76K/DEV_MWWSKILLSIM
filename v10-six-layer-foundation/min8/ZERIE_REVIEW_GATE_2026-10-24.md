# V10 Six-Layer Architecture — Zeerie review gate (2026-10-24)

## Fixed review target
- branch: `flamme/v10-six-layer-foundation`
- reviewed head: `6f6b5f784f02efeadac908469a2c4679a8874c50` (this review document is a subsequent docs-only commit)
- successful GitHub Actions: https://github.com/Scream76K/DEV_MWWSKILLSIM/actions/runs/40053909077
- scope: `v10-six-layer-foundation/min8/`, plus `v10-six-layer-foundation/core.cjs` (L1/L2 min2 dependency).
- product `index.html` unchanged. This is a standalone structural engine, not a product integration.

## Evidence supported by actual test execution
The GitHub Actions workflow reported **success** for both the min8 Node suite and min2/min3 regressions. Do not present these checks as validation of the production game DB, the actual browser, game formulas, or 14 weapon handlers.

Relevant implementations:
- `pipeline.cjs` — single public entry point, L1/L2 adaptation, comparisons
- `engine.cjs` — event plan, event-time conditions, effect application, channel execution and sole L5 aggregate
- `immutable-provider.cjs` — detached copy of a captured DB view
- `live-mutation-isolation.test.cjs`, `provider-pipeline-integration.test.cjs`, `nested-state-contract.test.cjs`, `nested-condition.test.cjs`, `session-seal.test.cjs`

## Questions requiring independent structural assessment
1. **Data read-view contract**. The provider copies a single `capture(versions)` result. It prevents post-capture source mutations from affecting A/B results (test-backed), but cannot prove `capture` itself read an atomic upstream image. Must the eventual production adapter use an immutable published DB bundle, transactional read, or explicit epoch verification? Identify what must be enforced at this interface before real DB integration.
2. **State event ownership**. Consume and transition events carry DB-owned values; the common engine validates resulting state. Check whether `resourcePath` / `operations` together with the handler return contract are sufficient for 14 weapon families without moving DB quantities back into handlers. Review handling of partial/failed steps and atomic updates.
3. **Effect ownership and units**. L3 validates effect specification; L4 applies ordered event-time effects and records trace; formula receives prepared input. Check unit contract (true attack vs displayed element; dimensionless multiply, additive units), undefined states, and whether formulas can introduce redundant generic effects.
4. **Comparison semantic identity**. L6 compares metric-level damage vs DPS contexts, excluding cosmetic signature and including duration only for DPS. Confirm all calculation-relevant inputs and resolved target/technique revisions are represented; inspect consequences of differing evaluation conditions (normal/maximum) and A/B failure.
5. **Completeness and provenance**. L5 uses event IDs and order; unresolved/incomplete work cannot become valid zero. Validate coverage of confirmed inactive, unknown, explicit no-op, missing formula, and read failures.

## What is NOT a reason to reject this gate
The absence of game-specific formulas, concrete 14 weapon handlers, real MHDB/Technique DB records, browser wiring or UI screenshots, and finalized game rounding.

## Decision requested
Please return: `ACCEPT_STRUCTURE`, `ACCEPT_WITH_SPECIFIC_GATES`, or `REJECT_STRUCTURE`, each issue tied to file/function and an acceptance test. Do not infer production integration from the CI result.

No PR/merge to develop/main without a separate approval.
