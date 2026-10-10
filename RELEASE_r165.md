# r165 — Verified A/B calculator transfer

- Added `gunlance-verified-transfer.js` and UI button to transfer calculator-attached verified evidence into A/B capture.
- Requires both rows to be gunlance, verified evidence origin, matching build names, same verified context, and valid verified components, hit counts, and durations.
- Staging validation rejects incomplete or mismatched pairs without overwriting existing captures.
- Reference DPS is never used to fabricate evidence or populate verified values.
- Existing calculator does not yet produce `verifiedCapture` automatically, so the button normally reports a pending status until verified evidence is integrated upstream.
