# DEV_MWWSKILLSIM OCR Step 1.25-A v5

Step 1.25-A v5 adds structural inference, observed OCR aliases, and bounded region geometry before equipment OCR.

## Scope
- OCR the whole uploaded screenshot once with Japanese Tesseract PSM 11.
- Extract OCR lines and their bounding boxes.
- Detect the main weapon, sub weapon, five armor parts, charm, and mantle from the left equipment column.
- The sub weapon and mantle are structurally detected but excluded from simulator reflection.
- Produce generous per-part regions; later steps can tighten them for name OCR.
- Existing weapon DB candidate scoring and the existing manual main-weapon crop flow are not changed by this step.

## Important behavior
- No fixed camera framing is required by the detector.
- Missing labels are inferred only when the five armor anchors form a stable vertical grid; inferred rows are explicitly marked.
- Label matching tolerates spaces and common OCR punctuation differences.
- Single-character OCR noise such as `|` is excluded from label matching.
- Only OCR boxes starting in the left 25% are considered; full-width/frame-line noise is rejected.
- Per-part regions use approximately 22% of screen width to match the equipment-card column.
- Known UI OCR aliases such as `腰防四` / `脚防思` are canonicalized to the corresponding armor labels without globally replacing characters.
- Main weapon, sub weapon, armor, charm, and mantle regions are ordered by screen position.

## Verification
- `node step125a.test.js`
- JavaScript syntax checked for every inline `<script>` block.
- The test covers normal labels, noisy/split labels, sub-weapon exclusion, valid region geometry, and OCR-line extraction.


## v4 structural inference
- When all five armor labels are found on a stable vertical pitch, the detector infers missing main/sub/charm/mantle rows from that grid.
- Inferred rows are marked as `構造推定`; they are regions only and are not treated as OCR-confirmed names.
- Sub weapon and mantle remain excluded from simulator reflection.

## v5 changes
- Five-armour vertical pitch is treated as the structural anchor when main/sub/charm/mantle labels are missing.
- OCR-detected labels expose canonical label text, match confidence, and source type (`ocr` or `inferred`).
- The detector never uses one-character labels such as `頭` or `|` as standalone structural evidence.
- Raw OCR confidence is preserved separately from structural label matching; a raw confidence of 0 does not discard an otherwise structurally valid armor anchor.
