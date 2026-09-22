MH Wilds OCR Step 1.25-C v4.2.8
- DB template matching is not used for icon discovery.
- Icon discovery remains limited to the left 12% of the source image.
- Diagnostic canvas is displayed with the same aspect ratio/width scaling as the source image.
- Row-chain scoring no longer rewards a uniformly spaced false chain too strongly; it uses candidate image score and the verified structural transition from upper rows to armor rows without hard-coded absolute coordinates.
- OCR geometry remains the existing icon-right / anchor-center-Y / H=iconH / W=7x iconW rule.
