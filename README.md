# DEV_MWWSKILLSIM OCR Step 1.24

Step 1.24 fixes the DB-candidate evidence aggregation used after OCR.

## Changes
- Average character score uses **all OCR passes that ranked the candidate #1**.
- Average OCR confidence uses the same supporting OCR passes.
- Top-3 rows are still retained for candidate discovery, but rank-2/3 appearances do not contaminate the candidate's supporting averages.
- Support bonus is calculated from the actual `support / total` pair and is included in the final score.
- Final score, displayed score, support bonus, and evidence averages all use the same summarized evidence.
- OCR↔OCR raw-string agreement remains informational only and is not used for final candidate selection.
- Page title, heading, and README are all marked Step 1.24.

## Support bonus
- 1/1: +4pt
- 2/2: +8pt
- 2/3: +6pt
- 3/3: +12pt
- 4/4: +12pt
- 5/6: +10pt
- 6/6: +12pt

## Verification
`step124.test.js` is retained as the regression test file for the candidate-score contract; it now includes Step 1.24 aggregation tests.
