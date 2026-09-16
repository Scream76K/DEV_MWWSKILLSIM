# DEV_MWWSKILLSIM OCR Step 1.25-A

Step 1.25-A adds automatic screen-structure detection before equipment OCR, with stricter OCR-label filtering and bounded region geometry.

## Scope
- OCR the whole uploaded screenshot once with Japanese Tesseract PSM 11.
- Extract OCR lines and their bounding boxes.
- Detect the main weapon, sub weapon, five armor parts, and charm from labels.
- The sub weapon is detected only as a boundary/reference and is excluded from the equipment-recognition target.
- Produce generous per-part regions; later steps can tighten them for name OCR.
- Existing weapon DB candidate scoring and the existing manual main-weapon crop flow are not changed by this step.

## Important behavior
- No fixed camera framing is required by the detector.
- Missing labels are reported instead of inventing an equipment region.
- Label matching tolerates spaces and common OCR punctuation differences.
- Single-character OCR noise such as `|` is excluded from label matching.
- Per-part regions are capped to 65% of screen width to prevent full-screen OCR noise from expanding crops.
- Main weapon and armor regions are ordered by screen position.

## Verification
- `node step125a.test.js`
- JavaScript syntax checked for every inline `<script>` block.
- The test covers normal labels, noisy/split labels, sub-weapon exclusion, valid region geometry, and OCR-line extraction.
