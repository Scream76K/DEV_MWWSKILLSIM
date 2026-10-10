# r200 — Comparison restoration guard

- Comparing saved builds must restore the original build and comparison conditions before displaying results.
- Even when restoring the original build fails, comparison conditions are restored via nested `finally`.
- Failure of original-build restoration produces an explicit user-facing warning; it is not silently treated as a successful comparison.
- Three targeted regression tests cover success, comparison failure, and original-build restoration failure.
- Future ideas spec retained; no future-ideas features activated.
