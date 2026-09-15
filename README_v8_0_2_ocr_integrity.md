# v8.0.2 OCR Integrity Build

## Purpose
This release is rebuilt from the known-working v7.8.0 OCR implementation instead of patching the broken v8.0.1 object.

## Structural safeguards
- ScreenshotImporter keeps the complete OCR method set in one object.
- A runtime integrity guard checks all required OCR methods before use.
- analyze() refuses to start if the integrity check fails.
- preprocess() and autoRecognize() are verified as methods, not free functions.
- The DB-constrained matching logic remains intact.
- Charm slot `防2-防1` behavior is inherited from v7.7.1+.

## Verification
The build was statically checked by extracting every JavaScript block from index.html and running Node syntax validation.
Required ScreenshotImporter methods were also enumerated and checked.
