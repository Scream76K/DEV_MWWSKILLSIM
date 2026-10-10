# r197 — Saved armor preflight and comparison error handling

- Reject unknown saved armor IDs (head/chest/arms/waist/legs) before mutating the current build.
- Show comparison errors in the comparison output, while retaining the existing finally restoration of the active build and comparison conditions.
- Added four regression tests. npm test: 492 pass, 0 fail.
- Future charm-library/export/share features remain deferred; no schema migration introduced.
