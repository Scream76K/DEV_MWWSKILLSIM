# DEV_MWWSKILLSIM OCR Step 1.17

DB candidate integration score display/aggregation fix.

- OCR processing remains unchanged.
- `平均文字評価` is now the true arithmetic mean across every OCR pass that selected the candidate as its #1 DB candidate.
- `最高文字評価` remains the maximum #1-candidate character score.
- If a candidate has no #1 support rows, the average falls back to its available candidate evidence rows.
- Strong multi-OCR convergence can still auto-confirm even when one OCR pass is poor; the strong average threshold is 55 points plus support/best-score requirements.
- Candidate margin is still `1st final score - 2nd final score` in percentage points; no second candidate is displayed as `—`.
- OCR-to-OCR agreement is not used for final decision.
