# r205 — Build defense skill level guard

- Normalize the later `skillLevel` definition to numeric finite values to avoid returning strings or NaN from malformed imported/custom skill data.
- Validate defense skill levels as positive integers, capped at Lv7, before applying flat and multiplicative defense effects. Fractional values no longer incorrectly receive defense multipliers.
- Regression coverage: `tests/r205-defense-skill-level.test.cjs` (6 tests).
- Full suite: 526 passed, 0 failed.
- No changes to weapon motion values, saved-build format, or future development ideas SPEC.
- iPhone manual verification pending.
