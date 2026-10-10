# r193 — Build power comparison route parity

- Fixed an inconsistency where the power index accepted two builds with missing STANDARD profile identifiers, even though DPS comparison already rejected them.
- Both power index and DPS ratio now require an explicitly matching weapon kind and STANDARD profile ID.
- Added regression tests for build-power changes and absent/mismatched route identities.
- No motion values, DPS formulas, skill effects or sharpness rules were changed.
