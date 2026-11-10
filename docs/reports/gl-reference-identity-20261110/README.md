# GL comparison helper: preserve reference action identity

Base product: `8f6e759e0745618bb26b26c0962bc62735426616`. The later unpushed `966ab61` test-environment repairs are independent and must not be overwritten by this patch. No branch, coefficient, technique record, adapter, saved-build schema, or main calculation policy is changed.

## Reproduced cause and bounded correction

`glShellReferenceMoves` gives normal, charged, and full-burst references different execution IDs and `referenceAction` values, but all three use `GL_SHELL_NORMAL_MEDIUM` as their coefficient-source record. `evaluateP0DamageRoute` previously replaced each execution ID with that shared canonical source ID. The adapter therefore did not receive the action-specific shell input. The helper reported `Cannot read properties of undefined (reading 'filter')` while the main consumer already calculated the correct action.

The helper now preserves the existing `reference:gl_NORMAL`, `reference:gl_CHARGED`, and `reference:gl_FULL_BURST` execution IDs. Ordinary techniques still use their canonical IDs. It also records the evaluated stage ID in the result so saved comparison and JSON do not collapse these distinct actions. No missing array is silently defaulted and no formula is duplicated or relaxed.

Only two fields in `evaluateP0DamageRoute` change. Main consumer evaluation, resource checks, skill continuation, and the adapter stay byte-identical. Normal and charged sequences already supported by the adapter remain supported; unsupported full-burst mixtures remain explicitly unavailable. This correction does not approve new shelling routes or fix other missing formulas.

## Verification

- New six source-function tests were RED before the change (five failures, one preserved case) and GREEN afterward. They test input/stage identity and comparison-route discrimination, not numerical game accuracy.
- Real MHDB weapons315/319, three actions, six builds/twelve normal/maximum channels: public helper equals the already-working main consumer. Selected technique, full-burst template, user combo, saved A/B comparison, report JSON, and reload were checked.
- Saved comparison deliberately uses the current shared comparison route, as before. The test does not silently substitute independently saved routes.
- Normal→charged→normal gives93.52 for weapon319, with stage values17.3/58.92/17.3. Insufficient ammunition and a full-burst mixture retain explicit existing reasons. No additional route is invented.
- Disposable Chromium independently checks the six builds and three saved pairs. The comparison damage row is visible; screenshots show the displayed values. The helper is invoked through its public function; save, calculate, compare, and reload use page controls. This is not an assertion that every legacy helper control is exposed in every layout.
- All14 representative weapons×4 skill probes,56 cases/112 channels: all recorded numerical values, omission details, and reasons equal the8f baseline exactly. These reports do not contain the complete pipeline/channel JSON.
- Current integration gate retains the previous1500 assertions and adds six, for1506 total. The historical per-branch contracts remain unchanged. CI includes the new test and harness paths.

Final hashes, legacy suite differences, and verification scope are in `verification.json`. The old suite failures are not converted to passing tests. MHDB raw equipment data is not included; fixture hashes are recorded in the public result.

## Commands

Use Node24 and the existing jsdom30.1.2/Playwright1.62.1 dependencies. The fixture directory must contain `mhdb-catalog-source/raw-pack.json` and `ui-public-14-strict.json`.

```sh
node --test tests/gl-reference-identity.test.cjs
node tools/integration-regression/run.cjs
node tools/gl-reference-identity-public.cjs PRODUCT_ROOT PRIVATE_FIXTURES
node tools/gl-reference-identity-browser.cjs PRODUCT_ROOT OUTPUT_DIR PRIVATE_FIXTURES
```

The new tests can be applied on top of966ab61 without replacing its repaired legacy harnesses. The patch must be applied as a diff, never by replacing the entire repository with the8f-based candidate.

## Limits

This verifies reference-action routing and persistence, not all weapon records, equipment/skill combinations, ammunition states, live-game numerical accuracy, or Safari/iPhone acceptance. Existing unrelated specifications and legacy feature-parity work remain open. No GitHub transmission or publication is part of this work.
