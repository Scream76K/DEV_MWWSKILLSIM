# r141 — regression fixtures canonicalization

- Moved the two existing JSON goldens to `tests/fixtures/`, matching the published GitHub layout.
- Updated three consumers (`tests/r46-regression.test.cjs`, `tools/legacy-mapping-dom.test.cjs`, `tools/legacy-combo-migration-dom.test.cjs`) to use the canonical paths.
- Removed duplicate JSON files from `tests/` root to prevent conflicting copies.
- Added regression checks for canonical fixture paths and valid JSON.
- **No changes** to Technique DB, combat calculations, combo DPS, or UI; actual unnormalized firepower values remain authoritative.
- No previously unverified gameplay data has been promoted.
