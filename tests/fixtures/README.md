# Canonical test fixtures (r141)

This directory is the single source for checked-in regression goldens.

- `r46-standard-golden.json`: baseline standard technique regression expectations.
- `r66-legacy-combo-golden.json`: legacy combo migration expectations.

These are **test expectations**, not official MHDB values or newly verified gameplay measurements. Do not promote their numbers into Technique DB without evidence.

Run `node --test tests/*.test.cjs` from repository root. Existing fixtures are preserved byte-for-byte from r140; only their paths changed.
