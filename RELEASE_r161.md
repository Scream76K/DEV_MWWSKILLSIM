# r161 — Verified A/B capture controls

- Added `gunlance-capture-ui.js` and A/B registration, comparison, and clear controls to `index.html`.
- Only verified generic component JSON accepted; no automatic equipment extraction or verification.
- Invalid input cannot overwrite saved capture. State is in-memory only (not persisted across reload).
- 288/288 Node tests pass.
