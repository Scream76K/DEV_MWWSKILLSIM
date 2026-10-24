# Himmel return — first real data connection (output-first)
2026-10-25 handoff. Structure gate **ACCEPT_STRUCTURE** (Zerie), validated at 62c7476 / CI run 40067583313. Do not rerun structural gate.

## First increment: single ordinary physical hit through real pinned Technique DB
**Expected output before choosing inputs:** public `evaluate` returns (1) one selected technique ID and revision in its trace, (2) exactly one emitted physical component with source, coefficient unit and damage unit from pinned DB, (3) normal/maximum separate, (4) available unnormalized comboTotalDamage if all required fields are known, (5) unavailable DPS with DURATION_UNAVAILABLE if duration is missing; no invented time. L5 is the only owner of final validity.

**Smallest real input:** one officially identified weapon from a non-CB weapon kind; one adopted Technique DB record with exactly one ordinary hit and existing revision/source; one real equipment snapshot with only required known true attack/element/affinity and weapon type; training target with valid known physical hitzone; no conditional skill/effect; no duration in first test. Preserve full required L1 schema (schemaVersion/build/target/conditions/evaluation), though minimization applies to content. Reuse one existing DB record; do not enter another MV into Handler, test fixture, or profile.

**Connection boundary:** Provider opens atomic snapshot and pins game/equipment/technique/effects versions; L2 resolves build; L3 returns empty sourced effect list; L4 resolves one DB event and delegates only applicable disposition to Handler, common formula owns damage mathematics; L5 emits total and DPS status; L6 reads values without recalculating. Real data adapter must not synthesize fields or coerce null/undefined to zero.

**Proof:** one public entry invocation, one output evidence row per layer (expected/observed/source/condition/result), and one follow-up with a real known duration only if evidence exists. Stop at first unexpected output; change one boundary, then rerun that single case. Do not use synthetic expected damage tables.

## Second increment: same output with one state transition
Use a real weapon technique with sourced consume/transition. Only add minimal state inputs necessary for that transition. Demonstrate validated expected state and atomic rollback on invalid operation; do not revisit already accepted artificial boundary tests.

## Third increment: real A/B & restore
Two real saved builds of same weapon/target/technique, one differing skill or equipment field. Use same public Pipeline, preserve separate normal/maximum, compare relative A-normal=100 only in relative field. Show save -> compare -> restore using actual product UI, with no mutable build leakage; missing duration invalidates DPS only.

## Deployment sequence
1. Representative ordinary hit from real DB and real Handler.
2. Representative sourced transition and special component. Avoid CB as sole representative.
3. Map each of 14 weapons to compatible common output contract and identify truly unique handler features; then connect incrementally.
4. Formal feature review and release gates separately; no develop/main merge or Pages publish without approval.

## Ownership
Himmel performs primary implementation/integration after return. Flamme supports contract reviews and root-cause analysis. Zerie maintains structural/technical acceptance; owner approves Safari/iPhone UX and publication. The historical CB exploratory branch `flamme/v10-development` is independent and must not overwrite current product HTML.
