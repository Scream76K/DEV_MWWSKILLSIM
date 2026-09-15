# v8.0.2

- Rebuilt OCR module from the known-working v7.8.0 base.
- Avoided patching v8.0.1 in place.
- Restored the complete `ScreenshotImporter` method set.
- Added an OCR module integrity guard for future regression detection.
- Added an analyze-time integrity gate.
- Preserved DB-constrained candidate matching and existing charm-slot fix.
- Kept development build isolated from `MHWSKILLSIM`.
