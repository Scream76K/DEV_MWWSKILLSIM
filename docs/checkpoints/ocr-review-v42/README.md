# OCR review and charm slot-first implementation checkpoint

This is a dormant code-only integration checkpoint. It does not itself change the active GitHub application, deployment, calculations, or saved builds.

- Source baseline (existing draft branch `flamme/ui-unresolved-reason-display-20261104`): Git `20a8127c19a1d2d374b2c237afce7ab8171eb399`; `index.html` SHA-256 `b224a8e5db74390a3313d92abf02b1ba64d5377e19ee4b2f9f06d5c03e6fc69f`.
- Included: exact/compatible decoration confirmation, original-image equipment and decoration crops, compact review controls, bad-crop candidate guard, defined no-slot marker, clear STEP labels, and typed random charm slot inference, defaulting, defer, validation, and retention with compatible skill edits.
- Intentionally excluded: the sample-image/annotated-guide redesign and every sample photo, recording, user test fixture, preview address, deployment setting, and unrelated UI/calculation change. The draft branch retains its own existing OCR guide, fonts, and assets.
- Integration scope: `host.patch` touches the OCR script include, OCR import bridge and the charm editor's skill-change handling. `embedded.patch` touches only the decoded inline OCR script. `step-label.css` replaces one scoped style rule. `decoration-ocr-confirmation.js` is the one new runtime asset referenced by the staged candidate.

To assemble without editing the checkout or enabling the checkpoint:

```sh
python3 stage_checkpoint.py /path/to/exact-branch/index.html /path/to/empty-stage
node check_checkpoint.cjs /path/to/empty-stage
```

The staging script needs Python 3 and `patch`. It fails closed on a different input or output SHA; it never writes to the source. Expected staged `index.html` SHA-256: `07631c83deef4611d483d359c71828099c169961c5495acb798dbf4f633737e1`.

The staged output is not approved for activation by this checkpoint. Review the affected code with its owner, rebase onto the current authorized branch if the pinned base has moved, and run the applicable repository suites and device OCR before copying the two staged files to active paths. Some legacy OCR UI tests describe the intentionally replaced confirmation screen; update any old expectations only after review.

Validation: staged assembly and fixture-free smoke test passed. Local jsdom integration against the pinned draft branch also passed exact/compatible displayed jewels, minimal default selection, manual override, stale-choice protection, unreadable pending, explicit defer, all-skipped rows, and saved-build/skill preservation. It exercised seeded OCR outputs and did not execute the Japanese recognition engine.
