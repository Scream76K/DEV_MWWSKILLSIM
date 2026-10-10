# r160 — Verified calculation result capture

- Added `gunlance-result-capture.js` to retain A/B verified generic damage snapshots without inventing evidence.
- Snapshots are validated before storing, invalid updates preserve prior snapshots.
- A/B comparison requires identical context IDs and complete verified duration, hit and damage evidence.
- Added five regression tests; full suite 284/284 passing.
- Pending: emitting validated snapshots automatically from the actual equipment/skill calculator and user-facing capture buttons. This release provides the capture API only.
