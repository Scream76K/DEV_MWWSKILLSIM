# r190 — Target identity / state audit hardening

- Adds optional exact monster part ID, part-state and monster-state comparisons to read-only target audit.
- Rejects inconsistent labels even when physical/elemental hitzones match.
- Preserves legacy contexts without these fields and never upgrades unverified damage/DPS.
- Maximum sharpness only; no depletion modeling.
