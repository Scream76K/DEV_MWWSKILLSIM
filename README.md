# DEV_MWWSKILLSIM OCR Step 1.9

Step 1.9 is a controlled experiment based on Step 1.8.

Changes:
- OCR name-region default vertical position: ny 38% -> 40% where applicable.
- Add 20px left/right and 10px top/bottom white padding to the final OCR canvas.
- Restrict OCR whitelist so ordinary English lowercase a-z are not deliberately allowed.
- Keep the existing character-confidence, OCR↔OCR consensus, dictionary matching, and early-exit logic.
- Do not increase the maximum OCR pass count.

Purpose:
Test whether boundary noise and a slightly misaligned vertical crop are causing the low raw OCR confidence.

Please compare with the same test image:
1. raw OCR strings
2. overall OCR confidence
3. character confidence
4. DB similarity / row score
5. OCR↔OCR consistency
6. OCR count and elapsed time
7. auto-confirm / hold

This is development-only. Do not use the beta repository.
