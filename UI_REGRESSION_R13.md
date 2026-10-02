# UI Regression r13

- OCR candidate radio checked state is rendered from the current `row.best`.
- First/current candidate remains visibly checked when internally selected.
- `どれでもない` remains in the same radio group and uses the same selected visualization.
- iOS Safari receives explicit native radio appearance and accent color.
- Candidate-selection logic is unchanged from r12; this patch repairs visual/state rendering.
- Regression requirement: internal selected state and visible checked state are separate checks.
