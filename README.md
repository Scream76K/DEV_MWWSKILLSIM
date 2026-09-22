# MH Wilds OCR Step 1.25-C v4.3.6

v4.3.6 is a focused coordinate-system correction from v4.3.5.

- Detection coordinates are based on the actual ImageData/canvas pixel dimensions from `naturalWidth` / `naturalHeight`.
- CSS/display dimensions are not used by the icon detector.
- Core search is physically restricted to the leftmost 15% of the actual image width.
- The v4.3.2 fixed core-size baseline (20–45 px) is restored; no `uiScale` expansion is used.
- v4.3.5 vertical Grid/RANSAC validation remains unchanged as the safety gate.
- DB template matching remains 0; DB icons are geometry calibration only.
- If a 9-row vertical grid is not established, no equipment rows are generated and OCR is not enabled.

The UI reports the detector scene dimensions and search width so coordinate-space mismatches can be diagnosed directly.
