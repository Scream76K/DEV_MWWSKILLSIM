# r204 — Build skill level validation

- Conditional maximum affinity skills now accept only positive integer levels and cap them to their supported maxima, preventing NaN from malformed saved/custom skill data.
- Element attack skills no longer promote fractional levels to Lv3 effects.
- Existing valid integer skill effects remain unchanged.
- New tests: `tests/r204-build-affinity-level-guard.test.cjs` (7 cases).
- Full suite: 520 passed, 0 failed (`node --test --test-concurrency=2 tests/*.test.cjs`).
- No changes to future ideas spec, damage motion values, or saved build schema.
- iPhone manual verification pending.
