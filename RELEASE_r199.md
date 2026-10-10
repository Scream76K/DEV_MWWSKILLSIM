# r199 — Missing saved-build comparison guard

- Abort comparison if any selected saved build is missing, null, or invalid.
- Avoid silently dropping a selected build and displaying a misleading partial comparison.
- Validate before taking or applying snapshots; no changes to combat formulas.
- Future ideas spec from r198 remains deferred.
