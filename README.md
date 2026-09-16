# DEV_MWWSKILLSIM OCR Step 1.25-A v3

Step 1.25-A adds automatic screen-structure detection before equipment OCR, with stricter OCR-label filtering and bounded region geometry.

## Scope
- OCR the whole uploaded screenshot once with Japanese Tesseract PSM 11.
- Extract OCR lines and their bounding boxes.
- Detect the main weapon, sub weapon, five armor parts, charm, and mantle from the left equipment column.
- The sub weapon and mantle are structurally detected but excluded from simulator reflection.
- Produce generous per-part regions; later steps can tighten them for name OCR.
- Existing weapon DB candidate scoring and the existing manual main-weapon crop flow are not changed by this step.

## Important behavior
- No fixed camera framing is required by the detector.
- Missing labels are reported instead of inventing an equipment region.
- Label matching tolerates spaces and common OCR punctuation differences.
- Single-character OCR noise such as `|` is excluded from label matching.
- Only OCR boxes starting in the left 25% are considered; full-width/frame-line noise is rejected.
- Per-part regions use approximately 22% of screen width to match the equipment-card column.
- Label matching uses full labels plus constrained 3-character OCR corruption handling (e.g. 腰防四 / 脚防思).
- Main weapon, sub weapon, armor, charm, and mantle regions are ordered by screen position.

## Verification
- `node step125a.test.js`
- JavaScript syntax checked for every inline `<script>` block.
- The test covers normal labels, noisy/split labels, sub-weapon exclusion, valid region geometry, and OCR-line extraction.
