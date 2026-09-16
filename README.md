# DEV_MWWSKILLSIM OCR Step 1.25-A v6

Step 1.25-A v6 adds screenshot-relative equipment-row scale/pitch inference before later equipment-name OCR.

## Scope
- OCR the whole uploaded screenshot once with Japanese Tesseract PSM 11.
- Restrict structural detection to the left equipment column.
- Detect main weapon, sub weapon, five armor parts, charm, and mantle.
- Sub weapon and mantle are structurally detected but excluded from simulator reflection.
- Produce per-part regions for later equipment-name OCR.

## v6: screenshot-relative scale inference
- No fixed `198px` pitch is used.
- Every successfully recognized equipment label becomes a semantic Y anchor.
- Pairwise `dy / semantic-row-distance` values are combined with a median to estimate the screenshot's equipment pitch.
- Two anchors are sufficient; for example main weapon + sub weapon directly define the one-row distance.
- Three or more anchors improve robustness and allow outlier rejection through the fitted grid residual.
- Missing rows are placed from the fitted grid in both directions.
- X position is derived from the detected left-column anchors; width remains proportional to the screenshot (`22%`).
- Region height follows the inferred pitch, so different capture scales/resolutions are supported.
- The UI reports anchor count, inferred pitch, and pitch source.

## Label robustness
- Single-character noise such as `|` is excluded.
- Only observed UI OCR aliases are normalized (`腰防四`, `脚防思`, etc.).
- Short labels such as `頭` are not accepted as standalone structural evidence.

## Verification
- `node step125a.test.js`
- Inline JavaScript syntax is checked.
- Tests cover normal labels, noisy labels, observed aliases, frame-line noise, five-armor inference, two-anchor pitch inference, and non-adjacent semantic anchors.

## Next step
After v6 is validated on both a high-resolution screenshot and a smaller/differently scaled screenshot, proceed to Step 1.25-B: per-region equipment-name OCR and part-restricted MHDB candidate search.
